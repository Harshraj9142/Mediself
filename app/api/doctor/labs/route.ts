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
    { id: "lab1", patient: "John Doe", test: "CBC", result: "Normal", flagged: false, date: new Date().toLocaleDateString(), acknowledged: false },
    { id: "lab2", patient: "Jane Smith", test: "Lipid Panel", result: "LDL 170 (High)", flagged: true, date: new Date().toLocaleDateString(), acknowledged: false },
  ]
  return NextResponse.json(items)
}
