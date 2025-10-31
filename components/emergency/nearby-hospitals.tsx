"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Clock, Navigation } from "lucide-react"

const hospitals = [
  {
    id: 1,
    name: "City Medical Center",
    distance: "0.5 km",
    phone: "+1 (555) 111-1111",
    hours: "24/7",
    services: ["Emergency", "ICU", "Surgery"],
  },
  {
    id: 2,
    name: "Downtown Hospital",
    distance: "1.2 km",
    phone: "+1 (555) 222-2222",
    hours: "24/7",
    services: ["Emergency", "Cardiology", "Neurology"],
  },
  {
    id: 3,
    name: "Riverside Medical Clinic",
    distance: "2.1 km",
    phone: "+1 (555) 333-3333",
    hours: "8 AM - 10 PM",
    services: ["General Care", "Urgent Care"],
  },
]

export function NearbyHospitals() {
  return (
    <div className="space-y-3">
      {hospitals.map((hospital) => (
        <Card key={hospital.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-foreground">{hospital.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    {hospital.distance}
                  </div>
                </div>
                <Button size="sm" className="gap-2">
                  <Navigation className="w-4 h-4" />
                  Navigate
                </Button>
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {hospital.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {hospital.hours}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-2">
                {hospital.services.map((service) => (
                  <Badge key={service} variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
