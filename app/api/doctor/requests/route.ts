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
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const requests = await db
      .collection("requests")
      .find({ doctorId: new ObjectId(doctorId), status: { $in: ["Pending", null] } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json(
      requests.map((r: any) => ({
        id: String(r._id),
        patient: r.patientName || String(r.patientId || "Patient"),
        request: r.request || r.type || "Request",
        date: new Date(r.createdAt).toLocaleString(),
        status: r.status || "Pending",
      }))
    )
  } catch (e) {
    return NextResponse.json([])
  }
}
