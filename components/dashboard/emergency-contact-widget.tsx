"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, AlertCircle, MapPin } from "lucide-react"
import Link from "next/link"

interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  status: "available" | "unavailable"
}

const emergencyContacts: EmergencyContact[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    relationship: "Spouse",
    phone: "+1 (555) 123-4567",
    status: "available",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    relationship: "Primary Doctor",
    phone: "+1 (555) 987-6543",
    status: "available",
  },
  {
    id: "3",
    name: "John Smith",
    relationship: "Brother",
    phone: "+1 (555) 456-7890",
    status: "unavailable",
  },
]

export function EmergencyContactWidget() {
  return (
    <Card className="border-2 border-[hsl(var(--accent-red))]/30 bg-gradient-to-br from-[hsl(var(--accent-red))]/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[hsl(var(--accent-red))]" />
            <CardTitle>Emergency Contacts</CardTitle>
          </div>
          <Badge className="bg-[hsl(var(--accent-red))] text-white">3 Contacts</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {emergencyContacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">{contact.name}</p>
              <p className="text-xs text-muted-foreground">{contact.relationship}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  contact.status === "available"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }
              >
                {contact.status === "available" ? "Available" : "Offline"}
              </Badge>
              <Button size="sm" variant="ghost" className="text-[hsl(var(--accent-blue))]">
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-3 border-t border-border">
          <Link href="/emergency" className="w-full">
            <Button className="w-full bg-[hsl(var(--accent-red))] hover:bg-[hsl(var(--accent-red))]/90 text-white gap-2">
              <MapPin className="w-4 h-4" />
              View Full Emergency Services
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
