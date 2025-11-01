import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "overview" // overview, patients, appointments, revenue

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    switch (type) {
      case "overview":
        return getOverviewAnalytics(db, doctorId, last30Days, last7Days)
      case "patients":
        return getPatientAnalytics(db, doctorId)
      case "appointments":
        return getAppointmentAnalytics(db, doctorId)
      case "revenue":
        return getRevenueAnalytics(db, doctorId, last30Days)
      default:
        return getOverviewAnalytics(db, doctorId, last30Days, last7Days)
    }
  } catch (e) {
    console.error("Analytics GET error:", e)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

async function getOverviewAnalytics(db: any, doctorId: string, last30Days: Date, last7Days: Date) {
  const appointments = db.collection("appointments")
  const relations = db.collection("doctor_patients")
  const prescriptions = db.collection("prescriptions")
  const labs = db.collection("labs")

  const [
    totalPatients,
    newPatientsLast30Days,
    totalAppointments,
    appointmentsLast7Days,
    completedAppointmentsLast30Days,
    cancelledAppointmentsLast30Days,
    totalPrescriptions,
    prescriptionsLast30Days,
    totalLabs,
    labsLast30Days,
    flaggedLabs,
  ] = await Promise.all([
    relations.countDocuments({ doctorId: new ObjectId(doctorId) }),
    relations.countDocuments({ doctorId: new ObjectId(doctorId), createdAt: { $gte: last30Days } }),
    appointments.countDocuments({ doctorId: new ObjectId(doctorId) }),
    appointments.countDocuments({ doctorId: new ObjectId(doctorId), createdAt: { $gte: last7Days } }),
    appointments.countDocuments({ doctorId: new ObjectId(doctorId), status: "Completed", createdAt: { $gte: last30Days } }),
    appointments.countDocuments({ doctorId: new ObjectId(doctorId), status: "Cancelled", createdAt: { $gte: last30Days } }),
    prescriptions.countDocuments({ doctorId: new ObjectId(doctorId) }),
    prescriptions.countDocuments({ doctorId: new ObjectId(doctorId), createdAt: { $gte: last30Days } }),
    labs.countDocuments({ doctorId: new ObjectId(doctorId) }),
    labs.countDocuments({ doctorId: new ObjectId(doctorId), createdAt: { $gte: last30Days } }),
    labs.countDocuments({ doctorId: new ObjectId(doctorId), flagged: true }),
  ])

  return NextResponse.json({
    type: "overview",
    patients: {
      total: totalPatients,
      newLast30Days: newPatientsLast30Days,
    },
    appointments: {
      total: totalAppointments,
      last7Days: appointmentsLast7Days,
      completedLast30Days: completedAppointmentsLast30Days,
      cancelledLast30Days: cancelledAppointmentsLast30Days,
      cancellationRate: totalAppointments > 0
        ? Math.round((cancelledAppointmentsLast30Days / totalAppointments) * 100)
        : 0,
    },
    prescriptions: {
      total: totalPrescriptions,
      last30Days: prescriptionsLast30Days,
    },
    labs: {
      total: totalLabs,
      last30Days: labsLast30Days,
      flagged: flaggedLabs,
    },
  })
}

async function getPatientAnalytics(db: any, doctorId: string) {
  const relations = db.collection("doctor_patients")

  // Get patient conditions distribution
  const conditionsPipeline = await relations.aggregate([
    { $match: { doctorId: new ObjectId(doctorId) } },
    { $unwind: "$conditions" },
    { $group: { _id: "$conditions", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]).toArray()

  const topConditions = conditionsPipeline.map((c: any) => ({
    condition: c._id,
    count: c.count
  }))

  return NextResponse.json({
    type: "patients",
    topConditions,
  })
}

async function getAppointmentAnalytics(db: any, doctorId: string) {
  const appointments = db.collection("appointments")

  // Appointments by status
  const statusDistribution = await appointments.aggregate([
    { $match: { doctorId: new ObjectId(doctorId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).toArray()

  // Appointments by month (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const monthlyTrend = await appointments.aggregate([
    {
      $match: {
        doctorId: new ObjectId(doctorId),
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]).toArray()

  return NextResponse.json({
    type: "appointments",
    statusDistribution: statusDistribution.map((s: any) => ({
      status: s._id || "Unknown",
      count: s.count
    })),
    monthlyTrend: monthlyTrend.map((m: any) => ({
      month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      count: m.count
    })),
  })
}

async function getRevenueAnalytics(db: any, doctorId: string, last30Days: Date) {
  const appointments = db.collection("appointments")
  const settings = db.collection("doctor_settings")

  // Get doctor's consultation fee
  const doctorSettings = await settings.findOne({ doctorId: new ObjectId(doctorId) })
  const consultationFee = doctorSettings?.consultationFee || 0

  // Calculate revenue from completed appointments
  const completedAppointments = await appointments.countDocuments({
    doctorId: new ObjectId(doctorId),
    status: "Completed",
    createdAt: { $gte: last30Days }
  })

  const estimatedRevenue = completedAppointments * consultationFee

  return NextResponse.json({
    type: "revenue",
    consultationFee,
    completedAppointmentsLast30Days: completedAppointments,
    estimatedRevenueLast30Days: estimatedRevenue,
  })
}
