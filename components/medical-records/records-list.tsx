"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Trash2, Eye } from "lucide-react"
import { useEffect, useState } from "react"

export function RecordsList() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<Array<{ id: string; title: string; date: string; doctor: string; type: string; size: string }>>([])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/medical-records/records")
      if (res.ok) setRecords(await res.json())
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const deleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/medical-records/records/${id}`, { method: "DELETE" })
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id))
      } else {
        alert("Delete failed")
      }
    } catch {
      alert("Network error")
    }
  }

  return (
    <div className="space-y-3">
      {(loading ? [] : records).map((record) => (
        <Card key={record.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-semibold text-foreground">{record.title}</div>
                  <div className="text-sm text-muted-foreground">{record.doctor}</div>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className="bg-secondary text-foreground">
                      {record.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{record.date}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{record.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10" title="View">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10" title="Download">
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent-red/10 text-accent-red"
                  onClick={() => deleteRecord(record.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {!loading && records.length === 0 && (
        <div className="text-sm text-muted-foreground">No records found.</div>
      )}
    </div>
  )
}
