"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RecordVitalsDialog } from "@/components/doctor/record-vitals-dialog"
import { Activity, FileText, Pill, FlaskConical, Calendar, StickyNote, Bell, User, Clock } from "lucide-react"

export default function DoctorPatientDetailPage() {
  const params = useParams() as { id?: string }
  const patientId = params?.id || ""
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [notes, setNotes] = useState<Array<{ id: string; text: string; createdAt: string | null }>>([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [noteText, setNoteText] = useState("")
  const [vitals, setVitals] = useState<any[]>([])
  const [vitalsLoading, setVitalsLoading] = useState(true)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!patientId) return
      try {
        const res = await fetch(`/api/doctor/patient-summary?id=${patientId}`, { cache: "no-store" })
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [patientId])

  const loadNotes = async () => {
    if (!patientId) return
    setNotesLoading(true)
    try {
      const res = await fetch(`/api/doctor/notes?patientId=${patientId}`, { cache: "no-store" })
      if (res.ok) setNotes(await res.json())
    } finally {
      setNotesLoading(false)
    }
  }

  const loadVitals = async () => {
    if (!patientId) return
    setVitalsLoading(true)
    try {
      const res = await fetch(`/api/doctor/patients/${patientId}/vitals?limit=10`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setVitals(data.items || [])
      }
    } finally {
      setVitalsLoading(false)
    }
  }

  const loadHistory = async () => {
    if (!patientId) return
    setHistoryLoading(true)
    try {
      const res = await fetch(`/api/doctor/patients/${patientId}/history`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setHistory(data.timeline || [])
      }
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
    loadVitals()
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId])

  const profile = data?.profile || {}
  const refreshSummary = async () => {
    if (!patientId) return
    const res = await fetch(`/api/doctor/patient-summary?id=${patientId}`, { cache: "no-store" })
    if (res.ok) setData(await res.json())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <User className="w-8 h-8 text-blue-600" />
              {profile.name || "Patient Details"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">View and manage patient information</p>
          </div>
          <RecordVitalsDialog patientId={patientId} onSuccess={() => { loadVitals(); refreshSummary(); }} />
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Patient Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : !data ? (
            <div className="text-sm text-muted-foreground">No data found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Name</div>
                <div className="font-medium">{profile.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div>{profile.email || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Phone</div>
                <div>{profile.phone || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">DOB</div>
                <div>{profile.dob || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Gender</div>
                <div>{profile.gender || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Blood Type</div>
                <div>{profile.bloodType || "-"}</div>
              </div>
              <div className="md:col-span-3">
                <div className="text-xs text-muted-foreground">Address</div>
                <div>
                  {profile.address
                    ? [profile.address.line1, profile.address.line2, profile.address.city, profile.address.state, profile.address.postalCode, profile.address.country]
                        .filter(Boolean)
                        .join(", ")
                    : "-"}
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="text-xs text-muted-foreground">Allergies</div>
                <div>{(profile.allergies || []).join(", ") || "-"}</div>
              </div>
              <div className="md:col-span-3">
                <div className="text-xs text-muted-foreground">Medications</div>
                <div>{(profile.medications || []).join(", ") || "-"}</div>
              </div>
              <div className="md:col-span-3">
                <div className="text-xs text-muted-foreground">Conditions</div>
                <div>{(profile.conditions || []).join(", ") || "-"}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="activity">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="activity">📋 Activity</TabsTrigger>
          <TabsTrigger value="vitals">💓 Vitals</TabsTrigger>
          <TabsTrigger value="history">🕐 Timeline</TabsTrigger>
          <TabsTrigger value="appointments">📅 Appointments</TabsTrigger>
          <TabsTrigger value="prescriptions">💊 Prescriptions</TabsTrigger>
          <TabsTrigger value="labs">🔬 Labs</TabsTrigger>
          <TabsTrigger value="reports">📄 Reports</TabsTrigger>
          <TabsTrigger value="reminders">⏰ Reminders</TabsTrigger>
          <TabsTrigger value="notes">📝 Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : (data?.activities || []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">No recent activity.</div>
                ) : (
                  (data.activities || []).map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                      <div>
                        <div className="font-medium">{a.type}</div>
                        <div className="text-sm text-muted-foreground">{a.desc}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{a.at ? new Date(a.at).toLocaleString() : "-"}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2">Date</th>
                      <th className="py-2">Reason</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.appointments || []).map((a: any) => (
                      <tr key={a.id} className="border-t border-border">
                        <td className="py-2">{a.date ? new Date(a.date).toLocaleString() : "-"}</td>
                        <td className="py-2">{a.reason || ""}</td>
                        <td className="py-2">{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2">Medication</th>
                      <th className="py-2">Dosage</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.prescriptions || []).map((p: any) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="py-2">{p.medication}</td>
                        <td className="py-2">{p.dosage}</td>
                        <td className="py-2">{p.status}</td>
                        <td className="py-2">{p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs">
          <Card>
            <CardHeader>
              <CardTitle>Labs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2">Test</th>
                      <th className="py-2">Result</th>
                      <th className="py-2">Flagged</th>
                      <th className="py-2">Created</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.labs || []).map((l: any) => (
                      <tr key={l.id} className="border-t border-border">
                        <td className="py-2">{l.test}</td>
                        <td className="py-2">{l.result}</td>
                        <td className="py-2">{l.flagged ? "Yes" : "No"}</td>
                        <td className="py-2">{l.createdAt ? new Date(l.createdAt).toLocaleString() : "-"}</td>
                        <td className="py-2">
                          {!l.acknowledged ? (
                            <Button size="sm" variant="outline" onClick={async () => {
                              const r = await fetch(`/api/doctor/labs/${l.id}/ack`, { method: "POST" })
                              if (r.ok) await refreshSummary()
                            }}>Acknowledge</Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Acknowledged</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.target as HTMLFormElement
                  const type = (form.querySelector('#r_type') as HTMLInputElement).value.trim()
                  const url = (form.querySelector('#r_url') as HTMLInputElement).value.trim()
                  if (!type) return
                  const res = await fetch('/api/doctor/reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ patientId, type, fileUrl: url || undefined }),
                  })
                  if (res.ok) {
                    ;(form.querySelector('#r_type') as HTMLInputElement).value = ''
                    ;(form.querySelector('#r_url') as HTMLInputElement).value = ''
                    await refreshSummary()
                  } else {
                    alert('Failed to add report')
                  }
                }}
              >
                <div>
                  <label className="text-sm text-muted-foreground">Type</label>
                  <Input id="r_type" placeholder="e.g. Blood Test" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">File URL (optional)</label>
                  <Input id="r_url" placeholder="https://..." />
                </div>
                <div>
                  <Button type="submit" className="w-full">Add</Button>
                </div>
              </form>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2">Type</th>
                      <th className="py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.reports || []).map((r: any) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="py-2">{r.type}</td>
                        <td className="py-2">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle>Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end mb-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.target as HTMLFormElement
                  const medicine = (form.querySelector('#d_med') as HTMLInputElement).value.trim()
                  const dosage = (form.querySelector('#d_dose') as HTMLInputElement).value.trim()
                  const time = (form.querySelector('#d_time') as HTMLInputElement).value
                  const date = (form.querySelector('#d_date') as HTMLInputElement).value
                  const reason = (form.querySelector('#d_reason') as HTMLInputElement).value.trim()
                  const frequency = (form.querySelector('#d_freq') as HTMLInputElement).value.trim()
                  if (!medicine || !dosage || !time) return
                  const res = await fetch('/api/doctor/reminders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ patientId, medicine, dosage, time, date: date || undefined, reason: reason || undefined, frequency: frequency || undefined }),
                  })
                  if (res.ok) {
                    ;(form.querySelector('#d_med') as HTMLInputElement).value = ''
                    ;(form.querySelector('#d_dose') as HTMLInputElement).value = ''
                    ;(form.querySelector('#d_reason') as HTMLInputElement).value = ''
                    await refreshSummary()
                  } else {
                    alert('Failed to create reminder')
                  }
                }}
              >
                <div>
                  <label className="text-sm text-muted-foreground">Medicine</label>
                  <Input id="d_med" placeholder="e.g. Metformin" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Dosage</label>
                  <Input id="d_dose" placeholder="e.g. 500 mg" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Time</label>
                  <Input id="d_time" type="time" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Date (optional)</label>
                  <Input id="d_date" type="date" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Frequency</label>
                  <Input id="d_freq" placeholder="daily" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Reason</label>
                  <Input id="d_reason" placeholder="Optional" />
                </div>
                <div className="md:col-span-6">
                  <Button type="submit">Add Reminder</Button>
                </div>
              </form>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2">Title</th>
                      <th className="py-2">Active</th>
                      <th className="py-2">Created</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.reminders || []).map((r: any) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="py-2">{r.title}</td>
                        <td className="py-2">{r.active ? "Yes" : "No"}</td>
                        <td className="py-2">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                        <td className="py-2">
                          <Button
                            size="sm"
                            variant={r.active ? "outline" : "default"}
                            onClick={async () => {
                              const res = await fetch(`/api/doctor/reminders/${r.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ active: !r.active }),
                              })
                              if (res.ok) await refreshSummary()
                              else alert("Failed to update reminder")
                            }}
                          >
                            {r.active ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="flex gap-2 mb-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const text = noteText.trim()
                  if (!text) return
                  const res = await fetch(`/api/doctor/notes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ patientId, text }),
                  })
                  if (res.ok) {
                    setNoteText("")
                    await loadNotes()
                  } else {
                    alert("Failed to add note")
                  }
                }}
              >
                <Input placeholder="Add a note" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                <Button type="submit">Add</Button>
              </form>

              <div className="space-y-2">
                {(notesLoading ? [] : notes).map((n) => (
                  <div key={n.id} className="p-3 bg-secondary rounded-md">
                    <div className="text-sm text-muted-foreground">{n.createdAt ? new Date(n.createdAt).toLocaleString() : "-"}</div>
                    <div className="font-medium text-foreground">{n.text}</div>
                  </div>
                ))}
                {!notesLoading && notes.length === 0 && <div className="text-sm text-muted-foreground">No notes yet.</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
