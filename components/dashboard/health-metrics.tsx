"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Heart, Droplets, Zap } from "lucide-react"

const metrics = [
  {
    title: "Heart Rate",
    value: "72",
    unit: "bpm",
    icon: Heart,
    color: "text-accent-red",
    bgColor: "bg-accent-red/10",
  },
  {
    title: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    icon: Activity,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Blood Sugar",
    value: "95",
    unit: "mg/dL",
    icon: Droplets,
    color: "text-accent-yellow",
    bgColor: "bg-accent-yellow/10",
  },
  {
    title: "Energy Level",
    value: "Good",
    unit: "Status",
    icon: Zap,
    color: "text-accent-blue",
    bgColor: "bg-accent-blue/10",
  },
]

export function HealthMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">{metric.value}</span>
                <span className="text-xs text-muted-foreground">{metric.unit}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
