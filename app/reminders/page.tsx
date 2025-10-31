"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MedicineRemindersTab } from "@/components/reminders/medicine-reminders-tab"
import { AddMedicineForm } from "@/components/reminders/add-medicine-form"
import { Plus } from "lucide-react"

export default function RemindersPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState("today")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Medicine Reminders</h1>
          <p className="text-muted-foreground">Never miss a dose with smart medication reminders</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Medicine Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Medicine
          </Button>
        </div>

        {/* Add Medicine Form */}
        {showAddForm && (
          <div className="mb-6">
            <AddMedicineForm onClose={() => setShowAddForm(false)} />
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <MedicineRemindersTab period="today" />
          </TabsContent>

          <TabsContent value="upcoming">
            <MedicineRemindersTab period="upcoming" />
          </TabsContent>

          <TabsContent value="history">
            <MedicineRemindersTab period="history" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
