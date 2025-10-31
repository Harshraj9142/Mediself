"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin } from "lucide-react"
import Link from "next/link"

const appointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "Nov 5, 2025",
    time: "10:00 AM",
    location: "City Medical Center",
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "General Practitioner",
    date: "Nov 12, 2025",
    time: "2:30 PM",
    location: "Downtown Clinic",
  },
]

export function UpcomingAppointments() {
  return (
    <div className="space-y-3">
      {appointments.map((apt) => (
        <Card key={apt.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="font-semibold text-foreground">{apt.doctor}</div>
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
          </CardContent>
        </Card>
      ))}
      <Link href="/appointments" className="block">
        <Button variant="outline" className="w-full bg-transparent">
          View All Appointments
        </Button>
      </Link>
    </div>
  )
}
