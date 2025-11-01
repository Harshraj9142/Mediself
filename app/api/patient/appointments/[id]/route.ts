import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const patientId = (session.user as any).id as string

  const id = params.id
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const res = await db.collection("appointments").deleteOne({ _id: new ObjectId(id), patientId: new ObjectId(patientId) })
    if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const patientId = (session.user as any).id as string

  const id = params.id
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  let body: any
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  const dateISO = body?.dateISO
  const reason = body?.reason
  if (!dateISO) return NextResponse.json({ error: "Missing dateISO" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const apts = db.collection("appointments")

    // verify ownership and get doctorId
    const current = await apts.findOne({ _id: new ObjectId(id), patientId: new ObjectId(patientId) })
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const doctorId = current.doctorId
    if (!doctorId) return NextResponse.json({ error: "Invalid appointment" }, { status: 400 })

    const newDate = new Date(dateISO)
    if (isNaN(newDate.getTime())) return NextResponse.json({ error: "Invalid dateISO" }, { status: 400 })

    // conflict check: is there any other appointment for same doctor at that time?
    const conflict = await apts.findOne({
      _id: { $ne: new ObjectId(id) },
      doctorId: new ObjectId(doctorId),
      date: newDate,
    })
    if (conflict) return NextResponse.json({ error: "Slot already taken" }, { status: 409 })

    const update: any = { date: newDate, updatedAt: new Date() }
    if (typeof reason === "string" && reason.trim()) update.reason = reason.trim()

    await apts.updateOne({ _id: new ObjectId(id) }, { $set: update })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
