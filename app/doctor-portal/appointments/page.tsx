"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function DoctorAppointments() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Manage Appointments</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">Add Appointment</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search appointments..." className="flex-1" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { patient: "John Doe", date: "Dec 15, 2024 - 09:00 AM", reason: "Checkup", status: "Confirmed" },
                  { patient: "Jane Smith", date: "Dec 15, 2024 - 10:30 AM", reason: "Follow-up", status: "Confirmed" },
                  {
                    patient: "Mike Johnson",
                    date: "Dec 16, 2024 - 02:00 PM",
                    reason: "Consultation",
                    status: "Pending",
                  },
                ].map((apt, i) => (
                  <tr key={i} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-4 text-foreground">{apt.patient}</td>
                    <td className="py-3 px-4 text-muted-foreground">{apt.date}</td>
                    <td className="py-3 px-4 text-foreground">{apt.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === "Confirmed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 bg-transparent">
                        Cancel
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
