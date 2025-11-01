"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Rx = { id: string; patient: string; medication: string; dosage: string; date: string; status: "Pending" | "Approved" | "Declined" }

export default function DoctorPrescriptionsPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Rx[]>([])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/doctor/prescriptions")
      if (res.ok) setItems(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const act = async (id: string, action: "approve" | "decline") => {
    try {
      const res = await fetch(`/api/doctor/prescriptions/${id}/${action}`, { method: "POST" })
      if (res.ok) load()
    } catch {}
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Prescriptions</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Patient</th>
                  <th className="py-2">Medication</th>
                  <th className="py-2">Dosage</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : items).map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">{r.patient}</td>
                    <td className="py-2">{r.medication}</td>
                    <td className="py-2">{r.dosage}</td>
                    <td className="py-2">{r.date}</td>
                    <td className="py-2">{r.status}</td>
                    <td className="py-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => act(r.id, "decline")}>Decline</Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => act(r.id, "approve")}>
                        Approve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && items.length === 0 && <div className="text-sm text-muted-foreground mt-2">No prescriptions.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
