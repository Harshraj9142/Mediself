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
  const [availability, setAvailability] = useState<any>(null)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])

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
      setAvailability(null)
      setBookedSlots([])
      if (!selectedDoctor || !selectedDate) return
      const date = selectedDate.toISOString().slice(0, 10)
      try {
        const res = await fetch(`/api/patient/doctor-availability?doctorId=${encodeURIComponent(selectedDoctor)}&date=${encodeURIComponent(date)}`)
        if (res.ok) {
          const data = await res.json()
          setAvailability(data.availability)
          setBookedSlots(data.bookedSlots || [])
          
          // Generate available slots based on doctor's schedule
          const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][selectedDate.getDay()]
          const dayAvailability = data.availability?.[dayOfWeek]
          
          if (dayAvailability?.enabled) {
            const startTime = dayAvailability.start || "09:00"
            const endTime = dayAvailability.end || "17:00"
            const slotDuration = data.slotDuration || 30
            
            // Generate slots
            const [startHour, startMin] = startTime.split(":").map(Number)
            const [endHour, endMin] = endTime.split(":").map(Number)
            const startMinutes = startHour * 60 + startMin
            const endMinutes = endHour * 60 + endMin
            
            const generatedSlots = []
            for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
              const hour = Math.floor(minutes / 60)
              const min = minutes % 60
              const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`
              
              // Check if slot is not booked
              if (!data.bookedSlots?.includes(timeStr)) {
                // Convert to 12-hour format
                const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                const ampm = hour >= 12 ? "PM" : "AM"
                generatedSlots.push(`${hour12}:${String(min).padStart(2, "0")} ${ampm}`)
              }
            }
            setSlots(generatedSlots)
          }
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

          {/* Availability Info */}
          {availability && selectedDate && (
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
              <div className="text-sm font-semibold mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                ✨ Doctor's Weekly Schedule
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className={`text-center p-1 rounded ${
                    availability[day]?.enabled 
                      ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                  }`}>
                    {day}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Select Time Slot
              {slots.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">({slots.length} available)</span>
              )}
            </label>
            {slots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {selectedDoctor && selectedDate ? "No available slots for this date" : "Select a doctor and date to see available slots"}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {slots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedTime === time
                        ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg scale-105"
                        : "bg-secondary hover:bg-teal-50 dark:hover:bg-teal-950/20 text-foreground hover:scale-105"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
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
