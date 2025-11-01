import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id as string

  const { searchParams } = new URL(req.url)
  const search = (searchParams.get("search") || "").trim().toLowerCase()
  const status = searchParams.get("status") || ""
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
  const skip = (page - 1) * limit

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const profiles = db.collection("elderly_profiles")

    const query: any = { userId: new ObjectId(userId) }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { relationship: { $regex: search, $options: "i" } },
        { condition: { $regex: search, $options: "i" } },
      ]
    }
    
    if (status) {
      query.status = status
    }

    const total = await profiles.countDocuments(query)
    
    const items = await profiles
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      page,
      limit,
      total,
      items: items.map((p: any) => ({
        id: String(p._id),
        name: p.name || "",
        age: p.age || 0,
        relationship: p.relationship || "",
        condition: p.condition || "",
        status: p.status || "stable",
        phone: p.phone || "",
        email: p.email || "",
        address: p.address || "",
        medications: p.medications || [],
        caregiverId: p.caregiverId ? String(p.caregiverId) : null,
        emergencyContact: p.emergencyContact || null,
        notes: p.notes || "",
        createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
      })),
    })
  } catch (e) {
    console.error("Elderly profiles GET error:", e)
    return NextResponse.json({ page: 1, limit: 50, total: 0, items: [] })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id as string

  try {
    const body = await req.json().catch(() => ({}))
    if (!body.name || !body.age) {
      return NextResponse.json({ error: "Name and age required" }, { status: 400 })
    }

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const profiles = db.collection("elderly_profiles")

    const doc = {
      userId: new ObjectId(userId),
      name: body.name,
      age: parseInt(body.age, 10),
      relationship: body.relationship || "",
      condition: body.condition || "",
      status: body.status || "stable",
      phone: body.phone || "",
      email: body.email || "",
      address: body.address || "",
      medications: Array.isArray(body.medications) ? body.medications : [],
      caregiverId: body.caregiverId ? new ObjectId(body.caregiverId) : null,
      emergencyContact: body.emergencyContact || null,
      notes: body.notes || "",
      createdAt: new Date(),
    }

    const result = await profiles.insertOne(doc)

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(userId),
        type: "Elderly Care",
        desc: `Added elderly profile for ${body.name}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, id: String(result.insertedId), message: "Profile created successfully" })
  } catch (e) {
    console.error("Elderly profile POST error:", e)
    return NextResponse.json({ error: "Failed to create", message: String(e) }, { status: 500 })
  }
}
