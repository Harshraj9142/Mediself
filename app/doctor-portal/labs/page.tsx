"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Lab = { id: string; patient: string; patientId: string; doctor: string; doctorId: string; test: string; result: string; flagged: boolean; date: string; acknowledged: boolean; isMyLab: boolean }

export default function DoctorLabsPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Lab[]>([])
  const [search, setSearch] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      const res = await fetch(`/api/doctor/labs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-cyan-50/20 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">All Lab Results</h2>
          <p className="text-sm text-muted-foreground mt-1">View and acknowledge all lab results in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by patient, test, result..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="w-64"
          />
          <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg" onClick={load}>Search</Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lab Results Queue</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
                My Lab
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                Other Doctor
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Type</th>
                  <th className="py-2">Patient</th>
                  <th className="py-2">Doctor</th>
                  <th className="py-2">Test</th>
                  <th className="py-2">Result</th>
                  <th className="py-2">Flag</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : items).map((r) => (
                  <tr key={r.id} className={`border-t border-border transition-colors ${
                    r.isMyLab 
                      ? "hover:bg-teal-50/30 dark:hover:bg-teal-950/10" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-900/10"
                  }`}>
                    <td className="py-2">
                      {r.isMyLab ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse" />
                          <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            Mine
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            Other
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 font-medium text-foreground">{r.patient}</td>
                    <td className="py-2 text-muted-foreground">{r.doctor}</td>
                    <td className="py-2">{r.test}</td>
                    <td className="py-2 font-mono text-sm">{r.result}</td>
                    <td className="py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        r.flagged
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      }`}>
                        {r.flagged ? "⚠️ Abnormal" : "✓ Normal"}
                      </span>
                    </td>
                    <td className="py-2 text-sm text-muted-foreground">{r.date}</td>
                    <td className="py-2">
                      {r.isMyLab ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled={r.acknowledged} 
                          onClick={() => ack(r.id)}
                          className={r.acknowledged ? "" : "hover:bg-teal-50 dark:hover:bg-teal-950/20"}
                        >
                          {r.acknowledged ? "✓ Acknowledged" : "Acknowledge"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">View only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && items.length === 0 && (
              <tr>
                <td className="py-8 text-center text-muted-foreground" colSpan={8}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl">🔬</div>
                    <div>No lab results found</div>
                  </div>
                </td>
              </tr>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
