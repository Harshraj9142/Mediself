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
    const { symptoms, duration, severity, additionalInfo } = body

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: "Symptoms required" }, { status: 400 })
    }

    const prompt = `As a medical AI assistant, analyze the following symptoms:

Symptoms: ${symptoms.join(", ")}
Duration: ${duration || "Not specified"}
Severity: ${severity || "Not specified"}
Additional Information: ${additionalInfo || "None"}

Please provide:
1. Possible conditions (list 3-5 possibilities, ordered by likelihood)
2. Severity assessment (mild, moderate, severe)
3. Recommended actions (self-care, schedule appointment, seek immediate care)
4. Warning signs to watch for
5. General advice

Format your response as JSON with the following structure:
{
  "possibleConditions": [
    {"name": "condition name", "likelihood": "high/medium/low", "description": "brief description"}
  ],
  "severityAssessment": "mild/moderate/severe",
  "recommendedAction": {
    "urgency": "immediate/soon/routine",
    "action": "description of what to do",
    "timeframe": "when to act"
  },
  "warningS igns": ["sign 1", "sign 2"],
  "generalAdvice": ["advice 1", "advice 2"],
  "disclaimer": "Important disclaimer message"
}

IMPORTANT: This is for informational purposes only and not a medical diagnosis.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a medical AI assistant. Provide symptom analysis in JSON format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: "json_object" },
    })

    const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}")

    return NextResponse.json({
      analysis,
      timestamp: new Date().toISOString(),
    })
  } catch (e: any) {
    console.error("Symptom Analyzer error:", e)
    return NextResponse.json({ 
      error: "Failed to analyze symptoms", 
      message: e.message 
    }, { status: 500 })
  }
}
