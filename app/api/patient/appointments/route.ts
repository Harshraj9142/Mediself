import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const patientId = (session.user as any).id as string

  const { searchParams } = new URL(req.url)
  const search = (searchParams.get("search") || "").trim().toLowerCase()
  const status = searchParams.get("status") || "" // Filter by status
  const fromDate = searchParams.get("fromDate") || "" // Filter from date
  const toDate = searchParams.get("toDate") || "" // Filter to date
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
  const skip = (page - 1) * limit

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const appointments = db.collection("appointments")
    const users = db.collection("users")

    // Build query for patient's appointments
    const query: any = { patientId: new ObjectId(patientId) }
    
    // Search filter
    if (search) {
      query.$or = [
        { doctorName: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ]
    }
    
    // Status filter
    if (status) {
      query.status = status
    }
    
    // Date range filter
    if (fromDate || toDate) {
      query.date = {}
      if (fromDate) query.date.$gte = new Date(fromDate)
      if (toDate) query.date.$lte = new Date(toDate)
    }

    // Get total count
    const total = await appointments.countDocuments(query)

    // Get paginated appointments
    const list = await appointments
      .find(query)
      .sort({ date: -1 })  // Most recent first
      .skip(skip)
      .limit(limit)
      .toArray()

    // Fetch doctor details
    const doctorIds = Array.from(
      new Set(list.map((a: any) => String(a.doctorId)).filter(Boolean))
    ).map((id) => new ObjectId(id))
    const doctors = doctorIds.length
      ? await users
          .find({ _id: { $in: doctorIds } })
          .project({ name: 1, email: 1, specialty: 1 })
          .toArray()
      : []
    const doctorMap = new Map<string, any>()
    doctors.forEach((d) => doctorMap.set(String(d._id), d))

    const items = list.map((a: any) => {
      const doctor = doctorMap.get(String(a.doctorId))
      const appointmentDate = new Date(a.date)
      const now = new Date()
      const isPast = appointmentDate < now
      const isToday = appointmentDate.toDateString() === now.toDateString()
      
      return {
        id: String(a._id),
        doctorId: String(a.doctorId),
        doctor: a.doctorName || doctor?.name || doctor?.email || "Doctor",
        doctorEmail: doctor?.email || "",
        specialty: doctor?.specialty || a.specialty || "General",
        reason: a.reason || "Consultation",
        date: appointmentDate.toLocaleDateString(),
        time: appointmentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dateTime: a.date,  // ISO string for sorting/filtering
        location: a.location || "Clinic",
        status: a.status || "Pending",
        isPast: isPast,
        isToday: isToday,
        patientName: a.patientName || "",
        createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "",
        updatedAt: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : "",
      }
    })

    return NextResponse.json({ page, limit, total, items })
  } catch (e) {
    console.error("Appointments GET error:", e)
    return NextResponse.json({ page: 1, limit: 50, total: 0, items: [], error: "Failed to load" })
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
    // Ensure doctor-patient relation exists and update last visit
    try {
      const profiles = db.collection("patient_profiles")
      const relations = db.collection("doctor_patients")
      const profile = (await profiles.findOne({ userId: new ObjectId(patientId) })) as any
      await relations.updateOne(
        { doctorId: new ObjectId(doctorId), patientId: new ObjectId(patientId) },
        {
          $setOnInsert: { createdAt: new Date() },
          $set: {
            patientName: patientName,
            lastVisitAt: when,
            conditions: Array.isArray(profile?.conditions) ? profile.conditions : [],
          },
        },
        { upsert: true }
      )
    } catch {}
    // Log activity for patient dashboard
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(patientId),
        type: "Appointment",
        desc: `Booked appointment with ${docName} for ${when.toLocaleDateString()} ${when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, id: String(res.insertedId), message: "Appointment booked successfully" })
  } catch (e) {
    console.error("Appointment POST error:", e)
    return NextResponse.json({ error: "Failed to create", message: String(e) }, { status: 500 })
  }
}
