import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const role = (session.user as any).role
  if (role !== "patient") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const userId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    const appointmentsCol = db.collection("appointments")
    const remindersCol = db.collection("reminders")
    const reportsCol = db.collection("reports")
    const activitiesCol = db.collection("activities")

    const [upcomingAppointments, activeReminders, recentReports, recentActivity] = await Promise.all([
      appointmentsCol.countDocuments({ patientId: new ObjectId(userId), date: { $gte: new Date() } }).catch(() => 0),
      remindersCol.countDocuments({ patientId: new ObjectId(userId), active: true }).catch(() => 0),
      reportsCol.countDocuments({ patientId: new ObjectId(userId), createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) } }).catch(() => 0),
      activitiesCol
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()
        .catch(() => [] as any[]),
    ])

    return NextResponse.json({
      stats: {
        upcomingAppointments,
        activeReminders,
        recentReports,
        healthScore: 85,
      },
      recentActivity: recentActivity.map((a) => ({
        type: a.type || "Activity",
        desc: a.desc || a.description || "",
        time: a.time || new Date(a.createdAt).toLocaleString(),
      })),
    })
  } catch (e) {
    return NextResponse.json({
      stats: { upcomingAppointments: 0, activeReminders: 0, recentReports: 0, healthScore: 85 },
      recentActivity: [],
    })
  }
}
