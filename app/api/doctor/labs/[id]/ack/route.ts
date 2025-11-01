import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string
  const doctorName = (session.user as any).name || (session.user as any).email

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const labs = db.collection("labs")
    const overrides = db.collection("dev_overrides")
    const _id = (() => {
      try {
        return new ObjectId(params.id)
      } catch {
        return null
      }
    })()
    if (_id) {
      const labDoc = await labs.findOne({ _id, doctorId: new ObjectId(doctorId) })
      if (labDoc) {
        await labs.updateOne({ _id }, { $set: { acknowledged: true, updatedAt: new Date() } })
        try {
          await db.collection("activities").insertOne({
            userId: labDoc.patientId,
            type: "Lab",
            desc: `Doctor ${doctorName} acknowledged lab: ${labDoc.test || "Result"}`,
            createdAt: new Date(),
          })
        } catch {}
        return NextResponse.json({ ok: true, id: params.id, acknowledged: true })
      }
    }
    await overrides.updateOne(
      { type: "lab", doctorId: new ObjectId(doctorId), itemId: params.id },
      { $set: { acknowledged: true, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    )
    return NextResponse.json({ ok: true, id: params.id, acknowledged: true })
  } catch {
    return NextResponse.json({ ok: true, id: params.id, acknowledged: true })
  }
}
