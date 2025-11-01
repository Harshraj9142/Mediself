import type React from "react"
import { Heart, Activity, Stethoscope, Sparkles } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-pulse" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Floating medical icons with glow */}
      <div className="absolute top-1/4 left-1/4 animate-bounce opacity-20 dark:opacity-10" style={{ animationDuration: '3s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-50" />
          <Heart className="relative w-8 h-8 text-red-500" />
        </div>
      </div>
      <div className="absolute top-1/3 right-1/4 animate-bounce opacity-20 dark:opacity-10" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-50" />
          <Activity className="relative w-10 h-10 text-teal-500" />
        </div>
      </div>
      <div className="absolute bottom-1/4 right-1/3 animate-bounce opacity-20 dark:opacity-10" style={{ animationDuration: '5s', animationDelay: '2s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50" />
          <Stethoscope className="relative w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div className="absolute top-2/3 left-1/3 animate-bounce opacity-20 dark:opacity-10" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-purple-400 rounded-full blur-xl opacity-50" />
          <Sparkles className="relative w-7 h-7 text-purple-500" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
