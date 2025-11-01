import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  const { id } = await params
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  try {
    const body = await req.json()

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const records = db.collection("medical_records")

    const existing = await records.findOne({ _id: new ObjectId(id), doctorId: new ObjectId(doctorId) })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const update: any = { updatedAt: new Date() }
    if (body.title !== undefined) update.title = body.title
    if (body.description !== undefined) update.description = body.description
    if (body.diagnosis !== undefined) update.diagnosis = body.diagnosis
    if (body.treatment !== undefined) update.treatment = body.treatment
    if (body.medications !== undefined) update.medications = Array.isArray(body.medications) ? body.medications : []
    if (body.tests !== undefined) update.tests = Array.isArray(body.tests) ? body.tests : []
    if (body.followUpDate !== undefined) update.followUpDate = body.followUpDate
    if (body.date !== undefined) update.date = new Date(body.date)
    if (body.category !== undefined) update.category = body.category
    if (body.attachments !== undefined) update.attachments = Array.isArray(body.attachments) ? body.attachments : []

    await records.updateOne({ _id: new ObjectId(id), doctorId: new ObjectId(doctorId) }, { $set: update })

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(doctorId),
        type: "Medical Record",
        desc: `Updated medical record for ${existing.patientName}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, message: "Medical record updated successfully" })
  } catch (e) {
    console.error("Medical record PUT error:", e)
    return NextResponse.json({ error: "Failed to update", message: String(e) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  const { id } = await params
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const records = db.collection("medical_records")

    const record = await records.findOne({ _id: new ObjectId(id), doctorId: new ObjectId(doctorId) })
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await records.deleteOne({ _id: new ObjectId(id), doctorId: new ObjectId(doctorId) })

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(doctorId),
        type: "Medical Record",
        desc: `Deleted medical record for ${record.patientName}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, message: "Medical record deleted successfully" })
  } catch (e) {
    console.error("Medical record DELETE error:", e)
    return NextResponse.json({ error: "Failed to delete", message: String(e) }, { status: 500 })
  }
}
