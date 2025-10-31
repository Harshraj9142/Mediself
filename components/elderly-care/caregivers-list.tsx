"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Phone, Mail, Edit2, Trash2 } from "lucide-react"

const caregivers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Primary Caregiver",
    phone: "+1 (555) 111-2222",
    email: "sarah@email.com",
    status: "active",
    elderlyCount: 2,
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    role: "Healthcare Provider",
    phone: "+1 (555) 222-3333",
    email: "michael@clinic.com",
    status: "active",
    elderlyCount: 1,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Nurse Assistant",
    phone: "+1 (555) 333-4444",
    email: "emily@email.com",
    status: "active",
    elderlyCount: 3,
  },
]

export function CaregiversList() {
  return (
    <div className="space-y-3">
      {caregivers.map((caregiver) => (
        <Card key={caregiver.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-semibold text-foreground">{caregiver.name}</div>
                  <div className="text-sm text-muted-foreground">{caregiver.role}</div>
                  <div className="text-sm text-muted-foreground">
                    Managing {caregiver.elderlyCount} elderly profiles
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {caregiver.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {caregiver.email}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {caregiver.status === "active" ? "Active" : "Inactive"}
                </Badge>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-accent-red/10 text-accent-red">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
