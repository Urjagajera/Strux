process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function getChatResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  systemPrompt: string
) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages
    ],
    max_tokens: 300,
  })
  return response.choices[0].message.content
}
