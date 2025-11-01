import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Get complete medical history timeline for a patient
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  const { id } = await params
  if (!id || !ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    // Verify relationship
    const relation = await db.collection("doctor_patients").findOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(id),
    })

    if (!relation) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

    // Gather all history from different collections
    const [appointments, prescriptions, labs, medicalRecords, reports, vitals] = await Promise.all([
      db.collection("appointments")
        .find({ patientId: new ObjectId(id) })
        .sort({ date: -1 })
        .toArray(),
      db.collection("prescriptions")
        .find({ patientId: new ObjectId(id) })
        .sort({ createdAt: -1 })
        .toArray(),
      db.collection("labs")
        .find({ patientId: new ObjectId(id) })
        .sort({ createdAt: -1 })
        .toArray(),
      db.collection("medical_records")
        .find({ patientId: new ObjectId(id) })
        .sort({ date: -1 })
        .toArray(),
      db.collection("reports")
        .find({ patientId: new ObjectId(id) })
        .sort({ createdAt: -1 })
        .toArray(),
      db.collection("patient_vitals")
        .find({ patientId: new ObjectId(id) })
        .sort({ recordedAt: -1 })
        .toArray(),
    ])

    // Create unified timeline
    const timeline: any[] = []

    appointments.forEach((apt: any) => {
      timeline.push({
        type: "appointment",
        date: apt.date || apt.createdAt,
        title: `Appointment: ${apt.reason || "Consultation"}`,
        description: `Status: ${apt.status || "Pending"}`,
        data: {
          id: String(apt._id),
          doctorName: apt.doctorName,
          reason: apt.reason,
          status: apt.status,
          location: apt.location,
        },
      })
    })

    prescriptions.forEach((rx: any) => {
      timeline.push({
        type: "prescription",
        date: rx.createdAt,
        title: `Prescription: ${rx.medication || rx.name}`,
        description: `${rx.dosage || ""} - ${rx.status || "Pending"}`,
        data: {
          id: String(rx._id),
          medication: rx.medication,
          dosage: rx.dosage,
          frequency: rx.frequency,
          duration: rx.duration,
          status: rx.status,
        },
      })
    })

    labs.forEach((lab: any) => {
      timeline.push({
        type: "lab",
        date: lab.createdAt,
        title: `Lab: ${lab.test || "Test"}`,
        description: `Result: ${lab.result || "Pending"}${lab.flagged ? " ⚠️ Flagged" : ""}`,
        data: {
          id: String(lab._id),
          test: lab.test,
          result: lab.result,
          unit: lab.unit,
          normalRange: lab.normalRange,
          flagged: lab.flagged,
        },
      })
    })

    medicalRecords.forEach((rec: any) => {
      timeline.push({
        type: "medical_record",
        date: rec.date || rec.createdAt,
        title: `Medical Record: ${rec.title || "Record"}`,
        description: rec.description || rec.diagnosis || "",
        data: {
          id: String(rec._id),
          title: rec.title,
          diagnosis: rec.diagnosis,
          treatment: rec.treatment,
          category: rec.category,
        },
      })
    })

    reports.forEach((rep: any) => {
      timeline.push({
        type: "report",
        date: rep.createdAt,
        title: `Report: ${rep.type || "Report"}`,
        description: rep.notes || "",
        data: {
          id: String(rep._id),
          type: rep.type,
          fileUrl: rep.fileUrl,
        },
      })
    })

    vitals.forEach((vital: any) => {
      const vitalsList = []
      if (vital.bloodPressureSystolic) vitalsList.push(`BP: ${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}`)
      if (vital.heartRate) vitalsList.push(`HR: ${vital.heartRate}`)
      if (vital.temperature) vitalsList.push(`Temp: ${vital.temperature}°C`)
      if (vital.oxygenSaturation) vitalsList.push(`O2: ${vital.oxygenSaturation}%`)

      timeline.push({
        type: "vitals",
        date: vital.recordedAt || vital.createdAt,
        title: "Vital Signs",
        description: vitalsList.join(", "),
        data: {
          id: String(vital._id),
          bloodPressureSystolic: vital.bloodPressureSystolic,
          bloodPressureDiastolic: vital.bloodPressureDiastolic,
          heartRate: vital.heartRate,
          temperature: vital.temperature,
          oxygenSaturation: vital.oxygenSaturation,
          weight: vital.weight,
          height: vital.height,
          bmi: vital.bmi,
        },
      })
    })

    // Sort by date descending
    timeline.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })

    return NextResponse.json({
      patientId: id,
      totalEvents: timeline.length,
      timeline: timeline.map((item) => ({
        ...item,
        date: item.date ? new Date(item.date).toISOString() : null,
      })),
    })
  } catch (e) {
    console.error("Patient history GET error:", e)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
