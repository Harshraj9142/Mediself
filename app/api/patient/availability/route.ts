import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

function dayKey(dateISO: string) {
  const d = new Date(dateISO)
  const idx = d.getDay() // 0=Sun ... 6=Sat
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][idx]
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":" ).map((x) => parseInt(x, 10))
  return h * 60 + m
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // Allow both roles to query availability (patients booking; doctors preview)
  const { searchParams } = new URL(req.url)
  const doctorId = searchParams.get("doctorId")
  const date = searchParams.get("date") // YYYY-MM-DD
  if (!doctorId || !date) return NextResponse.json({ error: "Missing params" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const settings = db.collection("doctor_settings")
    const appointments = db.collection("appointments")

    const doc = await settings.findOne({ doctorId: new ObjectId(doctorId) }) as any
    const key = dayKey(date)
    const rule = doc?.availability?.[key]
    if (!rule || !rule.enabled) return NextResponse.json({ slots: [] })

    const startMin = toMinutes(rule.start || "09:00")
    const endMin = toMinutes(rule.end || "17:00")
    if (endMin <= startMin) return NextResponse.json({ slots: [] })

    const dayDate = new Date(date)
    const startOfDay = new Date(dayDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(dayDate)
    endOfDay.setHours(23, 59, 59, 999)

    const existing = await appointments
      .find({ doctorId: new ObjectId(doctorId), date: { $gte: startOfDay, $lte: endOfDay } })
      .project({ date: 1 })
      .toArray()

    const taken = new Set<string>()
    existing.forEach((a: any) => {
      const d = new Date(a.date)
      const hh = d.getHours().toString().padStart(2, "0")
      const mm = d.getMinutes().toString().padStart(2, "0")
      taken.add(`${hh}:${mm}`)
    })

    const slots: string[] = []
    for (let t = startMin; t + 30 <= endMin; t += 30) {
      const hh = Math.floor(t / 60).toString().padStart(2, "0")
      const mm = (t % 60).toString().padStart(2, "0")
      const keyTime = `${hh}:${mm}`
      if (!taken.has(keyTime)) {
        // produce human format like 9:00 AM
        const d = new Date(dayDate)
        d.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0)
        const label = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
        slots.push(label)
      }
    }

    return NextResponse.json({ slots })
  } catch (e) {
    return NextResponse.json({ slots: [] })
  }
}
