"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"patient" | "doctor">("patient")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    })
    setIsLoading(false)
    if (!res || res.error) {
      alert("Invalid email or password")
      return
    }
    if (userType === "patient") {
      router.push("/dashboard")
    } else {
      router.push("/doctor-portal")
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-full p-4 shadow-2xl">
              <Logo />
            </div>
          </div>
        </div>
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 rounded-full border border-teal-200 dark:border-teal-800 mb-4 animate-pulse">
          <span className="text-sm font-semibold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
            ✨ Healthcare Made Simple
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">Welcome Back</span>
        </h1>
        <p className="text-muted-foreground text-lg">Sign in to your MediSelf account</p>
      </div>

      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 to-teal-50/50 dark:from-slate-900/90 dark:to-teal-950/50 backdrop-blur-xl border-2 border-teal-100/50 dark:border-teal-900/50">
        <CardHeader>
          <div className="flex gap-2 mb-4">
            <Button
              variant={userType === "patient" ? "default" : "outline"}
              onClick={() => setUserType("patient")}
              className={`flex-1 transition-all duration-300 ${
                userType === "patient"
                  ? "bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 shadow-lg"
                  : "hover:bg-teal-50 dark:hover:bg-teal-950/20 border-2"
              }`}
            >
              Patient
            </Button>
            <Button
              variant={userType === "doctor" ? "default" : "outline"}
              onClick={() => setUserType("doctor")}
              className={`flex-1 transition-all duration-300 ${
                userType === "doctor"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg"
                  : "hover:bg-blue-50 dark:hover:bg-blue-950/20 border-2"
              }`}
            >
              Doctor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
