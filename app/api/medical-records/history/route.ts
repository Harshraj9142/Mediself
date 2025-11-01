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
    const users = db.collection("users")

    // Query for history events with search and pagination
    const historyQuery: any = { patientId: new ObjectId(userId) }
    if (search) {
      historyQuery.$or = [
        { event: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { doctor: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count for pagination
    const historyCol = db.collection("medical_history").find({ patientId: new ObjectId(userId), kind: "event" })
    const totalHistory = await historyCol.count().catch(() => 0)

    // Get paginated events
    const events = await db
      .collection("medical_history")
      .find({ ...historyQuery, kind: "event" })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
      .catch(() => [] as any[])

    // Fetch doctor details for events
    const doctorIds = [...new Set(events.map((e: any) => String(e.doctorId)).filter(Boolean))].map(id => new ObjectId(id))
    const doctors = doctorIds.length > 0
      ? await users.find({ _id: { $in: doctorIds } }).project({ name: 1, email: 1 }).toArray()
      : []
    const doctorMap = new Map(doctors.map((d: any) => [String(d._id), d]))

    // Get conditions and allergies (no pagination needed, usually small lists)
    const conditions = await db
      .collection("medical_history")
      .find({ patientId: new ObjectId(userId), kind: "condition" })
      .toArray()
      .catch(() => [] as any[])

    const allergies = await db
      .collection("medical_history")
      .find({ patientId: new ObjectId(userId), kind: "allergy" })
      .toArray()
      .catch(() => [] as any[])

    return NextResponse.json({
      conditions: conditions.map((c: any) => ({
        id: String(c._id),
        name: c.name || c.condition || "Condition",
        since: c.since || c.sinceDate || "",
        severity: c.severity || "mild",
        status: c.status || "active",
        notes: c.notes || "",
      })),
      allergies: allergies.map((a: any) => ({
        id: String(a._id),
        name: a.name || a.allergen || "Allergy",
        severity: a.severity || "moderate",
        reaction: a.reaction || "",
        notes: a.notes || "",
      })),
      history: {
        page,
        limit,
        total: totalHistory,
        items: events.map((e: any) => {
          const doctor = doctorMap.get(String(e.doctorId))
          return {
            id: String(e._id),
            event: e.event || e.title || "Medical Event",
            description: e.description || "",
            date: e.date ? new Date(e.date).toLocaleDateString() : new Date(e.createdAt || Date.now()).toLocaleDateString(),
            doctor: e.doctor || doctor?.name || doctor?.email || "Unknown",
            doctorId: String(e.doctorId || ""),
            status: e.status || "completed",
            type: e.type || "General",
            notes: e.notes || "",
            createdAt: e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "",
          }
        }),
      },
    })
  } catch (e) {
    return NextResponse.json({
      conditions: [],
      allergies: [],
      history: { page: 1, limit: 50, total: 0, items: [] },
    })
  }
}
