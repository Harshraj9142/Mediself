"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Pill, Clock, AlertCircle, CheckCircle2, Trash2, Search, Bell } from "lucide-react"
import { useEffect, useState } from "react"

type Reminder = {
  id: string
  medicine: string
  dosage: string
  time: string
  scheduledAt: string
  frequency: string
  status: string
  reason: string
  createdAt: string
  active: boolean
}

interface MedicineRemindersTabProps {
  period: "today" | "upcoming" | "history"
}

export function MedicineRemindersTab({ period }: MedicineRemindersTabProps) {
  const [loading, setLoading] = useState(true)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("period", period)
      if (search) params.set("search", search)
      params.set("page", String(page))
      const res = await fetch(`/api/reminders?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setReminders(data.items || [])
        setTotal(data.total || 0)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    setPage(1)
    load()
  }, [period])

  useEffect(() => {
    load()
  }, [page])

  const handleSearch = () => {
    setPage(1)
    load()
  }

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
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by medicine name, dosage, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
          Search
        </Button>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading reminders...</div>}

      <div className="space-y-3">
      {!loading && reminders.map((reminder) => (
        <Card 
          key={reminder.id} 
          className={
            reminder.status === "missed" 
              ? "hover:shadow-lg transition-shadow border-l-4 border-l-red-500"
              : reminder.status === "taken"
              ? "hover:shadow-lg transition-shadow border-l-4 border-l-emerald-500"
              : "hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
          }
        >
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div 
                  className={
                    reminder.status === "taken"
                      ? "p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md"
                      : reminder.status === "missed"
                      ? "p-3 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 shadow-md"
                      : "p-3 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-md"
                  }
                >
                  {reminder.status === "taken" ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : reminder.status === "missed" ? (
                    <AlertCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Bell className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg text-foreground">{reminder.medicine}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
                      {reminder.dosage}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {reminder.frequency}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {reminder.time}
                  </div>
                  {reminder.reason && (
                    <p className="text-sm text-muted-foreground p-2 bg-secondary/50 rounded border">
                      <span className="font-medium">Reason:</span> {reminder.reason}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {reminder.status === "taken" ? (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Taken
                  </Badge>
                ) : reminder.status === "pending" ? (
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    Pending
                  </Badge>
                ) : reminder.status === "scheduled" ? (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Scheduled
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Missed
                  </Badge>
                )}
                {period !== "history" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                      onClick={() => updateStatus(reminder.id, "taken")}
                      title="Mark taken"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark Taken
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400"
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
      </div>
      {/* Empty State */}
      {!loading && reminders.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-2">💊</div>
            <div className="text-muted-foreground">No reminders found</div>
            {search && (
              <p className="text-sm text-muted-foreground mt-2">Try a different search term</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && total > 50 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="hover:bg-pink-50 dark:hover:bg-pink-950/20"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {page} of {Math.ceil(total / 50)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 50)}
            className="hover:bg-pink-50 dark:hover:bg-pink-950/20"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
