"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PatientLabsPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Array<{ id: string; test: string; result: string; flagged: boolean; acknowledged: boolean; createdAt: string | null }>>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/patient/labs", { cache: "no-store" })
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
          <CardTitle>My Lab Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Test</th>
                  <th className="py-2">Result</th>
                  <th className="py-2">Flagged</th>
                  <th className="py-2">Acknowledged</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : items).map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">{l.test}</td>
                    <td className="py-2">{l.result}</td>
                    <td className="py-2">{l.flagged ? "Yes" : "No"}</td>
                    <td className="py-2">{l.acknowledged ? "Yes" : "No"}</td>
                    <td className="py-2">{l.createdAt ? new Date(l.createdAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && items.length === 0 && (
              <div className="text-sm text-muted-foreground mt-2">No labs found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
