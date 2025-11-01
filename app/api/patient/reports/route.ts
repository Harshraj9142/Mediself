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
    const items = await db
      .collection("reports")
      .find({ patientId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray()

    return NextResponse.json(
      items.map((r: any) => ({
        id: String(r._id),
        type: r.type || "Report",
        fileUrl: r.fileUrl || null,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      }))
    )
  } catch (e) {
    return NextResponse.json([])
  }
}
