import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id as string

  const { searchParams } = new URL(req.url)
  const elderlyId = searchParams.get("elderlyId") || ""

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const healthData = db.collection("elderly_health_monitoring")
    const profiles = db.collection("elderly_profiles")

    // If elderlyId specified, get data for that person
    if (elderlyId && ObjectId.isValid(elderlyId)) {
      const data = await healthData
        .find({ userId: new ObjectId(userId), elderlyId: new ObjectId(elderlyId) })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()

      const profile = await profiles.findOne({ _id: new ObjectId(elderlyId), userId: new ObjectId(userId) })

      return NextResponse.json({
        elderlyName: profile?.name || "Unknown",
        data: data.map((d: any) => ({
          id: String(d._id),
          heartRate: d.heartRate || null,
          bloodPressure: d.bloodPressure || null,
          bloodSugar: d.bloodSugar || null,
          temperature: d.temperature || null,
          oxygen: d.oxygen || null,
          notes: d.notes || "",
          recordedAt: d.createdAt ? new Date(d.createdAt).toLocaleString() : "",
        })),
      })
    }

    // Otherwise get latest for all elderly profiles
    const elderlyProfiles = await profiles
      .find({ userId: new ObjectId(userId) })
      .toArray()

    const result = await Promise.all(
      elderlyProfiles.map(async (profile: any) => {
        const latest = await healthData
          .findOne({ userId: new ObjectId(userId), elderlyId: profile._id }, { sort: { createdAt: -1 } })

        return {
          id: String(profile._id),
          name: profile.name || "",
          age: profile.age || 0,
          heartRate: latest?.heartRate || null,
          bloodPressure: latest?.bloodPressure || null,
          bloodSugar: latest?.bloodSugar || null,
          temperature: latest?.temperature || null,
          oxygen: latest?.oxygen || null,
          lastRecorded: latest?.createdAt ? new Date(latest.createdAt).toLocaleString() : null,
        }
      })
    )

    return NextResponse.json({ items: result })
  } catch (e) {
    console.error("Health monitoring GET error:", e)
    return NextResponse.json({ items: [] })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as any).id as string

  try {
    const body = await req.json().catch(() => ({}))
    if (!body.elderlyId) {
      return NextResponse.json({ error: "elderlyId required" }, { status: 400 })
    }

    if (!ObjectId.isValid(body.elderlyId)) {
      return NextResponse.json({ error: "Invalid elderlyId" }, { status: 400 })
    }

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const healthData = db.collection("elderly_health_monitoring")
    const profiles = db.collection("elderly_profiles")

    // Verify profile exists and belongs to user
    const profile = await profiles.findOne({ _id: new ObjectId(body.elderlyId), userId: new ObjectId(userId) })
    if (!profile) {
      return NextResponse.json({ error: "Elderly profile not found" }, { status: 404 })
    }

    const doc = {
      userId: new ObjectId(userId),
      elderlyId: new ObjectId(body.elderlyId),
      elderlyName: profile.name,
      heartRate: body.heartRate || null,
      bloodPressure: body.bloodPressure || null,
      bloodSugar: body.bloodSugar || null,
      temperature: body.temperature || null,
      oxygen: body.oxygen || null,
      notes: body.notes || "",
      createdAt: new Date(),
    }

    const result = await healthData.insertOne(doc)

    // Log activity
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(userId),
        type: "Elderly Care",
        desc: `Recorded health data for ${profile.name}`,
        createdAt: new Date(),
      })
    } catch {}

    return NextResponse.json({ ok: true, id: String(result.insertedId), message: "Health data recorded successfully" })
  } catch (e) {
    console.error("Health monitoring POST error:", e)
    return NextResponse.json({ error: "Failed to record", message: String(e) }, { status: 500 })
  }
}
