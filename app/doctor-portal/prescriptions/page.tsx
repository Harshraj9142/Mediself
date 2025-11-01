"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type Rx = { id: string; patient: string; patientId: string; doctor: string; doctorId: string; medication: string; dosage: string; date: string; status: "Pending" | "Approved" | "Declined"; isMyPrescription: boolean }

export default function DoctorPrescriptionsPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Rx[]>([])
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([])
  const [form, setForm] = useState<{ patientId: string; medication: string; dosage: string }>({ patientId: "", medication: "", dosage: "" })
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      const res = await fetch(`/api/doctor/prescriptions?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      } else setError("Failed to load prescriptions")
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

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
    loadPatients()
  }, [])

  const act = async (id: string, action: "approve" | "decline") => {
    try {
      const comment = window.prompt(`Optional ${action} comment:`) || ""
      const res = await fetch(`/api/doctor/prescriptions/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      })
      if (res.ok) {
        setMessage(action === "approve" ? "Approved" : "Declined")
        await load()
      } else setError("Action failed")
    } catch {}
  }

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/doctor/prescriptions/${id}`, { method: "DELETE" })
      if (res.ok) {
        setMessage("Deleted")
        await load()
      } else setError("Delete failed")
    } catch {}
  }

  const createRx = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.patientId || !form.medication || !form.dosage) return
    try {
      setCreating(true)
      const res = await fetch("/api/doctor/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({ patientId: "", medication: "", dosage: "" })
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">All Prescriptions</h2>
          <p className="text-sm text-muted-foreground mt-1">View and manage all prescriptions in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by patient/medication/status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="w-64"
          />
          <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg" onClick={load}>Refresh</Button>
        </div>
      </div>

      {(message || error) && (
        <div className={`text-sm ${error ? "text-accent-red" : "text-green-600"}`}>{error || message}</div>
      )}

      {/* Create Prescription */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse" />
            Create New Prescription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end" onSubmit={createRx}>
            <div className="md:col-span-1">
              <label className="text-sm text-muted-foreground">Patient</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
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
              <label className="text-sm text-muted-foreground">Medication</label>
              <Input
                placeholder="e.g. Atorvastatin"
                value={form.medication}
                onChange={(e) => setForm((f) => ({ ...f, medication: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Dosage</label>
              <Input
                placeholder="e.g. 10 mg OD"
                value={form.dosage}
                onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))}
              />
            </div>
            <div>
              <Button type="submit" className="w-full" disabled={creating || !form.patientId || !form.medication || !form.dosage}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prescription Queue</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
                My Prescription
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
                  <th className="py-2">Prescribed By</th>
                  <th className="py-2">Medication</th>
                  <th className="py-2">Dosage</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : items).map((r) => (
                  <tr key={r.id} className={`border-t border-border transition-colors ${
                    r.isMyPrescription 
                      ? "hover:bg-teal-50/30 dark:hover:bg-teal-950/10" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-900/10"
                  }`}>
                    <td className="py-2">
                      {r.isMyPrescription ? (
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
                    <td className="py-2">{r.medication}</td>
                    <td className="py-2">{r.dosage}</td>
                    <td className="py-2 text-sm text-muted-foreground">{r.date}</td>
                    <td className="py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        r.status === "Approved"
                          ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400"
                          : r.status === "Declined"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2">
                      {r.isMyPrescription ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => act(r.id, "decline")}>Decline</Button>
                          <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" onClick={() => act(r.id, "approve")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => remove(r.id)}>
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">View only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && items.length === 0 && (
              <tr>
                <td className="py-8 text-center text-muted-foreground" colSpan={8}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl">💊</div>
                    <div>No prescriptions found</div>
                  </div>
                </td>
              </tr>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
