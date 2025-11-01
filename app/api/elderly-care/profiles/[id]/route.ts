import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id as string

  const { id } = await params
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const profiles = db.collection("elderly_profiles")

    const profile = await profiles.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) })
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await profiles.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) })

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(userId),
        type: "Elderly Care",
        desc: `Removed elderly profile for ${profile.name || "someone"}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, message: "Profile deleted successfully" })
  } catch (e) {
    console.error("Elderly profile DELETE error:", e)
    return NextResponse.json({ error: "Failed to delete", message: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id as string

  const { id } = await params
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  try {
    const body = await req.json().catch(() => ({}))

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const profiles = db.collection("elderly_profiles")

    const existing = await profiles.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const update: any = { updatedAt: new Date() }
    if (body.name) update.name = body.name
    if (body.age !== undefined) update.age = parseInt(body.age, 10)
    if (body.relationship !== undefined) update.relationship = body.relationship
    if (body.condition !== undefined) update.condition = body.condition
    if (body.status) update.status = body.status
    if (body.phone !== undefined) update.phone = body.phone
    if (body.email !== undefined) update.email = body.email
    if (body.address !== undefined) update.address = body.address
    if (body.medications !== undefined) update.medications = Array.isArray(body.medications) ? body.medications : []
    if (body.caregiverId !== undefined) update.caregiverId = body.caregiverId ? new ObjectId(body.caregiverId) : null
    if (body.emergencyContact !== undefined) update.emergencyContact = body.emergencyContact
    if (body.notes !== undefined) update.notes = body.notes

    await profiles.updateOne({ _id: new ObjectId(id), userId: new ObjectId(userId) }, { $set: update })

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(userId),
        type: "Elderly Care",
        desc: `Updated elderly profile for ${body.name || existing.name || "someone"}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, message: "Profile updated successfully" })
  } catch (e) {
    console.error("Elderly profile PATCH error:", e)
    return NextResponse.json({ error: "Failed to update", message: String(e) }, { status: 500 })
  }
}
