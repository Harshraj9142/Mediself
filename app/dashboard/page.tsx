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
  const [stats, setStats] = useState<{ upcomingAppointments: number; activeReminders: number; recentReports: number; healthScore: number }>({
    upcomingAppointments: 0,
    activeReminders: 0,
    recentReports: 0,
    healthScore: 85,
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
    <div className="p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                <p className="text-3xl font-bold text-blue-600">{loading ? "-" : stats.upcomingAppointments}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Reminders</p>
                <p className="text-3xl font-bold text-green-600">{loading ? "-" : stats.activeReminders}</p>
              </div>
              <Pill className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Reports</p>
                <p className="text-3xl font-bold text-orange-600">{loading ? "-" : stats.recentReports}</p>
              </div>
              <FileText className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className="text-3xl font-bold text-green-600">{loading ? "-" : `${stats.healthScore}%`}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wellness Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bpData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#22c55e" name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heart Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(loading ? [] : recentActivity).map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">{activity.type}</p>
                  <p className="text-sm text-muted-foreground">{activity.desc}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
            {!loading && recentActivity.length === 0 && (
              <div className="text-sm text-muted-foreground">No recent activity.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
