"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const healthHistory = [
  {
    id: 1,
    event: "Diagnosed with Hypertension",
    date: "Jan 15, 2024",
    doctor: "Dr. Sarah Johnson",
    status: "ongoing",
  },
  {
    id: 2,
    event: "Appendix Surgery",
    date: "Jun 20, 2023",
    doctor: "Dr. James Wilson",
    status: "completed",
  },
  {
    id: 3,
    event: "Flu Vaccination",
    date: "Oct 10, 2024",
    doctor: "Health Clinic",
    status: "completed",
  },
  {
    id: 4,
    event: "COVID-19 Vaccination (Booster)",
    date: "Mar 5, 2024",
    doctor: "Health Clinic",
    status: "completed",
  },
  {
    id: 5,
    event: "Allergy to Penicillin Confirmed",
    date: "Aug 30, 2023",
    doctor: "Dr. Emily Rodriguez",
    status: "ongoing",
  },
]

const conditions = [
  { name: "Hypertension", since: "Jan 2024", severity: "mild" },
  { name: "Seasonal Allergies", since: "Recurring", severity: "mild" },
]

const allergies = [
  { name: "Penicillin", severity: "severe", reaction: "Rash" },
  { name: "Shellfish", severity: "moderate", reaction: "Itching" },
]

export function HealthHistory() {
  return (
    <div className="space-y-6">
      {/* Current Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conditions.map((condition, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <div className="font-semibold text-foreground">{condition.name}</div>
                  <div className="text-sm text-muted-foreground">Since {condition.since}</div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    condition.severity === "mild"
                      ? "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30"
                      : "bg-accent-red/10 text-accent-red border-accent-red/30"
                  }
                >
                  {condition.severity === "mild" ? "Mild" : "Severe"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Known Allergies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allergies.map((allergy, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-accent-red/5 border border-accent-red/20"
              >
                <div>
                  <div className="font-semibold text-foreground">{allergy.name}</div>
                  <div className="text-sm text-muted-foreground">Reaction: {allergy.reaction}</div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    allergy.severity === "severe"
                      ? "bg-accent-red/10 text-accent-red border-accent-red/30"
                      : "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30"
                  }
                >
                  {allergy.severity === "severe" ? "Severe" : "Moderate"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medical Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Medical Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthHistory.map((event, idx) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mt-2" />
                  {idx !== healthHistory.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
                </div>
                <div className="pb-4">
                  <div className="font-semibold text-foreground">{event.event}</div>
                  <div className="text-sm text-muted-foreground">{event.doctor}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">{event.date}</span>
                    <Badge
                      variant="outline"
                      className={
                        event.status === "completed"
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-accent-blue/10 text-accent-blue border-accent-blue/30"
                      }
                    >
                      {event.status === "completed" ? "Completed" : "Ongoing"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
