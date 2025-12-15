import { streamText } from "ai"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages, studentInfo } = await req.json()

    const systemPrompt = `You are an AI study assistant helping a student named ${studentInfo.name || "student"}.
${studentInfo.grade ? `They are in ${studentInfo.grade}.` : ""}
${studentInfo.subjects?.length > 0 ? `Their subjects are: ${studentInfo.subjects.join(", ")}.` : ""}

Your role is to:
- Provide study recommendations and guidance
- Suggest effective study techniques and schedules
- Help explain concepts in a clear, age-appropriate way
- Recommend study topics and practice areas
- Motivate and encourage the student
- Be friendly, supportive, and educational

Keep your responses concise, practical, and encouraging.`

    const apiKey = process.env.AI_GATEWAY_API_KEY

    if (!apiKey) {
      console.error("[STUDY_ASSISTANT_ERROR] Missing AI_GATEWAY_API_KEY environment variable")
      return new Response(
        "AI Gateway not configured. Set AI_GATEWAY_API_KEY environment variable or provide an apiKey option.",
        { status: 500 },
      )
    }

    const result = streamText({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      maxTokens: 1000,
      apiKey,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[STUDY_ASSISTANT_ERROR]", error)
    return new Response("Internal server error", { status: 500 })
  }
}
