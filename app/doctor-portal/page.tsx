"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, CheckCircle, Clock } from "lucide-react"

export default function DoctorDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-blue-600">24</p>
              </div>
              <Users className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
                <p className="text-3xl font-bold text-green-600">6</p>
              </div>
              <Calendar className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600">18</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-orange-600">3</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "09:00 AM", patient: "John Doe", reason: "Regular Checkup", status: "Completed" },
              { time: "10:30 AM", patient: "Jane Smith", reason: "Follow-up", status: "In Progress" },
              { time: "02:00 PM", patient: "Mike Johnson", reason: "Consultation", status: "Pending" },
              { time: "03:30 PM", patient: "Sarah Williams", reason: "Lab Review", status: "Pending" },
            ].map((apt, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <div>
                  <p className="font-semibold text-foreground">{apt.patient}</p>
                  <p className="text-sm text-muted-foreground">{apt.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{apt.time}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      apt.status === "Completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : apt.status === "In Progress"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { patient: "Alice Brown", request: "Prescription Refill", date: "2 hours ago" },
              { patient: "Bob Wilson", request: "Report Review", date: "4 hours ago" },
              { patient: "Carol Davis", request: "Appointment Reschedule", date: "1 day ago" },
            ].map((req, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">{req.patient}</p>
                  <p className="text-sm text-muted-foreground">{req.request}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Decline
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
