"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecordsList } from "@/components/medical-records/records-list"
import { LabReports } from "@/components/medical-records/lab-reports"
import { HealthHistory } from "@/components/medical-records/health-history"
import { Upload } from "lucide-react"

export default function MedicalRecordsPage() {
  const [activeTab, setActiveTab] = useState("records")

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-cyan-50/20 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <section className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Medical Records</h1>
          <p className="text-teal-50">Access your medical history, reports, and documents</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <Card className="mb-8 border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 shadow-md">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">Upload Medical Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    Add prescriptions, test results, lab reports, or other medical documents
                  </p>
                </div>
              </div>
              <Button className="gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg">
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white dark:bg-slate-800 shadow-md p-1 rounded-lg">
            <TabsTrigger 
              value="records" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
            >
              📄 Medical Records
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
            >
              🔬 Lab Reports
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              📋 Health History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-4">
            <RecordsList />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <LabReports />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <HealthHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
