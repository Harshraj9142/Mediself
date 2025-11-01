"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, MapPin, Trash2, Search } from "lucide-react"
import { useEffect, useState } from "react"

type Apt = {
  id: string
  doctorId: string
  doctor: string
  specialty: string
  reason: string
  date: string
  time: string
  dateTime: string
  location: string
  status: string
  createdAt: string
}

export function AppointmentsList() {
  const [items, setItems] = useState<Apt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [reschedulingId, setReschedulingId] = useState<string | null>(null)
  const [reschedDate, setReschedDate] = useState<string>("") // YYYY-MM-DD
  const [reschedSlots, setReschedSlots] = useState<string[]>([])
  const [reschedSlot, setReschedSlot] = useState<string>("")
  const [reschedLoading, setReschedLoading] = useState(false)
  const [reschedError, setReschedError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      params.set("page", String(page))
      const res = await fetch(`/api/patient/appointments?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || "Failed to load appointments")
        setItems([])
      } else {
        const data = await res.json()
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (e) {
      setError("Network error")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page])

  const handleSearch = () => {
    setPage(1)
    load()
  }

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/patient/appointments/${id}`, { method: "DELETE" })
      if (res.ok) setItems((prev) => prev.filter((x) => x.id !== id))
    } catch {}
  }

  const startReschedule = (apt: Apt) => {
    setReschedulingId(apt.id)
    setReschedDate("")
    setReschedSlots([])
    setReschedSlot("")
    setReschedError(null)
  }

  const loadSlots = async (apt: Apt) => {
    setReschedError(null)
    setReschedSlots([])
    if (!reschedDate) {
      setReschedError("Pick a date first")
      return
    }
    setReschedLoading(true)
    try {
      const res = await fetch(`/api/patient/availability?doctorId=${encodeURIComponent(apt.doctorId)}&date=${encodeURIComponent(reschedDate)}`)
      if (res.ok) {
        const data = await res.json()
        setReschedSlots(Array.isArray(data?.slots) ? data.slots : [])
      }
    } catch {}
    setReschedLoading(false)
  }

  const parseAMPMToDate = (dateISO: string, timeLabel: string) => {
    const base = new Date(dateISO)
    const m = timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (!m) return base
    let hour = parseInt(m[1], 10)
    const minute = parseInt(m[2], 10)
    const ampm = m[3].toUpperCase()
    if (ampm === "PM" && hour !== 12) hour += 12
    if (ampm === "AM" && hour === 12) hour = 0
    const d = new Date(base)
    d.setHours(hour, minute, 0, 0)
    return d
  }

  const applyReschedule = async (apt: Apt) => {
    setReschedError(null)
    if (!reschedDate || !reschedSlot) {
      setReschedError("Select date and time")
      return
    }
    try {
      const newDate = parseAMPMToDate(reschedDate, reschedSlot)
      const res = await fetch(`/api/patient/appointments/${apt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateISO: newDate.toISOString() }),
      })
      if (res.ok) {
        // update list locally
        const newDateStr = newDate.toLocaleDateString()
        const newTimeStr = newDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        setItems((prev) => prev.map((x) => (x.id === apt.id ? { ...x, date: newDateStr, time: newTimeStr } : x)))
        setReschedulingId(null)
      } else {
        const data = await res.json().catch(() => ({}))
        setReschedError(data?.error || "Failed to reschedule")
      }
    } catch {
      setReschedError("Network error")
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by doctor, reason, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
          Search
        </Button>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading appointments...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && items.map((apt) => (
        <Card key={apt.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-foreground text-lg">{apt.doctor}</div>
                  <Badge
                    variant="outline"
                    className={
                      apt.status === "Confirmed"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : apt.status === "Pending"
                        ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400"
                        : apt.status === "Completed"
                        ? "bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-400"
                        : "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400"
                    }
                  >
                    {apt.status}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                    {apt.specialty}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Reason:</span> {apt.reason}
                </div>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {apt.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {apt.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {apt.location}
                  </div>
                </div>
                {reschedulingId === apt.id && (
                  <div className="mt-4 p-3 border border-border rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="date"
                        value={reschedDate}
                        onChange={(e) => setReschedDate(e.target.value)}
                        className="px-2 py-1 rounded border border-border bg-background text-foreground"
                      />
                      <Button size="sm" variant="outline" onClick={() => loadSlots(apt)} disabled={!reschedDate || reschedLoading}>
                        {reschedLoading ? "Loading..." : "Load Slots"}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {reschedSlots.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReschedSlot(s)}
                          className={`px-3 py-1 rounded text-sm ${reschedSlot === s ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"}`}
                        >
                          {s}
                        </button>
                      ))}
                      {reschedSlots.length === 0 && !!reschedDate && !reschedLoading && (
                        <div className="text-xs text-muted-foreground">No slots available</div>
                      )}
                    </div>
                    {reschedError && <div className="text-xs text-accent-red mb-2">{reschedError}</div>}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => applyReschedule(apt)} disabled={!reschedDate || !reschedSlot}>
                        Confirm Reschedule
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setReschedulingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => startReschedule(apt)}>
                  Reschedule
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-accent-red hover:bg-accent-red/10"
                  onClick={() => remove(apt.id)}
                  aria-label="Delete appointment"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {!loading && items.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-2">📅</div>
            <div className="text-muted-foreground">No appointments found</div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && total > 50 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / 50)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 50)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
