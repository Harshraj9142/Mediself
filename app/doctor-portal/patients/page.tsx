"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Download, BarChart3, UserCheck, Filter, ArrowUpDown } from "lucide-react"
import Link from "next/link"

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Array<{ id: string; name: string; email: string; lastVisitAt: string | null; conditions: string[]; hasRelation: boolean }>>([]);
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [gender, setGender] = useState("")
  const [condition, setCondition] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [myPatientsOnly, setMyPatientsOnly] = useState(false)
  const [stats, setStats] = useState<any>(null)

  const loadPatients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (gender) params.set("gender", gender)
      if (condition) params.set("condition", condition)
      if (sortBy) params.set("sortBy", sortBy)
      if (myPatientsOnly) params.set("myPatientsOnly", "true")
      params.set("limit", "50")
      
      const res = await fetch(`/api/doctor/patients?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setPatients(
          (data.items || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            lastVisitAt: p.lastVisitAt ? new Date(p.lastVisitAt).toLocaleDateString() : null,
            conditions: Array.isArray(p.conditions) ? p.conditions : [],
            hasRelation: p.hasRelation || false,
          }))
        )
      }
    } catch {}
    setLoading(false)
  }

  const loadStats = async () => {
    try {
      const res = await fetch('/api/doctor/patients/stats')
      if (res.ok) setStats(await res.json())
    } catch {}
  }

  const handleExport = () => {
    window.location.href = '/api/doctor/patients/export?format=csv'
  }

  useEffect(() => {
    loadPatients()
    loadStats()
  }, [])

  useEffect(() => {
    loadPatients()
  }, [gender, condition, sortBy, myPatientsOnly])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              Patients
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Manage and view patient information</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Link href="/doctor-portal/patients/stats">
              <Button variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Statistics
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalPatients}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-indigo-200 dark:border-indigo-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">New (30 days)</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stats.recentPatients}</p>
                  </div>
                  <UserCheck className="w-10 h-10 text-indigo-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.upcomingAppointments}</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-pink-200 dark:border-pink-800">
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Top Conditions</p>
                  <div className="space-y-1">
                    {stats.topConditions.slice(0, 3).map((c: any, i: number) => (
                      <div key={i} className="text-xs flex justify-between">
                        <span className="truncate">{c.condition}</span>
                        <Badge variant="outline" className="text-xs">{c.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5 text-blue-600" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or email" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loadPatients()}
                  className="pl-10"
                />
              </div>
              
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Input 
                placeholder="Filter by condition" 
                value={condition} 
                onChange={(e) => setCondition(e.target.value)}
              />

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="name">By Name</SelectItem>
                  <SelectItem value="lastVisit">Last Visit</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button 
                  variant={myPatientsOnly ? "default" : "outline"}
                  onClick={() => setMyPatientsOnly(!myPatientsOnly)}
                  className="flex-1"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {myPatientsOnly ? "My Patients" : "All Patients"}
                </Button>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={loadPatients} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={() => {
                setSearch("")
                setGender("")
                setCondition("")
                setSortBy("recent")
                setMyPatientsOnly(false)
              }}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient List */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-blue-600" />
                Patient List ({patients.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading patients...</div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No patients found. Try adjusting your filters.</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {patients.map((p) => (
                  <Link key={p.id} href={`/doctor-portal/patients/${p.id}`}>
                    <Card className="hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer border-2">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{p.name}</h3>
                              {p.hasRelation && (
                                <Badge className="bg-green-100 text-green-700 border-green-300">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  My Patient
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{p.email}</p>
                            {p.lastVisitAt && (
                              <p className="text-xs text-muted-foreground mt-1">Last visit: {p.lastVisitAt}</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                            {p.conditions.slice(0, 3).map((condition, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                            {p.conditions.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{p.conditions.length - 3}</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
