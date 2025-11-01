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
    const prescriptionsCol = db.collection("prescriptions")
    const labsCol = db.collection("labs")

    const today = new Date()
    const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)

    const [
      // Appointments
      upcomingAppointments,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      // Prescriptions
      totalPrescriptions,
      approvedPrescriptions,
      pendingPrescriptions,
      // Labs
      totalLabs,
      flaggedLabs,
      acknowledgedLabs,
      // Reports
      totalReports,
      recentReports,
      // Reminders
      activeReminders,
      // Activity
      recentActivity,
    ] = await Promise.all([
      // Appointments counts
      appointmentsCol.countDocuments({ patientId: new ObjectId(userId), date: { $gte: today } }).catch(() => 0),
      appointmentsCol.countDocuments({ patientId: new ObjectId(userId) }).catch(() => 0),
      appointmentsCol.countDocuments({ patientId: new ObjectId(userId), status: "Completed" }).catch(() => 0),
      appointmentsCol.countDocuments({ patientId: new ObjectId(userId), status: "Pending" }).catch(() => 0),
      // Prescriptions counts
      prescriptionsCol.countDocuments({ patientId: new ObjectId(userId) }).catch(() => 0),
      prescriptionsCol.countDocuments({ patientId: new ObjectId(userId), status: "Approved" }).catch(() => 0),
      prescriptionsCol.countDocuments({ patientId: new ObjectId(userId), status: "Pending" }).catch(() => 0),
      // Labs counts
      labsCol.countDocuments({ patientId: new ObjectId(userId) }).catch(() => 0),
      labsCol.countDocuments({ patientId: new ObjectId(userId), flagged: true }).catch(() => 0),
      labsCol.countDocuments({ patientId: new ObjectId(userId), acknowledged: true }).catch(() => 0),
      // Reports counts
      reportsCol.countDocuments({ patientId: new ObjectId(userId) }).catch(() => 0),
      reportsCol.countDocuments({ patientId: new ObjectId(userId), createdAt: { $gte: thirtyDaysAgo } }).catch(() => 0),
      // Reminders count
      remindersCol.countDocuments({ patientId: new ObjectId(userId), active: true }).catch(() => 0),
      // Recent activity
      activitiesCol
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()
        .catch(() => [] as any[]),
    ])

    // Calculate health score based on activity
    let healthScore = 70
    if (acknowledgedLabs > 0) healthScore += 5
    if (completedAppointments > 0) healthScore += 10
    if (approvedPrescriptions > 0) healthScore += 5
    if (activeReminders > 0) healthScore += 5
    if (flaggedLabs === 0) healthScore += 5
    healthScore = Math.min(100, healthScore)

    return NextResponse.json({
      stats: {
        // Appointments
        upcomingAppointments,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        // Prescriptions
        totalPrescriptions,
        approvedPrescriptions,
        pendingPrescriptions,
        // Labs
        totalLabs,
        flaggedLabs,
        acknowledgedLabs,
        // Reports
        totalReports,
        recentReports,
        // Reminders
        activeReminders,
        // Health
        healthScore,
      },
      recentActivity: recentActivity.map((a) => ({
        type: a.type || "Activity",
        desc: a.desc || a.description || "",
        time: a.time || new Date(a.createdAt).toLocaleString(),
      })),
    })
  } catch (e) {
    return NextResponse.json({
      stats: {
        upcomingAppointments: 0,
        totalAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        totalPrescriptions: 0,
        approvedPrescriptions: 0,
        pendingPrescriptions: 0,
        totalLabs: 0,
        flaggedLabs: 0,
        acknowledgedLabs: 0,
        totalReports: 0,
        recentReports: 0,
        activeReminders: 0,
        healthScore: 70,
      },
      recentActivity: [],
    })
  }
}
