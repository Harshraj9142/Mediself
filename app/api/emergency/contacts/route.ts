import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const contacts = db.collection("emergency_contacts")

    const docs = await contacts
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      items: docs.map((d: any) => ({
        id: String(d._id),
        name: d.name || "",
        relationship: d.relationship || "",
        phone: d.phone || "",
        email: d.email || "",
        createdAt: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "",
      })),
    })
  } catch (e) {
    return NextResponse.json({ items: [] })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id as string

  try {
    const body = await req.json().catch(() => ({}))
    if (!body.name || !body.phone) {
      return NextResponse.json({ error: "Name and phone required" }, { status: 400 })
    }

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const contacts = db.collection("emergency_contacts")

    const doc = {
      userId: new ObjectId(userId),
      name: body.name,
      relationship: body.relationship || "",
      phone: body.phone,
      email: body.email || "",
      createdAt: new Date(),
    }

    const result = await contacts.insertOne(doc)
    return NextResponse.json({ ok: true, id: String(result.insertedId) })
  } catch (e) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
