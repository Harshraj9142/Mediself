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

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]

export function BookingForm({ selectedDate, selectedDoctor, onCancel }: BookingFormProps) {
  const [selectedTime, setSelectedTime] = useState<string>()
  const [reason, setReason] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTime && reason) {
      setIsSubmitted(true)
      setTimeout(() => {
        onCancel()
        setIsSubmitted(false)
      }, 2000)
    }
  }

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
              {timeSlots.map((time) => (
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedTime || !reason} className="flex-1">
              Confirm Booking
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
