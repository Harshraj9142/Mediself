import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST() {
  // Block in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seeding disabled in production" }, { status: 403 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Only doctors can run seed" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    const users = db.collection("users")
    const doctorPatients = db.collection("doctor_patients")
    const appointments = db.collection("appointments")
    const prescriptions = db.collection("prescriptions")
    const labs = db.collection("labs")
    const requests = db.collection("requests")
    const reminders = db.collection("reminders")
    const reports = db.collection("reports")
    const activities = db.collection("activities")
    const doctorSettings = db.collection("doctor_settings")

    // Ensure a demo patient exists
    const demoEmail = `patient.${doctorId}@demo.local`
    let patient = await users.findOne({ email: demoEmail })
    if (!patient) {
      const res = await users.insertOne({
        email: demoEmail,
        name: "Demo Patient",
        password: "__seed__", // not used for auth
        role: "patient",
        createdAt: new Date(),
      })
      patient = { _id: res.insertedId, email: demoEmail, name: "Demo Patient", role: "patient" } as any
    }

    const docId = new ObjectId(doctorId)
    const patId = new ObjectId(patient._id)

    // Link doctor to patient
    await doctorPatients.updateOne(
      { doctorId: docId, patientId: patId },
      {
        $setOnInsert: {
          createdAt: new Date(),
        },
        $set: {
          patientName: patient.name,
          lastVisitAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          conditions: ["Hypertension"],
        },
      },
      { upsert: true }
    )

    // Today window
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(9, 0, 0, 0)
    const later = new Date(now)
    later.setHours(11, 0, 0, 0)

    // Appointments (today)
    const aptDocs = [
      { doctorId: docId, patientId: patId, patientName: patient.name, date: startOfDay, status: "Pending", reason: "Checkup", createdAt: new Date() },
      { doctorId: docId, patientId: patId, patientName: patient.name, date: later, status: "Confirmed", reason: "Follow-up", createdAt: new Date() },
    ]
    await appointments.insertMany(aptDocs)

    // Prescriptions (pending)
    await prescriptions.insertMany([
      { doctorId: docId, patientId: patId, patientName: patient.name, medication: "Atorvastatin", dosage: "10 mg OD", status: "Pending", createdAt: new Date() },
      { doctorId: docId, patientId: patId, patientName: patient.name, medication: "Metformin", dosage: "500 mg BID", status: "Pending", createdAt: new Date() },
    ])

    // Labs
    await labs.insertMany([
      { doctorId: docId, patientId: patId, patientName: patient.name, test: "CBC", result: "Normal", flagged: false, acknowledged: false, createdAt: new Date() },
      { doctorId: docId, patientId: patId, patientName: patient.name, test: "Lipid Panel", result: "LDL 170 (High)", flagged: true, acknowledged: false, createdAt: new Date() },
    ])

    // Requests
    await requests.insertMany([
      { doctorId: docId, patientId: patId, patientName: patient.name, request: "Refill prescription", createdAt: new Date() },
      { doctorId: docId, patientId: patId, patientName: patient.name, request: "Share lab results", createdAt: new Date() },
    ])

    // Patient reminders/reports/activities
    await reminders.insertMany([
      { patientId: patId, active: true, title: "Take meds", createdAt: new Date() },
      { patientId: patId, active: true, title: "Drink water", createdAt: new Date() },
    ])
    await reports.insertMany([
      { patientId: patId, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), type: "Blood Test" },
      { patientId: patId, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), type: "ECG" },
    ])
    await activities.insertMany([
      { userId: patId, type: "Login", desc: "Signed in", createdAt: new Date() },
      { userId: patId, type: "Appointment", desc: "Booked appointment", createdAt: new Date(Date.now() - 1000 * 60 * 60) },
    ])

    // Doctor settings (availability)
    await doctorSettings.updateOne(
      { doctorId: docId },
      {
        $set: {
          availability: {
            Mon: { start: "09:00", end: "17:00", enabled: true },
            Tue: { start: "09:00", end: "17:00", enabled: true },
            Wed: { start: "09:00", end: "17:00", enabled: true },
            Thu: { start: "09:00", end: "17:00", enabled: true },
            Fri: { start: "09:00", end: "17:00", enabled: true },
            Sat: { start: "10:00", end: "14:00", enabled: true },
            Sun: { start: "00:00", end: "00:00", enabled: false },
          },
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    )

    return NextResponse.json({ ok: true, doctorId, patientId: String(patId) })
  } catch (e) {
    return NextResponse.json({ error: "Seed failed" }, { status: 500 })
  }
}
