"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Calendar, Pill, FileText } from "lucide-react"
import { useEffect, useState } from "react"

const bpData = [
  { time: "Mon", systolic: 120, diastolic: 80 },
  { time: "Tue", systolic: 118, diastolic: 78 },
  { time: "Wed", systolic: 122, diastolic: 82 },
  { time: "Thu", systolic: 119, diastolic: 79 },
  { time: "Fri", systolic: 121, diastolic: 81 },
  { time: "Sat", systolic: 120, diastolic: 80 },
  { time: "Sun", systolic: 118, diastolic: 78 },
]

const heartRateData = [
  { time: "Mon", rate: 72 },
  { time: "Tue", rate: 70 },
  { time: "Wed", rate: 75 },
  { time: "Thu", rate: 71 },
  { time: "Fri", rate: 73 },
  { time: "Sat", rate: 72 },
  { time: "Sun", rate: 70 },
]

export default function PatientDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    upcomingAppointments: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    totalPrescriptions: 0,
    approvedPrescriptions: 0,
    pendingPrescriptions: 0,
    totalLabs: 0,
    flaggedLabs: 0,
    acknowledgedLabs: 0,
    totalReports: 0,
    recentReports: 0,
    activeReminders: 0,
    healthScore: 70,
  })
  const [recentActivity, setRecentActivity] = useState<Array<{ type: string; desc: string; time: string }>>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard/patient")
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setRecentActivity(data.recentActivity)
        }
      } catch (e) {
        // noop
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-cyan-50/20 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">Patient Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your health overview</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-800/20 border-teal-200 dark:border-teal-700 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Appointments</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">{loading ? "-" : stats.totalAppointments}</p>
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">Upcoming: {stats.upcomingAppointments}</p>
              </div>
              <Calendar className="w-10 h-10 text-teal-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Prescriptions</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{loading ? "-" : stats.totalPrescriptions}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Approved: {stats.approvedPrescriptions} | Pending: {stats.pendingPrescriptions}</p>
              </div>
              <Pill className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20 border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Reports</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{loading ? "-" : stats.totalReports}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Last 30 days: {stats.recentReports}</p>
              </div>
              <FileText className="w-10 h-10 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-800/20 border-cyan-200 dark:border-cyan-700 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Health Score</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{loading ? "-" : `${stats.healthScore}%`}</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                  {stats.healthScore >= 90 ? "Excellent" : stats.healthScore >= 75 ? "Good" : "Fair"}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-cyan-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-800/20 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Lab Results</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{loading ? "-" : stats.totalLabs}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {stats.flaggedLabs > 0 ? `⚠️ ${stats.flaggedLabs} Flagged` : "✓ All Normal"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-lg">🔬</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-orange-100 dark:from-rose-900/20 dark:to-orange-800/20 border-rose-200 dark:border-rose-700 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Reminders</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">{loading ? "-" : stats.activeReminders}</p>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Medication alerts</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                <span className="text-lg">🔔</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 border-amber-200 dark:border-amber-700 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed Visits</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">{loading ? "-" : stats.completedAppointments}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">All time</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/20 dark:to-teal-800/20 border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Items</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">{loading ? "-" : (stats.pendingAppointments + stats.pendingPrescriptions)}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Needs attention</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wellness Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
              Blood Pressure Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={bpData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#14b8a6" strokeWidth={2} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#06b6d4" strokeWidth={2} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500" />
              Heart Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={heartRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="#ec4899" name="Heart Rate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(loading ? [] : recentActivity).map((activity, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-lg border border-teal-100 dark:border-teal-900 hover:shadow-md transition-all duration-200">
                <div className="mb-2 sm:mb-0">
                  <p className="font-semibold text-foreground">{activity.type}</p>
                  <p className="text-sm text-muted-foreground">{activity.desc}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
            {!loading && recentActivity.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No recent activity.</div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
