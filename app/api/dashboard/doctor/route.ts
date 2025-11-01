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
  if (role !== "doctor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const doctorId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    const appointmentsCol = db.collection("appointments")
    const relationsCol = db.collection("doctor_patients")
    const usersCol = db.collection("users")
    const prescriptionsCol = db.collection("prescriptions")
    const labsCol = db.collection("labs")
    const reportsCol = db.collection("reports")

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const [
      // Patients
      myPatients,
      totalPatientsInSystem,
      // Appointments
      myTodaysAppointments,
      myCompletedToday,
      myPendingToday,
      totalAppointments,
      myTotalAppointments,
      // Prescriptions
      myPrescriptions,
      myPendingPrescriptions,
      totalPrescriptions,
      // Labs
      myLabs,
      myUnacknowledgedLabs,
      totalLabs,
      // Reports
      myReports,
      totalReports,
      // Lists
      todayList,
      requests,
    ] = await Promise.all([
      // Patients counts
      relationsCol.countDocuments({ doctorId: new ObjectId(doctorId) }).catch(() => 0),
      usersCol.countDocuments({ role: "patient" }).catch(() => 0),
      // Appointments counts
      appointmentsCol.countDocuments({ doctorId: new ObjectId(doctorId), date: { $gte: startOfDay, $lte: endOfDay } }).catch(() => 0),
      appointmentsCol.countDocuments({ doctorId: new ObjectId(doctorId), status: "Completed", date: { $gte: startOfDay, $lte: endOfDay } }).catch(() => 0),
      appointmentsCol.countDocuments({ doctorId: new ObjectId(doctorId), status: "Pending", date: { $gte: startOfDay, $lte: endOfDay } }).catch(() => 0),
      appointmentsCol.countDocuments({}).catch(() => 0),
      appointmentsCol.countDocuments({ doctorId: new ObjectId(doctorId) }).catch(() => 0),
      // Prescriptions counts
      prescriptionsCol.countDocuments({ doctorId: new ObjectId(doctorId) }).catch(() => 0),
      prescriptionsCol.countDocuments({ doctorId: new ObjectId(doctorId), status: "Pending" }).catch(() => 0),
      prescriptionsCol.countDocuments({}).catch(() => 0),
      // Labs counts
      labsCol.countDocuments({ doctorId: new ObjectId(doctorId) }).catch(() => 0),
      labsCol.countDocuments({ doctorId: new ObjectId(doctorId), acknowledged: { $ne: true } }).catch(() => 0),
      labsCol.countDocuments({}).catch(() => 0),
      // Reports counts
      reportsCol.countDocuments({ doctorId: new ObjectId(doctorId) }).catch(() => 0),
      reportsCol.countDocuments({}).catch(() => 0),
      // Today's appointments list
      appointmentsCol
        .find({ doctorId: new ObjectId(doctorId), date: { $gte: startOfDay, $lte: endOfDay } })
        .sort({ date: 1 })
        .limit(10)
        .toArray()
        .catch(() => [] as any[]),
      // Requests list
      db.collection("requests")
        .find({ doctorId: new ObjectId(doctorId) })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()
        .catch(() => [] as any[]),
    ])

    return NextResponse.json({
      stats: {
        // Patients
        myPatients,
        totalPatients: totalPatientsInSystem,
        // Today's appointments
        todaysAppointments: myTodaysAppointments,
        completedToday: myCompletedToday,
        pendingToday: myPendingToday,
        // All appointments
        myTotalAppointments,
        totalAppointments,
        // Prescriptions
        myPrescriptions,
        myPendingPrescriptions,
        totalPrescriptions,
        // Labs
        myLabs,
        myUnacknowledgedLabs,
        totalLabs,
        // Reports
        myReports,
        totalReports,
      },
      todayList: todayList.map((a) => ({
        id: String(a._id),
        time: new Date(a.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        patient: a.patientName || String(a.patientId || "Patient"),
        reason: a.reason || "Consultation",
        status: a.status || "Pending",
      })),
      requests: requests.map((r) => ({
        patient: r.patientName || String(r.patientId || "Patient"),
        request: r.request || r.type || "Request",
        date: new Date(r.createdAt).toLocaleString(),
      })),
    })
  } catch (e) {
    return NextResponse.json({
      stats: {
        myPatients: 0,
        totalPatients: 0,
        todaysAppointments: 0,
        completedToday: 0,
        pendingToday: 0,
        myTotalAppointments: 0,
        totalAppointments: 0,
        myPrescriptions: 0,
        myPendingPrescriptions: 0,
        totalPrescriptions: 0,
        myLabs: 0,
        myUnacknowledgedLabs: 0,
        totalLabs: 0,
        myReports: 0,
        totalReports: 0,
      },
      todayList: [],
      requests: [],
    })
  }
}
