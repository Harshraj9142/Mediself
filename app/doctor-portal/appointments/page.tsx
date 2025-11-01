"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useEffect, useState } from "react"

type Apt = { id: string; patient: string; date: string; time: string; reason: string; status: string }

export default function DoctorAppointments() {
  const [items, setItems] = useState<Apt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const load = async (q?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set("search", q)
      const res = await fetch(`/api/doctor/appointments?${params.toString()}`)
      if (res.ok) setItems(await res.json())
      else setItems([])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const setStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/doctor/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)))
    } catch {}
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Manage Appointments</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => load(search)}>Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              className="flex-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(search)}
            />
            <Button variant="outline" onClick={() => load(search)}>Search</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : items).map((apt) => (
                  <tr key={apt.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-4 text-foreground">{apt.patient}</td>
                    <td className="py-3 px-4 text-muted-foreground">{apt.date} - {apt.time}</td>
                    <td className="py-3 px-4 text-foreground">{apt.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status?.toLowerCase() === "confirmed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : apt.status?.toLowerCase() === "completed"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : apt.status?.toLowerCase() === "cancelled"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setStatus(apt.id, "Confirmed")}>
                        Confirm
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setStatus(apt.id, "Completed")}>
                        Complete
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 bg-transparent" onClick={() => setStatus(apt.id, "Cancelled")}>
                        Cancel
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td className="py-3 px-4 text-sm text-muted-foreground" colSpan={5}>No appointments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
