import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json().catch(() => ({}))
    const { message, conversation = [] } = body

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 })
    }

    // Build conversation history
    const messages: any[] = [
      {
        role: "system",
        content: `You are a helpful medical AI assistant for the Mediself healthcare platform. 
        
Your role:
- Provide general health information and advice
- Help users understand their symptoms and conditions
- Explain medical terms and procedures
- Suggest when to seek professional medical care
- Answer questions about medications, treatments, and wellness

Important guidelines:
- Always emphasize that you're providing general information, not medical diagnosis
- Recommend consulting healthcare professionals for serious concerns
- Be empathetic, clear, and supportive
- Use simple language that patients can understand
- For emergencies, always advise calling emergency services immediately

Current user: ${(session.user as any).name || "Patient"}`
      },
      ...conversation,
      { role: "user", content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request."

    return NextResponse.json({
      reply,
      model: completion.model,
      usage: completion.usage,
    })
  } catch (e: any) {
    console.error("AI Health Assistant error:", e)
    return NextResponse.json({ 
      error: "Failed to get AI response", 
      message: e.message 
    }, { status: 500 })
  }
}
