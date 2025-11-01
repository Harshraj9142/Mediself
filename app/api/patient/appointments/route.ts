import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const patientId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const appointments = db.collection("appointments")
    const users = db.collection("users")

    const list = await appointments
      .find({ patientId: new ObjectId(patientId) })
      .sort({ date: 1 })
      .limit(200)
      .toArray()

    const doctorIds = Array.from(
      new Set(list.map((a: any) => String(a.doctorId)).filter(Boolean))
    ).map((id) => new ObjectId(id))
    const doctors = doctorIds.length
      ? await users
          .find({ _id: { $in: doctorIds } })
          .project({ name: 1, email: 1 })
          .toArray()
      : []
    const doctorMap = new Map<string, any>()
    doctors.forEach((d) => doctorMap.set(String(d._id), d))

    return NextResponse.json(
      list.map((a: any) => ({
        id: String(a._id),
        doctorId: String(a.doctorId),
        doctor: a.doctorName || doctorMap.get(String(a.doctorId))?.name || doctorMap.get(String(a.doctorId))?.email || "Doctor",
        specialty: a.specialty || "General",
        date: new Date(a.date).toLocaleDateString(),
        time: new Date(a.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        location: a.location || "Clinic",
        status: (a.status || "Pending").toLowerCase(),
      }))
    )
  } catch (e) {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const patientId = (session.user as any).id as string
  const patientName = (session.user as any).name || (session.user as any).email

  try {
    const body = await req.json()
    const { doctorId, reason, dateISO } = body || {}
    if (!doctorId || !reason || !dateISO) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const users = db.collection("users")
    const settings = db.collection("doctor_settings")
    const appointments = db.collection("appointments")

    const doctor = await users.findOne({ _id: new ObjectId(doctorId) })
    const docName = (doctor as any)?.name || (doctor as any)?.email || "Doctor"

    // Validate within doctor's availability window
    const when = new Date(dateISO)
    if (isNaN(when.getTime())) return NextResponse.json({ error: "Invalid dateISO" }, { status: 400 })
    const weekdayKey = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][when.getDay()]
    const docSettings = (await settings.findOne({ doctorId: new ObjectId(doctorId) })) as any
    const rule = docSettings?.availability?.[weekdayKey]
    const toMinutes = (s: string) => {
      const [h, m] = (s || "").split(":").map((x: string) => parseInt(x, 10))
      return h * 60 + m
    }
    if (!rule || !rule.enabled) return NextResponse.json({ error: "Doctor unavailable that day" }, { status: 400 })
    const mins = when.getHours() * 60 + when.getMinutes()
    if (mins < toMinutes(rule.start || "09:00") || mins >= toMinutes(rule.end || "17:00")) {
      return NextResponse.json({ error: "Time outside availability" }, { status: 400 })
    }

    // Conflict check: no other appointment at same doctor/time
    const conflict = await appointments.findOne({ doctorId: new ObjectId(doctorId), date: when })
    if (conflict) return NextResponse.json({ error: "Slot already taken" }, { status: 409 })

    const res = await appointments.insertOne({
      doctorId: new ObjectId(doctorId),
      doctorName: docName,
      patientId: new ObjectId(patientId),
      patientName,
      reason,
      date: when,
      status: "Pending",
      createdAt: new Date(),
    })

    return NextResponse.json({ ok: true, id: String(res.insertedId) })
  } catch (e) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
