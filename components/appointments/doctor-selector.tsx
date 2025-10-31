"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface DoctorSelectorProps {
  selectedDoctor?: string
  onDoctorChange: (doctorId: string) => void
}

const doctors = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    rating: 4.8,
    availability: "Available",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "General Practitioner",
    rating: 4.9,
    availability: "Available",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatologist",
    rating: 4.7,
    availability: "Available",
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Orthopedist",
    rating: 4.6,
    availability: "Available",
  },
]

export function DoctorSelector({ selectedDoctor, onDoctorChange }: DoctorSelectorProps) {
  return (
    <div className="space-y-2">
      {doctors.map((doctor) => (
        <button
          key={doctor.id}
          onClick={() => onDoctorChange(doctor.id)}
          className={`w-full text-left transition-all ${
            selectedDoctor === doctor.id ? "ring-2 ring-primary rounded-lg" : "hover:bg-secondary rounded-lg"
          }`}
        >
          <Card className={selectedDoctor === doctor.id ? "border-primary" : ""}>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="font-semibold text-foreground">{doctor.name}</div>
                <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent-yellow text-accent-yellow" />
                    <span className="text-sm font-medium">{doctor.rating}</span>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {doctor.availability}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  )
}
