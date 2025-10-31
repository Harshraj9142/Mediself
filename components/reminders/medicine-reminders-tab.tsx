"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pill, Clock, AlertCircle, CheckCircle2, Edit2, Trash2 } from "lucide-react"

interface MedicineRemindersTabProps {
  period: "today" | "upcoming" | "history"
}

const todayReminders = [
  {
    id: 1,
    medicine: "Aspirin",
    dosage: "100mg",
    time: "8:00 AM",
    status: "taken",
    reason: "Heart Health",
  },
  {
    id: 2,
    medicine: "Vitamin D",
    dosage: "1000 IU",
    time: "12:00 PM",
    status: "pending",
    reason: "Bone Health",
  },
  {
    id: 3,
    medicine: "Blood Pressure Med",
    dosage: "5mg",
    time: "8:00 PM",
    status: "pending",
    reason: "Hypertension",
  },
]

const upcomingReminders = [
  {
    id: 4,
    medicine: "Metformin",
    dosage: "500mg",
    time: "Tomorrow 9:00 AM",
    status: "scheduled",
    reason: "Diabetes Management",
  },
  {
    id: 5,
    medicine: "Lisinopril",
    dosage: "10mg",
    time: "Tomorrow 8:00 PM",
    status: "scheduled",
    reason: "Blood Pressure",
  },
  {
    id: 6,
    medicine: "Atorvastatin",
    dosage: "20mg",
    time: "Nov 2, 2025 8:00 PM",
    status: "scheduled",
    reason: "Cholesterol",
  },
]

const historyReminders = [
  {
    id: 7,
    medicine: "Aspirin",
    dosage: "100mg",
    time: "Oct 28, 2025 8:00 AM",
    status: "taken",
    reason: "Heart Health",
  },
  {
    id: 8,
    medicine: "Vitamin D",
    dosage: "1000 IU",
    time: "Oct 28, 2025 12:00 PM",
    status: "taken",
    reason: "Bone Health",
  },
  {
    id: 9,
    medicine: "Blood Pressure Med",
    dosage: "5mg",
    time: "Oct 28, 2025 8:00 PM",
    status: "missed",
    reason: "Hypertension",
  },
]

export function MedicineRemindersTab({ period }: MedicineRemindersTabProps) {
  const reminders = period === "today" ? todayReminders : period === "upcoming" ? upcomingReminders : historyReminders

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Pill className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-semibold text-foreground">{reminder.medicine}</div>
                  <div className="text-sm text-muted-foreground">{reminder.dosage}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {reminder.time}
                  </div>
                  <div className="text-xs text-muted-foreground pt-1">{reminder.reason}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {reminder.status === "taken" ? (
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Taken
                  </Badge>
                ) : reminder.status === "pending" ? (
                  <Badge variant="outline" className="bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30">
                    Pending
                  </Badge>
                ) : reminder.status === "scheduled" ? (
                  <Badge variant="outline" className="bg-accent-blue/10 text-accent-blue border-accent-blue/30">
                    Scheduled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-accent-red/10 text-accent-red border-accent-red/30 gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Missed
                  </Badge>
                )}
                {period !== "history" && (
                  <>
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-accent-red/10 text-accent-red">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
