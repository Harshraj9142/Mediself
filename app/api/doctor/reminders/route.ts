import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string
  const doctorName = (session.user as any).name || (session.user as any).email

  try {
    const body = await req.json().catch(() => ({})) as {
      patientId?: string
      medicine: string
      dosage: string
      frequency?: string
      time: string // HH:mm
      reason?: string
      date?: string // optional yyyy-mm-dd
    }
    const patientId = body.patientId || ""
    if (!patientId || !ObjectId.isValid(patientId) || !body.medicine || !body.dosage || !body.time) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const scheduleDate = body.date ? new Date(body.date) : new Date()
    const [hh, mm] = (body.time || "").split(":").map((v) => parseInt(v, 10))
    scheduleDate.setHours(hh || 0, mm || 0, 0, 0)
    const now = new Date()
    if (scheduleDate < now) scheduleDate.setDate(scheduleDate.getDate() + 1)

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    // access control: ensure doctor is linked to the patient
    const rel = await db.collection("doctor_patients").findOne({ doctorId: new ObjectId(doctorId), patientId: new ObjectId(patientId) })
    if (!rel) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const doc = {
      patientId: new ObjectId(patientId),
      medicine: body.medicine,
      dosage: body.dosage,
      frequency: body.frequency || "daily",
      time: body.time,
      scheduledAt: scheduleDate,
      reason: body.reason || "",
      active: true,
      status: "pending",
      createdAt: new Date(),
      createdBy: new ObjectId(doctorId),
      createdByRole: "doctor",
    }

    const { insertedId } = await db.collection("reminders").insertOne(doc)
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(patientId),
        type: "Reminder",
        desc: `Doctor ${doctorName} created reminder for ${body.medicine} at ${body.time}${body.date ? ` on ${body.date}` : ""}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ id: String(insertedId) }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
