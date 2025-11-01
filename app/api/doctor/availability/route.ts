import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Get available time slots for a doctor on a specific date
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const doctorIdParam = searchParams.get("doctorId") || ""
  const date = searchParams.get("date") || "" // YYYY-MM-DD

  if (!doctorIdParam || !ObjectId.isValid(doctorIdParam)) {
    return NextResponse.json({ error: "Valid doctorId required" }, { status: 400 })
  }

  if (!date) {
    return NextResponse.json({ error: "date required (YYYY-MM-DD)" }, { status: 400 })
  }

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)
    const settings = db.collection("doctor_settings")
    const appointments = db.collection("appointments")

    // Get doctor's schedule settings
    const doctorSettings = await settings.findOne({ doctorId: new ObjectId(doctorIdParam) })
    if (!doctorSettings) {
      return NextResponse.json({ slots: [], message: "Doctor schedule not configured" })
    }

    const availability = doctorSettings.availability || {}
    const slotDuration = doctorSettings.slotDuration || 30

    // Determine day of week
    const targetDate = new Date(date)
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const dayName = dayNames[targetDate.getDay()]

    const daySchedule = availability[dayName]
    if (!daySchedule || !daySchedule.enabled) {
      return NextResponse.json({ slots: [], message: "Doctor not available on this day" })
    }

    // Generate time slots
    const slots: string[] = []
    const startTime = daySchedule.start || "09:00"
    const endTime = daySchedule.end || "17:00"

    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    let currentHour = startHour
    let currentMin = startMin

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`
      
      // Convert to 12-hour format for display
      const hour12 = currentHour % 12 || 12
      const ampm = currentHour < 12 ? 'AM' : 'PM'
      const displayTime = `${hour12}:${String(currentMin).padStart(2, '0')} ${ampm}`
      
      slots.push(displayTime)

      // Add slot duration
      currentMin += slotDuration
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60)
        currentMin = currentMin % 60
      }
    }

    // Check existing appointments for this date
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const bookedAppointments = await appointments
      .find({
        doctorId: new ObjectId(doctorIdParam),
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: "Cancelled" }
      })
      .toArray()

    // Get booked time slots
    const bookedSlots = new Set(
      bookedAppointments.map((apt: any) => {
        const aptDate = new Date(apt.date)
        const hour12 = aptDate.getHours() % 12 || 12
        const ampm = aptDate.getHours() < 12 ? 'AM' : 'PM'
        return `${hour12}:${String(aptDate.getMinutes()).padStart(2, '0')} ${ampm}`
      })
    )

    // Filter out booked slots
    const availableSlots = slots.filter(slot => !bookedSlots.has(slot))

    return NextResponse.json({
      date,
      dayOfWeek: dayName,
      slots: availableSlots,
      totalSlots: slots.length,
      availableSlots: availableSlots.length,
      bookedSlots: slots.length - availableSlots.length,
    })
  } catch (e) {
    console.error("Availability GET error:", e)
    return NextResponse.json({ error: "Failed to fetch availability", message: String(e) }, { status: 500 })
  }
}
