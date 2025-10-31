"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pill, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const reminders = [
  {
    id: 1,
    medicine: "Aspirin",
    dosage: "100mg",
    time: "8:00 AM",
    status: "taken",
  },
  {
    id: 2,
    medicine: "Vitamin D",
    dosage: "1000 IU",
    time: "12:00 PM",
    status: "pending",
  },
  {
    id: 3,
    medicine: "Blood Pressure Med",
    dosage: "5mg",
    time: "8:00 PM",
    status: "pending",
  },
]

export function MedicineReminders() {
  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-lg bg-primary/10 mt-1">
                  <Pill className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{reminder.medicine}</div>
                  <div className="text-sm text-muted-foreground">{reminder.dosage}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    {reminder.time}
                  </div>
                </div>
              </div>
              {reminder.status === "taken" ? (
                <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
              ) : (
                <Button size="sm" variant="outline">
                  Mark Done
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      <Link href="/reminders" className="block">
        <Button variant="outline" className="w-full bg-transparent">
          Manage All Reminders
        </Button>
      </Link>
    </div>
  )
}
