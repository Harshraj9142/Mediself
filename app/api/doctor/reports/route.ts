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
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
  const skip = (page - 1) * limit

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const reports = db.collection("reports")
    const users = db.collection("users")

    // Build query for ALL reports
    const query: any = {}
    if (search) {
      query.$or = [
        { type: { $regex: search, $options: "i" } },
        { fileUrl: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count
    const total = await reports.countDocuments(query)

    // Get paginated reports
    const list = await reports
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

    // Map reports with enriched data
    const items = list.map((r: any) => {
      const doctor = doctorMap.get(String(r.doctorId))
      const patient = patientMap.get(String(r.patientId))
      const isMyReport = String(r.doctorId) === String(doctorId)

      return {
        id: String(r._id),
        patient: patient?.name || patient?.email || "Patient",
        patientId: String(r.patientId),
        doctor: doctor?.name || doctor?.email || "Doctor",
        doctorId: String(r.doctorId),
        type: r.type || "Report",
        fileUrl: r.fileUrl || null,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
        isMyReport,
      }
    })

    return NextResponse.json({ page, limit, total, items })
  } catch (e) {
    return NextResponse.json({ page: 1, limit: 50, total: 0, items: [] })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string
  const doctorName = (session.user as any).name || (session.user as any).email

  try {
    const body = await req.json().catch(() => ({})) as { patientId?: string; type?: string; fileUrl?: string }
    const patientId = body.patientId || ""
    const type = (body.type || "").trim()
    const fileUrl = (body.fileUrl || "").trim()
    if (!patientId || !ObjectId.isValid(patientId) || !type) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    // Access control: ensure relation exists
    const rel = await db.collection("doctor_patients").findOne({ doctorId: new ObjectId(doctorId), patientId: new ObjectId(patientId) })
    if (!rel) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { insertedId } = await db.collection("reports").insertOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(patientId),
      type,
      fileUrl: fileUrl || null,
      createdAt: new Date(),
    })
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(patientId),
        type: "Report",
        desc: `Doctor ${doctorName} added report: ${type}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, id: String(insertedId) }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
