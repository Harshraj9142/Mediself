import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Get patient vital signs history
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  const { id } = await params
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    // Verify relationship
    const relation = await db.collection("doctor_patients").findOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(id),
    })

    if (!relation) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

    const vitals = await db
      .collection("patient_vitals")
      .find({ patientId: new ObjectId(id) })
      .sort({ recordedAt: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({
      patientId: id,
      items: vitals.map((v: any) => ({
        id: String(v._id),
        bloodPressureSystolic: v.bloodPressureSystolic || null,
        bloodPressureDiastolic: v.bloodPressureDiastolic || null,
        heartRate: v.heartRate || null,
        temperature: v.temperature || null,
        oxygenSaturation: v.oxygenSaturation || null,
        respiratoryRate: v.respiratoryRate || null,
        weight: v.weight || null,
        height: v.height || null,
        bmi: v.bmi || null,
        glucose: v.glucose || null,
        notes: v.notes || "",
        recordedBy: v.recordedBy ? String(v.recordedBy) : null,
        recordedAt: v.recordedAt ? new Date(v.recordedAt).toISOString() : null,
        createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : null,
      })),
    })
  } catch (e) {
    console.error("Vitals GET error:", e)
    return NextResponse.json({ error: "Failed to fetch vitals" }, { status: 500 })
  }
}

// Add new vital signs record
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string
  const doctorName = (session.user as any).name || (session.user as any).email

  const { id } = await params
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  try {
    const body = await req.json()

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    // Verify relationship
    const relation = await db.collection("doctor_patients").findOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(id),
    })

    if (!relation) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

    const vitalRecord = {
      patientId: new ObjectId(id),
      doctorId: new ObjectId(doctorId),
      bloodPressureSystolic: body.bloodPressureSystolic || null,
      bloodPressureDiastolic: body.bloodPressureDiastolic || null,
      heartRate: body.heartRate || null,
      temperature: body.temperature || null,
      oxygenSaturation: body.oxygenSaturation || null,
      respiratoryRate: body.respiratoryRate || null,
      weight: body.weight || null,
      height: body.height || null,
      bmi: body.bmi || (body.weight && body.height ? (body.weight / Math.pow(body.height / 100, 2)).toFixed(1) : null),
      glucose: body.glucose || null,
      notes: body.notes || "",
      recordedBy: new ObjectId(doctorId),
      recordedByName: doctorName,
      recordedAt: body.recordedAt ? new Date(body.recordedAt) : new Date(),
      createdAt: new Date(),
    }

    const result = await db.collection("patient_vitals").insertOne(vitalRecord)

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(doctorId),
        type: "Vitals",
        desc: `Recorded vital signs for patient`,
        createdAt: new Date(),
      })

      await db.collection("activities").insertOne({
        userId: new ObjectId(id),
        type: "Vitals",
        desc: `Dr. ${doctorName} recorded your vital signs`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({
      ok: true,
      id: String(result.insertedId),
      message: "Vital signs recorded successfully",
    })
  } catch (e) {
    console.error("Vitals POST error:", e)
    return NextResponse.json({ error: "Failed to record vitals", message: String(e) }, { status: 500 })
  }
}
