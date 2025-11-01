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
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get("patientId") || searchParams.get("id")
  if (!patientId || !ObjectId.isValid(patientId)) return NextResponse.json({ error: "Invalid patientId" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    // Access control: ensure doctor-patient relation exists
    const rel = await db.collection("doctor_patients").findOne({ doctorId: new ObjectId(doctorId), patientId: new ObjectId(patientId) })
    if (!rel) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const list = await db
      .collection("notes")
      .find({ doctorId: new ObjectId(doctorId), patientId: new ObjectId(patientId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    return NextResponse.json(
      list.map((n: any) => ({ id: String(n._id), text: n.text || "", createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : null }))
    )
  } catch (e) {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string
  const doctorName = (session.user as any).name || (session.user as any).email

  try {
    const body = await req.json().catch(() => ({})) as { patientId?: string; text?: string }
    const patientId = body.patientId || ""
    const text = (body.text || "").trim()
    if (!patientId || !ObjectId.isValid(patientId) || !text) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    // Access control: ensure doctor-patient relation exists
    const rel = await db.collection("doctor_patients").findOne({ doctorId: new ObjectId(doctorId), patientId: new ObjectId(patientId) })
    if (!rel) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { insertedId } = await db.collection("notes").insertOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(patientId),
      text,
      createdAt: new Date(),
    })

    // Optional: log activity for patient timeline
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(patientId),
        type: "Note",
        desc: `Doctor ${doctorName} added a note`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, id: String(insertedId) }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
