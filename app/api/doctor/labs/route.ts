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

    return NextResponse.json(mapped)
  } catch (e) {
    return NextResponse.json([])
  }
}
