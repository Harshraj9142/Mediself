"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react"

interface HealthAlert {
  id: string
  type: "warning" | "critical" | "info"
  message: string
  timestamp: string
}

const healthAlerts: HealthAlert[] = [
  {
    id: "1",
    type: "warning",
    message: "Blood sugar slightly elevated",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "info",
    message: "Medication reminder: Take Aspirin",
    timestamp: "30 minutes ago",
  },
  {
    id: "3",
    type: "critical",
    message: "High blood pressure detected",
    timestamp: "1 hour ago",
  },
]

export function HealthSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Blood Pressure Summary */}
      <Card className="border-l-4 border-l-[hsl(var(--accent-red))]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Blood Pressure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-foreground">120/80</span>
              <TrendingUp className="w-4 h-4 text-[hsl(var(--accent-orange))]" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Slightly High
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Last checked: 2 hours ago</p>
          </div>
        </CardContent>
      </Card>

      {/* Blood Sugar Summary */}
      <Card className="border-l-4 border-l-[hsl(var(--accent-yellow))]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Blood Sugar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-foreground">95</span>
              <TrendingDown className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Normal
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Last checked: 1 hour ago</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card className="border-l-4 border-l-[hsl(var(--accent-blue))]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[hsl(var(--accent-red))] mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-foreground">High BP detected</p>
                <p className="text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[hsl(var(--accent-yellow))] mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-foreground">Sugar elevated</p>
                <p className="text-muted-foreground">2 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
