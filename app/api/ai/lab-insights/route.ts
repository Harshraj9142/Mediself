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
    const { labResults } = body

    if (!labResults || labResults.length === 0) {
      return NextResponse.json({ error: "Lab results required" }, { status: 400 })
    }

    const labData = labResults.map((lab: any) => 
      `${lab.test || lab.name}: ${lab.result} ${lab.unit || ""} (Normal: ${lab.normalRange || "N/A"})`
    ).join("\n")

    const prompt = `As a medical AI assistant, analyze these lab results and provide insights:

${labData}

Please provide:
1. Overall health assessment
2. Values outside normal range (with explanations)
3. Potential health concerns or patterns
4. Lifestyle recommendations
5. Follow-up suggestions

Format as JSON:
{
  "overallAssessment": "summary of overall health status",
  "abnormalValues": [
    {"test": "test name", "value": "value", "concern": "what it means", "severity": "low/medium/high"}
  ],
  "healthConcerns": ["concern 1", "concern 2"],
  "recommendations": {
    "lifestyle": ["recommendation 1"],
    "dietary": ["recommendation 1"],
    "followUp": ["what to monitor or test next"]
  },
  "positiveFindings": ["good result 1"],
  "disclaimer": "Medical disclaimer"
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a medical AI assistant specialized in lab result analysis. Provide insights in JSON format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    })

    const insights = JSON.parse(completion.choices[0]?.message?.content || "{}")

    return NextResponse.json({
      insights,
      timestamp: new Date().toISOString(),
    })
  } catch (e: any) {
    console.error("Lab Insights error:", e)
    return NextResponse.json({ 
      error: "Failed to analyze lab results", 
      message: e.message 
    }, { status: 500 })
  }
}
