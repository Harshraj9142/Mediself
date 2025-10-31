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
    const col = db.collection("records")
    const docs = await col
      .find({ patientId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    return NextResponse.json(
      docs.map((d: any) => ({
        id: String(d._id),
        title: d.title || d.name || "Record",
        date: d.date ? new Date(d.date).toLocaleDateString() : new Date(d.createdAt || Date.now()).toLocaleDateString(),
        doctor: d.doctor || d.source || "",
        type: d.type || "Document",
        size: d.size || "-",
      }))
    )
  } catch {
    return NextResponse.json([])
  }
}
