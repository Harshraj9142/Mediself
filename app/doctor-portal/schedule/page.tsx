"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Schedule = { id: string; doctorId: string; doctorName: string; availability: { [day: string]: { start: string; end: string; enabled: boolean } }; slotDuration: number; updatedAt: string; isMySchedule: boolean }

export default function DoctorSchedulePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<"own" | "all">("own")
  const [availability, setAvailability] = useState<{ [day: string]: { start: string; end: string; enabled: boolean } }>({})
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([])

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const load = async () => {
    setLoading(true)
    try {
      if (view === "own") {
        const res = await fetch("/api/doctor/schedule?view=own")
        if (res.ok) {
          const data = await res.json()
          setAvailability(data.availability || {})
        }
      } else {
        const res = await fetch("/api/doctor/schedule")
        if (res.ok) {
          const data = await res.json()
          setAllSchedules(data.items || [])
        }
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [view])

  const toggleDay = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...(prev[day] || { start: "09:00", end: "17:00", enabled: false }), enabled: !(prev[day]?.enabled ?? false) },
    }))
  }

  const update = async () => {
    setSaving(true)
    try {
      await fetch("/api/doctor/schedule", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ availability }) })
    } catch {}
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-cyan-50/20 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
            {view === "own" ? "My Schedule" : "All Doctor Schedules"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {view === "own" ? "Manage your weekly availability" : "View all doctors' schedules in the system"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={view === "own" ? "default" : "outline"}
            className={view === "own" ? "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700" : ""}
            onClick={() => setView("own")}
          >
            My Schedule
          </Button>
          <Button 
            variant={view === "all" ? "default" : "outline"}
            className={view === "all" ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : ""}
            onClick={() => setView("all")}
          >
            All Doctors
          </Button>
          {view === "own" && (
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg" disabled={saving} onClick={update}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>

      {view === "own" ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse" />
              Edit Your Weekly Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {days.map((d) => (
                <div key={d} className={`border rounded-lg p-4 transition-all ${
                  availability[d]?.enabled 
                    ? "bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border-teal-200 dark:border-teal-800" 
                    : "border-border bg-secondary/30"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-semibold text-foreground text-lg">{d}</label>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => toggleDay(d)}
                      className={availability[d]?.enabled ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-600 text-emerald-700 dark:text-emerald-400" : ""}
                    >
                      {availability[d]?.enabled ? "✓ Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Start Time</label>
                      <Input
                        type="time"
                        value={availability[d]?.start || "09:00"}
                        onChange={(e) => setAvailability((p) => ({ ...p, [d]: { ...(p[d] || {}), start: e.target.value, enabled: p[d]?.enabled ?? true, end: p[d]?.end || "17:00" } }))}
                        disabled={!availability[d]?.enabled}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">End Time</label>
                      <Input
                        type="time"
                        value={availability[d]?.end || "17:00"}
                        onChange={(e) => setAvailability((p) => ({ ...p, [d]: { ...(p[d] || {}), end: e.target.value, enabled: p[d]?.enabled ?? true, start: p[d]?.start || "09:00" } }))}
                        disabled={!availability[d]?.enabled}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allSchedules.map((schedule) => (
            <Card key={schedule.id} className={`shadow-lg transition-all ${
              schedule.isMySchedule 
                ? "border-2 border-teal-300 dark:border-teal-700" 
                : ""
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {schedule.isMySchedule ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse" />
                        <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          My Schedule
                        </span>
                      </div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                    <CardTitle>{schedule.doctorName}</CardTitle>
                  </div>
                  {schedule.updatedAt && (
                    <span className="text-xs text-muted-foreground">Updated: {schedule.updatedAt}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((d) => {
                    const daySchedule = schedule.availability[d]
                    return (
                      <div key={d} className={`text-center p-3 rounded-lg border ${
                        daySchedule?.enabled
                          ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800"
                          : "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800"
                      }`}>
                        <div className="font-semibold text-sm mb-1">{d}</div>
                        {daySchedule?.enabled ? (
                          <>
                            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">✓ Available</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {daySchedule.start} - {daySchedule.end}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-gray-500">Closed</div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Slot Duration: {schedule.slotDuration} minutes
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && allSchedules.length === 0 && (
            <Card className="shadow-lg">
              <CardContent className="py-12 text-center text-muted-foreground">
                <div className="text-4xl mb-2">📅</div>
                <div>No schedules found</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
