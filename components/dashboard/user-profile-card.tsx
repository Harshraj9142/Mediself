"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, Calendar, MapPin, Edit } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

export function UserProfileCard() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const role = (session?.user as any)?.role
        const endpoint = role === "doctor" 
          ? "/api/doctor/profile"
          : "/api/patient/profile"
        
        const res = await fetch(endpoint)
        if (res.ok) {
          const data = await res.json()
          setProfile({ ...data, role })
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      loadProfile()
    }
  }, [session])

  if (loading) {
    return (
      <Card className="border-2 border-blue-200 shadow-lg animate-pulse">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) return null

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const roleColor = profile.role === "doctor" ? "from-blue-600 to-indigo-600" : "from-teal-600 to-cyan-600"
  const badgeColor = profile.role === "doctor" 
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    : "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"

  return (
    <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            My Profile
          </CardTitle>
          <Link href="/profile">
            <Button size="sm" variant="outline" className="gap-1">
              <Edit className="w-3 h-3" />
              Edit
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className={`w-20 h-20 border-4 border-white shadow-lg bg-gradient-to-br ${roleColor}`}>
              <AvatarFallback className="text-white text-2xl font-bold">
                {getInitials(profile.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{profile.name}</h3>
              <Badge variant="outline" className={`${badgeColor} mt-1`}>
                {profile.role === "doctor" ? "👨‍⚕️ Doctor" : "🧑 Patient"}
              </Badge>
              {profile.specialty && <p className="text-sm text-muted-foreground mt-1">{profile.specialty}</p>}
              {profile.profileCompletion !== undefined && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Profile</span>
                    <span>{profile.profileCompletion}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className={`h-full bg-gradient-to-r ${roleColor} rounded-full`} style={{ width: `${profile.profileCompletion}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-muted-foreground truncate">{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-muted-foreground">{profile.phone}</span>
              </div>
            )}
            {profile.dob && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-muted-foreground">
                  {new Date(profile.dob).toLocaleDateString()}
                  {profile.age && ` (${profile.age} years)`}
                </span>
              </div>
            )}
            {profile.address && (profile.address.city || profile.address.state) && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="text-muted-foreground">
                  {[profile.address.city, profile.address.state].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>

          {profile.bloodType && (
            <div className="pt-3 border-t">
              <div className="text-sm">
                <span className="text-muted-foreground">Blood Type: </span>
                <span className="font-semibold text-red-600">{profile.bloodType}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
