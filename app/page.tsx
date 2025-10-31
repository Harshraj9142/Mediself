import { LandingHero } from "@/components/landing-hero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Calendar, FileText, Pill, Brain, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHero />

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need for better health management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Smart Scheduling",
                desc: "Book appointments with doctors instantly and get reminders",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Heart,
                title: "Health Tracking",
                desc: "Monitor vital signs and wellness metrics in real-time",
                color: "from-red-500 to-pink-600",
              },
              {
                icon: FileText,
                title: "Medical Records",
                desc: "Secure access to all your medical documents and reports",
                color: "from-orange-500 to-orange-600",
              },
              {
                icon: Pill,
                title: "Medicine Reminders",
                desc: "Never miss a dose with smart medication reminders",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Brain,
                title: "AI Assistant",
                desc: "Get health insights and answers from our AI chatbot",
                color: "from-cyan-500 to-blue-600",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your health data is encrypted and protected",
                color: "from-green-500 to-green-600",
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card key={i} className="hover:shadow-lg transition-shadow duration-300 border-0">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">Ready to Take Control of Your Health?</h2>
          <p className="text-xl text-green-100">Join thousands of users managing their health with MediSelf</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
            >
              Sign Up Now
            </a>
            <a
              href="/auth/login"
              className="px-8 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
