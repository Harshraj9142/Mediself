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
    <div className="min-h-screen bg-gradient-to-br from-pink-50/30 via-rose-50/20 to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <section className="bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">💊 Medicine Reminders</h1>
          <p className="text-pink-50">Never miss a dose with smart medication reminders</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Medicine Button */}
        <div className="mb-6 flex justify-end">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg"
          >
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
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white dark:bg-slate-800 shadow-md p-1 rounded-lg">
            <TabsTrigger 
              value="today"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white"
            >
              📅 Today
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
            >
              📆 Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              📋 History
            </TabsTrigger>
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
