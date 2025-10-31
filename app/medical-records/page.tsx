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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Medical Records</h1>
          <p className="text-muted-foreground">Access your medical history, reports, and documents</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Upload Medical Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Add prescriptions, test results, or other medical documents
                </p>
              </div>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="records">Medical Records</TabsTrigger>
            <TabsTrigger value="reports">Lab Reports</TabsTrigger>
            <TabsTrigger value="history">Health History</TabsTrigger>
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
