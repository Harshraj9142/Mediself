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
  const search = (searchParams.get("search") || "").trim().toLowerCase()
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)))
  const skip = (page - 1) * limit

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    const relations = db.collection("doctor_patients")
    const users = db.collection("users")

    const relCursor = relations.find({ doctorId: new ObjectId(doctorId) })
    const total = await relCursor.count().catch(() => 0)
    const rels = await relCursor.skip(skip).limit(limit).toArray()

    const patientIds = rels.map((r: any) => r.patientId).filter(Boolean)
    const details = patientIds.length
      ? await users
          .find({ _id: { $in: patientIds.map((id: any) => (typeof id === "string" ? new ObjectId(id) : id)) } })
          .project({ name: 1, email: 1 })
          .toArray()
      : []

    const byId = new Map<string, any>()
    details.forEach((d: any) => byId.set(String(d._id), d))

    let items = rels.map((r: any) => {
      const info = byId.get(String(r.patientId)) || {}
      return {
        id: String(r.patientId || r._id),
        name: r.patientName || info.name || "Patient",
        email: info.email || "",
        lastVisitAt: r.lastVisitAt || null,
        conditions: r.conditions || [],
      }
    })

    if (search) {
      items = items.filter((p) => p.name.toLowerCase().includes(search) || p.email.toLowerCase().includes(search))
    }

    return NextResponse.json({ page, limit, total, items })
  } catch (e) {
    return NextResponse.json({ page, limit, total: 0, items: [] })
  }
}
