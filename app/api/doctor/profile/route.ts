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
    const users = db.collection("users")
    const settings = db.collection("doctor_settings")

    // Get doctor's user information
    const doctor = await users.findOne({ _id: new ObjectId(doctorId) })
    if (!doctor) return NextResponse.json(null)

    // Get doctor's settings if available
    const doctorSettings = await settings.findOne({ doctorId: new ObjectId(doctorId) })

    return NextResponse.json({
      id: String(doctor._id),
      name: doctor.name || doctor.email || "Doctor",
      email: doctor.email || "",
      role: doctor.role || "doctor",
      phone: doctorSettings?.phone || doctor.phone || "",
      specialty: doctor.specialty || doctorSettings?.specialty || "General Practitioner",
      about: doctorSettings?.about || "",
      qualifications: doctorSettings?.qualifications || [],
      experience: doctorSettings?.experience || null,
      createdAt: doctor.createdAt || null,
    })
  } catch (e) {
    console.error("Doctor profile GET error:", e)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
