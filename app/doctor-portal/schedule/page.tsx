"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DoctorSchedulePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availability, setAvailability] = useState<{ [day: string]: { start: string; end: string; enabled: boolean } }>({})

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/doctor/schedule")
      if (res.ok) {
        const data = await res.json()
        setAvailability(data.availability || {})
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Schedule</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" disabled={saving} onClick={update}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {days.map((d) => (
              <div key={d} className={`border border-border rounded-lg p-4 ${availability[d]?.enabled ? "bg-secondary/50" : ""}`}>
                <div className="flex items-center justify-between">
                  <label className="font-medium text-foreground">{d}</label>
                  <Button size="sm" variant="outline" onClick={() => toggleDay(d)}>
                    {availability[d]?.enabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Start</label>
                    <Input
                      type="time"
                      value={availability[d]?.start || "09:00"}
                      onChange={(e) => setAvailability((p) => ({ ...p, [d]: { ...(p[d] || {}), start: e.target.value, enabled: p[d]?.enabled ?? true, end: p[d]?.end || "17:00" } }))}
                      disabled={!availability[d]?.enabled}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">End</label>
                    <Input
                      type="time"
                      value={availability[d]?.end || "17:00"}
                      onChange={(e) => setAvailability((p) => ({ ...p, [d]: { ...(p[d] || {}), end: e.target.value, enabled: p[d]?.enabled ?? true, start: p[d]?.start || "09:00" } }))}
                      disabled={!availability[d]?.enabled}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
