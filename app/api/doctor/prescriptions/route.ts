import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

type Rx = { id: string; patient: string; medication: string; dosage: string; date: string; status: string }

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  let body: any
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  const { patientId, medication, dosage } = body || {}
  if (!patientId || !medication || !dosage) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const users = db.collection("users")
    const patients = await users.findOne({ _id: new ObjectId(patientId) })
    if (!patients) return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    const patientName = (patients as any)?.name || (patients as any)?.email || "Patient"

    const res = await db.collection("prescriptions").insertOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(patientId),
      patientName,
      medication,
      dosage,
      status: "Pending",
      createdAt: new Date(),
    })
    return NextResponse.json({ ok: true, id: String(res.insertedId) })
  } catch (e) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const col = db.collection("prescriptions")
    const list = await col
      .find({ doctorId: new ObjectId(doctorId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    const mapped = list.map((r: any) => ({
      id: String(r._id),
      patient: r.patientName || String(r.patientId || "Patient"),
      medication: r.medication || r.drug || "",
      dosage: r.dosage || r.sig || "",
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
      status: r.status || "Pending",
    })) as Rx[]
    return NextResponse.json(mapped)
  } catch (e) {
    return NextResponse.json([])
  }
}
