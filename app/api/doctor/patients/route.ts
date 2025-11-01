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
  const gender = searchParams.get("gender") || ""
  const condition = searchParams.get("condition") || ""
  const sortBy = searchParams.get("sortBy") || "recent" // recent, name, lastVisit
  const myPatientsOnly = searchParams.get("myPatientsOnly") === "true"
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
  const skip = (page - 1) * limit

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    const users = db.collection("users")
    const relations = db.collection("doctor_patients")
    const profiles = db.collection("patient_profiles")

    // If myPatientsOnly, get patient IDs first
    let allowedPatientIds: ObjectId[] | null = null
    if (myPatientsOnly) {
      const myRelations = await relations
        .find({ doctorId: new ObjectId(doctorId) })
        .project({ patientId: 1 })
        .toArray()
      allowedPatientIds = myRelations.map((r: any) => r.patientId)
      if (allowedPatientIds.length === 0) {
        return NextResponse.json({ page, limit, total: 0, items: [] })
      }
    }

    // Build search query for all patients
    const searchQuery: any = { role: "patient" }
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }
    if (allowedPatientIds) {
      searchQuery._id = { $in: allowedPatientIds }
    }

    // Get patient IDs matching criteria
    let patientIds = (await users.find(searchQuery).project({ _id: 1 }).toArray()).map((p: any) => p._id)

    // Apply profile-based filters (gender, condition)
    if (gender || condition) {
      const profileQuery: any = { userId: { $in: patientIds } }
      if (gender) profileQuery.gender = gender
      if (condition) profileQuery.conditions = condition

      const matchingProfiles = await profiles.find(profileQuery).project({ userId: 1 }).toArray()
      const matchingUserIds = matchingProfiles.map((p: any) => p.userId)

      // Also check conditions in relations
      if (condition) {
        const relationsWithCondition = await relations
          .find({ doctorId: new ObjectId(doctorId), conditions: condition, patientId: { $in: patientIds } })
          .project({ patientId: 1 })
          .toArray()
        const relPatientIds = relationsWithCondition.map((r: any) => r.patientId)
        // Combine both sources
        patientIds = [...new Set([...matchingUserIds.map(String), ...relPatientIds.map(String)])].map((id) => new ObjectId(id))
      } else {
        patientIds = matchingUserIds
      }
    }

    const total = patientIds.length

    // Determine sort order
    let sortField: any = { createdAt: -1 }
    if (sortBy === "name") sortField = { name: 1 }

    // Get paginated list of patients
    const allPatients = await users
      .find({ _id: { $in: patientIds } })
      .project({ name: 1, email: 1, createdAt: 1 })
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get relationship data for this doctor with these patients
    const currentPagePatientIds = allPatients.map((p: any) => p._id)
    const relationsByPatient = new Map<string, any>()
    if (currentPagePatientIds.length > 0) {
      const rels = await relations
        .find({ doctorId: new ObjectId(doctorId), patientId: { $in: currentPagePatientIds } })
        .toArray()
      rels.forEach((r: any) => relationsByPatient.set(String(r.patientId), r))
    }

    // Get profile data for conditions
    const profilesByPatient = new Map<string, any>()
    if (currentPagePatientIds.length > 0) {
      const patientProfiles = await profiles
        .find({ userId: { $in: currentPagePatientIds } })
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
