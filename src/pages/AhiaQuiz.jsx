import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Trophy, RotateCcw, Share2, ChevronRight, ShoppingBasket } from 'lucide-react'
import Navbar from '../components/Navbar'

const ALL_QUESTIONS = [
  {
    id: 1,
    category: 'Market Culture',
    emoji: '🏪',
    question: 'How many days are in the traditional Igbo market week?',
    options: ['3 days', '4 days', '7 days', '5 days'],
    answer: 1,
    explanation: 'The Igbo week has 4 days: Eke, Orie, Afọ, and Nkwọ. Each day traditionally hosts markets in different villages.',
  },
  {
    id: 2,
    category: 'Market Culture',
    emoji: '📅',
    question: 'What does "Orie" mean in the Igbo market calendar?',
    options: ['A day of rest', 'One of the four sacred market days', 'The name of a god', 'A type of food'],
    answer: 1,
    explanation: 'Orie (also spelled Oye) is one of the four sacred days of the Igbo week, traditionally a major market day in many communities.',
  },
  {
    id: 3,
    category: 'Market Culture',
    emoji: '🌍',
    question: 'What is the Igbo word for market?',
    options: ['Ulo', 'Ahịa', 'Obodo', 'Nnọọ'],
    answer: 1,
    explanation: '"Ahịa" means market in Igbo. You will hear it used across Southeast Nigeria. "Ahịa Orie" means Orie market.',
  },
  {
    id: 4,
    category: 'Market Culture',
    emoji: '👩',
    question: 'What is the Igbo phrase for "village women"?',
    options: ['Ụmụ nwoke obodo', 'Ụmụ nwanyị obodo', 'Ndị ọchị', 'Ụmụ ada'],
    answer: 1,
    explanation: '"Ụmụ nwanyị obodo" means village women. They are the backbone of Igbo traditional markets, often waking before dawn to sell fresh produce.',
  },
  {
    id: 5,
    category: 'Market Culture',
    emoji: '🌿',
    question: 'What does "Nne" mean in Igbo?',
    options: ['Father', 'Market', 'Mother', 'Food'],
    answer: 2,
    explanation: '"Nne" means mother in Igbo. It is a term of endearment and respect. The Only Market Days AI assistant is named Nne.',
  },
  {
    id: 6,
    category: 'Village Produce',
    emoji: '🌿',
    question: 'What is another name for Ugu leaf?',
    options: ['Bitter leaf', 'Fluted pumpkin leaf', 'Waterleaf', 'Uziza'],
    answer: 1,
    explanation: 'Ugu is the Igbo name for fluted pumpkin leaf (Telfairia occidentalis). It is one of the most popular vegetables in Southeast Nigerian cooking.',
  },
  {
    id: 7,
    category: 'Village Produce',
    emoji: '🫙',
    question: 'Palm oil from the village is better than most supermarket versions because:',
    options: ['It is imported', 'It is unrefined and freshly processed', 'It has more water', 'It is cheaper to produce'],
    answer: 1,
    explanation: 'Freshly pressed village palm oil is unrefined and contains more nutrients. Supermarket palm oil is often refined and processed, losing much of its natural value.',
  },
  {
    id: 8,
    category: 'Village Produce',
    emoji: '🐟',
    question: 'What is the Igbo name for stockfish?',
    options: ['Crayfish', 'Okporoko', 'Ofe', 'Egusi'],
    answer: 1,
    explanation: '"Okporoko" is the Igbo name for stockfish (dried cod). It is an essential ingredient in many Igbo soups and stews.',
  },
  {
    id: 9,
    category: 'Village Produce',
    emoji: '🌰',
    question: 'What is bitterkola traditionally used for in Igbo culture?',
    options: ['Only for cooking', 'Medicine, rituals, and as a welcome gift', 'Only as a snack', 'Decoration'],
    answer: 1,
    explanation: 'Bitterkola (Garcinia kola) has deep cultural significance. It is used in traditional medicine, offered to guests as welcome, used in ceremonies, and believed to have many health benefits.',
  },
  {
    id: 10,
    category: 'Village Produce',
    emoji: '🫐',
    question: 'African Pear (Ube) is in peak season during which months?',
    options: ['December to February', 'March to May', 'July to September', 'October to November'],
    answer: 2,
    explanation: 'African Pear (Ube) peaks from July to September in Southeast Nigeria. During this season, village prices are at their lowest — often half of what you pay in city markets.',
  },
  {
    id: 11,
    category: 'Village Produce',
    emoji: '🌽',
    question: 'Fresh roasting corn is cheapest at village markets during which season?',
    options: ['November to January', 'May to August', 'March to April', 'September to October'],
    answer: 1,
    explanation: 'Fresh corn peaks May to August during the rainy season in Southeast Nigeria. At village markets during this period, you can buy at farm gate price — sometimes 50% cheaper than city retailers.',
  },
  {
    id: 12,
    category: 'Igbo Cooking',
    emoji: '🍲',
    question: 'What soup uses palm fruit (ofe akwu) as its primary ingredient?',
    options: ['Ofe onugbu', 'Ofe akwu (Banga soup)', 'Egusi soup', 'Ofe oha'],
    answer: 1,
    explanation: '"Ofe akwu" or Banga soup is made from palm fruit. It is one of the most beloved soups in Igbo and Delta cuisine, often cooked with fresh or smoked fish.',
  },
  {
    id: 13,
    category: 'Igbo Cooking',
    emoji: '🥬',
    question: 'Which leaf is traditionally used to cook "ofe ukazi"?',
    options: ['Ugu leaf', 'Ukazi (Afang leaf)', 'Bitter leaf', 'Uziza leaf'],
    answer: 1,
    explanation: 'Ukazi (also called Afang leaf) is the star ingredient in ofe ukazi soup. It is also used in Afang soup popular in Akwa Ibom and Cross River states.',
  },
  {
    id: 14,
    category: 'Igbo Cooking',
    emoji: '🍚',
    question: 'What is akpu made from?',
    options: ['Yam', 'Cassava', 'Corn', 'Plantain'],
    answer: 1,
    explanation: 'Akpu (also called fufu) is made from fermented cassava. It is a staple swallow food across Southeast Nigeria, often eaten with ofe onugbu (bitter leaf soup) or oha soup.',
  },
  {
    id: 15,
    category: 'Igbo Cooking',
    emoji: '🌶️',
    question: 'Uziza leaf is known for its:',
    options: ['Sweet taste', 'Peppery, slightly bitter flavour', 'Sour taste', 'No particular taste'],
    answer: 1,
    explanation: 'Uziza has a distinctive peppery, slightly bitter flavour. It is used in pepper soup, ofe onugbu, and other dishes. The seeds are also used as a spice.',
  },
  {
    id: 16,
    category: 'Only Market Days',
    emoji: '🛒',
    question: 'How often does Orie Ntigha market hold?',
    options: ['Every 4 days', 'Every 7 days', 'Every 8 days', 'Every day'],
    answer: 2,
    explanation: 'Orie Ntigha holds every 8 days, following the traditional Igbo calendar. Together with Orie Ukwu (which also holds every 8 days, alternating), fresh produce is available every 4 days.',
  },
  {
    id: 17,
    category: 'Only Market Days',
    emoji: '📦',
    question: 'What is the minimum order on Only Market Days?',
    options: ['₦1,000', '₦2,000', '₦3,500', '₦5,000'],
    answer: 2,
    explanation: 'The minimum order is ₦3,500. This ensures that the delivery economics work for both the buyer and the platform.',
  },
  {
    id: 18,
    category: 'Only Market Days',
    emoji: '🕐',
    question: 'Same-day orders on market day close at what time?',
    options: ['8:00 AM', '12:00 PM', '10:00 AM', '2:00 PM'],
    answer: 2,
    explanation: 'Same-day orders close at 10AM on market day. After that, the agent shops for confirmed orders. Pre-orders the night before are always recommended for guaranteed stock.',
  },
  {
    id: 19,
    category: 'Only Market Days',
    emoji: '🚐',
    question: 'Which city receives their delivery first from Isiala Ngwa?',
    options: ['Aba', 'Umuahia', 'Enugu', 'Port Harcourt'],
    answer: 1,
    explanation: 'Umuahia receives delivery first (from 12:30PM) because it is closer to Isiala Ngwa — about 30 minutes by bus. Aba is about 40 minutes away and receives from 3:00PM.',
  },
  {
    id: 20,
    category: 'Only Market Days',
    emoji: '🌅',
    question: 'What time does the market agent arrive at the market for pre-orders?',
    options: ['7:00 AM', '5:00 AM', '9:00 AM', '6:00 AM'],
    answer: 1,
    explanation: 'The agent arrives at 5AM for pre-orders — before the market fills up. This is how pre-order customers get first pick of the freshest stock, just like serious buyers have always done at Igbo markets.',
  },
]

function getQuizQuestions(n = 10) {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

const CATEGORY_COLORS = {
  'Market Culture': { bg: 'rgba(27,67,50,0.1)', color: 'var(--green)', border: 'var(--green-muted)' },
  'Village Produce': { bg: 'rgba(212,160,23,0.1)', color: '#8B6914', border: 'var(--gold)' },
  'Igbo Cooking': { bg: 'rgba(232,93,4,0.1)', color: 'var(--orange)', border: 'var(--orange)' },
  'Only Market Days': { bg: 'rgba(116,198,157,0.1)', color: '#1B6B4A', border: 'var(--green-muted)' },
}

export default function AhiaQuiz() {
  const [screen, setScreen] = useState('intro')
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(20)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    if (!timerActive || answered) return
    if (timeLeft <= 0) {
      handleAnswer(null)
      return
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, timerActive, answered])

  function startQuiz() {
    const qs = getQuizQuestions(10)
    setQuestions(qs)
    setCurrent(0)
    setScore(0)
    setAnswers([])
    setSelected(null)
    setAnswered(false)
    setTimeLeft(20)
    setTimerActive(true)
    setScreen('quiz')
  }

  function handleAnswer(optionIndex) {
    if (answered) return
    setAnswered(true)
    setSelected(optionIndex)
    setTimerActive(false)
    const q = questions[current]
    const isCorrect = optionIndex === q.answer
    if (isCorrect) setScore(s => s + 1)
    setAnswers(prev => [...prev, { questionId: q.id, selected: optionIndex, correct: isCorrect }])
  }

  function nextQuestion() {
    if (current + 1 >= questions.length) {
      setScreen('result')
      return
    }
    setCurrent(c => c + 1)
    setSelected(null)
    setAnswered(false)
    setTimeLeft(20)
    setTimerActive(true)
  }

  function getResultMessage(score, total) {
    const pct = score / total
    if (pct === 1) return { title: 'Ọgọ! Perfect score!', sub: 'You know Igbo market culture inside out. A true son/daughter of the soil!', emoji: '🏆' }
    if (pct >= 0.8) return { title: 'Ọ dị mma! Excellent!', sub: 'You have deep knowledge of Igbo culture and markets. Impressive!', emoji: '⭐' }
    if (pct >= 0.6) return { title: 'Ọ dị mma! Well done!', sub: 'Good knowledge. Keep exploring Igbo market culture!', emoji: '🌿' }
    if (pct >= 0.4) return { title: 'Keep learning!', sub: 'You know some things but there is more to discover about Igbo markets and culture.', emoji: '📚' }
    return { title: 'Nno! Welcome to learning!', sub: 'No worries — every quiz teaches you something new. Try again!', emoji: '🌱' }
  }

  // ── INTRO ──
  if (screen === 'intro') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 80 }}>
        <Navbar />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: 13, marginBottom: 20, textDecoration: 'none' }}>
            <ArrowLeft size={15} /> Back
          </Link>
          <div style={{ background: 'linear-gradient(135deg, var(--green) 0%, #2D6A4F 100%)', borderRadius: 20, padding: '32px 24px', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🏪</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 32, fontWeight: 900, marginBottom: 4 }}>Ahịa Quiz</h1>
            <div style={{ color: 'var(--gold)', fontSize: 13, letterSpacing: 2, marginBottom: 16 }}>IGBO MARKET & CULTURE CHALLENGE</div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6 }}>
              Test your knowledge of Igbo market culture, traditional foods, village produce, and the Only Market Days platform.
            </p>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 12, fontWeight: 600 }}>QUIZ COVERS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Object.entries(CATEGORY_COLORS).map(([cat, style]) => (
                <div key={cat} style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: style.color }}>{cat}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: '16px', marginBottom: 24 }}>
            {[
              { icon: '❓', text: '10 random questions per game' },
              { icon: '⏱️', text: '20 seconds per question' },
              { icon: '✅', text: 'Explanation shown after each answer' },
              { icon: '🏆', text: 'Score and grade at the end' },
              { icon: '🔄', text: 'Different questions every time' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 14, color: '#555' }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
          <button onClick={startQuiz} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: 17 }}>
            Start Quiz — Ahịa!
          </button>
        </div>
      </div>
    )
  }

  // ── QUIZ ──
  if (screen === 'quiz') {
    const q = questions[current]

    // Guard — if questions not loaded yet
    if (!q) return null

    const catStyle = CATEGORY_COLORS[q.category] || CATEGORY_COLORS['Market Culture']
    const timerPct = (timeLeft / 20) * 100
    const timerColor = timeLeft > 10 ? 'var(--green)' : timeLeft > 5 ? 'var(--gold)' : 'var(--orange)'

    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 40 }}>
        <Navbar />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 6 }}>
              <span>Question {current + 1} of {questions.length}</span>
              <span style={{ fontFamily: 'DM Mono, monospace', color: timerColor, fontWeight: 700 }}>{timeLeft}s</span>
            </div>
            <div style={{ height: 4, background: 'var(--cream-dark)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', background: 'var(--green)', borderRadius: 2, width: `${(current / questions.length) * 100}%`, transition: 'width 0.3s' }} />
            </div>
            <div style={{ height: 3, background: 'var(--cream-dark)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: timerColor, borderRadius: 2, width: `${timerPct}%`, transition: 'width 1s linear, background 0.3s' }} />
            </div>
          </div>

          <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: catStyle.bg, border: `1px solid ${catStyle.border}`, borderRadius: 20, padding: '4px 12px', marginBottom: 16 }}>
              <span>{q.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: catStyle.color }}>{q.category}</span>
            </div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, lineHeight: 1.4, marginBottom: 20, color: 'var(--charcoal)' }}>
              {q.question}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.options.map((option, i) => {
                let bg = 'white'
                let border = 'var(--cream-dark)'
                let color = 'var(--charcoal)'
                let icon = null
                if (answered) {
                  if (i === q.answer) { bg = 'rgba(34,197,94,0.1)'; border = '#22c55e'; color = '#15803d'; icon = '✅' }
                  else if (i === selected && i !== q.answer) { bg = 'rgba(232,93,4,0.08)'; border = 'var(--orange)'; color = 'var(--orange)'; icon = '❌' }
                } else if (selected === i) { bg = 'rgba(27,67,50,0.08)'; border = 'var(--green)' }
                return (
                  <button key={i} onClick={() => !answered && handleAnswer(i)} style={{
                    padding: '14px 16px', borderRadius: 10,
                    border: `2px solid ${border}`, background: bg, color,
                    fontSize: 14, fontWeight: answered && i === q.answer ? 600 : 400,
                    textAlign: 'left', cursor: answered ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 10, transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif',
                  }}>
                    <span>{option}</span>
                    {icon && <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>}
                  </button>
                )
              })}
            </div>
            {answered && (
              <div style={{ marginTop: 16, background: 'rgba(27,67,50,0.06)', border: '1px solid var(--green-muted)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>💡 Did you know?</div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{q.explanation}</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '6px 14px', boxShadow: 'var(--shadow)', fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
              Score: {score}/{current + (answered ? 1 : 0)}
            </div>
            {answered && (
              <button onClick={nextQuestion} className="btn-primary" style={{ padding: '10px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                {current + 1 >= questions.length ? 'See Results' : 'Next'}
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── RESULTS ──
  if (screen === 'result') {
    // Guard — if somehow questions is empty
    if (!questions.length) {
      return (
        <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 80 }}>
          <Navbar />
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginBottom: 16 }}>Something went wrong</h2>
            <button onClick={startQuiz} className="btn-primary" style={{ justifyContent: 'center' }}>
              <RotateCcw size={18} /> Try Again
            </button>
          </div>
        </div>
      )
    }

    const result = getResultMessage(score, questions.length)
    const pct = Math.round((score / questions.length) * 100)

    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 80 }}>
        <Navbar />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>

          {/* Result hero */}
          <div style={{ background: 'linear-gradient(135deg, var(--green), #2D6A4F)', borderRadius: 20, padding: '32px 24px', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>{result.emoji}</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              {result.title}
            </h1>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '3px solid rgba(255,255,255,0.3)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              margin: '16px auto',
            }}>
              <div style={{ fontFamily: 'DM Mono, monospace', color: 'white', fontSize: 28, fontWeight: 900, lineHeight: 1 }}>
                {score}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>of {questions.length}</div>
            </div>
            <div style={{ color: 'var(--gold)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{pct}%</div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6 }}>{result.sub}</p>
          </div>

          {/* Answer review */}
          <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
              Your Answers
            </div>
            {questions.map((q, i) => {
              const a = answers[i]
              return (
                <div key={q.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  paddingBottom: 12, marginBottom: 12,
                  borderBottom: i < questions.length - 1 ? '1px solid var(--cream-dark)' : 'none',
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>
                    {a?.correct ? '✅' : '❌'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--charcoal)', marginBottom: 2, lineHeight: 1.3 }}>
                      {q.question}
                    </div>
                    <div style={{ fontSize: 12, color: a?.correct ? '#15803d' : 'var(--orange)' }}>
                      {a?.correct
                        ? `✓ ${q.options[q.answer]}`
                        : `✗ You said: ${a?.selected !== null && a?.selected !== undefined ? q.options[a.selected] : 'Time up'}`
                      }
                    </div>
                    {!a?.correct && (
                      <div style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>
                        ✓ Correct: {q.options[q.answer]}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={startQuiz} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16 }}>
              <RotateCcw size={18} />
              Play Again
            </button>
            <Link to="/market" className="btn-secondary" style={{ justifyContent: 'center', padding: '14px', textDecoration: 'none' }}>
              <ShoppingBasket size={16} />
              Shop the Market
            </Link>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Ahịa Quiz — Only Market Days',
                    text: `I scored ${score}/${questions.length} (${pct}%) on the Ahịa Quiz! Test your knowledge of Igbo market culture. 🌿`,
                    url: window.location.href,
                  })
                }
              }}
              style={{
                background: 'white', border: '1.5px solid var(--cream-dark)',
                borderRadius: 8, padding: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, fontSize: 14, fontWeight: 600, color: '#555', cursor: 'pointer',
              }}
            >
              <Share2 size={16} />
              Share my score
            </button>
          </div>
        </div>
      </div>
    )
  }
}
