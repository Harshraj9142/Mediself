import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

function startOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function endOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const userId = (session.user as any).id as string

  const { searchParams } = new URL(req.url)
  const period = (searchParams.get("period") || "today") as "today" | "upcoming" | "history"
  const search = (searchParams.get("search") || "").trim().toLowerCase()
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
  const skip = (page - 1) * limit

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const col = db.collection("reminders")

    const todayStart = startOfDay()
    const todayEnd = endOfDay()

    let query: any = { patientId: new ObjectId(userId) }
    if (period === "today") {
      query.scheduledAt = { $gte: todayStart, $lte: todayEnd }
    } else if (period === "upcoming") {
      query.scheduledAt = { $gt: todayEnd }
    } else if (period === "history") {
      query.scheduledAt = { $lt: todayStart }
    }

    // Add search filter
    if (search) {
      query.$or = [
        { medicine: { $regex: search, $options: "i" } },
        { dosage: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
        { frequency: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count
    const total = await col.countDocuments(query)

    // Get paginated items
    const items = await col
      .find(query)
      .sort({ scheduledAt: period === "history" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const result = items.map((r: any) => ({
      id: String(r._id),
      medicine: r.medicine || "Medicine",
      dosage: r.dosage || "",
      time: r.scheduledAt ? new Date(r.scheduledAt).toLocaleString() : "",
      scheduledAt: r.scheduledAt,
      frequency: r.frequency || "daily",
      status: r.status || "pending",
      reason: r.reason || "",
      createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
      active: r.active !== false,
    }))

    return NextResponse.json({ page, limit, total, items: result, period })
  } catch (e) {
    return NextResponse.json({ page: 1, limit: 50, total: 0, items: [], period })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const userId = (session.user as any).id as string

  try {
    const body = (await req.json()) as {
      medicine: string
      dosage: string
      frequency: string
      time: string // HH:mm
      reason?: string
      date?: string // optional yyyy-mm-dd
    }
    if (!body.medicine || !body.dosage || !body.time) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const scheduleDate = body.date ? new Date(body.date) : new Date()
    const [hh, mm] = body.time.split(":").map((v) => parseInt(v, 10))
    scheduleDate.setHours(hh || 0, mm || 0, 0, 0)
    const now = new Date()
    if (scheduleDate < now) {
      // push to next day if time already passed today
      scheduleDate.setDate(scheduleDate.getDate() + 1)
    }

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const col = db.collection("reminders")

    const doc = {
      patientId: new ObjectId(userId),
      medicine: body.medicine,
      dosage: body.dosage,
      frequency: body.frequency || "daily",
      time: body.time,
      scheduledAt: scheduleDate,
      reason: body.reason || "",
      status: "pending",
      createdAt: new Date(),
    }

    const { insertedId } = await col.insertOne(doc)
    return NextResponse.json({ id: String(insertedId) }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
