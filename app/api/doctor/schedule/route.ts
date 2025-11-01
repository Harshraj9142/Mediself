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
  const view = searchParams.get("view") // "own" or "all"

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const settings = db.collection("doctor_settings")
    const users = db.collection("users")

    // If view=own, return only current doctor's schedule (backward compatibility)
    if (view === "own") {
      const doc = await settings.findOne({ doctorId: new ObjectId(doctorId) })
      return NextResponse.json({ availability: (doc as any)?.availability || {} })
    }

    // Otherwise return ALL doctors' schedules
    const allSettings = await settings.find({}).toArray()
    const doctorIds = allSettings.map((s: any) => s.doctorId).filter(Boolean)
    
    // Fetch doctor details
    const doctors = doctorIds.length > 0
      ? await users.find({ _id: { $in: doctorIds } }).project({ name: 1, email: 1 }).toArray()
      : []

    const doctorMap = new Map(doctors.map((d: any) => [String(d._id), d]))

    // Map schedules with enriched data
    const items = allSettings.map((s: any) => {
      const doctor = doctorMap.get(String(s.doctorId))
      const isMySchedule = String(s.doctorId) === String(doctorId)

      return {
        id: String(s._id),
        doctorId: String(s.doctorId),
        doctorName: doctor?.name || doctor?.email || "Doctor",
        availability: s.availability || {},
        slotDuration: s.slotDuration || 30,
        updatedAt: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "",
        isMySchedule,
      }
    })

    return NextResponse.json({ items })
  } catch (e) {
    return NextResponse.json({ items: [] })
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
    const availability = body?.availability || {}
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const settings = db.collection("doctor_settings")
    await settings.updateOne(
      { doctorId: new ObjectId(doctorId) },
      { $set: { availability, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
