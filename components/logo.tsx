"use client"

import { Heart } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <Heart className="w-8 h-8 text-[hsl(var(--accent-green))] fill-[hsl(var(--accent-green))]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full" />
        </div>
      </div>
      <span className="font-bold text-lg bg-gradient-to-r from-[hsl(var(--accent-green))] via-green-600 to-blue-500 bg-clip-text text-transparent">
        MediSelf
      </span>
    </div>
  )
}
