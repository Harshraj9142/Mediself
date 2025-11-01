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
  const search = (searchParams.get("search") || "").trim().toLowerCase()
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)))
  const skip = (page - 1) * limit

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    const users = db.collection("users")
    const relations = db.collection("doctor_patients")
    const profiles = db.collection("patient_profiles")

    // Build search query for all patients
    const searchQuery: any = { role: "patient" }
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count of all patients matching search
    const total = await users.countDocuments(searchQuery)

    // Get paginated list of all patients
    const allPatients = await users
      .find(searchQuery)
      .project({ name: 1, email: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get relationship data for this doctor with these patients
    const patientIds = allPatients.map((p: any) => p._id)
    const relationsByPatient = new Map<string, any>()
    if (patientIds.length > 0) {
      const rels = await relations
        .find({ doctorId: new ObjectId(doctorId), patientId: { $in: patientIds } })
        .toArray()
      rels.forEach((r: any) => relationsByPatient.set(String(r.patientId), r))
    }

    // Get profile data for conditions
    const profilesByPatient = new Map<string, any>()
    if (patientIds.length > 0) {
      const patientProfiles = await profiles
        .find({ userId: { $in: patientIds } })
        .toArray()
      patientProfiles.forEach((p: any) => profilesByPatient.set(String(p.userId), p))
    }

    // Build response items
    const items = allPatients.map((patient: any) => {
      const patientId = String(patient._id)
      const relation = relationsByPatient.get(patientId)
      const profile = profilesByPatient.get(patientId)

      return {
        id: patientId,
        name: patient.name || patient.email || "Patient",
        email: patient.email || "",
        lastVisitAt: relation?.lastVisitAt || null,
        conditions: relation?.conditions || profile?.conditions || [],
        hasRelation: !!relation,
      }
    })

    return NextResponse.json({ page, limit, total, items })
  } catch (e) {
    return NextResponse.json({ page, limit, total: 0, items: [] })
  }
}
