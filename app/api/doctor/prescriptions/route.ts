import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

// Dev fallback cache so actions work without seeded DB data
type Rx = { id: string; patient: string; medication: string; dosage: string; date: string; status: string }
const fallbackByDoctor = new Map<string, Rx[]>()

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const col = db.collection("prescriptions")
    const overridesCol = db.collection("dev_overrides")
    const list = await col
      .find({ doctorId: new ObjectId(doctorId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    const mapped = list.map((r: any) => ({
      id: String(r._id),
      patient: r.patientName || String(r.patientId || "Patient"),
      medication: r.medication || r.drug || "",
      dosage: r.dosage || r.sig || "",
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
      status: r.status || "Pending",
    })) as Rx[]

    // Apply overrides if present
    const overrideDocs = await overridesCol
      .find({ type: "prescription", doctorId: new ObjectId(doctorId) })
      .project({ itemId: 1, status: 1 })
      .toArray()
    const overrideMap = new Map<string, string>()
    overrideDocs.forEach((o: any) => overrideMap.set(String(o.itemId), o.status))
    const applyOverrides = (arr: Rx[]) =>
      arr.map((it) => ({ ...it, status: overrideMap.get(it.id) || it.status }))

    if (mapped.length > 0) return NextResponse.json(applyOverrides(mapped))

    // Fallback to in-memory demo list
    if (!fallbackByDoctor.has(doctorId)) {
      fallbackByDoctor.set(doctorId, [
        { id: "rx1", patient: "John Doe", medication: "Atorvastatin", dosage: "10 mg OD", date: new Date().toLocaleDateString(), status: "Pending" },
        { id: "rx2", patient: "Jane Smith", medication: "Metformin", dosage: "500 mg BID", date: new Date().toLocaleDateString(), status: "Pending" },
      ])
    }
    return NextResponse.json(applyOverrides(fallbackByDoctor.get(doctorId) || []))
  } catch (e) {
    // On DB failure, still provide fallback
    if (!fallbackByDoctor.has(doctorId)) {
      fallbackByDoctor.set(doctorId, [
        { id: "rx1", patient: "John Doe", medication: "Atorvastatin", dosage: "10 mg OD", date: new Date().toLocaleDateString(), status: "Pending" },
        { id: "rx2", patient: "Jane Smith", medication: "Metformin", dosage: "500 mg BID", date: new Date().toLocaleDateString(), status: "Pending" },
      ])
    }
    return NextResponse.json(fallbackByDoctor.get(doctorId) || [])
  }
}
