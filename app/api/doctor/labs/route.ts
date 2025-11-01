import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  const { searchParams } = new URL(req.url)
  const search = (searchParams.get("search") || "").trim().toLowerCase()
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
  const skip = (page - 1) * limit

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const labs = db.collection("labs")
    const users = db.collection("users")

    // Build query for ALL labs
    const query: any = {}
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { test: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { result: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count
    const total = await labs.countDocuments(query)

    // Get paginated labs
    const list = await labs
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get unique doctor and patient IDs for enrichment
    const doctorIds = [...new Set(list.map((r: any) => String(r.doctorId)).filter(Boolean))].map(id => new ObjectId(id))
    const patientIds = [...new Set(list.map((r: any) => String(r.patientId)).filter(Boolean))].map(id => new ObjectId(id))

    // Fetch doctor and patient details
    const doctors = doctorIds.length > 0
      ? await users.find({ _id: { $in: doctorIds } }).project({ name: 1, email: 1 }).toArray()
      : []
    const patients = patientIds.length > 0
      ? await users.find({ _id: { $in: patientIds } }).project({ name: 1, email: 1 }).toArray()
      : []

    const doctorMap = new Map(doctors.map((d: any) => [String(d._id), d]))
    const patientMap = new Map(patients.map((p: any) => [String(p._id), p]))

    // Map labs with enriched data
    const items = list.map((r: any) => {
      const doctor = doctorMap.get(String(r.doctorId))
      const patient = patientMap.get(String(r.patientId))
      const isMyLab = String(r.doctorId) === String(doctorId)

      return {
        id: String(r._id),
        patient: r.patientName || patient?.name || patient?.email || "Patient",
        patientId: String(r.patientId),
        doctor: doctor?.name || doctor?.email || "Doctor",
        doctorId: String(r.doctorId),
        test: r.test || r.type || "",
        result: r.result || "",
        flagged: !!r.flagged,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
        acknowledged: !!r.acknowledged,
        isMyLab,
      }
    })

    return NextResponse.json({ page, limit, total, items })
  } catch (e) {
    return NextResponse.json({ page: 1, limit: 50, total: 0, items: [] })
  }
}
