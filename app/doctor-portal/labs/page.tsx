"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Lab = { id: string; patient: string; test: string; result: string; flagged: boolean; date: string; acknowledged: boolean }

export default function DoctorLabsPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Lab[]>([])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/doctor/labs")
      if (res.ok) setItems(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const ack = async (id: string) => {
    try {
      const res = await fetch(`/api/doctor/labs/${id}/ack`, { method: "POST" })
      if (res.ok) load()
    } catch {}
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Lab Results</h2>
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
                  <th className="py-2">Test</th>
                  <th className="py-2">Result</th>
                  <th className="py-2">Flag</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : items).map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">{r.patient}</td>
                    <td className="py-2">{r.test}</td>
                    <td className="py-2">{r.result}</td>
                    <td className={`py-2 ${r.flagged ? "text-red-600" : "text-muted-foreground"}`}>{r.flagged ? "Abnormal" : "Normal"}</td>
                    <td className="py-2">{r.date}</td>
                    <td className="py-2">
                      <Button size="sm" variant="outline" disabled={r.acknowledged} onClick={() => ack(r.id)}>
                        {r.acknowledged ? "Acknowledged" : "Acknowledge"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && items.length === 0 && <div className="text-sm text-muted-foreground mt-2">No lab results.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
