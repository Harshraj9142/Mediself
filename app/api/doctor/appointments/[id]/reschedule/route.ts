import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string
  const doctorName = (session.user as any).name || (session.user as any).email

  const id = params.id
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  try {
    const body = await req.json().catch(() => ({})) as { date?: string; time?: string }
    const dateStr = (body.date || "").trim() // yyyy-mm-dd
    const timeStr = (body.time || "").trim() // HH:mm
    if (!dateStr || !timeStr) return NextResponse.json({ error: "Missing date/time" }, { status: 400 })

    const newDate = new Date(dateStr)
    const [hh, mm] = timeStr.split(":").map((v) => parseInt(v, 10))
    if (isFinite(hh) && isFinite(mm)) newDate.setHours(hh, mm, 0, 0)

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    const appts = db.collection("appointments")
    const rx = await appts.findOne({ _id: new ObjectId(id), doctorId: new ObjectId(doctorId) })
    if (!rx) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await appts.updateOne({ _id: new ObjectId(id) }, { $set: { date: newDate, updatedAt: new Date(), status: rx.status || "Pending" } })

    try {
      await db.collection("activities").insertOne({
        userId: rx.patientId,
        type: "Appointment",
        desc: `Doctor ${doctorName} rescheduled appointment to ${newDate.toLocaleString()}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, date: newDate.toISOString() })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
