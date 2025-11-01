"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaregiversList } from "@/components/elderly-care/caregivers-list"
import { ElderlyProfilesList } from "@/components/elderly-care/elderly-profiles-list"
import { HealthMonitoring } from "@/components/elderly-care/health-monitoring"
import { Plus, Heart } from "lucide-react"

export default function ElderlyCare() {
  const [activeTab, setActiveTab] = useState("profiles")

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-pink-50/20 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <section className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8" />
            Elderly Care Management
          </h1>
          <p className="text-rose-50">Monitor and manage the health of your loved ones</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white dark:bg-slate-800 shadow-md p-1 rounded-lg">
            <TabsTrigger 
              value="profiles"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              👴 Elderly Profiles
            </TabsTrigger>
            <TabsTrigger 
              value="caregivers"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              👨‍⚕️ Caregivers
            </TabsTrigger>
            <TabsTrigger 
              value="monitoring"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
            >
              📊 Health Monitoring
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button className="gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg">
                <Plus className="w-4 h-4" />
                Add Elderly Profile
              </Button>
            </div>
            <ElderlyProfilesList />
          </TabsContent>

          <TabsContent value="caregivers" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button className="gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg">
                <Plus className="w-4 h-4" />
                Add Caregiver
              </Button>
            </div>
            <CaregiversList />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <HealthMonitoring />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
