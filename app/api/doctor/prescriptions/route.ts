import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

type Rx = { id: string; patient: string; medication: string; dosage: string; date: string; status: string }

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  let body: any
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  const { patientId, medication, dosage } = body || {}
  if (!patientId || !medication || !dosage) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const users = db.collection("users")
    const patients = await users.findOne({ _id: new ObjectId(patientId) })
    if (!patients) return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    const patientName = (patients as any)?.name || (patients as any)?.email || "Patient"

    const res = await db.collection("prescriptions").insertOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(patientId),
      patientName,
      medication,
      dosage,
      status: "Pending",
      createdAt: new Date(),
    })
    return NextResponse.json({ ok: true, id: String(res.insertedId) })
  } catch (e) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}

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
    const prescriptions = db.collection("prescriptions")
    const users = db.collection("users")

    // Build query for ALL prescriptions
    const query: any = {}
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { medication: { $regex: search, $options: "i" } },
        { drug: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count
    const total = await prescriptions.countDocuments(query)

    // Get paginated prescriptions
    const list = await prescriptions
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

    // Map prescriptions with enriched data
    const items = list.map((r: any) => {
      const doctor = doctorMap.get(String(r.doctorId))
      const patient = patientMap.get(String(r.patientId))
      const isMyPrescription = String(r.doctorId) === String(doctorId)

      return {
        id: String(r._id),
        patient: r.patientName || patient?.name || patient?.email || "Patient",
        patientId: String(r.patientId),
        doctor: doctor?.name || doctor?.email || "Doctor",
        doctorId: String(r.doctorId),
        medication: r.medication || r.drug || "",
        dosage: r.dosage || r.sig || "",
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
        status: r.status || "Pending",
        isMyPrescription,
      }
    })

    return NextResponse.json({ page, limit, total, items })
  } catch (e) {
    return NextResponse.json({ page: 1, limit: 50, total: 0, items: [] })
  }
}
