import { useEffect, useState } from 'react'
import { Wind, Droplets, Thermometer, RefreshCw } from 'lucide-react'
import { fetchMarketWeather, getWeatherTheme } from '../lib/weather'
import { isOrderOpen, isPreorderOpen, getTodaysMarket, getTomorrowsMarket } from '../lib/marketCalendar'

export default function WeatherBanner() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const now = new Date()
  const todayMarket = getTodaysMarket(now)
  const tomorrowMarket = getTomorrowsMarket(now)
  const orderOpen = isOrderOpen(now)
  const preorderOpen = isPreorderOpen(now)

  async function loadWeather() {
    setLoading(true)
    const data = await fetchMarketWeather(!!todayMarket, preorderOpen)
    setWeather(data)
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => {
    loadWeather()
    // Refresh every 30 minutes
    const id = setInterval(loadWeather, 30 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <div style={{
        background: 'rgba(27,67,50,0.06)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderBottom: '1px solid var(--cream-dark)',
      }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--green-muted)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 12, color: '#888' }}>Checking weather at Isiala Ngwa...</span>
      </div>
    )
  }

  if (!weather) return null

  const theme = weather.theme
  const isImportant = weather.isRainy || weather.current.type === 'storm'

  // Only show expanded weather on market-related days
  const isRelevantDay = !!todayMarket || !!tomorrowMarket || preorderOpen

  return (
    <div style={{ borderBottom: '1px solid var(--cream-dark)' }}>

      {/* Compact bar — always visible */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          background: isImportant
            ? theme.bg
            : 'rgba(27,67,50,0.04)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'background 0.3s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{weather.current.emoji}</span>
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: isImportant ? 'white' : 'var(--charcoal)',
            }}>
              {weather.current.label} • {weather.current.temp}°C
              <span style={{
                marginLeft: 8,
                fontSize: 10,
                fontWeight: 400,
                color: isImportant ? 'rgba(255,255,255,0.7)' : '#888',
              }}>
                Isiala Ngwa North
              </span>
            </div>
            {isRelevantDay && (
              <div style={{
                fontSize: 11,
                color: isImportant ? 'rgba(255,255,255,0.85)' : '#666',
                marginTop: 1,
              }}>
                {weather.marketMessage}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {weather.isRainy && (
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 20,
              letterSpacing: 0.5,
            }}>
              RAIN
            </span>
          )}
          <span style={{
            fontSize: 18,
            color: isImportant ? 'rgba(255,255,255,0.6)' : '#bbb',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}>
            ›
          </span>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{
          background: isImportant ? theme.bg : 'white',
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          animation: 'fadeIn 0.2s ease',
        }}>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
            {[
              { icon: Thermometer, label: 'Temperature', value: `${weather.current.temp}°C` },
              { icon: Droplets, label: 'Humidity', value: `${weather.current.humidity}%` },
              { icon: Wind, label: 'Wind', value: `${weather.current.wind} km/h` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                background: isImportant ? 'rgba(255,255,255,0.12)' : 'var(--cream)',
                borderRadius: 10, padding: '10px',
                textAlign: 'center',
              }}>
                <Icon size={16} color={isImportant ? 'rgba(255,255,255,0.8)' : 'var(--green)'} style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: isImportant ? 'white' : 'var(--charcoal)' }}>{value}</div>
                <div style={{ fontSize: 10, color: isImportant ? 'rgba(255,255,255,0.6)' : '#888' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Rain probability */}
          {weather.rainProbNext6h > 20 && (
            <div style={{
              background: isImportant ? 'rgba(255,255,255,0.12)' : 'rgba(52,152,219,0.08)',
              border: `1px solid ${isImportant ? 'rgba(255,255,255,0.2)' : 'rgba(52,152,219,0.2)'}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, color: isImportant ? 'white' : '#2C3E50' }}>
                🌧️ Rain chance next 6 hours
              </span>
              <span style={{
                fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 16,
                color: isImportant ? 'white' : '#3498DB',
              }}>
                {weather.rainProbNext6h}%
              </span>
            </div>
          )}

          {/* Tomorrow forecast */}
          {tomorrowMarket && (
            <div style={{
              background: isImportant ? 'rgba(255,255,255,0.1)' : 'var(--cream)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 11, color: isImportant ? 'rgba(255,255,255,0.6)' : '#888', marginBottom: 2 }}>
                  Tomorrow — {tomorrowMarket.name} market day
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: isImportant ? 'white' : 'var(--charcoal)' }}>
                  {weather.tomorrow.emoji} {weather.tomorrow.label}
                </div>
              </div>
              {['rain', 'heavy_rain', 'storm'].includes(weather.tomorrow.type) && (
                <div style={{
                  background: 'rgba(232,93,4,0.9)',
                  color: 'white', fontSize: 11, fontWeight: 700,
                  padding: '4px 10px', borderRadius: 20,
                }}>
                  Pre-order tonight!
                </div>
              )}
            </div>
          )}

          {/* Market-specific advisory */}
          {isRelevantDay && (
            <div style={{
              background: isImportant ? 'rgba(255,255,255,0.1)' : 'rgba(27,67,50,0.06)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 14,
            }}>
              <div style={{ fontSize: 11, color: isImportant ? 'rgba(255,255,255,0.6)' : '#888', marginBottom: 4 }}>
                📍 Market weather advisory
              </div>
              <div style={{ fontSize: 13, color: isImportant ? 'white' : 'var(--charcoal)', lineHeight: 1.5 }}>
                {weather.marketMessage}
              </div>
            </div>
          )}

          {/* Last updated + refresh */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: isImportant ? 'rgba(255,255,255,0.4)' : '#bbb' }}>
              Updated {lastUpdated?.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); loadWeather() }}
              style={{
                background: isImportant ? 'rgba(255,255,255,0.15)' : 'var(--cream)',
                border: 'none', borderRadius: 8, padding: '6px 12px',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: isImportant ? 'white' : 'var(--green)',
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
