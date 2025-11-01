"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"

interface DoctorSelectorProps {
  selectedDoctor?: string
  onDoctorChange: (doctorId: string) => void
}

type Doc = { id: string; name: string; email?: string; specialty?: string; rating?: number; availability?: string }

export function DoctorSelector({ selectedDoctor, onDoctorChange }: DoctorSelectorProps) {
  const [docs, setDocs] = useState<Doc[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch("/api/doctors")
        if (!res.ok) return
        const data = (await res.json()) as Array<{ id: string; name: string; email?: string }>
        if (mounted) {
          setDocs(
            data.map((d) => ({
              id: d.id,
              name: d.name,
              email: d.email,
              specialty: "General",
              rating: 4.8,
              availability: "Available",
            }))
          )
        }
      } catch {}
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-2">
      {docs.map((doctor) => (
        <button
          key={doctor.id}
          onClick={() => onDoctorChange(doctor.id)}
          className={`w-full text-left transition-all ${
            selectedDoctor === doctor.id ? "ring-2 ring-primary rounded-lg" : "hover:bg-secondary rounded-lg"
          }`}
        >
          <Card className={selectedDoctor === doctor.id ? "border-primary" : ""}>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="font-semibold text-foreground">{doctor.name}</div>
                <div className="text-sm text-muted-foreground">{doctor.specialty || "General"}</div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent-yellow text-accent-yellow" />
                    <span className="text-sm font-medium">{doctor.rating || 4.8}</span>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {doctor.availability || "Available"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </button>
      ))}
      {docs.length === 0 && (
        <div className="text-sm text-muted-foreground">No doctors available.</div>
      )}
    </div>
  )
}
