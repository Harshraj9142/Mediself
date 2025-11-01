import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// Helper functions
function calculateAge(dob: string): number | null {
  if (!dob) return null
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function calculateBMI(heightCm: number | null, weightKg: number | null): number | null {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null
  const heightM = heightCm / 100
  return Number((weightKg / (heightM * heightM)).toFixed(1))
}

function calculateProfileCompletion(profile: any): number {
  const fields = [
    profile.name,
    profile.dob,
    profile.gender,
    profile.phone,
    profile.address?.line1,
    profile.address?.city,
    profile.address?.state,
    profile.bloodType,
    profile.heightCm,
    profile.weightKg,
    profile.emergencyContact?.name,
    profile.emergencyContact?.phone,
    profile.insurance?.provider,
  ]
  const filledFields = fields.filter(f => f !== null && f !== undefined && f !== "").length
  return Math.round((filledFields / fields.length) * 100)
}

const ProfileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  phone: z.string().max(50).optional(),
  address: z
    .object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      relation: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  insurance: z
    .object({
      provider: z.string().optional(),
      policyNumber: z.string().optional(),
    })
    .optional(),
  bloodType: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  heightCm: z.number().min(0).max(300).optional(),
  weightKg: z.number().min(0).max(500).optional(),
  notes: z.string().max(5000).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const patientId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const profiles = db.collection("patient_profiles")

    const doc = await profiles.findOne({ userId: new ObjectId(patientId) })
    if (!doc) return NextResponse.json(null)

    // Calculate derived fields
    const age = calculateAge(doc.dob)
    const bmi = calculateBMI(doc.heightCm, doc.weightKg)
    const profileCompletion = calculateProfileCompletion(doc)

    return NextResponse.json({
      id: String(doc._id),
      userId: String(doc.userId),
      name: doc.name,
      dob: doc.dob,
      age: age,
      gender: doc.gender,
      phone: doc.phone,
      address: doc.address || null,
      allergies: doc.allergies || [],
      medications: doc.medications || [],
      conditions: doc.conditions || [],
      emergencyContact: doc.emergencyContact || null,
      insurance: doc.insurance || null,
      bloodType: doc.bloodType || null,
      heightCm: doc.heightCm ?? null,
      weightKg: doc.weightKg ?? null,
      bmi: bmi,
      notes: doc.notes || "",
      profileCompletion: profileCompletion,
      updatedAt: doc.updatedAt || doc.createdAt || null,
      createdAt: doc.createdAt || null,
    })
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const patientId = (session.user as any).id as string
  const patientName = (session.user as any).name || (session.user as any).email

  try {
    const body = await req.json().catch(() => ({}))
    const parsed = ProfileSchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ")
      return NextResponse.json({ error: "Invalid payload", details: errors }, { status: 400 })
    }

    const data = parsed.data
    const now = new Date()

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const profiles = db.collection("patient_profiles")
    const users = db.collection("users")

    if (data.name) {
      await users.updateOne(
        { _id: new ObjectId(patientId) },
        { $set: { name: data.name } }
      )
    }

    const res = await profiles.updateOne(
      { userId: new ObjectId(patientId) },
      {
        $setOnInsert: { createdAt: now },
        $set: {
          userId: new ObjectId(patientId),
          name: data.name ?? patientName,
          dob: data.dob ?? null,
          gender: data.gender ?? null,
          phone: data.phone ?? null,
          address: data.address ?? null,
          allergies: data.allergies ?? [],
          medications: data.medications ?? [],
          conditions: data.conditions ?? [],
          emergencyContact: data.emergencyContact ?? null,
          insurance: data.insurance ?? null,
          bloodType: data.bloodType ?? null,
          heightCm: data.heightCm ?? null,
          weightKg: data.weightKg ?? null,
          notes: data.notes ?? "",
          updatedAt: now,
        },
      },
      { upsert: true }
    )

    const id = res.upsertedId ? String(res.upsertedId) : String((await profiles.findOne({ userId: new ObjectId(patientId) }))?._id || "")

    // Log activity for patient dashboard
    try {
      const changed = [
        data.name ? "name" : null,
        data.phone ? "phone" : null,
        data.address ? "address" : null,
        data.allergies ? "allergies" : null,
        data.medications ? "medications" : null,
        data.conditions ? "conditions" : null,
        data.emergencyContact ? "emergency contact" : null,
        data.insurance ? "insurance" : null,
        data.bloodType ? "blood type" : null,
        data.heightCm ? "height" : null,
        data.weightKg ? "weight" : null,
        data.dob ? "dob" : null,
        data.gender ? "gender" : null,
        data.notes ? "notes" : null,
      ].filter(Boolean)
      const summary = changed.length ? `Updated ${changed.slice(0, 3).join(", ")}${changed.length > 3 ? " and more" : ""}` : "Updated profile"
      const client = (await clientPromise) as MongoClient
      const db = client.db(process.env.MONGODB_DB)
      await db.collection("activities").insertOne({
        userId: new ObjectId(patientId),
        type: "Profile",
        desc: summary,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, id, message: "Profile updated successfully" })
  } catch (e) {
    console.error("Profile save error:", e)
    return NextResponse.json({ error: "Failed to save", message: String(e) }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const patientId = (session.user as any).id as string

  try {
    const body = await req.json().catch(() => ({}))
    const parsed = ProfileSchema.partial().safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ")
      return NextResponse.json({ error: "Invalid payload", details: errors }, { status: 400 })
    }

    const data = parsed.data
    const now = new Date()

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const profiles = db.collection("patient_profiles")
    const users = db.collection("users")

    // Check if profile exists
    const existing = await profiles.findOne({ userId: new ObjectId(patientId) })
    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Update user name if provided
    if (data.name) {
      await users.updateOne(
        { _id: new ObjectId(patientId) },
        { $set: { name: data.name } }
      )
    }

    // Build update object with only provided fields
    const updateFields: any = { updatedAt: now }
    Object.keys(data).forEach(key => {
      if (data[key as keyof typeof data] !== undefined) {
        updateFields[key] = data[key as keyof typeof data]
      }
    })

    await profiles.updateOne(
      { userId: new ObjectId(patientId) },
      { $set: updateFields }
    )

    // Log activity
    try {
      const changed = Object.keys(data).filter(k => data[k as keyof typeof data] !== undefined)
      const summary = `Partial update: ${changed.slice(0, 3).join(", ")}${changed.length > 3 ? " and more" : ""}`
      await db.collection("activities").insertOne({
        userId: new ObjectId(patientId),
        type: "Profile",
        desc: summary,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, message: "Profile updated successfully" })
  } catch (e) {
    console.error("Profile update error:", e)
    return NextResponse.json({ error: "Failed to update", message: String(e) }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const patientId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const profiles = db.collection("patient_profiles")

    const result = await profiles.deleteOne({ userId: new ObjectId(patientId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(patientId),
        type: "Profile",
        desc: "Profile deleted",
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, message: "Profile deleted successfully" })
  } catch (e) {
    console.error("Profile delete error:", e)
    return NextResponse.json({ error: "Failed to delete", message: String(e) }, { status: 500 })
  }
}
