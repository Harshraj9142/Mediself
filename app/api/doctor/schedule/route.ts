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
    const settings = db.collection("doctor_settings")
    const doc = await settings.findOne({ doctorId: new ObjectId(doctorId) })
    return NextResponse.json({ availability: (doc as any)?.availability || {} })
  } catch (e) {
    return NextResponse.json({ availability: {} })
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
