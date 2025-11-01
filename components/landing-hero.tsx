"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Heart, Activity, Stethoscope } from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-pulse" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse" style={{ animationDelay: '4s' }} />
      
      {/* Floating medical icons */}
      <div className="absolute top-1/4 left-1/4 animate-bounce opacity-20 dark:opacity-10" style={{ animationDuration: '3s' }}>
        <Heart className="w-8 h-8 text-red-400" />
      </div>
      <div className="absolute top-1/3 right-1/4 animate-bounce opacity-20 dark:opacity-10" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        <Activity className="w-10 h-10 text-teal-400" />
      </div>
      <div className="absolute bottom-1/4 right-1/3 animate-bounce opacity-20 dark:opacity-10" style={{ animationDuration: '5s', animationDelay: '2s' }}>
        <Stethoscope className="w-8 h-8 text-blue-400" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full border border-teal-200 dark:border-teal-800 mb-4">
                <span className="text-sm font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  ✨ AI-Powered Healthcare Platform
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight">
                Your Digital
                <br />
                <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                  Healthcare Companion
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Manage appointments, track health metrics, access medical records, and get AI-powered health insights
                all in one place.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              {[
                "Schedule appointments with doctors",
                "Track blood pressure, heart rate & more",
                "Access medical records anytime",
                "AI health assistant available 24/7",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-2 hover:bg-teal-50 dark:hover:bg-teal-950/20">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-96 sm:h-full min-h-96 lg:min-h-[500px]">
            {/* 3D card effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500 rounded-3xl opacity-20 blur-3xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-white/80 to-teal-50/80 dark:from-slate-900/80 dark:to-teal-950/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-teal-200/50 dark:border-teal-800/50 h-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-500">
              <div className="text-center space-y-6">
                {/* Animated logo/icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative w-32 h-32 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
                    <Heart className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">MediSelf</h3>
                  <p className="text-lg text-muted-foreground">Healthcare made simple</p>
                </div>
                {/* Floating stats */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 backdrop-blur">
                    <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">10k+</div>
                    <div className="text-xs text-muted-foreground">Users</div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 backdrop-blur">
                    <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">500+</div>
                    <div className="text-xs text-muted-foreground">Doctors</div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 backdrop-blur">
                    <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">24/7</div>
                    <div className="text-xs text-muted-foreground">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
