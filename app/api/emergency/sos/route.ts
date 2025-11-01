import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id as string
  const userName = (session.user as any).name || (session.user as any).email

  try {
    const body = await req.json().catch(() => ({}))
    const location = body.location || null

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const sosAlerts = db.collection("sos_alerts")

    const doc = {
      userId: new ObjectId(userId),
      userName: userName,
      location: location,
      status: "active",
      createdAt: new Date(),
    }

    const result = await sosAlerts.insertOne(doc)

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(userId),
        type: "Emergency",
        desc: "SOS alert activated",
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, id: String(result.insertedId) })
  } catch (e) {
    return NextResponse.json({ error: "Failed to send SOS" }, { status: 500 })
  }
}
