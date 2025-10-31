"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Trash2 } from "lucide-react"

const appointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "Nov 5, 2025",
    time: "10:00 AM",
    location: "City Medical Center",
    status: "confirmed",
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "General Practitioner",
    date: "Nov 12, 2025",
    time: "2:30 PM",
    location: "Downtown Clinic",
    status: "confirmed",
  },
  {
    id: 3,
    doctor: "Dr. Emily Rodriguez",
    specialty: "Dermatologist",
    date: "Nov 20, 2025",
    time: "3:00 PM",
    location: "Skin Care Clinic",
    status: "pending",
  },
]

export function AppointmentsList() {
  return (
    <div className="space-y-3">
      {appointments.map((apt) => (
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
              <Button variant="ghost" size="icon" className="text-accent-red hover:bg-accent-red/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
