"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"
import { DoctorSelector } from "@/components/appointments/doctor-selector"
import { BookingForm } from "@/components/appointments/booking-form"
import { AppointmentsList } from "@/components/appointments/appointments-list"
import { Calendar } from "lucide-react"

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>()
  const [showBookingForm, setShowBookingForm] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-cyan-50/20 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <section className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            Appointments
          </h1>
          <p className="text-teal-50">Schedule or manage your doctor appointments</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar & Doctor Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Calendar */}
            <Card className="border-2 border-teal-200 dark:border-teal-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
              </CardContent>
            </Card>

            {/* Doctor Selector */}
            <Card className="border-2 border-cyan-200 dark:border-cyan-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Select Doctor
                </CardTitle>
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
              <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                  <CardTitle>Book New Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Select a date and doctor above, then click the button below to proceed with booking.
                  </p>
                  <Button
                    onClick={() => setShowBookingForm(true)}
                    disabled={!selectedDate || !selectedDoctor}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg"
                  >
                    📝 Proceed to Booking
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
