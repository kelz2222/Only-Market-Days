export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages, system } = req.body

    // Convert messages to Gemini format
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: system }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Gemini error:', data)
      return res.status(response.status).json({ error: data.error?.message || 'Gemini error' })
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      return res.status(500).json({ error: 'No response from Gemini' })
    }

    // Return in same shape NneAI.jsx expects
    return res.status(200).json({
      content: [{ type: 'text', text }]
    })

  } catch (err) {
    console.error('Nne proxy error:', err)
    return res.status(500).json({ error: 'Nne proxy failed', detail: err.message })
  }
}
