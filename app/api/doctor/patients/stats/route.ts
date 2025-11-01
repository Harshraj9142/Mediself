import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Get patient statistics and analytics
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    // Get all doctor's patients
    const relations = await db
      .collection("doctor_patients")
      .find({ doctorId: new ObjectId(doctorId) })
      .toArray()

    const patientIds = relations.map((r: any) => r.patientId)
    const totalPatients = patientIds.length

    if (totalPatients === 0) {
      return NextResponse.json({
        totalPatients: 0,
        genderDistribution: {},
        ageDistribution: {},
        topConditions: [],
        recentPatients: [],
      })
    }

    // Get patient profiles
    const profiles = await db
      .collection("patient_profiles")
      .find({ userId: { $in: patientIds } })
      .toArray()

    // Calculate statistics
    const genderCounts: Record<string, number> = {}
    const ageBuckets: Record<string, number> = {
      "0-18": 0,
      "19-35": 0,
      "36-50": 0,
      "51-65": 0,
      "66+": 0,
    }
    const conditionCounts: Record<string, number> = {}

    profiles.forEach((profile: any) => {
      // Gender distribution
      const gender = profile.gender || "Unknown"
      genderCounts[gender] = (genderCounts[gender] || 0) + 1

      // Age distribution
      if (profile.age) {
        if (profile.age <= 18) ageBuckets["0-18"]++
        else if (profile.age <= 35) ageBuckets["19-35"]++
        else if (profile.age <= 50) ageBuckets["36-50"]++
        else if (profile.age <= 65) ageBuckets["51-65"]++
        else ageBuckets["66+"]++
      }
    })

    // Get conditions from relationships
    relations.forEach((rel: any) => {
      const conditions = rel.conditions || []
      conditions.forEach((condition: string) => {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1
      })
    })

    // Top conditions sorted by count
    const topConditions = Object.entries(conditionCounts)
      .map(([condition, count]) => ({ condition, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Recent patients (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentPatients = relations
      .filter((r: any) => r.createdAt && new Date(r.createdAt) >= thirtyDaysAgo)
      .length

    // Patients with upcoming appointments
    const now = new Date()
    const upcomingAppointments = await db
      .collection("appointments")
      .countDocuments({
        doctorId: new ObjectId(doctorId),
        date: { $gte: now },
        status: { $ne: "Cancelled" },
      })

    return NextResponse.json({
      totalPatients,
      recentPatients,
      upcomingAppointments,
      genderDistribution: Object.entries(genderCounts).map(([gender, count]) => ({
        gender,
        count,
        percentage: Math.round((count / totalPatients) * 100),
      })),
      ageDistribution: Object.entries(ageBuckets).map(([range, count]) => ({
        range,
        count,
        percentage: totalPatients > 0 ? Math.round((count / totalPatients) * 100) : 0,
      })),
      topConditions,
    })
  } catch (e) {
    console.error("Patient stats error:", e)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
