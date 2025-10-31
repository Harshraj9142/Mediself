"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"

export function LabReports() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Array<{ id: string; test: string; value: string; unit: string; normalRange: string; status: string; date: string; trend: string }>>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/medical-records/labs")
        if (res.ok) setReports(await res.json())
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Latest Lab Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(loading ? [] : reports).map((report) => (
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
            {!loading && reports.length === 0 && (
              <div className="text-sm text-muted-foreground">No lab reports found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
