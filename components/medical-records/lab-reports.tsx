"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

const labReports = [
  {
    id: 1,
    test: "Blood Glucose",
    value: "95",
    unit: "mg/dL",
    normalRange: "70-100",
    status: "normal",
    date: "Oct 20, 2025",
    trend: "stable",
  },
  {
    id: 2,
    test: "Cholesterol (Total)",
    value: "185",
    unit: "mg/dL",
    normalRange: "<200",
    status: "normal",
    date: "Oct 20, 2025",
    trend: "down",
  },
  {
    id: 3,
    test: "HDL Cholesterol",
    value: "52",
    unit: "mg/dL",
    normalRange: ">40",
    status: "normal",
    date: "Oct 20, 2025",
    trend: "up",
  },
  {
    id: 4,
    test: "LDL Cholesterol",
    value: "115",
    unit: "mg/dL",
    normalRange: "<130",
    status: "normal",
    date: "Oct 20, 2025",
    trend: "stable",
  },
  {
    id: 5,
    test: "Triglycerides",
    value: "125",
    unit: "mg/dL",
    normalRange: "<150",
    status: "normal",
    date: "Oct 20, 2025",
    trend: "down",
  },
]

export function LabReports() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Latest Lab Results - Oct 20, 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {labReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{report.test}</div>
                  <div className="text-sm text-muted-foreground">Normal range: {report.normalRange}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg text-foreground">
                      {report.value} <span className="text-sm font-normal text-muted-foreground">{report.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        report.status === "normal"
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-accent-red/10 text-accent-red border-accent-red/30"
                      }
                    >
                      {report.status === "normal" ? "Normal" : "Alert"}
                    </Badge>
                    {report.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-accent-red" />
                    ) : report.trend === "down" ? (
                      <TrendingDown className="w-4 h-4 text-primary" />
                    ) : (
                      <div className="w-4 h-4 text-muted-foreground">—</div>
                    )}
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
