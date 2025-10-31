"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, Mail, MessageSquare, ExternalLink } from "lucide-react"

const faqs = [
  {
    question: "How do I reset my password?",
    answer: "Go to the login page and click 'Forgot Password'. Follow the instructions sent to your email.",
  },
  {
    question: "How do I add a new medicine reminder?",
    answer: "Navigate to the Reminders page and click 'Add Medicine'. Fill in the details and save.",
  },
  {
    question: "Can I share my medical records with my doctor?",
    answer: "Yes, go to Medical Records and use the share option to send records to your healthcare provider.",
  },
  {
    question: "How do I update my emergency contacts?",
    answer: "Go to Emergency Services page and click edit on any contact to update their information.",
  },
]

export function HelpSupport() {
  return (
    <div className="space-y-6">
      {/* Contact Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Get help via email within 24 hours</p>
            <Button className="w-full gap-2">
              <Mail className="w-4 h-4" />
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Chat with our support team in real-time</p>
            <Button className="w-full gap-2">
              <MessageSquare className="w-4 h-4" />
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group border-b border-border pb-4 last:border-0">
                <summary className="cursor-pointer font-semibold text-foreground hover:text-primary transition-colors">
                  {faq.question}
                </summary>
                <p className="text-muted-foreground mt-2 text-sm">{faq.answer}</p>
              </details>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation & Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-between bg-transparent">
              User Guide
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between bg-transparent">
              Privacy Policy
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between bg-transparent">
              Terms of Service
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
