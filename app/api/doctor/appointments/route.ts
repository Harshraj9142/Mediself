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
  const search = (searchParams.get("search") || "").trim().toLowerCase()
  const day = searchParams.get("day") // optional ISO date filter

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const col = db.collection("appointments")

    const query: any = { doctorId: new ObjectId(doctorId) }
    if (day) {
      const d = new Date(day)
      const start = new Date(d)
      start.setHours(0, 0, 0, 0)
      const end = new Date(d)
      end.setHours(23, 59, 59, 999)
      query.date = { $gte: start, $lte: end }
    }

    let list = await col.find(query).sort({ date: 1 }).limit(300).toArray()

    const mapped = list.map((a: any) => ({
      id: String(a._id),
      patient: a.patientName || String(a.patientId || "Patient"),
      date: new Date(a.date).toLocaleDateString(),
      time: new Date(a.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      reason: a.reason || "Consultation",
      status: a.status || "Pending",
    }))

    const filtered = search
      ? mapped.filter(
          (x) =>
            x.patient.toLowerCase().includes(search) ||
            x.reason.toLowerCase().includes(search) ||
            x.status.toLowerCase().includes(search)
        )
      : mapped

    return NextResponse.json(filtered)
  } catch (e) {
    return NextResponse.json([])
  }
}
