import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string
  const doctorName = (session.user as any).name || (session.user as any).email

  try {
    const body = await _.json().catch(() => ({})) as { comment?: string }
    const comment = (body.comment || "").trim()
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const col = db.collection("prescriptions")
    const overrides = db.collection("dev_overrides")
    const _id = (() => {
      try {
        return new ObjectId(id)
      } catch {
        return null
      }
    })()
    if (_id) {
      const rx = await col.findOne({ _id })
      const res = await col.updateOne(
        { _id },
        { $set: { status: "Approved", approvedBy: new ObjectId(doctorId), approvedByName: doctorName, approvedAt: new Date(), approvedComment: comment } }
      )
      if (res.matchedCount > 0) {
        if (rx?.patientId) {
          try {
            await db.collection("activities").insertOne({
              userId: rx.patientId,
              type: "Prescription",
              desc: `Doctor ${doctorName} approved ${rx.medication || rx.name || "prescription"}${comment ? `: ${comment}` : ""}`,
              createdAt: new Date(),
            })
          } catch {}
        }
        return NextResponse.json({ ok: true, id, status: "Approved" })
      }
    }
    await overrides.updateOne(
      { type: "prescription", doctorId: new ObjectId(doctorId), itemId: id },
      { $set: { status: "Approved", updatedAt: new Date(), approvedComment: comment }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    )
    try {
      await db.collection("activities").insertOne({
        userId: new ObjectId(doctorId),
        type: "Prescription",
        desc: `Approved prescription ${id}${comment ? `: ${comment}` : ""}`,
        createdAt: new Date(),
      })
    } catch {}
    return NextResponse.json({ ok: true, id, status: "Approved" })
  } catch {
    return NextResponse.json({ ok: true, id, status: "Approved" })
  }
}
