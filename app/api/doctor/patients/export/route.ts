import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Export patient list as CSV
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  const { searchParams } = new URL(req.url)
  const format = searchParams.get("format") || "json" // json or csv

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    // Get all doctor's patients
    const relations = await db
      .collection("doctor_patients")
      .find({ doctorId: new ObjectId(doctorId) })
      .toArray()

    const patientIds = relations.map((r: any) => r.patientId)

    if (patientIds.length === 0) {
      if (format === "csv") {
        return new NextResponse("No patients found", {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=patients.csv",
          },
        })
      }
      return NextResponse.json({ patients: [] })
    }

    // Get patient details
    const [users, profiles] = await Promise.all([
      db.collection("users")
        .find({ _id: { $in: patientIds } })
        .project({ password: 0 })
        .toArray(),
      db.collection("patient_profiles")
        .find({ userId: { $in: patientIds } })
        .toArray(),
    ])

    const profileMap = new Map(profiles.map((p: any) => [String(p.userId), p]))
    const relationMap = new Map(relations.map((r: any) => [String(r.patientId), r]))

    const patients = users.map((user: any) => {
      const profile = profileMap.get(String(user._id))
      const relation = relationMap.get(String(user._id))

      return {
        id: String(user._id),
        name: profile?.name || user.name || user.email || "Patient",
        email: user.email || "",
        phone: profile?.phone || "",
        dob: profile?.dob || "",
        gender: profile?.gender || "",
        bloodType: profile?.bloodType || "",
        conditions: (relation?.conditions || []).join("; "),
        allergies: (profile?.allergies || []).join("; "),
        lastVisit: relation?.lastVisitAt ? new Date(relation.lastVisitAt).toLocaleDateString() : "",
        registeredSince: relation?.createdAt ? new Date(relation.createdAt).toLocaleDateString() : "",
      }
    })

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "DOB",
        "Gender",
        "Blood Type",
        "Conditions",
        "Allergies",
        "Last Visit",
        "Registered Since",
      ]

      const rows = patients.map((p) => [
        p.id,
        p.name,
        p.email,
        p.phone,
        p.dob,
        p.gender,
        p.bloodType,
        p.conditions,
        p.allergies,
        p.lastVisit,
        p.registeredSince,
      ])

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="patients.csv"',
        },
      })
    }

    return NextResponse.json({ patients, total: patients.length })
  } catch (e) {
    console.error("Patient export error:", e)
    return NextResponse.json({ error: "Failed to export patients" }, { status: 500 })
  }
}
