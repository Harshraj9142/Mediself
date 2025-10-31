"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Phone, Mail, Edit2, Trash2 } from "lucide-react"

const elderlyProfiles = [
  {
    id: 1,
    name: "Margaret Johnson",
    age: 78,
    relationship: "Mother",
    condition: "Hypertension, Arthritis",
    status: "stable",
    phone: "+1 (555) 123-4567",
    email: "margaret@email.com",
  },
  {
    id: 2,
    name: "Robert Wilson",
    age: 82,
    relationship: "Father",
    condition: "Diabetes, Heart Disease",
    status: "monitoring",
    phone: "+1 (555) 234-5678",
    email: "robert@email.com",
  },
  {
    id: 3,
    name: "Dorothy Chen",
    age: 75,
    relationship: "Grandmother",
    condition: "Osteoporosis",
    status: "stable",
    phone: "+1 (555) 345-6789",
    email: "dorothy@email.com",
  },
]

export function ElderlyProfilesList() {
  return (
    <div className="space-y-3">
      {elderlyProfiles.map((profile) => (
        <Card key={profile.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-semibold text-foreground">{profile.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {profile.age} years old • {profile.relationship}
                  </div>
                  <div className="text-sm text-muted-foreground">Conditions: {profile.condition}</div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {profile.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    profile.status === "stable"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30"
                  }
                >
                  {profile.status === "stable" ? "Stable" : "Monitoring"}
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
