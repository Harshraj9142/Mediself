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
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const doctorId = searchParams.get("doctorId")
  const date = searchParams.get("date") // YYYY-MM-DD format

  if (!doctorId || !ObjectId.isValid(doctorId)) {
    return NextResponse.json({ error: "Invalid doctorId" }, { status: 400 })
  }

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const users = db.collection("users")
    const settings = db.collection("doctor_settings")
    const appointments = db.collection("appointments")

    // Get doctor info
    const doctor = await users.findOne({ _id: new ObjectId(doctorId), role: "doctor" })
    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 })

    // Get doctor settings
    const docSettings = (await settings.findOne({ doctorId: new ObjectId(doctorId) })) as any

    // Weekly availability
    const availability = docSettings?.availability || {
      Mon: { enabled: true, start: "09:00", end: "17:00" },
      Tue: { enabled: true, start: "09:00", end: "17:00" },
      Wed: { enabled: true, start: "09:00", end: "17:00" },
      Thu: { enabled: true, start: "09:00", end: "17:00" },
      Fri: { enabled: true, start: "09:00", end: "17:00" },
      Sat: { enabled: false, start: "09:00", end: "17:00" },
      Sun: { enabled: false, start: "09:00", end: "17:00" },
    }

    // If date is provided, get booked slots for that date
    let bookedSlots: string[] = []
    if (date) {
      const targetDate = new Date(date)
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      const dayAppointments = await appointments
        .find({
          doctorId: new ObjectId(doctorId),
          date: { $gte: startOfDay, $lte: endOfDay },
        })
        .toArray()

      bookedSlots = dayAppointments.map((apt: any) => {
        const d = new Date(apt.date)
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
      })
    }

    return NextResponse.json({
      doctor: {
        id: String(doctor._id),
        name: (doctor as any).name || (doctor as any).email,
        email: (doctor as any).email,
      },
      availability,
      bookedSlots,
      slotDuration: docSettings?.slotDuration || 30, // minutes
    })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
