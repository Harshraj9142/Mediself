"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type Rx = { id: string; patient: string; medication: string; dosage: string; date: string; status: "Pending" | "Approved" | "Declined" }

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
      const res = await fetch("/api/doctor/prescriptions")
      if (res.ok) setItems(await res.json())
      else setError("Failed to load prescriptions")
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">Prescriptions</h2>
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by patient/medication/status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={load}>Refresh</Button>
        </div>
      </div>

      {(message || error) && (
        <div className={`text-sm ${error ? "text-accent-red" : "text-green-600"}`}>{error || message}</div>
      )}

      {/* Create Prescription */}
      <Card>
        <CardHeader>
          <CardTitle>New Prescription</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Patient</th>
                  <th className="py-2">Medication</th>
                  <th className="py-2">Dosage</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : items.filter((r) => {
                  const q = search.trim().toLowerCase()
                  if (!q) return true
                  return (
                    r.patient.toLowerCase().includes(q) ||
                    r.medication.toLowerCase().includes(q) ||
                    r.status.toLowerCase().includes(q)
                  )
                })).map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">{r.patient}</td>
                    <td className="py-2">{r.medication}</td>
                    <td className="py-2">{r.dosage}</td>
                    <td className="py-2">{r.date}</td>
                    <td className="py-2">{r.status}</td>
                    <td className="py-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => act(r.id, "decline")}>Decline</Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => act(r.id, "approve")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 bg-transparent" onClick={() => remove(r.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && items.length === 0 && <div className="text-sm text-muted-foreground mt-2">No prescriptions.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
