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
  const dayParam = searchParams.get("day") // ISO date (yyyy-mm-dd)

  const day = dayParam ? new Date(dayParam) : new Date()
  const startOfDay = new Date(day)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(day)
  endOfDay.setHours(23, 59, 59, 999)

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const appointmentsCol = db.collection("appointments")

    const list = await appointmentsCol
      .find({ doctorId: new ObjectId(doctorId), date: { $gte: startOfDay, $lte: endOfDay } })
      .sort({ date: 1 })
      .toArray()

    return NextResponse.json(
      list.map((a: any) => ({
        id: String(a._id),
        time: new Date(a.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        patient: a.patientName || String(a.patientId || "Patient"),
        reason: a.reason || "Consultation",
        status: a.status || "Pending",
      }))
    )
  } catch (e) {
    return NextResponse.json([])
  }
}
