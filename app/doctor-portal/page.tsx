"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, CheckCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { UserProfileCard } from "@/components/dashboard/user-profile-card"

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    myPatients: 0,
    totalPatients: 0,
    todaysAppointments: 0,
    completedToday: 0,
    pendingToday: 0,
    myTotalAppointments: 0,
    totalAppointments: 0,
    myPrescriptions: 0,
    myPendingPrescriptions: 0,
    totalPrescriptions: 0,
    myLabs: 0,
    myUnacknowledgedLabs: 0,
    totalLabs: 0,
    myReports: 0,
    totalReports: 0,
  })
  const [todayList, setTodayList] = useState<Array<{ id: string; time: string; patient: string; reason: string; status: string }>>([])
  const [requests, setRequests] = useState<Array<{ patient: string; request: string; date: string; id?: string }>>([])
  const [patients, setPatients] = useState<Array<{ id: string; name: string; email: string; lastVisitAt: string | null; conditions: string[]; hasRelation: boolean }>>([])
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
            hasRelation: !!p.hasRelation,
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-cyan-50/20 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">Doctor Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your practice overview</p>
      </div>

      {/* Profile Section */}
      <UserProfileCard />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-800/20 border-teal-200 dark:border-teal-700 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Patients in System</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">{loading ? "-" : stats.totalPatients}</p>
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">My Patients: {stats.myPatients}</p>
              </div>
              <Users className="w-10 h-10 text-teal-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Appointments</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{loading ? "-" : stats.totalAppointments}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Mine: {stats.myTotalAppointments}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20 border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Today's Appointments</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{loading ? "-" : stats.todaysAppointments}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Completed: {stats.completedToday} | Pending: {stats.pendingToday}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-800/20 border-cyan-200 dark:border-cyan-700 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Prescriptions</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{loading ? "-" : stats.totalPrescriptions}</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Mine: {stats.myPrescriptions} | Pending: {stats.myPendingPrescriptions}</p>
              </div>
              <Clock className="w-10 h-10 text-cyan-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-800/20 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Lab Results</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{loading ? "-" : stats.totalLabs}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Mine: {stats.myLabs} | Unacknowledged: {stats.myUnacknowledgedLabs}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-lg">🔬</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-orange-100 dark:from-rose-900/20 dark:to-orange-800/20 border-rose-200 dark:border-rose-700 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">{loading ? "-" : stats.totalReports}</p>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">My Reports: {stats.myReports}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                <span className="text-lg">📄</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 border-amber-200 dark:border-amber-700 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">System Activity</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">{loading ? "-" : "Active"}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">All systems operational</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
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
          <div className="flex items-center justify-between">
            <CardTitle>All Patients</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
                My Patient
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                New Patient
              </span>
            </div>
          </div>
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
                  <th className="py-2">Status</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Last Visit</th>
                  <th className="py-2">Conditions</th>
                </tr>
              </thead>
              <tbody>
                {(patientsLoading ? [] : patients).map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-teal-50/30 dark:hover:bg-teal-950/10 transition-colors">
                    <td className="py-2">
                      {p.hasRelation ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse" />
                          <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            My Patient
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            New
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 font-medium text-foreground">
                      <Link href={`/doctor-portal/patients/${p.id}`} className="hover:underline hover:text-teal-600">
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-2">{p.email}</td>
                    <td className="py-2">{p.lastVisitAt || "-"}</td>
                    <td className="py-2">
                      {p.conditions.length > 0 ? (
                        <span className="text-xs">{p.conditions.join(", ")}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </td>
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
    </div>
  )
}
