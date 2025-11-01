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
    const caregivers = db.collection("caregivers")

    const caregiver = await caregivers.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) })
    if (!caregiver) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await caregivers.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) })

    // Remove caregiver reference from elderly profiles
    await db.collection("elderly_profiles").updateMany(
      { userId: new ObjectId(userId), caregiverId: new ObjectId(id) },
      { $set: { caregiverId: null } }
    )

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(userId),
        type: "Elderly Care",
        desc: `Removed caregiver ${caregiver.name || "someone"}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, message: "Caregiver deleted successfully" })
  } catch (e) {
    console.error("Caregiver DELETE error:", e)
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
    const caregivers = db.collection("caregivers")

    const existing = await caregivers.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const update: any = { updatedAt: new Date() }
    if (body.name) update.name = body.name
    if (body.role !== undefined) update.role = body.role
    if (body.phone !== undefined) update.phone = body.phone
    if (body.email !== undefined) update.email = body.email
    if (body.status) update.status = body.status
    if (body.address !== undefined) update.address = body.address
    if (body.notes !== undefined) update.notes = body.notes

    await caregivers.updateOne({ _id: new ObjectId(id), userId: new ObjectId(userId) }, { $set: update })

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(userId),
        type: "Elderly Care",
        desc: `Updated caregiver ${body.name || existing.name || "someone"}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, message: "Caregiver updated successfully" })
  } catch (e) {
    console.error("Caregiver PATCH error:", e)
    return NextResponse.json({ error: "Failed to update", message: String(e) }, { status: 500 })
  }
}
