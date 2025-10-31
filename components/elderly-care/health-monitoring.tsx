"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Heart, Droplets, AlertCircle } from "lucide-react"

const monitoringData = [
  {
    name: "Margaret Johnson",
    metrics: [
      { label: "Heart Rate", value: "72", unit: "bpm", icon: Heart, status: "normal" },
      { label: "Blood Pressure", value: "135/85", unit: "mmHg", icon: Activity, status: "elevated" },
      { label: "Blood Sugar", value: "110", unit: "mg/dL", icon: Droplets, status: "normal" },
    ],
  },
  {
    name: "Robert Wilson",
    metrics: [
      { label: "Heart Rate", value: "68", unit: "bpm", icon: Heart, status: "normal" },
      { label: "Blood Pressure", value: "128/80", unit: "mmHg", icon: Activity, status: "normal" },
      { label: "Blood Sugar", value: "145", unit: "mg/dL", icon: Droplets, status: "alert" },
    ],
  },
]

export function HealthMonitoring() {
  return (
    <div className="space-y-6">
      {monitoringData.map((person, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="text-lg">{person.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {person.metrics.map((metric, metricIdx) => {
                const Icon = metric.icon
                return (
                  <div
                    key={metricIdx}
                    className={`p-4 rounded-lg border ${
                      metric.status === "alert"
                        ? "bg-accent-red/5 border-accent-red/20"
                        : metric.status === "elevated"
                          ? "bg-accent-yellow/5 border-accent-yellow/20"
                          : "bg-primary/5 border-primary/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`w-4 h-4 ${
                            metric.status === "alert"
                              ? "text-accent-red"
                              : metric.status === "elevated"
                                ? "text-accent-yellow"
                                : "text-primary"
                          }`}
                        />
                        <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                      </div>
                      {metric.status === "alert" && <AlertCircle className="w-4 h-4 text-accent-red" />}
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-bold text-foreground">{metric.value}</span>
                      <span className="text-xs text-muted-foreground">{metric.unit}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        metric.status === "alert"
                          ? "bg-accent-red/10 text-accent-red border-accent-red/30"
                          : metric.status === "elevated"
                            ? "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30"
                            : "bg-primary/10 text-primary border-primary/30"
                      }
                    >
                      {metric.status === "alert" ? "Alert" : metric.status === "elevated" ? "Elevated" : "Normal"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
