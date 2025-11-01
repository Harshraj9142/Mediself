"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, AlertTriangle, Clock, Activity, Search } from "lucide-react"
import { useEffect, useState } from "react"

type Condition = {
  id: string
  name: string
  since: string
  severity: string
  status: string
  notes: string
}

type Allergy = {
  id: string
  name: string
  severity: string
  reaction: string
  notes: string
}

type HistoryEvent = {
  id: string
  event: string
  description: string
  date: string
  doctor: string
  doctorId: string
  status: string
  type: string
  notes: string
  createdAt: string
}

export function HealthHistory() {
  const [loading, setLoading] = useState(true)
  const [conditions, setConditions] = useState<Condition[]>([])
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [history, setHistory] = useState<HistoryEvent[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      params.set("page", String(page))
      const res = await fetch(`/api/medical-records/history?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setConditions(data.conditions || [])
        setAllergies(data.allergies || [])
        setHistory(data.history?.items || [])
        setTotal(data.history?.total || 0)
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
    <div className="space-y-6">
      {/* Current Conditions */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-600" />
            Current Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(loading ? [] : conditions).map((condition) => (
              <Card key={condition.id} className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-foreground">{condition.name}</h4>
                        <p className="text-sm text-muted-foreground">Since {condition.since}</p>
                      </div>
                      <Badge
                        className={
                          condition.severity === "severe"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : condition.severity === "moderate"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }
                      >
                        {condition.severity}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {condition.status === "active" ? "🔴 Active" : "✓ Resolved"}
                    </Badge>
                    {condition.notes && (
                      <p className="text-sm text-muted-foreground p-2 bg-secondary/50 rounded border">
                        {condition.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {!loading && conditions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No current conditions recorded</div>
          )}
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="border-2 border-red-200 dark:border-red-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Known Allergies
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(loading ? [] : allergies).map((allergy) => (
              <Card
                key={allergy.id}
                className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/10 hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-foreground">{allergy.name}</h4>
                        {allergy.reaction && (
                          <p className="text-sm text-muted-foreground">Reaction: {allergy.reaction}</p>
                        )}
                      </div>
                      <Badge
                        className={
                          allergy.severity === "severe"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : allergy.severity === "moderate"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }
                      >
                        ⚠️ {allergy.severity}
                      </Badge>
                    </div>
                    {allergy.notes && (
                      <p className="text-sm text-muted-foreground p-2 bg-white/50 dark:bg-black/20 rounded border">
                        {allergy.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {!loading && allergies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No allergies recorded</div>
          )}
        </CardContent>
      </Card>

      {/* Medical Timeline */}
      <Card className="border-2 border-teal-200 dark:border-teal-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              Medical Timeline
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search timeline events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
              Search
            </Button>
          </div>

          {loading && <div className="text-sm text-muted-foreground">Loading timeline...</div>}

          {/* Timeline */}
          <div className="space-y-4">
            {!loading && history.map((event, idx) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 shadow-md mt-2 flex items-center justify-center">
                    <Activity className="w-2.5 h-2.5 text-white" />
                  </div>
                  {idx !== history.length - 1 && <div className="w-0.5 flex-1 bg-gradient-to-b from-teal-200 to-cyan-200 dark:from-teal-800 dark:to-cyan-800 mt-2" />}
                </div>
                <Card className="flex-1 border-l-4 border-l-teal-500 hover:shadow-md transition-shadow mb-4">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-foreground">{event.event}</h4>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          )}
                        </div>
                        <Badge
                          className={
                            event.status === "completed"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : event.status === "ongoing"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {event.doctor}
                        </span>
                        <span>•</span>
                        <span>{event.date}</span>
                      </div>
                      {event.notes && (
                        <p className="text-sm text-muted-foreground p-3 bg-teal-50/50 dark:bg-teal-950/20 rounded border border-teal-200 dark:border-teal-800">
                          <span className="font-medium">Notes:</span> {event.notes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {!loading && history.length === 0 && (
            <Card className="shadow-lg">
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-2">📋</div>
                <div className="text-muted-foreground">No timeline events found</div>
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
                className="hover:bg-teal-50 dark:hover:bg-teal-950/20"
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
                className="hover:bg-teal-50 dark:hover:bg-teal-950/20"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
