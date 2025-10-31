"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Eye, Trash2 } from "lucide-react"

export function PrivacySettings() {
  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    dataSharing: false,
    researchParticipation: false,
  })

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Profile Visibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["private", "contacts-only", "public"].map((option) => (
              <label key={option} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value={option}
                  checked={privacy.profileVisibility === option}
                  onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                  className="w-4 h-4"
                />
                <span className="text-foreground capitalize">
                  {option === "contacts-only" ? "Contacts Only" : option}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Data Sharing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.dataSharing}
                onChange={(e) => setPrivacy({ ...privacy, dataSharing: e.target.checked })}
                className="w-4 h-4"
              />
              <div>
                <div className="font-semibold text-foreground">Allow Data Sharing</div>
                <div className="text-sm text-muted-foreground">
                  Share anonymized health data with healthcare providers
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.researchParticipation}
                onChange={(e) => setPrivacy({ ...privacy, researchParticipation: e.target.checked })}
                className="w-4 h-4"
              />
              <div>
                <div className="font-semibold text-foreground">Research Participation</div>
                <div className="text-sm text-muted-foreground">Participate in medical research studies</div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-accent-red/30 bg-accent-red/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent-red">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full border-accent-red/30 text-accent-red hover:bg-accent-red/10 bg-transparent"
          >
            Download My Data
          </Button>
          <Button
            variant="outline"
            className="w-full border-accent-red/30 text-accent-red hover:bg-accent-red/10 bg-transparent"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
