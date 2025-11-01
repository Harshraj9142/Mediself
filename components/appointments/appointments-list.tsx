"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

type Apt = {
  id: string
  doctorId: string
  doctor: string
  specialty: string
  date: string
  time: string
  location: string
  status: "confirmed" | "pending" | string
}

export function AppointmentsList() {
  const [items, setItems] = useState<Apt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/patient/appointments")
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || "Failed to load appointments")
        setItems([])
      } else {
        const data = (await res.json()) as Apt[]
        setItems(data)
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
  }, [])

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/patient/appointments/${id}`, { method: "DELETE" })
      if (res.ok) setItems((prev) => prev.filter((x) => x.id !== id))
    } catch {}
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading appointments...</div>
  if (error) return <div className="text-sm text-accent-red">{error}</div>

  return (
    <div className="space-y-3">
      {items.map((apt) => (
        <Card key={apt.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-foreground">{apt.doctor}</div>
                  <Badge
                    variant="outline"
                    className={
                      apt.status === "confirmed"
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30"
                    }
                  >
                    {apt.status === "confirmed" ? "Confirmed" : "Pending"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">{apt.specialty}</div>
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
              </div>
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
          </CardContent>
        </Card>
      ))}
      {items.length === 0 && <div className="text-sm text-muted-foreground">No appointments found.</div>}
    </div>
  )
}
