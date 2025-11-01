import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { AIChatbot } from "@/components/ai-chatbot"
import { Footer } from "@/components/footer"
import { AuthSessionProvider } from "@/components/auth-session-provider"
import { Toaster } from "@/components/ui/toaster"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MediSelf - Your Digital Healthcare Companion",
  description: "Manage your health digitally with appointments, medical records, and more",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} font-sans antialiased`}>
        <AuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Toaster />
            <AIChatbot />
          </ThemeProvider>
        </AuthSessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
