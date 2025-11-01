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
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
  const skip = (page - 1) * limit

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const caregivers = db.collection("caregivers")
    const elderlyProfiles = db.collection("elderly_profiles")

    const query: any = { userId: new ObjectId(userId) }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    const total = await caregivers.countDocuments(query)
    
    const items = await caregivers
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Count elderly profiles for each caregiver
    const caregiverIds = items.map((c: any) => c._id)
    const elderlyCounts = await elderlyProfiles.aggregate([
      { $match: { userId: new ObjectId(userId), caregiverId: { $in: caregiverIds } } },
      { $group: { _id: "$caregiverId", count: { $sum: 1 } } }
    ]).toArray()
    
    const countMap = new Map<string, number>()
    elderlyCounts.forEach((c: any) => countMap.set(String(c._id), c.count))

    return NextResponse.json({
      page,
      limit,
      total,
      items: items.map((c: any) => ({
        id: String(c._id),
        name: c.name || "",
        role: c.role || "",
        phone: c.phone || "",
        email: c.email || "",
        status: c.status || "active",
        elderlyCount: countMap.get(String(c._id)) || 0,
        address: c.address || "",
        notes: c.notes || "",
        createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
      })),
    })
  } catch (e) {
    console.error("Caregivers GET error:", e)
    return NextResponse.json({ page: 1, limit: 50, total: 0, items: [] })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id as string

  try {
    const body = await req.json().catch(() => ({}))
    if (!body.name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 })
    }

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const caregivers = db.collection("caregivers")

    const doc = {
      userId: new ObjectId(userId),
      name: body.name,
      role: body.role || "",
      phone: body.phone || "",
      email: body.email || "",
      status: body.status || "active",
      address: body.address || "",
      notes: body.notes || "",
      createdAt: new Date(),
    }

    const result = await caregivers.insertOne(doc)

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(userId),
        type: "Elderly Care",
        desc: `Added caregiver ${body.name}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, id: String(result.insertedId), message: "Caregiver added successfully" })
  } catch (e) {
    console.error("Caregiver POST error:", e)
    return NextResponse.json({ error: "Failed to create", message: String(e) }, { status: 500 })
  }
}
