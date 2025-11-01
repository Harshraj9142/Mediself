import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const id = params.id
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const res = await db.collection("prescriptions").deleteOne({ _id: new ObjectId(id) })
    if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
