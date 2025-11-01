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

  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get("id") || searchParams.get("patientId")
  if (!patientId) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const profiles = db.collection("patient_profiles")
    const users = db.collection("users")

    const uid = new ObjectId(patientId)
    const [profile, user] = await Promise.all([
      profiles.findOne({ userId: uid }),
      users.findOne({ _id: uid }, { projection: { name: 1, email: 1 } }),
    ])

    if (!profile && !user) return NextResponse.json(null)

    return NextResponse.json({
      id: profile ? String(profile._id) : null,
      userId: patientId,
      name: (profile as any)?.name || (user as any)?.name || (user as any)?.email || "Patient",
      email: (user as any)?.email || null,
      dob: (profile as any)?.dob || null,
      gender: (profile as any)?.gender || null,
      phone: (profile as any)?.phone || null,
      address: (profile as any)?.address || null,
      allergies: (profile as any)?.allergies || [],
      medications: (profile as any)?.medications || [],
      conditions: (profile as any)?.conditions || [],
      emergencyContact: (profile as any)?.emergencyContact || null,
      insurance: (profile as any)?.insurance || null,
      bloodType: (profile as any)?.bloodType || null,
      heightCm: (profile as any)?.heightCm ?? null,
      weightKg: (profile as any)?.weightKg ?? null,
      notes: (profile as any)?.notes || "",
      updatedAt: (profile as any)?.updatedAt || (profile as any)?.createdAt || null,
    })
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
