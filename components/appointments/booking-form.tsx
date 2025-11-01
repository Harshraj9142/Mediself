"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface BookingFormProps {
  selectedDate?: Date
  selectedDoctor?: string
  onCancel: () => void
}

const doctors: Record<string, string> = {
  "1": "Dr. Sarah Johnson",
  "2": "Dr. Michael Chen",
  "3": "Dr. Emily Rodriguez",
  "4": "Dr. James Wilson",
}

// dynamic time slots loaded from backend
import { useEffect } from "react"

export function BookingForm({ selectedDate, selectedDoctor, onCancel }: BookingFormProps) {
  const [selectedTime, setSelectedTime] = useState<string>()
  const [reason, setReason] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slots, setSlots] = useState<string[]>([])

  const parseTimeToDate = (baseDate: Date, time: string) => {
    const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (!m) return baseDate
    let hour = parseInt(m[1], 10)
    const minute = parseInt(m[2], 10)
    const ampm = m[3].toUpperCase()
    if (ampm === "PM" && hour !== 12) hour += 12
    if (ampm === "AM" && hour === 12) hour = 0
    const d = new Date(baseDate)
    d.setHours(hour, minute, 0, 0)
    return d
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!selectedDoctor || !selectedDate || !selectedTime || !reason) return
    try {
      setSubmitting(true)
      const when = parseTimeToDate(selectedDate, selectedTime)
      const res = await fetch("/api/patient/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: selectedDoctor, reason, dateISO: when.toISOString() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || "Failed to create appointment")
      } else {
        setIsSubmitted(true)
        setTimeout(() => {
          onCancel()
          setIsSubmitted(false)
        }, 1500)
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      setSlots([])
      if (!selectedDoctor || !selectedDate) return
      const date = selectedDate.toISOString().slice(0, 10)
      try {
        const res = await fetch(`/api/patient/availability?doctorId=${encodeURIComponent(selectedDoctor)}&date=${encodeURIComponent(date)}`)
        if (res.ok) {
          const data = await res.json()
          setSlots(Array.isArray(data?.slots) ? data.slots : [])
        }
      } catch {}
    }
    load()
  }, [selectedDoctor, selectedDate])

  if (isSubmitted) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Appointment Booked!</h3>
              <p className="text-sm text-muted-foreground">
                Your appointment has been confirmed. Check your email for details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Doctor: </span>
              <span className="font-semibold text-foreground">{doctors[selectedDoctor || ""]}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Date: </span>
              <span className="font-semibold text-foreground">
                {selectedDate?.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Select Time Slot</label>
            <div className="grid grid-cols-3 gap-2">
              {(slots.length ? slots : ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]).map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedTime === time
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Reason for Visit</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your symptoms or reason for the appointment..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </div>

          {/* Validation Message */}
          {(!selectedTime || !reason) && (
            <div className="flex items-center gap-2 text-sm text-accent-red">
              <AlertCircle className="w-4 h-4" />
              Please fill in all fields
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-accent-red">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedTime || !reason || submitting} className="flex-1">
              {submitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
