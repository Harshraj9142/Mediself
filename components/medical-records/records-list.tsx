"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Trash2, Eye } from "lucide-react"

const records = [
  {
    id: 1,
    title: "Prescription - Aspirin",
    date: "Oct 28, 2025",
    doctor: "Dr. Sarah Johnson",
    type: "Prescription",
    size: "245 KB",
  },
  {
    id: 2,
    title: "Blood Test Results",
    date: "Oct 20, 2025",
    doctor: "Lab Center",
    type: "Lab Report",
    size: "512 KB",
  },
  {
    id: 3,
    title: "X-Ray Report - Chest",
    date: "Oct 15, 2025",
    doctor: "Imaging Center",
    type: "Imaging",
    size: "1.2 MB",
  },
  {
    id: 4,
    title: "Vaccination Certificate",
    date: "Sep 10, 2025",
    doctor: "Health Clinic",
    type: "Certificate",
    size: "180 KB",
  },
  {
    id: 5,
    title: "Allergy Test Results",
    date: "Aug 30, 2025",
    doctor: "Dr. Emily Rodriguez",
    type: "Lab Report",
    size: "420 KB",
  },
]

export function RecordsList() {
  return (
    <div className="space-y-3">
      {records.map((record) => (
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
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-accent-red/10 text-accent-red">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
