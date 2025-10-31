"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Edit2, Trash2 } from "lucide-react"

const emergencyContacts = [
  {
    id: 1,
    name: "Sarah Johnson",
    relationship: "Daughter",
    phone: "+1 (555) 123-4567",
    email: "sarah@email.com",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    relationship: "Primary Doctor",
    phone: "+1 (555) 234-5678",
    email: "michael@clinic.com",
  },
  {
    id: 3,
    name: "John Smith",
    relationship: "Brother",
    phone: "+1 (555) 345-6789",
    email: "john@email.com",
  },
]

export function EmergencyContacts() {
  return (
    <div className="space-y-3">
      {emergencyContacts.map((contact) => (
        <Card key={contact.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="font-semibold text-foreground">{contact.name}</div>
                <div className="text-sm text-muted-foreground">{contact.relationship}</div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {contact.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {contact.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Phone className="w-4 h-4" />
                </Button>
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
