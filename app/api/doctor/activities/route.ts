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
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
  const skip = (page - 1) * limit

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const activities = db.collection("activities")

    const total = await activities.countDocuments({ userId: new ObjectId(doctorId) })
    
    const items = await activities
      .find({ userId: new ObjectId(doctorId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      page,
      limit,
      total,
      items: items.map((a: any) => ({
        id: String(a._id),
        type: a.type || "Activity",
        desc: a.desc || "",
        timestamp: a.createdAt ? new Date(a.createdAt).toLocaleString() : "",
        date: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "",
        time: a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      })),
    })
  } catch (e) {
    console.error("Activities GET error:", e)
    return NextResponse.json({ page: 1, limit: 20, total: 0, items: [] })
  }
}
