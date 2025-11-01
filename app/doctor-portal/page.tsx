"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, CheckCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{ totalPatients: number; todaysAppointments: number; completed: number; pending: number }>({
    totalPatients: 0,
    todaysAppointments: 0,
    completed: 0,
    pending: 0,
  })
  const [todayList, setTodayList] = useState<Array<{ id: string; time: string; patient: string; reason: string; status: string }>>([])
  const [requests, setRequests] = useState<Array<{ patient: string; request: string; date: string; id?: string }>>([])
  const [patients, setPatients] = useState<Array<{ id: string; name: string; email: string; lastVisitAt: string | null; conditions: string[] }>>([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [patientSearch, setPatientSearch] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard/doctor")
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setTodayList(data.todayList)
          setRequests(data.requests)
        } else {
          toast({ title: "Failed to load dashboard", variant: "destructive" })
        }
      } catch {
        toast({ title: "Network error", variant: "destructive" })
      }
      setLoading(false)
    }
    load()
  }, [])

  const loadPatients = async (search?: string) => {
    setPatientsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      const res = await fetch(`/api/doctor/patients?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setPatients(
          (data.items || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            lastVisitAt: p.lastVisitAt ? new Date(p.lastVisitAt).toLocaleDateString() : null,
            conditions: Array.isArray(p.conditions) ? p.conditions : [],
          }))
        )
      }
    } catch {}
    setPatientsLoading(false)
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const actOnRequest = async (id: string, action: "approve" | "decline") => {
    try {
      const res = await fetch(`/api/doctor/requests/${id}/${action}`, { method: "POST" })
      if (res.ok) {
        // refresh requests
        const r = await fetch("/api/doctor/requests")
        if (r.ok) setRequests(await r.json())
      } else {
        toast({ title: "Request action failed", variant: "destructive" })
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" })
    }
  }

  const updateAptStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/doctor/appointments/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        // refresh dashboard blocks
        const r = await fetch("/api/dashboard/doctor")
        if (r.ok) {
          const data = await r.json()
          setStats(data.stats)
          setTodayList(data.todayList)
        }
      } else {
        toast({ title: "Failed to update appointment status", variant: "destructive" })
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" })
    }
  }

  const rescheduleApt = async (id: string) => {
    const date = window.prompt("New date (YYYY-MM-DD):") || ""
    if (!date) return
    const time = window.prompt("New time (HH:MM):") || ""
    if (!time) return
    try {
      const res = await fetch(`/api/doctor/appointments/${id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time }),
      })
      if (res.ok) {
        const r = await fetch("/api/dashboard/doctor")
        if (r.ok) {
          const data = await r.json()
          setStats(data.stats)
          setTodayList(data.todayList)
        }
        toast({ title: "Appointment rescheduled" })
      } else {
        toast({ title: "Failed to reschedule", variant: "destructive" })
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-blue-600">{loading ? "-" : stats.totalPatients}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
                <p className="text-3xl font-bold text-green-600">{loading ? "-" : stats.todaysAppointments}</p>
              </div>
              <Calendar className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600">{loading ? "-" : stats.completed}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{loading ? "-" : stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(loading ? [] : todayList).map((apt, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <div>
                  <p className="font-semibold text-foreground">{apt.patient}</p>
                  <p className="text-sm text-muted-foreground">{apt.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{apt.time}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      apt.status === "Completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : apt.status === "In Progress"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {apt.status}
                  </span>
                  <div className="flex gap-2 justify-end mt-2">
                    <Button size="sm" variant="outline" onClick={() => updateAptStatus(apt.id, "In Progress")}>In Progress</Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateAptStatus(apt.id, "Completed")}>
                      Complete
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => rescheduleApt(apt.id)}>Reschedule</Button>
                  </div>
                </div>
              </div>
            ))}
            {!loading && todayList.length === 0 && (
              <div className="text-sm text-muted-foreground">No appointments for today.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(loading ? [] : requests).map((req: any, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">{req.patient}</p>
                  <p className="text-sm text-muted-foreground">{req.request}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => req.id && actOnRequest(req.id, "decline")}>
                    Decline
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => req.id && actOnRequest(req.id, "approve")}>
                    Approve
                  </Button>
                </div>
              </div>
            ))}
            {!loading && requests.length === 0 && (
              <div className="text-sm text-muted-foreground">No requests.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patients Roster */}
      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Search patients by name or email"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
            />
            <Button onClick={() => loadPatients(patientSearch)}>Search</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Last Visit</th>
                  <th className="py-2">Conditions</th>
                </tr>
              </thead>
              <tbody>
                {(patientsLoading ? [] : patients).map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">
                      <Link href={`/doctor-portal/patients/${p.id}`} className="hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-2">{p.email}</td>
                    <td className="py-2">{p.lastVisitAt || "-"}</td>
                    <td className="py-2">{p.conditions.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!patientsLoading && patients.length === 0 && (
              <div className="text-sm text-muted-foreground mt-2">No patients found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
