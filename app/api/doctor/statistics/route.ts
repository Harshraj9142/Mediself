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
  const period = searchParams.get("period") || "month" // week, month, year

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    // Calculate date ranges
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }

    const appointments = db.collection("appointments")
    const prescriptions = db.collection("prescriptions")
    const labs = db.collection("labs")
    const relations = db.collection("doctor_patients")

    // Get statistics
    const [
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      appointmentsByMonth,
      totalPrescriptions,
      activePrescriptions,
      totalLabsOrdered,
      flaggedLabs,
      newPatients,
      totalPatients,
    ] = await Promise.all([
      appointments.countDocuments({
        doctorId: new ObjectId(doctorId),
        createdAt: { $gte: startDate }
      }),
      appointments.countDocuments({
        doctorId: new ObjectId(doctorId),
        status: "Completed",
        createdAt: { $gte: startDate }
      }),
      appointments.countDocuments({
        doctorId: new ObjectId(doctorId),
        status: "Pending",
        createdAt: { $gte: startDate }
      }),
      appointments.countDocuments({
        doctorId: new ObjectId(doctorId),
        status: "Cancelled",
        createdAt: { $gte: startDate }
      }),
      appointments.aggregate([
        {
          $match: {
            doctorId: new ObjectId(doctorId),
            createdAt: { $gte: startDate }
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
      ]).toArray(),
      prescriptions.countDocuments({
        doctorId: new ObjectId(doctorId),
        createdAt: { $gte: startDate }
      }),
      prescriptions.countDocuments({
        doctorId: new ObjectId(doctorId),
        status: { $ne: "Declined" },
        createdAt: { $gte: startDate }
      }),
      labs.countDocuments({
        doctorId: new ObjectId(doctorId),
        createdAt: { $gte: startDate }
      }),
      labs.countDocuments({
        doctorId: new ObjectId(doctorId),
        flagged: true,
        createdAt: { $gte: startDate }
      }),
      relations.countDocuments({
        doctorId: new ObjectId(doctorId),
        createdAt: { $gte: startDate }
      }),
      relations.countDocuments({
        doctorId: new ObjectId(doctorId)
      }),
    ])

    // Format monthly data
    const monthlyData = appointmentsByMonth.map((item: any) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      count: item.count
    }))

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        pending: pendingAppointments,
        cancelled: cancelledAppointments,
        completionRate: totalAppointments > 0 
          ? Math.round((completedAppointments / totalAppointments) * 100) 
          : 0,
        monthlyData
      },
      prescriptions: {
        total: totalPrescriptions,
        active: activePrescriptions
      },
      labs: {
        total: totalLabsOrdered,
        flagged: flaggedLabs
      },
      patients: {
        total: totalPatients,
        newPatients: newPatients
      }
    })
  } catch (e) {
    console.error("Statistics GET error:", e)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
