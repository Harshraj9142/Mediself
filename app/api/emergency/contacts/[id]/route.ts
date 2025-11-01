import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id as string

  const { id } = await params

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const contacts = db.collection("emergency_contacts")

    await contacts.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id as string

  const { id } = await params

  try {
    const body = await req.json().catch(() => ({}))
    
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const contacts = db.collection("emergency_contacts")

    const update: any = {}
    if (body.name) update.name = body.name
    if (body.relationship !== undefined) update.relationship = body.relationship
    if (body.phone) update.phone = body.phone
    if (body.email !== undefined) update.email = body.email

    await contacts.updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { $set: update }
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
