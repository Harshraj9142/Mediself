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
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const doctorId = (session.user as any).id as string

  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get("id") || searchParams.get("patientId")
  if (!patientId || !ObjectId.isValid(patientId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  try {
    const client = (await clientPromise) as MongoClient
    const db = client.db(process.env.MONGODB_DB)

    // Access control: ensure relation exists
    const rel = await db.collection("doctor_patients").findOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(patientId),
    })
    if (!rel) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const users = db.collection("users")
    const profiles = db.collection("patient_profiles")
    const activities = db.collection("activities")
    const appointments = db.collection("appointments")
    const prescriptions = db.collection("prescriptions")
    const labs = db.collection("labs")
    const reports = db.collection("reports")
    const reminders = db.collection("reminders")

    const [user, profile, activityList, appts, meds, labList, reportList, reminderList] = await Promise.all([
      users.findOne({ _id: new ObjectId(patientId) }, { projection: { name: 1, email: 1 } }),
      profiles.findOne({ userId: new ObjectId(patientId) }),
      activities.find({ userId: new ObjectId(patientId) }).sort({ createdAt: -1 }).limit(25).toArray(),
      appointments
        .find({ patientId: new ObjectId(patientId) })
        .sort({ date: -1 })
        .limit(25)
        .toArray(),
      prescriptions
        .find({ patientId: new ObjectId(patientId) })
        .sort({ createdAt: -1 })
        .limit(25)
        .toArray(),
      labs
        .find({ patientId: new ObjectId(patientId) })
        .sort({ createdAt: -1 })
        .limit(25)
        .toArray(),
      reports
        .find({ patientId: new ObjectId(patientId) })
        .sort({ createdAt: -1 })
        .limit(25)
        .toArray(),
      reminders
        .find({ patientId: new ObjectId(patientId) })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray(),
    ])

    return NextResponse.json({
      profile: {
        id: patientId,
        name: (profile as any)?.name || (user as any)?.name || (user as any)?.email || "Patient",
        email: (user as any)?.email || null,
        dob: (profile as any)?.dob || null,
        gender: (profile as any)?.gender || null,
        phone: (profile as any)?.phone || null,
        address: (profile as any)?.address || null,
        allergies: (profile as any)?.allergies || [],
        medications: (profile as any)?.medications || [],
        conditions: (profile as any)?.conditions || [],
        emergencyContact: (profile as any)?.emergencyContact || null,
        insurance: (profile as any)?.insurance || null,
        bloodType: (profile as any)?.bloodType || null,
        heightCm: (profile as any)?.heightCm ?? null,
        weightKg: (profile as any)?.weightKg ?? null,
        notes: (profile as any)?.notes || "",
      },
      activities: activityList.map((a: any) => ({
        type: a.type || "Activity",
        desc: a.desc || a.description || "",
        at: a.createdAt ? new Date(a.createdAt).toISOString() : null,
      })),
      appointments: appts.map((a: any) => ({
        id: String(a._id),
        date: a.date ? new Date(a.date).toISOString() : null,
        doctorId: String(a.doctorId),
        reason: a.reason || "",
        status: a.status || "Pending",
      })),
      prescriptions: meds.map((p: any) => ({
        id: String(p._id),
        medication: p.medication || p.name || "",
        dosage: p.dosage || "",
        status: p.status || "Pending",
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
      })),
      labs: labList.map((l: any) => ({
        id: String(l._id),
        test: l.test || "",
        result: l.result || "",
        flagged: !!l.flagged,
        acknowledged: !!l.acknowledged,
        createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : null,
      })),
      reports: reportList.map((r: any) => ({
        id: String(r._id),
        type: r.type || "Report",
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      })),
      reminders: reminderList.map((r: any) => ({
        id: String(r._id),
        title: r.title || r.text || "Reminder",
        active: !!r.active,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      })),
    })
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
