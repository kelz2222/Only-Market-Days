export default async function handler(req, res) {
  // GET test — visit /api/nne in browser to confirm it's alive
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Nne is alive', gemini: !!process.env.GEMINI_API_KEY })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages, system } = req.body

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not set in environment variables' })
    }

    // Filter out leading assistant message — Gemini requires user first
    const filtered = messages.filter((_, i) => !(i === 0 && messages[0].role === 'assistant'))

    // Must start with user message
    if (!filtered.length || filtered[0].role !== 'user') {
      return res.status(400).json({ error: 'Messages must start with a user message' })
    }

    const contents = filtered.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const geminiRes = await fetch(
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

    const data = await geminiRes.json()

    if (!geminiRes.ok) {
      console.error('Gemini API error:', JSON.stringify(data))
      return res.status(geminiRes.status).json({
        error: data.error?.message || 'Gemini API error',
        details: data
      })
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      console.error('No text in Gemini response:', JSON.stringify(data))
      return res.status(500).json({ error: 'No text returned from Gemini', details: data })
    }

    return res.status(200).json({
      content: [{ type: 'text', text }]
    })

  } catch (err) {
    console.error('Nne proxy exception:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
