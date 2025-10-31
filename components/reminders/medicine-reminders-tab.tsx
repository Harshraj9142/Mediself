"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pill, Clock, AlertCircle, CheckCircle2, Edit2, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

interface MedicineRemindersTabProps {
  period: "today" | "upcoming" | "history"
}

export function MedicineRemindersTab({ period }: MedicineRemindersTabProps) {
  const [loading, setLoading] = useState(true)
  const [reminders, setReminders] = useState<Array<{ id: string; medicine: string; dosage: string; time: string; status: string; reason: string }>>([])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reminders?period=${period}`)
      if (res.ok) setReminders(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [period])

  useEffect(() => {
    const handler = () => load()
    window.addEventListener("reminders:refresh", handler as any)
    return () => window.removeEventListener("reminders:refresh", handler as any)
  }, [])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
      if (res.ok) load()
      else alert("Update failed")
    } catch { alert("Network error") }
  }

  const removeReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" })
      if (res.ok) setReminders((prev) => prev.filter((r) => r.id !== id))
      else alert("Delete failed")
    } catch { alert("Network error") }
  }

  return (
    <div className="space-y-3">
      {(loading ? [] : reminders).map((reminder) => (
        <Card key={reminder.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Pill className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-semibold text-foreground">{reminder.medicine}</div>
                  <div className="text-sm text-muted-foreground">{reminder.dosage}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {reminder.time}
                  </div>
                  <div className="text-xs text-muted-foreground pt-1">{reminder.reason}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {reminder.status === "taken" ? (
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Taken
                  </Badge>
                ) : reminder.status === "pending" ? (
                  <Badge variant="outline" className="bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30">
                    Pending
                  </Badge>
                ) : reminder.status === "scheduled" ? (
                  <Badge variant="outline" className="bg-accent-blue/10 text-accent-blue border-accent-blue/30">
                    Scheduled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-accent-red/10 text-accent-red border-accent-red/30 gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Missed
                  </Badge>
                )}
                {period !== "history" && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-primary/10"
                      onClick={() => updateStatus(reminder.id, "taken")}
                      title="Mark taken"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-accent-red/10 text-accent-red"
                      onClick={() => removeReminder(reminder.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {!loading && reminders.length === 0 && (
        <div className="text-sm text-muted-foreground">No reminders found.</div>
      )}
    </div>
  )
}
