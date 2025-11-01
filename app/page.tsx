import { LandingHero } from "@/components/landing-hero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Calendar, FileText, Pill, Brain, Shield, Star, Quote, Award, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHero />

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-teal-50/30 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full border border-teal-200 dark:border-teal-800 mb-4">
              <span className="text-sm font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                ✨ Comprehensive Healthcare Solution
              </span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need for better health management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: "Smart Scheduling",
                desc: "Book appointments with doctors instantly and get reminders",
                color: "from-teal-500 to-cyan-600",
                bgColor: "from-teal-50 to-cyan-50",
              },
              {
                icon: Heart,
                title: "Health Tracking",
                desc: "Monitor vital signs and wellness metrics in real-time",
                color: "from-red-500 to-pink-600",
                bgColor: "from-red-50 to-pink-50",
              },
              {
                icon: FileText,
                title: "Medical Records",
                desc: "Secure access to all your medical documents and reports",
                color: "from-blue-500 to-indigo-600",
                bgColor: "from-blue-50 to-indigo-50",
              },
              {
                icon: Pill,
                title: "Medicine Reminders",
                desc: "Never miss a dose with smart medication reminders",
                color: "from-emerald-500 to-teal-600",
                bgColor: "from-emerald-50 to-teal-50",
              },
              {
                icon: Brain,
                title: "AI Assistant",
                desc: "Get health insights and answers from our AI chatbot",
                color: "from-cyan-500 to-blue-600",
                bgColor: "from-cyan-50 to-blue-50",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your health data is encrypted and protected",
                color: "from-teal-500 to-emerald-600",
                bgColor: "from-teal-50 to-emerald-50",
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card key={i} className={`group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-gradient-to-br ${feature.bgColor} dark:from-slate-800 dark:to-slate-850 overflow-hidden relative`}>
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, rgba(20,184,166,0.1), rgba(6,182,212,0.1))` }} />
                  <CardHeader className="relative">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity`} />
                      <div
                        className={`relative w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <CardTitle className="group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200 dark:border-blue-800 mb-4">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ⭐ Trusted by Thousands
              </span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">Real stories from real people</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Cardiologist",
                content: "MediSelf has revolutionized how I manage my patients. The integrated dashboard saves me hours every week.",
                rating: 5,
                color: "from-pink-500 to-rose-500",
                initial: "SJ"
              },
              {
                name: "Michael Chen",
                role: "Patient",
                content: "Finally, a healthcare app that actually works! Booking appointments and tracking my health has never been easier.",
                rating: 5,
                color: "from-teal-500 to-cyan-500",
                initial: "MC"
              },
              {
                name: "Dr. Emily Rodriguez",
                role: "General Practitioner",
                content: "The AI assistant is incredible. It helps me provide better care and my patients love the accessibility.",
                rating: 5,
                color: "from-blue-500 to-indigo-500",
                initial: "ER"
              },
            ].map((testimonial, i) => (
              <Card key={i} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-white dark:bg-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: `linear-gradient(135deg, ${testimonial.color.split(' ')[1]}, ${testimonial.color.split(' ')[2]})` }} />
                <CardHeader className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {testimonial.initial}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-muted-foreground/20" />
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: "10,000+", label: "Active Users", color: "from-teal-500 to-cyan-500" },
              { icon: Award, value: "500+", label: "Healthcare Providers", color: "from-blue-500 to-indigo-500" },
              { icon: Heart, value: "99%", label: "Satisfaction Rate", color: "from-pink-500 to-rose-500" },
              { icon: Shield, value: "100%", label: "Data Security", color: "from-emerald-500 to-teal-500" },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} className="space-y-3 group hover:scale-110 transition-transform duration-300">
                  <div className="flex justify-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Ready to Take Control of Your Health?</h2>
            <p className="text-xl text-teal-100">Join thousands of users managing their health with MediSelf</p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 py-8">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">10k+</div>
              <div className="text-sm text-teal-100">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">500+</div>
              <div className="text-sm text-teal-100">Doctors</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">24/7</div>
              <div className="text-sm text-teal-100">Support</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="/auth/signup"
              className="px-8 py-4 bg-white text-teal-600 font-semibold rounded-xl hover:bg-teal-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Sign Up Now
            </a>
            <a
              href="/auth/login"
              className="px-8 py-4 bg-teal-700/50 backdrop-blur text-white font-semibold rounded-xl hover:bg-teal-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 border-2 border-white/20"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
