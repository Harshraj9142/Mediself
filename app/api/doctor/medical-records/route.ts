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
  const patientId = searchParams.get("patientId") || ""
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
  const skip = (page - 1) * limit

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const records = db.collection("medical_records")

    const query: any = { doctorId: new ObjectId(doctorId) }
    if (patientId && ObjectId.isValid(patientId)) {
      query.patientId = new ObjectId(patientId)
    }

    const total = await records.countDocuments(query)
    const items = await records
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      page,
      limit,
      total,
      items: items.map((r: any) => ({
        id: String(r._id),
        patientId: String(r.patientId),
        patientName: r.patientName || "",
        title: r.title || "",
        description: r.description || "",
        diagnosis: r.diagnosis || "",
        treatment: r.treatment || "",
        medications: r.medications || [],
        tests: r.tests || [],
        followUpDate: r.followUpDate || null,
        date: r.date ? new Date(r.date).toLocaleDateString() : "",
        category: r.category || "General",
        attachments: r.attachments || [],
        createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
      })),
    })
  } catch (e) {
    console.error("Medical records GET error:", e)
    return NextResponse.json({ page: 1, limit: 20, total: 0, items: [] })
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
    const body = await req.json()

    if (!body.patientId) {
      return NextResponse.json({ error: "patientId required" }, { status: 400 })
    }

    if (!ObjectId.isValid(body.patientId)) {
      return NextResponse.json({ error: "Invalid patientId" }, { status: 400 })
    }

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const records = db.collection("medical_records")
    const users = db.collection("users")

    // Verify patient exists
    const patient = await users.findOne({ _id: new ObjectId(body.patientId), role: "patient" })
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const record = {
      doctorId: new ObjectId(doctorId),
      doctorName: doctorName,
      patientId: new ObjectId(body.patientId),
      patientName: patient.name || patient.email || "Patient",
      title: body.title || "",
      description: body.description || "",
      diagnosis: body.diagnosis || "",
      treatment: body.treatment || "",
      medications: Array.isArray(body.medications) ? body.medications : [],
      tests: Array.isArray(body.tests) ? body.tests : [],
      followUpDate: body.followUpDate || null,
      date: body.date ? new Date(body.date) : new Date(),
      category: body.category || "General",
      attachments: Array.isArray(body.attachments) ? body.attachments : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await records.insertOne(record)

    // Log activity for doctor
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(doctorId),
        type: "Medical Record",
        desc: `Added medical record for ${record.patientName}`,
        createdAt: new Date(),
      })
    } catch {}

    // Log activity for patient
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(body.patientId),
        type: "Medical Record",
        desc: `Dr. ${doctorName} added a medical record: ${body.title || "New record"}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ 
      ok: true, 
      id: String(result.insertedId), 
      message: "Medical record created successfully" 
    })
  } catch (e) {
    console.error("Medical records POST error:", e)
    return NextResponse.json({ error: "Failed to create", message: String(e) }, { status: 500 })
  }
}
