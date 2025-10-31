import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const userId = (session.user as any).id as string

  const id = params.id
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  try {
    const body = await req.json().catch(() => ({})) as Partial<{
      medicine: string
      dosage: string
      frequency: string
      time: string
      reason: string
      status: string
      scheduledAt: string
    }>

    const update: any = {}
    if (body.medicine !== undefined) update.medicine = body.medicine
    if (body.dosage !== undefined) update.dosage = body.dosage
    if (body.frequency !== undefined) update.frequency = body.frequency
    if (body.time !== undefined) update.time = body.time
    if (body.reason !== undefined) update.reason = body.reason
    if (body.status !== undefined) update.status = body.status
    if (body.scheduledAt !== undefined) update.scheduledAt = new Date(body.scheduledAt)

    if (Object.keys(update).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 })

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    const result = await db.collection("reminders").updateOne(
      { _id: new ObjectId(id), patientId: new ObjectId(userId) },
      { $set: update }
    )

    if (result.matchedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const userId = (session.user as any).id as string

  const id = params.id
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    const result = await db.collection("reminders").deleteOne({ _id: new ObjectId(id), patientId: new ObjectId(userId) })
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
