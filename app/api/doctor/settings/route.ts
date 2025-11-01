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
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const settings = db.collection("doctor_settings")

    const doc = await settings.findOne({ doctorId: new ObjectId(doctorId) })

    if (!doc) {
      return NextResponse.json({
        doctorId,
        specialty: "",
        about: "",
        qualifications: [],
        experience: null,
        phone: "",
        availability: {},
        slotDuration: 30,
        consultationFee: null,
        location: {
          clinic: "",
          address: "",
          city: "",
          state: "",
          zipCode: ""
        },
        languages: [],
        acceptingNewPatients: true,
        onlineConsultation: false,
      })
    }

    return NextResponse.json({
      id: String(doc._id),
      doctorId: String(doc.doctorId),
      specialty: doc.specialty || "",
      about: doc.about || "",
      qualifications: doc.qualifications || [],
      experience: doc.experience || null,
      phone: doc.phone || "",
      availability: doc.availability || {},
      slotDuration: doc.slotDuration || 30,
      consultationFee: doc.consultationFee || null,
      location: doc.location || {},
      languages: doc.languages || [],
      acceptingNewPatients: doc.acceptingNewPatients !== false,
      onlineConsultation: doc.onlineConsultation || false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  } catch (e) {
    console.error("Settings GET error:", e)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  try {
    const body = await req.json()

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const settings = db.collection("doctor_settings")
    const users = db.collection("users")

    const update: any = {
      updatedAt: new Date()
    }

    // Update allowed fields
    if (body.specialty !== undefined) update.specialty = body.specialty
    if (body.about !== undefined) update.about = body.about
    if (body.qualifications !== undefined) update.qualifications = Array.isArray(body.qualifications) ? body.qualifications : []
    if (body.experience !== undefined) update.experience = body.experience
    if (body.phone !== undefined) update.phone = body.phone
    if (body.availability !== undefined) update.availability = body.availability
    if (body.slotDuration !== undefined) update.slotDuration = body.slotDuration
    if (body.consultationFee !== undefined) update.consultationFee = body.consultationFee
    if (body.location !== undefined) update.location = body.location
    if (body.languages !== undefined) update.languages = Array.isArray(body.languages) ? body.languages : []
    if (body.acceptingNewPatients !== undefined) update.acceptingNewPatients = body.acceptingNewPatients
    if (body.onlineConsultation !== undefined) update.onlineConsultation = body.onlineConsultation

    await settings.updateOne(
      { doctorId: new ObjectId(doctorId) },
      {
        $set: update,
        $setOnInsert: { doctorId: new ObjectId(doctorId), createdAt: new Date() }
      },
      { upsert: true }
    )

    // Also update specialty in users table
    if (body.specialty !== undefined) {
      await users.updateOne(
        { _id: new ObjectId(doctorId) },
        { $set: { specialty: body.specialty } }
      )
    }

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(doctorId),
        type: "Settings",
        desc: "Updated profile settings",
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, message: "Settings updated successfully" })
  } catch (e) {
    console.error("Settings PUT error:", e)
    return NextResponse.json({ error: "Failed to update", message: String(e) }, { status: 500 })
  }
}
