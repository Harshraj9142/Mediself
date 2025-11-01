"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function DoctorSettingsPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [specialty, setSpecialty] = useState("")

  const save = async () => {
    // TODO: hook to /api/doctor/profile when available
    alert("Settings saved (demo)")
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Jane Doe" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground">Specialty</label>
              <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Cardiology" />
            </div>
          </div>
          <div className="mt-4">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={save}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
