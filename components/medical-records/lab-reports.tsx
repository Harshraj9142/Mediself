"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Activity, AlertCircle, CheckCircle, Search } from "lucide-react"
import { useEffect, useState } from "react"

type LabReport = {
  id: string
  test: string
  type: string
  result: string
  unit: string
  normalRange: string
  status: string
  flagged: boolean
  acknowledged: boolean
  date: string
  doctor: string
  doctorId: string
  notes: string
  createdAt: string
}

export function LabReports() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<LabReport[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      params.set("page", String(page))
      const res = await fetch(`/api/medical-records/labs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setReports(data.items || [])
        setTotal(data.total || 0)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [page])

  const handleSearch = () => {
    setPage(1)
    load()
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by test name, type, result..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          Search
        </Button>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading lab results...</div>}

      {/* Lab Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!loading && reports.map((report) => (
          <Card
            key={report.id}
            className={
              report.flagged
                ? "border-l-4 border-l-red-500 hover:shadow-lg transition-shadow"
                : "border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow"
            }
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={
                        report.flagged
                          ? "p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 shadow-md"
                          : "p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md"
                      }
                    >
                      {report.flagged ? (
                        <AlertCircle className="w-5 h-5 text-white" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">{report.test}</h3>
                      <p className="text-sm text-muted-foreground">{report.type}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      report.flagged
                        ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }
                  >
                    {report.flagged ? "⚠️ Abnormal" : "✓ Normal"}
                  </Badge>
                </div>

                {/* Result */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{report.result}</span>
                    {report.unit && <span className="text-lg text-muted-foreground">{report.unit}</span>}
                  </div>
                  {report.normalRange && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Normal range: <span className="font-medium">{report.normalRange}</span>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    {report.doctor}
                  </span>
                  <span>•</span>
                  <span>{report.date}</span>
                  {report.acknowledged && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                        ✓ Acknowledged
                      </Badge>
                    </>
                  )}
                </div>

                {/* Notes */}
                {report.notes && (
                  <div className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-lg border border-border">
                    <span className="font-medium">Notes:</span> {report.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && reports.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-2">🔬</div>
            <div className="text-muted-foreground">No lab results found</div>
            {search && (
              <p className="text-sm text-muted-foreground mt-2">Try a different search term</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && total > 50 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {page} of {Math.ceil(total / 50)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 50)}
            className="hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
