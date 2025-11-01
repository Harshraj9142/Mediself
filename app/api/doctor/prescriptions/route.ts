import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as any).role
  if (role !== "doctor") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Demo data; replace with DB query later
  const items = [
    { id: "rx1", patient: "John Doe", medication: "Atorvastatin", dosage: "10 mg OD", date: new Date().toLocaleDateString(), status: "Pending" },
    { id: "rx2", patient: "Jane Smith", medication: "Metformin", dosage: "500 mg BID", date: new Date().toLocaleDateString(), status: "Pending" },
  ]
  return NextResponse.json(items)
}
