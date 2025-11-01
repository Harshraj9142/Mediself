import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Get detailed patient information
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Verify doctor-patient relationship
    const relation = await db.collection("doctor_patients").findOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(id),
    })

    if (!relation) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    )

    const profile = await db.collection("patient_profiles").findOne({ userId: new ObjectId(id) })

    if (!user) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

    return NextResponse.json({
      id: String(user._id),
      name: user.name || profile?.name || user.email || "Patient",
      email: user.email || "",
      role: user.role || "patient",
      createdAt: user.createdAt || null,
      profile: profile ? {
        dob: profile.dob || null,
        age: profile.age || null,
        gender: profile.gender || null,
        phone: profile.phone || null,
        address: profile.address || null,
        bloodType: profile.bloodType || null,
        heightCm: profile.heightCm || null,
        weightKg: profile.weightKg || null,
        bmi: profile.bmi || null,
        allergies: profile.allergies || [],
        medications: profile.medications || [],
        conditions: profile.conditions || [],
        emergencyContact: profile.emergencyContact || null,
        insurance: profile.insurance || null,
        notes: profile.notes || "",
      } : null,
      relationship: {
        since: relation.createdAt || null,
        lastVisit: relation.lastVisitAt || null,
        conditions: relation.conditions || [],
      }
    })
  } catch (e) {
    console.error("Patient GET error:", e)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

// Update patient relationship notes or conditions
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Verify relationship exists
    const relation = await db.collection("doctor_patients").findOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(id),
    })

    if (!relation) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

    const update: any = {}
    if (body.conditions !== undefined) update.conditions = Array.isArray(body.conditions) ? body.conditions : []
    if (body.notes !== undefined) update.notes = body.notes

    if (Object.keys(update).length > 0) {
      await db.collection("doctor_patients").updateOne(
        {
          doctorId: new ObjectId(doctorId),
          patientId: new ObjectId(id),
        },
        { $set: update }
      )
    }

    return NextResponse.json({ ok: true, message: "Patient relationship updated" })
  } catch (e) {
    console.error("Patient PATCH error:", e)
    return NextResponse.json({ error: "Failed to update", message: String(e) }, { status: 500 })
  }
}

// Remove patient from doctor's list
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

    const result = await db.collection("doctor_patients").deleteOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Patient relationship not found" }, { status: 404 })
    }

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(doctorId),
        type: "Patient Management",
        desc: `Removed patient from list`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, message: "Patient removed from your list" })
  } catch (e) {
    console.error("Patient DELETE error:", e)
    return NextResponse.json({ error: "Failed to delete", message: String(e) }, { status: 500 })
  }
}
