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

  const handleConfirmSOS = () => {
    setSosActivated(true)
    setShowConfirmation(false)
    // Simulate SOS deactivation after 5 seconds
    setTimeout(() => setSosActivated(false), 5000)
  }

  const handleCancel = () => {
    setShowConfirmation(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-[hsl(var(--accent-red))]/20 to-[hsl(var(--accent-red))]/10 border-b border-[hsl(var(--accent-red))]/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Emergency Services</h1>
          <p className="text-muted-foreground">Quick access to emergency help and medical assistance</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Card className="border-[hsl(var(--accent-red))]/30 bg-[hsl(var(--accent-red))]/5">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <AlertCircle className="w-12 h-12 text-[hsl(var(--accent-red))]" />
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Emergency SOS</h2>
                  <p className="text-muted-foreground mb-6">
                    Press the button below to immediately alert emergency contacts and services
                  </p>
                </div>
                <Button
                  onClick={handleSOSClick}
                  disabled={sosActivated}
                  className={`px-8 py-6 text-lg font-bold rounded-full transition-all ${
                    sosActivated
                      ? "bg-[hsl(var(--accent-red))] hover:bg-[hsl(var(--accent-red))]/90 text-white animate-pulse"
                      : "bg-[hsl(var(--accent-red))] hover:bg-[hsl(var(--accent-red))]/90 text-white"
                  }`}
                >
                  {sosActivated ? "SOS ACTIVATED - CALLING EMERGENCY" : "ACTIVATE SOS"}
                </Button>
                {sosActivated && (
                  <Badge className="bg-[hsl(var(--accent-red))] text-white gap-2 animate-pulse">
                    <Heart className="w-3 h-3" />
                    Emergency services notified
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-2 border-[hsl(var(--accent-red))]">
              <CardHeader className="bg-[hsl(var(--accent-red))]/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-[hsl(var(--accent-red))]">Confirm Emergency SOS</CardTitle>
                  <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[hsl(var(--accent-red))] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Send help now?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This will immediately notify your emergency contacts and nearby hospitals with your location.
                    </p>
                  </div>
                </div>

                <div className="bg-secondary p-3 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Will notify:</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[hsl(var(--accent-blue))]" />
                      <span>Emergency Contacts (3)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[hsl(var(--accent-orange))]" />
                      <span>Nearby Hospitals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[hsl(var(--accent-red))]" />
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
                    className="flex-1 bg-[hsl(var(--accent-red))] hover:bg-[hsl(var(--accent-red))]/90 text-white"
                  >
                    Send SOS Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Emergency Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* National Emergency Number */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-[hsl(var(--accent-red))]" />
                Emergency Number
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[hsl(var(--accent-red))] mb-2">911</div>
              <p className="text-sm text-muted-foreground mb-4">Call for immediate medical emergency</p>
              <Button className="w-full bg-[hsl(var(--accent-red))] hover:bg-[hsl(var(--accent-red))]/90 text-white">
                Call 911
              </Button>
            </CardContent>
          </Card>

          {/* Poison Control */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[hsl(var(--accent-yellow))]" />
                Poison Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[hsl(var(--accent-yellow))] mb-2">1-800-222-1222</div>
              <p className="text-sm text-muted-foreground mb-4">For poisoning emergencies</p>
              <Button variant="outline" className="w-full bg-transparent">
                Call Now
              </Button>
            </CardContent>
          </Card>

          {/* Mental Health Crisis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-[hsl(var(--accent-blue))]" />
                Crisis Hotline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[hsl(var(--accent-blue))] mb-2">988</div>
              <p className="text-sm text-muted-foreground mb-4">Mental health crisis support</p>
              <Button variant="outline" className="w-full bg-transparent">
                Call Now
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
