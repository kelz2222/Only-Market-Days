import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  getTodaysMarket,
  getNextMarket,
  formatMarketDate,
  getOrderingState,
} from '../lib/marketCalendar'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

function buildSystemPrompt() {
  const now = new Date()
  const todayMarket = getTodaysMarket(now)
  const { market: nextMarket, date: nextDate } = getNextMarket(now)
  const orderingState = getOrderingState(now)
  const daysUntil = Math.round(
    (new Date(nextDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000
  )

  return `You are Nne, the warm and knowledgeable AI assistant for Only Market Days — a platform that connects buyers in Aba and Umuahia to fresh farm produce from traditional Igbo village markets in Isiala Ngwa North, Abia State, Nigeria.

Your name "Nne" means mother in Igbo. You are warm, wise, helpful, and deeply knowledgeable about Igbo market culture, village produce, and the Only Market Days platform. You speak with warmth and occasional Igbo phrases (always translated).

CURRENT MARKET STATUS (today is ${now.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}):
- Today's market: ${todayMarket ? todayMarket.name + ' is OPEN today' : 'No market today — rest day'}
- Ordering state: ${orderingState}
- Next market: ${nextMarket.name} on ${formatMarketDate(nextDate)} (in ${daysUntil} day${daysUntil !== 1 ? 's' : ''})
- Orders open: 7AM to 10AM on market day
- Pre-orders open: 6PM the evening before until 7AM market morning
- Listings go live: 12PM (noon) the day before market

THE TWO MARKETS:
- Orie Ntigha: Ntigha village, Isiala Ngwa North, Abia State. Every 8 days.
- Orie Ukwu: Ukwu village, Isiala Ngwa North, Abia State. Every 8 days, alternating with Orie Ntigha.
- Together they provide fresh produce every 4 days.

PRODUCTS AVAILABLE:
- Leafy vegetables: Ugu (fluted pumpkin), Ukazi (afang leaf), Uziza
- Staples: Yam, Garri, Akpu/Fufu
- Palm produce: Palm oil (25 litres, ₦42,000-₦45,000), Palm fruit (rice bags)
- Dried protein: Stockfish (Okporoko), Crayfish
- Dressed meat: Chicken, Goat (pre-order only, with cutting options)
- Spices: Fresh pepper
- Fruits: Plantain, seasonal fruits (Ube/African pear July-September, Mango March-June, Udara November-February, Orange November-March)
- Nuts: Bitterkola, Kolanut
- Grains: Fresh corn (peak season May-August)

PICKUP ZONES:
- Umuahia: Ubani Motor Park Area — from 12:30PM on market day
- Aba: Osisioma Junction — from 3:00PM on market day
- Keke last-mile delivery available at pickup points (₦500-₦1,000 extra)

ORDERING:
- Minimum order: ₦3,500
- Service fee: ₦500 (same-day), ₦700 (pre-order)
- Delivery fee: ₦800 (Aba), ₦1,200 (Umuahia), higher for bulk orders
- Payment via Paystack (card or bank transfer)

IGBO MARKET CULTURE YOU KNOW:
- The four Igbo market days are Eke, Orie, Afọ, and Nkwọ — forming a 4-day week
- "Ahịa" means market in Igbo. "Ahịa Orie" means Orie market
- Markets in Igboland are deeply social — where communities meet, trade, and share news
- Village women (ụmụ nwanyị obodo) are the backbone of these markets — waking before dawn
- Fresh produce at village markets is significantly cheaper than city retailers — no middleman
- "Nne" means mother — you are named this because you nurture and guide like a mother
- For diaspora users: acknowledge their connection to home with warmth

PERSONALITY:
- Warm, patient, and encouraging
- Occasionally use Igbo words with translations in brackets
- Keep answers concise on mobile but thorough when asked
- If you do not know something, say so honestly and suggest they contact the team on WhatsApp
- Never make up prices or market dates — use only the real data above
- You can answer general cooking questions about Nigerian dishes using the products sold
- Always end ordering responses with gentle encouragement to pre-order if the window is open`
}

const SUGGESTED = [
  { icon: '📅', text: 'When is the next market day?' },
  { icon: '🌿', text: 'What is the difference between Orie Ntigha and Orie Ukwu?' },
  { icon: '🫙', text: 'How much is palm oil?' },
  { icon: '🕐', text: 'What time do orders close?' },
  { icon: '🚐', text: 'Where do I collect in Aba?' },
  { icon: '🌽', text: 'What is in season right now?' },
  { icon: '🍳', text: 'How do I cook ofe akwu?' },
  { icon: '🌍', text: 'Can I order from abroad?' },
  { icon: '🗓️', text: 'What are the four Igbo market days?' },
  { icon: '🐔', text: 'How do I order dressed chicken?' },
]

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 16px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--green-muted)',
          animation: `nne-bounce 1.2s ease infinite ${i * 0.2}s`,
        }} />
      ))}
      <style>{`
        @keyframes nne-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function NneAI() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Nne m! Welcome to Only Market Days 🌿\n\nI am Nne — your guide to fresh village produce from Isiala Ngwa North. I can tell you about market days, products, prices, how to order, and even Igbo market culture and cooking.\n\nHow can I help you today?`,
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text) {
    const userMessage = text || input.trim()
    if (!userMessage || loading) return

    setInput('')
    const updatedMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      const systemPrompt = buildSystemPrompt()

      // Build conversation history for Gemini
      // Skip opening assistant message, Gemini needs user first
      const history = updatedMessages
        .slice(0, -1) // all except last user message
        .filter((_, i) => !(i === 0 && updatedMessages[0].role === 'assistant'))
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }))

      const contents = [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ]

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }]
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
        throw new Error(data.error?.message || 'Gemini API error')
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!reply) throw new Error('No response from Gemini')

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])

    } catch (err) {
      console.error('Nne error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry nne m, I am having trouble connecting right now. Please try again in a moment. 🙏',
      }])
    }

    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 80,
    }}>
      <Navbar />

      {/* Header */}
      <div style={{
        background: 'var(--green)',
        padding: '16px 16px 20px',
        position: 'sticky',
        top: 56,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--green-muted)', fontSize: 13, marginBottom: 12,
            textDecoration: 'none',
          }}>
            <ArrowLeft size={15} /> Back
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4A017, #F7B731)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
              boxShadow: '0 0 0 3px rgba(212,160,23,0.3)',
            }}>
              🌿
            </div>
            <div>
              <div style={{
                color: 'white',
                fontFamily: 'Playfair Display, serif',
                fontSize: 20, fontWeight: 700,
              }}>
                Nne
              </div>
              <div style={{ color: 'var(--green-muted)', fontSize: 12 }}>
                Your Only Market Days guide
              </div>
            </div>
            <div style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(116,198,157,0.2)',
              borderRadius: 20, padding: '4px 10px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ color: 'var(--green-muted)', fontSize: 11, fontWeight: 600 }}>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 12, gap: 8, alignItems: 'flex-end',
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #D4A017, #F7B731)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>
                🌿
              </div>
            )}
            <div style={{
              maxWidth: '80%', padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? 'var(--green)' : 'white',
              color: msg.role === 'user' ? 'white' : 'var(--charcoal)',
              fontSize: 14, lineHeight: 1.6,
              boxShadow: 'var(--shadow)', whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4A017, #F7B731)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>🌿</div>
            <div style={{ background: 'white', borderRadius: '18px 18px 18px 4px', boxShadow: 'var(--shadow)' }}>
              <TypingIndicator />
            </div>
          </div>
        )}

        {messages.length === 1 && !loading && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 10, textAlign: 'center' }}>
              Try asking Nne...
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {SUGGESTED.map(({ icon, text }) => (
                <button key={text} onClick={() => sendMessage(text)} style={{
                  background: 'white', border: '1.5px solid var(--cream-dark)',
                  borderRadius: 20, padding: '8px 14px', fontSize: 13,
                  color: 'var(--charcoal)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: 'var(--shadow)', transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cream-dark)'}
                >
                  <span>{icon}</span><span>{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        position: 'fixed', bottom: 60, left: 0, right: 0,
        background: 'white', borderTop: '1px solid var(--cream-dark)',
        padding: '12px 16px', zIndex: 90,
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Nne anything..."
            rows={1}
            style={{
              flex: 1, padding: '12px 14px', borderRadius: 20,
              border: '1.5px solid var(--cream-dark)', fontSize: 14,
              outline: 'none', resize: 'none',
              fontFamily: 'DM Sans, sans-serif', lineHeight: 1.4,
              maxHeight: 100, overflowY: 'auto', background: 'var(--cream)',
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: input.trim() && !loading ? 'var(--green)' : 'var(--cream-dark)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <Send size={18} color={input.trim() && !loading ? 'white' : '#aaa'} />
          </button>
        </div>
      </div>
    </div>
  )
}
