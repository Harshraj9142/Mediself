"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Heart, Activity, Stethoscope, Sparkles, Zap, Brain, Shield, Pill } from "lucide-react"
import { useEffect, useState } from "react"

export function LandingHero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 overflow-hidden">
      {/* Animated gradient mesh background */}
      <div 
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 50%),
            radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.15), transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.15), transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.15), transparent 50%)
          `
        }}
      />

      {/* Animated gradient orbs - Enhanced */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 dark:opacity-20 animate-pulse" />
      <div className="absolute -bottom-8 left-20 w-[500px] h-[500px] bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 dark:opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-15 animate-pulse" style={{ animationDelay: '4s' }} />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      {/* Floating medical icons with glow */}
      <div className="absolute top-1/4 left-1/4 animate-bounce opacity-30 dark:opacity-20" style={{ animationDuration: '3s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-50" />
          <Heart className="relative w-8 h-8 text-red-500" />
        </div>
      </div>
      <div className="absolute top-1/3 right-1/4 animate-bounce opacity-30 dark:opacity-20" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-50" />
          <Activity className="relative w-10 h-10 text-teal-500" />
        </div>
      </div>
      <div className="absolute bottom-1/4 right-1/3 animate-bounce opacity-30 dark:opacity-20" style={{ animationDuration: '5s', animationDelay: '2s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50" />
          <Stethoscope className="relative w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div className="absolute top-2/3 left-1/3 animate-bounce opacity-30 dark:opacity-20" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-purple-400 rounded-full blur-xl opacity-50" />
          <Sparkles className="relative w-7 h-7 text-purple-500" />
        </div>
      </div>
      <div className="absolute bottom-1/3 left-1/4 animate-bounce opacity-30 dark:opacity-20" style={{ animationDuration: '3.5s', animationDelay: '1.5s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-50" />
          <Zap className="relative w-6 h-6 text-cyan-500" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full border-2 border-blue-200 dark:border-blue-800 mb-4 animate-bounce backdrop-blur-sm" style={{ animationDuration: '3s' }}>
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                  AI-Powered Healthcare Platform
                  <Zap className="w-4 h-4 text-pink-500 animate-pulse" />
                </span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-bold text-foreground leading-tight">
                Your{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Smart
                </span>
                <br />
                <span className="inline-flex items-center gap-4">
                  <span className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                    Healthcare
                  </span>
                  <Heart className="w-16 h-16 text-pink-500 animate-pulse inline" style={{ animationDuration: '2s' }} />
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  Companion
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
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110 text-lg px-8 py-6 group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-500 transition-all duration-300 hover:scale-105 text-lg px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Visual - Enhanced 3D */}
          <div className="relative h-96 sm:h-full min-h-96 lg:min-h-[600px] perspective-1000">
            {/* 3D card effect with multiple layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500 rounded-3xl opacity-30 blur-3xl animate-pulse" />
            <div 
              className="relative bg-gradient-to-br from-white/90 to-purple-50/90 dark:from-slate-900/90 dark:to-purple-950/50 backdrop-blur-2xl rounded-3xl p-8 border-2 border-purple-200/50 dark:border-purple-800/50 h-full flex items-center justify-center shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:-rotate-1"
              style={{
                transform: `rotateY(${(mousePosition.x - window.innerWidth / 2) / 50}deg) rotateX(${(mousePosition.y - window.innerHeight / 2) / -50}deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="text-center space-y-6">
                {/* Animated logo/icon with pulse rings */}
                <div className="relative">
                  {/* Pulse rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute w-32 h-32 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full opacity-20 animate-ping" />
                    <div className="absolute w-40 h-40 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20 animate-ping" style={{ animationDelay: '1s' }} />
                    <div className="absolute w-48 h-48 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-ping" style={{ animationDelay: '2s' }} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-60 animate-pulse" />
                  <div className="relative w-40 h-40 bg-gradient-to-br from-blue-500 via-purple-500 via-fuchsia-500 to-pink-500 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="absolute inset-2 bg-white/20 dark:bg-black/20 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
                    <Heart className="relative w-20 h-20 text-white animate-pulse drop-shadow-2xl" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                    MediSelf
                  </h3>
                  <p className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                    Healthcare made simple ✨
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <Brain className="w-6 h-6 text-blue-500 animate-pulse" />
                    <Shield className="w-6 h-6 text-purple-500 animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <Pill className="w-6 h-6 text-pink-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
                  </div>
                </div>
                {/* Floating stats with enhanced gradient backgrounds */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-4 backdrop-blur border-2 border-blue-200/50 dark:border-blue-700/50 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">10k+</div>
                    <div className="text-xs text-muted-foreground font-semibold">Users</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4 backdrop-blur border-2 border-purple-200/50 dark:border-purple-700/50 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">500+</div>
                    <div className="text-xs text-muted-foreground font-semibold">Doctors</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30 rounded-xl p-4 backdrop-blur border-2 border-pink-200/50 dark:border-pink-700/50 hover:scale-110 hover:shadow-xl hover:shadow-pink-500/20 transition-all duration-300">
                    <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">24/7</div>
                    <div className="text-xs text-muted-foreground font-semibold">Support</div>
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
