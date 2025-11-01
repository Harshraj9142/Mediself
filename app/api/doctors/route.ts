import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"

export async function GET() {
  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const users = db.collection("users")
    const docs = await users
      .find({ role: "doctor" })
      .project({ name: 1, email: 1 })
      .limit(200)
      .toArray()
    return NextResponse.json(
      docs.map((d: any) => ({ id: String(d._id), name: d.name || d.email, email: d.email }))
    )
  } catch (e) {
    return NextResponse.json([])
  }
}
