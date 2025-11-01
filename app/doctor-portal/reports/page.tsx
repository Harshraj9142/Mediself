"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, ExternalLink } from "lucide-react"

type Report = { id: string; patient: string; patientId: string; doctor: string; doctorId: string; type: string; fileUrl: string | null; date: string; isMyReport: boolean }

export default function DoctorReportsPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Report[]>([])
  const [search, setSearch] = useState("")
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [form, setForm] = useState<{ patientId: string; type: string; fileUrl: string }>({ patientId: "", type: "", fileUrl: "" })
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      const res = await fetch(`/api/doctor/reports?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch {}
    setLoading(false)
  }

  const loadPatients = async () => {
    try {
      const res = await fetch("/api/doctor/patients")
      if (res.ok) {
        const data = await res.json()
        const opts = (data.items || []).map((p: any) => ({ id: p.id, name: p.name }))
        setPatients(opts)
      }
    } catch {}
  }

  useEffect(() => {
    load()
    loadPatients()
  }, [])

  const createReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.patientId || !form.type) return
    try {
      setCreating(true)
      const res = await fetch("/api/doctor/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({ patientId: "", type: "", fileUrl: "" })
        setShowCreateForm(false)
        load()
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-cyan-50/20 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">All Reports</h2>
          <p className="text-sm text-muted-foreground mt-1">View and manage all medical reports in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="w-64"
          />
          <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg" onClick={load}>Search</Button>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "Cancel" : "Create Report"}
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card className="shadow-lg border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
              Create New Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end" onSubmit={createReport}>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Patient</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground mt-1"
                  value={form.patientId}
                  onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
                >
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Report Type</label>
                <Input
                  placeholder="e.g. Blood Test, X-Ray"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">File URL (Optional)</label>
                <Input
                  placeholder="https://..."
                  value={form.fileUrl}
                  onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Button type="submit" className="w-full" disabled={creating || !form.patientId || !form.type}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Medical Reports</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
                My Report
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                Other Doctor
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Type</th>
                  <th className="py-2">Patient</th>
                  <th className="py-2">Doctor</th>
                  <th className="py-2">Report Type</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">File</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : items).map((r) => (
                  <tr key={r.id} className={`border-t border-border transition-colors ${
                    r.isMyReport 
                      ? "hover:bg-teal-50/30 dark:hover:bg-teal-950/10" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-900/10"
                  }`}>
                    <td className="py-2">
                      {r.isMyReport ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse" />
                          <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            Mine
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            Other
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 font-medium text-foreground">{r.patient}</td>
                    <td className="py-2 text-muted-foreground">{r.doctor}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        {r.type}
                      </div>
                    </td>
                    <td className="py-2 text-sm text-muted-foreground">{r.date}</td>
                    <td className="py-2">
                      {r.fileUrl ? (
                        <a
                          href={r.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">No file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && items.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <div className="text-4xl mb-2">📄</div>
                <div>No reports found</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
