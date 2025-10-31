"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Mail, MessageSquare } from "lucide-react"

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    appointmentReminders: true,
    medicineReminders: true,
    labReports: true,
    healthAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  })

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const notificationOptions = [
    {
      key: "appointmentReminders",
      label: "Appointment Reminders",
      description: "Get notified before your appointments",
      icon: Bell,
    },
    {
      key: "medicineReminders",
      label: "Medicine Reminders",
      description: "Reminders to take your medicines on time",
      icon: Bell,
    },
    {
      key: "labReports",
      label: "Lab Reports",
      description: "Notifications when lab reports are ready",
      icon: Bell,
    },
    {
      key: "healthAlerts",
      label: "Health Alerts",
      description: "Important health and wellness alerts",
      icon: Bell,
    },
    {
      key: "emailNotifications",
      label: "Email Notifications",
      description: "Receive notifications via email",
      icon: Mail,
    },
    {
      key: "smsNotifications",
      label: "SMS Notifications",
      description: "Receive notifications via SMS",
      icon: MessageSquare,
    },
    {
      key: "pushNotifications",
      label: "Push Notifications",
      description: "Receive push notifications on your device",
      icon: Bell,
    },
  ]

  return (
    <div className="space-y-4">
      {notificationOptions.map((option) => {
        const Icon = option.icon
        const isEnabled = notifications[option.key as keyof typeof notifications]
        return (
          <Card key={option.key}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <div className="font-semibold text-foreground">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(option.key as keyof typeof notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
