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
    const { medications, conditions } = body

    if (!medications || medications.length === 0) {
      return NextResponse.json({ error: "Medications required" }, { status: 400 })
    }

    const medList = medications.join(", ")
    const conditionList = conditions?.join(", ") || "None specified"

    const prompt = `As a pharmacology AI assistant, analyze these medications for potential interactions:

Medications: ${medList}
Medical Conditions: ${conditionList}

Please provide:
1. Drug-drug interactions (if any)
2. Severity of interactions (mild, moderate, severe)
3. Drug-condition interactions
4. Timing recommendations
5. Safety warnings
6. General precautions

Format as JSON:
{
  "interactions": [
    {
      "drugs": ["drug1", "drug2"],
      "severity": "mild/moderate/severe",
      "description": "what happens",
      "recommendation": "what to do"
    }
  ],
  "conditionInteractions": [
    {
      "medication": "med name",
      "condition": "condition name",
      "concern": "description",
      "severity": "mild/moderate/severe"
    }
  ],
  "timingRecommendations": [
    {
      "medication": "med name",
      "timing": "when to take",
      "reason": "why"
    }
  ],
  "warnings": ["warning 1", "warning 2"],
  "overallSafety": "safe/caution/consult-doctor",
  "additionalAdvice": ["advice 1"],
  "disclaimer": "Consult healthcare provider disclaimer"
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a pharmacology AI assistant. Analyze medication interactions and provide safety information in JSON format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    })

    const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}")

    return NextResponse.json({
      analysis,
      medicationsAnalyzed: medications,
      timestamp: new Date().toISOString(),
    })
  } catch (e: any) {
    console.error("Medication Checker error:", e)
    return NextResponse.json({ 
      error: "Failed to check medications", 
      message: e.message 
    }, { status: 500 })
  }
}
