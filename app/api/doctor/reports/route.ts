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
    const body = await req.json().catch(() => ({})) as { patientId?: string; type?: string; fileUrl?: string }
    const patientId = body.patientId || ""
    const type = (body.type || "").trim()
    const fileUrl = (body.fileUrl || "").trim()
    if (!patientId || !ObjectId.isValid(patientId) || !type) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    // Access control: ensure relation exists
    const rel = await db.collection("doctor_patients").findOne({ doctorId: new ObjectId(doctorId), patientId: new ObjectId(patientId) })
    if (!rel) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { insertedId } = await db.collection("reports").insertOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(patientId),
      type,
      fileUrl: fileUrl || null,
      createdAt: new Date(),
    })
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(patientId),
        type: "Report",
        desc: `Doctor ${doctorName} added report: ${type}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, id: String(insertedId) }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
