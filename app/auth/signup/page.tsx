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
import { User, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { signIn } from "next-auth/react"

export default function SignupPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"patient" | "doctor">("patient")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    setFormData({ ...formData, password })
    calculatePasswordStrength(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: userType,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data?.error || "Signup failed")
        setIsLoading(false)
        return
      }
      const login = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })
      setIsLoading(false)
      if (!login || login.error) {
        alert("Account created, but sign in failed. Please try logging in.")
        return
      }
      if (userType === "patient") {
        router.push("/dashboard")
      } else {
        router.push("/doctor-portal")
      }
    } catch (err) {
      setIsLoading(false)
      alert("Something went wrong. Please try again.")
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
            ✨ Join the Healthcare Revolution
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">Create Account</span>
        </h1>
        <p className="text-muted-foreground text-lg">Join MediSelf today</p>
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
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

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
                  onChange={handlePasswordChange}
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
              {/* Password strength indicator */}
              <div className="space-y-2 mt-2">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        i < passwordStrength
                          ? i < 1
                            ? "bg-gradient-to-r from-red-500 to-orange-500 shadow-sm"
                            : i < 2
                              ? "bg-gradient-to-r from-orange-500 to-yellow-500 shadow-sm"
                              : i < 3
                                ? "bg-gradient-to-r from-yellow-500 to-lime-500 shadow-sm"
                                : "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength > 0 && (
                  <p className={`text-xs font-medium ${
                    passwordStrength < 2
                      ? "text-red-500"
                      : passwordStrength < 3
                        ? "text-yellow-500"
                        : passwordStrength < 4
                          ? "text-lime-500"
                          : "text-emerald-500"
                  }`}>
                    {passwordStrength < 2 ? "Weak password" : passwordStrength < 3 ? "Fair password" : passwordStrength < 4 ? "Good password" : "Strong password"}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </span>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300" 
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
