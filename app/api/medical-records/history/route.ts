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

    // Try unified collection first
    const unified = await db
      .collection("medical_history")
      .find({ patientId: new ObjectId(userId) })
      .toArray()
      .catch(() => [] as any[])

    let conditions: any[] = []
    let allergies: any[] = []
    let events: any[] = []

    if (unified.length) {
      conditions = unified.filter((d: any) => d.kind === "condition")
      allergies = unified.filter((d: any) => d.kind === "allergy")
      events = unified.filter((d: any) => d.kind === "event")
    } else {
      // Fallback to separate collections if present
      conditions = await db
        .collection("conditions")
        .find({ patientId: new ObjectId(userId) })
        .toArray()
        .catch(() => [])
      allergies = await db
        .collection("allergies")
        .find({ patientId: new ObjectId(userId) })
        .toArray()
        .catch(() => [])
      events = await db
        .collection("history_events")
        .find({ patientId: new ObjectId(userId) })
        .sort({ date: -1 })
        .toArray()
        .catch(() => [])
    }

    return NextResponse.json({
      conditions: conditions.map((c: any) => ({
        name: c.name || c.condition || "Condition",
        since: c.since || c.sinceDate || "",
        severity: c.severity || "mild",
      })),
      allergies: allergies.map((a: any) => ({
        name: a.name || a.allergen || "Allergy",
        severity: a.severity || "moderate",
        reaction: a.reaction || "",
      })),
      history: events.map((e: any) => ({
        id: String(e._id),
        event: e.event || e.title || "Event",
        date: e.date ? new Date(e.date).toLocaleDateString() : new Date().toLocaleDateString(),
        doctor: e.doctor || e.source || "",
        status: e.status || "completed",
      })),
    })
  } catch {
    return NextResponse.json({ conditions: [], allergies: [], history: [] })
  }
}
