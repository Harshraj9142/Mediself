"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PatientReportsPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Array<{ id: string; type: string; fileUrl: string | null; createdAt: string | null }>>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/patient/reports", { cache: "no-store" })
        if (res.ok) setItems(await res.json())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Type</th>
                  <th className="py-2">File</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : items).map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">{r.type}</td>
                    <td className="py-2">{r.fileUrl ? (<a href={r.fileUrl} target="_blank" className="text-primary underline">Open</a>) : "-"}</td>
                    <td className="py-2">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && items.length === 0 && (
              <div className="text-sm text-muted-foreground mt-2">No reports found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
