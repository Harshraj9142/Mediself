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
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const userId = (session.user as any).id as string

  const { searchParams } = new URL(req.url)
  const search = (searchParams.get("search") || "").trim().toLowerCase()
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
  const skip = (page - 1) * limit

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const records = db.collection("records")
    const users = db.collection("users")

    // Build query for patient's records
    const query: any = { patientId: new ObjectId(userId) }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { doctor: { $regex: search, $options: "i" } },
        { source: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count
    const total = await records.countDocuments(query)

    // Get paginated records
    const docs = await records
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Fetch doctor details if doctorId is present
    const doctorIds = [...new Set(docs.map((r: any) => String(r.doctorId)).filter(Boolean))].map(id => new ObjectId(id))
    const doctors = doctorIds.length > 0
      ? await users.find({ _id: { $in: doctorIds } }).project({ name: 1, email: 1 }).toArray()
      : []
    const doctorMap = new Map(doctors.map((d: any) => [String(d._id), d]))

    const items = docs.map((d: any) => {
      const doctor = doctorMap.get(String(d.doctorId))
      return {
        id: String(d._id),
        title: d.title || d.name || "Medical Record",
        description: d.description || "",
        date: d.date ? new Date(d.date).toLocaleDateString() : new Date(d.createdAt || Date.now()).toLocaleDateString(),
        doctor: d.doctor || doctor?.name || doctor?.email || d.source || "Unknown",
        doctorId: String(d.doctorId || ""),
        type: d.type || "Document",
        category: d.category || "General",
        fileUrl: d.fileUrl || d.url || null,
        size: d.size || "-",
        createdAt: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "",
      }
    })

    return NextResponse.json({ page, limit, total, items })
  } catch (e) {
    return NextResponse.json({ page: 1, limit: 50, total: 0, items: [] })
  }
}
