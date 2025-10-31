import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"

export async function POST(req: Request) {
  try {
    const body = await req.json() as { name: string; email: string; password: string; role?: "patient" | "doctor" }
    const name = body.name?.trim()
    const email = body.email?.toLowerCase().trim()
    const password = body.password
    const role = body.role === "doctor" ? "doctor" : "patient"

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const users = db.collection("users")

    const existing = await users.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const { insertedId } = await users.insertOne({ name, email, password: hashed, role, emailVerified: null })

    return NextResponse.json({ id: String(insertedId) }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
