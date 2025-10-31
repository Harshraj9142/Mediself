"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaregiversList } from "@/components/elderly-care/caregivers-list"
import { ElderlyProfilesList } from "@/components/elderly-care/elderly-profiles-list"
import { HealthMonitoring } from "@/components/elderly-care/health-monitoring"
import { Plus } from "lucide-react"

export default function ElderlyCare() {
  const [activeTab, setActiveTab] = useState("profiles")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Elderly Care Management</h1>
          <p className="text-muted-foreground">Monitor and manage the health of your loved ones</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profiles">Elderly Profiles</TabsTrigger>
            <TabsTrigger value="caregivers">Caregivers</TabsTrigger>
            <TabsTrigger value="monitoring">Health Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Elderly Profile
              </Button>
            </div>
            <ElderlyProfilesList />
          </TabsContent>

          <TabsContent value="caregivers" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button className="gap-2">
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
