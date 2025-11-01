"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useEffect, useState } from "react"

type Apt = { id: string; patient: string; patientId: string; doctor: string; doctorId: string; date: string; time: string; dateTime: Date; reason: string; status: string; isMyAppointment: boolean }

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
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      } else setItems([])
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-cyan-50/20 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">All Appointments</h2>
          <p className="text-sm text-muted-foreground mt-1">View and manage all appointments in the system</p>
        </div>
        <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg" onClick={() => load(search)}>Refresh</Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
                My Appointment
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                Other Doctor
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by patient, doctor, reason..."
                className="flex-1 sm:w-80"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load(search)}
              />
              <Button variant="outline" onClick={() => load(search)}>Search</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Doctor</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : items).map((apt) => (
                  <tr key={apt.id} className={`border-b border-border transition-colors ${
                    apt.isMyAppointment 
                      ? "hover:bg-teal-50/30 dark:hover:bg-teal-950/10" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-900/10"
                  }`}>
                    <td className="py-3 px-4">
                      {apt.isMyAppointment ? (
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
                    <td className="py-3 px-4 text-foreground font-medium">{apt.patient}</td>
                    <td className="py-3 px-4 text-foreground">{apt.doctor}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <div className="text-sm">{apt.date}</div>
                      <div className="text-xs text-muted-foreground">{apt.time}</div>
                    </td>
                    <td className="py-3 px-4 text-foreground">{apt.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status?.toLowerCase() === "confirmed"
                            ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400"
                            : apt.status?.toLowerCase() === "completed"
                              ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-400"
                              : apt.status?.toLowerCase() === "cancelled"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {apt.isMyAppointment ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="hover:bg-teal-50 dark:hover:bg-teal-950/20" onClick={() => setStatus(apt.id, "Confirmed")}>
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-950/20" onClick={() => setStatus(apt.id, "Completed")}>
                            Complete
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => setStatus(apt.id, "Cancelled")}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">View only</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td className="py-8 text-center text-muted-foreground" colSpan={7}>
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">📅</div>
                        <div>No appointments found</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
