"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity } from "lucide-react"

interface RecordVitalsDialogProps {
  patientId: string
  onSuccess?: () => void
}

export function RecordVitalsDialog({ patientId, onSuccess }: RecordVitalsDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    respiratoryRate: "",
    weight: "",
    height: "",
    glucose: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {}
      if (formData.bloodPressureSystolic) payload.bloodPressureSystolic = parseInt(formData.bloodPressureSystolic)
      if (formData.bloodPressureDiastolic) payload.bloodPressureDiastolic = parseInt(formData.bloodPressureDiastolic)
      if (formData.heartRate) payload.heartRate = parseInt(formData.heartRate)
      if (formData.temperature) payload.temperature = parseFloat(formData.temperature)
      if (formData.oxygenSaturation) payload.oxygenSaturation = parseInt(formData.oxygenSaturation)
      if (formData.respiratoryRate) payload.respiratoryRate = parseInt(formData.respiratoryRate)
      if (formData.weight) payload.weight = parseFloat(formData.weight)
      if (formData.height) payload.height = parseFloat(formData.height)
      if (formData.glucose) payload.glucose = parseInt(formData.glucose)
      if (formData.notes) payload.notes = formData.notes

      const res = await fetch(`/api/doctor/patients/${patientId}/vitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setOpen(false)
        setFormData({
          bloodPressureSystolic: "",
          bloodPressureDiastolic: "",
          heartRate: "",
          temperature: "",
          oxygenSaturation: "",
          respiratoryRate: "",
          weight: "",
          height: "",
          glucose: "",
          notes: "",
        })
        onSuccess?.()
      } else {
        alert("Failed to record vitals")
      }
    } catch (error) {
      alert("Error recording vitals")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-red-600 to-pink-600">
          <Activity className="w-4 h-4" />
          Record Vitals
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Vital Signs</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bp-sys">Blood Pressure - Systolic</Label>
              <Input
                id="bp-sys"
                type="number"
                placeholder="120"
                value={formData.bloodPressureSystolic}
                onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bp-dia">Blood Pressure - Diastolic</Label>
              <Input
                id="bp-dia"
                type="number"
                placeholder="80"
                value={formData.bloodPressureDiastolic}
                onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="hr">Heart Rate (bpm)</Label>
              <Input
                id="hr"
                type="number"
                placeholder="72"
                value={formData.heartRate}
                onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="temp">Temperature (°C)</Label>
              <Input
                id="temp"
                type="number"
                step="0.1"
                placeholder="98.6"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="o2">Oxygen Saturation (%)</Label>
              <Input
                id="o2"
                type="number"
                placeholder="98"
                value={formData.oxygenSaturation}
                onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="rr">Respiratory Rate</Label>
              <Input
                id="rr"
                type="number"
                placeholder="16"
                value={formData.respiratoryRate}
                onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="170"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="glucose">Blood Glucose (mg/dL)</Label>
              <Input
                id="glucose"
                type="number"
                placeholder="95"
                value={formData.glucose}
                onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional observations..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-red-600 to-pink-600">
              {loading ? "Recording..." : "Record Vitals"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
