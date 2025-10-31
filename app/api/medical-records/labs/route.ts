import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const userId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const col = db.collection("lab_reports")
    const docs = await col
      .find({ patientId: new ObjectId(userId) })
      .sort({ date: -1 })
      .limit(100)
      .toArray()

    return NextResponse.json(
      docs.map((d: any) => ({
        id: String(d._id),
        test: d.test || d.name || "Test",
        value: d.value ?? "-",
        unit: d.unit || "",
        normalRange: d.normalRange || "",
        status: d.status || "normal",
        date: d.date ? new Date(d.date).toLocaleDateString() : new Date().toLocaleDateString(),
        trend: d.trend || "stable",
      }))
    )
  } catch {
    return NextResponse.json([])
  }
}
