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

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const [totalPatients, todaysAppointments, completedCount, pendingCount, todayList, requests] = await Promise.all([
      relationsCol.countDocuments({ doctorId: new ObjectId(doctorId) }).catch(() => 0),
      appointmentsCol
        .countDocuments({ doctorId: new ObjectId(doctorId), date: { $gte: startOfDay, $lte: endOfDay } })
        .catch(() => 0),
      appointmentsCol
        .countDocuments({ doctorId: new ObjectId(doctorId), status: "Completed", date: { $gte: startOfDay, $lte: endOfDay } })
        .catch(() => 0),
      appointmentsCol
        .countDocuments({ doctorId: new ObjectId(doctorId), status: "Pending", date: { $gte: startOfDay, $lte: endOfDay } })
        .catch(() => 0),
      appointmentsCol
        .find({ doctorId: new ObjectId(doctorId), date: { $gte: startOfDay, $lte: endOfDay } })
        .sort({ date: 1 })
        .limit(10)
        .toArray()
        .catch(() => [] as any[]),
      db
        .collection("requests")
        .find({ doctorId: new ObjectId(doctorId) })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()
        .catch(() => [] as any[]),
    ])

    return NextResponse.json({
      stats: {
        totalPatients,
        todaysAppointments,
        completed: completedCount,
        pending: pendingCount,
      },
      todayList: todayList.map((a) => ({
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
      stats: { totalPatients: 0, todaysAppointments: 0, completed: 0, pending: 0 },
      todayList: [],
      requests: [],
    })
  }
}
