import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

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

    return NextResponse.json({
      id: String(doc._id),
      userId: String(doc.userId),
      name: doc.name,
      dob: doc.dob,
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
      notes: doc.notes || "",
      updatedAt: doc.updatedAt || doc.createdAt || null,
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
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
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

    return NextResponse.json({ ok: true, id })
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
