"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, Mail, Edit2, Trash2, Plus, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"

type Contact = {
  id: string
  name: string
  relationship: string
  phone: string
  email: string
  createdAt: string
}

export function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", relationship: "", phone: "", email: "" })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/emergency/contacts")
      if (res.ok) {
        const data = await res.json()
        setContacts(data.items || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = async () => {
    if (!formData.name || !formData.phone) return
    try {
      const res = await fetch("/api/emergency/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setFormData({ name: "", relationship: "", phone: "", email: "" })
        setShowAddForm(false)
        load()
      }
    } catch {}
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/emergency/contacts/${id}`, { method: "DELETE" })
      if (res.ok) {
        setContacts(prev => prev.filter(c => c.id !== id))
      }
    } catch {}
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="space-y-4">
      {/* Add Contact Button */}
      <Button 
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 gap-2"
      >
        <UserPlus className="w-4 h-4" />
        Add Emergency Contact
      </Button>

      {/* Add Form */}
      {showAddForm && (
        <Card className="border-2 border-red-200 dark:border-red-800">
          <CardContent className="pt-6 space-y-3">
            <Input
              placeholder="Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Relationship"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            />
            <Input
              placeholder="Phone *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700">
                Save Contact
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <div className="text-sm text-muted-foreground">Loading contacts...</div>}

      <div className="space-y-3">
      {!loading && contacts.map((contact) => (
        <Card key={contact.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 shadow-md">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg text-foreground">{contact.name}</h3>
                  {contact.relationship && (
                    <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  )}
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground pt-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${contact.phone}`} className="hover:text-foreground">
                        {contact.phone}
                      </a>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${contact.email}`} className="hover:text-foreground">
                          {contact.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleCall(contact.phone)}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 gap-1"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(contact.id)}
                  className="hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {!loading && contacts.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-2">📞</div>
            <div className="text-muted-foreground">No emergency contacts added yet</div>
            <p className="text-sm text-muted-foreground mt-2">Click "Add Emergency Contact" to get started</p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}
