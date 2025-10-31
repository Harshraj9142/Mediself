"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"
import { DoctorSelector } from "@/components/appointments/doctor-selector"
import { BookingForm } from "@/components/appointments/booking-form"
import { AppointmentsList } from "@/components/appointments/appointments-list"

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>()
  const [showBookingForm, setShowBookingForm] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Appointments</h1>
          <p className="text-muted-foreground">Schedule or manage your doctor appointments</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar & Doctor Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
              </CardContent>
            </Card>

            {/* Doctor Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <DoctorSelector selectedDoctor={selectedDoctor} onDoctorChange={setSelectedDoctor} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Form & Appointments List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Form */}
            {!showBookingForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Book New Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Select a date and doctor above, then click the button below to proceed with booking.
                  </p>
                  <Button
                    onClick={() => setShowBookingForm(true)}
                    disabled={!selectedDate || !selectedDoctor}
                    className="w-full"
                  >
                    Proceed to Booking
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <BookingForm
                selectedDate={selectedDate}
                selectedDoctor={selectedDoctor}
                onCancel={() => setShowBookingForm(false)}
              />
            )}

            {/* Appointments List */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Your Appointments</h2>
              <AppointmentsList />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
