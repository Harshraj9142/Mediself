"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Pill, Users } from "lucide-react"

const actions = [
  {
    href: "/appointments",
    icon: Calendar,
    label: "Book Appointment",
    description: "Schedule a doctor visit",
  },
  {
    href: "/medical-records",
    icon: FileText,
    label: "View Records",
    description: "Access your medical history",
  },
  {
    href: "/reminders",
    icon: Pill,
    label: "Manage Medicines",
    description: "Set medicine reminders",
  },
  {
    href: "/elderly-care",
    icon: Users,
    label: "Elderly Care",
    description: "Care for loved ones",
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.href} href={action.href}>
            <Button
              variant="outline"
              className="w-full h-auto flex flex-col items-start gap-2 p-4 hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
            >
              <Icon className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-xs opacity-75">{action.description}</div>
              </div>
            </Button>
          </Link>
        )
      })}
    </div>
  )
}
