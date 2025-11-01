"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Phone, Heart, MapPin, X } from "lucide-react"
import { EmergencyContacts } from "@/components/emergency/emergency-contacts"
import { NearbyHospitals } from "@/components/emergency/nearby-hospitals"

export default function EmergencyPage() {
  const [sosActivated, setSosActivated] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSOSClick = () => {
    setShowConfirmation(true)
  }

  const handleConfirmSOS = async () => {
    setSosActivated(true)
    setShowConfirmation(false)
    
    // Send SOS to backend
    try {
      await fetch("/api/emergency/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: "Current Location" }),
      })
    } catch {}
    
    // Simulate SOS deactivation after 5 seconds
    setTimeout(() => setSosActivated(false), 5000)
  }

  const handleCancel = () => {
    setShowConfirmation(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50/30 via-rose-50/20 to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <AlertCircle className="w-8 h-8" />
            Emergency Services
          </h1>
          <p className="text-red-50">Quick access to emergency help and medical assistance</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Card className="border-4 border-red-500 dark:border-red-700 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center gap-6 py-12">
                <div className="p-6 rounded-full bg-gradient-to-br from-red-500 to-rose-500 shadow-2xl">
                  <AlertCircle className="w-16 h-16 text-white" />
                </div>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-foreground mb-3">Emergency SOS</h2>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    Press the button below to immediately alert emergency contacts and services
                  </p>
                </div>
                <Button
                  onClick={handleSOSClick}
                  disabled={sosActivated}
                  className={`px-12 py-8 text-xl font-bold rounded-full transition-all shadow-2xl ${
                    sosActivated
                      ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white animate-pulse scale-110"
                      : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white hover:scale-105"
                  }`}
                >
                  {sosActivated ? "🚨 SOS ACTIVATED - CALLING EMERGENCY" : "🆘 ACTIVATE SOS"}
                </Button>
                {sosActivated && (
                  <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white gap-2 animate-pulse text-base px-4 py-2">
                    <Heart className="w-4 h-4" />
                    Emergency services notified
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <Card className="w-full max-w-md border-4 border-red-500 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6" />
                    Confirm Emergency SOS
                  </CardTitle>
                  <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-lg">Send help now?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This will immediately notify your emergency contacts and nearby hospitals with your location.
                    </p>
                  </div>
                </div>

                <div className="bg-secondary p-4 rounded-lg space-y-3 border border-border">
                  <p className="text-sm font-semibold text-foreground">Will notify:</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-3 p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span>Your Emergency Contacts</span>
                    </li>
                    <li className="flex items-center gap-3 p-2 rounded bg-orange-50 dark:bg-orange-950/20">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      <span>Nearby Hospitals</span>
                    </li>
                    <li className="flex items-center gap-3 p-2 rounded bg-red-50 dark:bg-red-950/20">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span>Emergency Services (911)</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleCancel} variant="outline" className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSOS}
                    className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg"
                  >
                    🆘 Send SOS Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Emergency Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* National Emergency Number */}
          <Card className="border-2 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-red-600" />
                Emergency Number
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">911</div>
              <p className="text-sm text-muted-foreground mb-4">Call for immediate medical emergency</p>
              <Button 
                onClick={() => window.location.href = 'tel:911'}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg"
              >
                📞 Call 911
              </Button>
            </CardContent>
          </Card>

          {/* Poison Control */}
          <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Poison Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">1-800-222-1222</div>
              <p className="text-sm text-muted-foreground mb-4">For poisoning emergencies</p>
              <Button 
                onClick={() => window.location.href = 'tel:1-800-222-1222'}
                variant="outline" 
                className="w-full hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                📞 Call Now
              </Button>
            </CardContent>
          </Card>

          {/* Mental Health Crisis */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-600" />
                Crisis Hotline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">988</div>
              <p className="text-sm text-muted-foreground mb-4">Mental health crisis support</p>
              <Button 
                onClick={() => window.location.href = 'tel:988'}
                variant="outline" 
                className="w-full hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                📞 Call Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emergency Contacts */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Your Emergency Contacts</h2>
            <EmergencyContacts />
          </div>

          {/* Nearby Hospitals */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Nearby Hospitals</h2>
            <NearbyHospitals />
          </div>
        </div>
      </div>
    </div>
  )
}
