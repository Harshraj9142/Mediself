"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Download, Trash2, Eye, Search, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"

type Record = {
  id: string
  title: string
  description: string
  date: string
  doctor: string
  doctorId: string
  type: string
  category: string
  fileUrl: string | null
  size: string
  createdAt: string
}

export function RecordsList() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<Record[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      params.set("page", String(page))
      const res = await fetch(`/api/medical-records/records?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setRecords(data.items || [])
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
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, type, doctor, description..."
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

      {loading && <div className="text-sm text-muted-foreground">Loading records...</div>}

      <div className="space-y-3">
      {!loading && records.map((record) => (
        <Card key={record.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-teal-500">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{record.title}</h3>
                    {record.description && (
                      <p className="text-sm text-muted-foreground mt-1">{record.description}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                      {record.type}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {record.category}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Doctor:</span> {record.doctor}
                    </span>
                    <span>•</span>
                    <span>{record.date}</span>
                    {record.size !== "-" && (
                      <>
                        <span>•</span>
                        <span>{record.size}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {record.fileUrl ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:border-teal-300"
                      onClick={() => window.open(record.fileUrl!, "_blank")}
                      title="View File"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-teal-50 dark:hover:bg-teal-950/20"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400"
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
        <Card className="shadow-lg">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-2">📄</div>
            <div className="text-muted-foreground">No medical records found</div>
            {search && (
              <p className="text-sm text-muted-foreground mt-2">Try a different search term</p>
            )}
          </CardContent>
        </Card>
      )}
      </div>

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
    </div>
  )
}
