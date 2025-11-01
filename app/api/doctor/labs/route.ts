import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const labs = db.collection("labs")
    const overrides = db.collection("dev_overrides")

    const list = await labs
      .find({ doctorId: new ObjectId(doctorId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    const mapped = list.map((r: any) => ({
      id: String(r._id),
      patient: r.patientName || String(r.patientId || "Patient"),
      test: r.test || r.type || "",
      result: r.result || "",
      flagged: !!r.flagged,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
      acknowledged: !!r.acknowledged,
    }))

    const overrideDocs = await overrides
      .find({ type: "lab", doctorId: new ObjectId(doctorId) })
      .project({ itemId: 1, acknowledged: 1 })
      .toArray()
    const overrideMap = new Map<string, boolean>()
    overrideDocs.forEach((o: any) => overrideMap.set(String(o.itemId), !!o.acknowledged))
    const applyOverrides = (arr: any[]) => arr.map((it) => ({ ...it, acknowledged: overrideMap.get(it.id) ?? it.acknowledged }))

    if (mapped.length > 0) return NextResponse.json(applyOverrides(mapped))

    // Fallback demo list
    const demo = [
      { id: "lab1", patient: "John Doe", test: "CBC", result: "Normal", flagged: false, date: new Date().toLocaleDateString(), acknowledged: false },
      { id: "lab2", patient: "Jane Smith", test: "Lipid Panel", result: "LDL 170 (High)", flagged: true, date: new Date().toLocaleDateString(), acknowledged: false },
    ]
    return NextResponse.json(applyOverrides(demo))
  } catch (e) {
    const demo = [
      { id: "lab1", patient: "John Doe", test: "CBC", result: "Normal", flagged: false, date: new Date().toLocaleDateString(), acknowledged: false },
      { id: "lab2", patient: "Jane Smith", test: "Lipid Panel", result: "LDL 170 (High)", flagged: true, date: new Date().toLocaleDateString(), acknowledged: false },
    ]
    return NextResponse.json(demo)
  }
}
