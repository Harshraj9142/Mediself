"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Array<{ id: string; name: string; email: string; lastVisitAt: string | null; conditions: string[] }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const loadPatients = async (query?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set("search", query)
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
          }))
        )
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    loadPatients()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Patients</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="Search patients by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button onClick={() => loadPatients(search)}>Search</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Last Visit</th>
                  <th className="py-2">Conditions</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : patients).map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">{p.name}</td>
                    <td className="py-2">{p.email}</td>
                    <td className="py-2">{p.lastVisitAt || "-"}</td>
                    <td className="py-2">{p.conditions.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && patients.length === 0 && <div className="text-sm text-muted-foreground mt-2">No patients found.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
