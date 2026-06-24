import { useEffect, useState } from 'react'
import { getTodaysMarket } from '../lib/marketCalendar'

export default function OnlyMarketDaysIcon({ size = 48 }) {
  const [isMarketDay, setIsMarketDay] = useState(false)

  useEffect(() => {
    const market = getTodaysMarket(new Date())
    setIsMarketDay(!!market)
  }, [])

  const spinDuration = isMarketDay ? '3s' : '8s'

  return (
    <>
      <style>{`
        @keyframes spinMarketIcon {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .omd-icon-spin {
          animation: spinMarketIcon ${spinDuration} linear infinite;
          transform-origin: center;
          display: block;
        }
      `}</style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 190 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="omd-icon-spin">
          <path d="M95 95 L95 10 A85 85 0 0 0 10 95 Z"  fill="#1B4332"/>
          <path d="M95 95 L95 10 A85 85 0 0 1 180 95 Z" fill="#C0522B"/>
          <path d="M95 95 L10 95 A85 85 0 0 0 95 180 Z" fill="#9B7E46"/>
          <path d="M95 95 L180 95 A85 85 0 0 1 95 180 Z" fill="#5C3D1E"/>
          <circle cx="95" cy="95" r="85" stroke="#1B4332" strokeWidth="3" fill="none"/>
          <line x1="95" y1="10"  x2="95"  y2="180" stroke="#F7F3EC" strokeWidth="2"/>
          <line x1="10" y1="95"  x2="180" y2="95"  stroke="#F7F3EC" strokeWidth="2"/>
          <circle cx="95" cy="95" r="28" fill="#F7B731" opacity="0.2"/>
          <circle cx="95" cy="95" r="20" fill="#F7B731"/>
          <circle cx="95" cy="95" r="13" fill="#FFD460"/>
          {[0,45,90,135,180,225,270,315].map((angle) => {
            const rad = (angle * Math.PI) / 180
            return (
              <line
                key={angle}
                x1={95 + Math.cos(rad) * 23} y1={95 + Math.sin(rad) * 23}
                x2={95 + Math.cos(rad) * 33} y2={95 + Math.sin(rad) * 33}
                stroke="#F7B731" strokeWidth="4" strokeLinecap="round"
              />
            )
          })}
          <circle cx="95"  cy="10"  r="5" fill="#F7B731"/>
          <circle cx="180" cy="95"  r="5" fill="#F7B731"/>
          <circle cx="95"  cy="180" r="5" fill="#F7B731"/>
          <circle cx="10"  cy="95"  r="5" fill="#F7B731"/>
          <line x1="42" y1="36" x2="60" y2="54" stroke="#F7F3EC" strokeWidth="5" strokeLinecap="round"/>
          <line x1="60" y1="36" x2="42" y2="54" stroke="#F7F3EC" strokeWidth="5" strokeLinecap="round"/>
          <text x="51" y="76" textAnchor="middle" fill="#F7F3EC" fontSize="13" fontFamily="sans-serif" fontWeight="700" letterSpacing="1">EKE</text>
          <circle cx="138" cy="45" r="13" stroke="#F7F3EC" strokeWidth="4.5" fill="none"/>
          <text x="138" y="76" textAnchor="middle" fill="#F7F3EC" fontSize="13" fontFamily="sans-serif" fontWeight="700" letterSpacing="1">ORIE</text>
          <line x1="48" y1="114" x2="48" y2="138" stroke="#F7F3EC" strokeWidth="4.5" strokeLinecap="round"/>
          <line x1="61" y1="114" x2="61" y2="138" stroke="#F7F3EC" strokeWidth="4.5" strokeLinecap="round"/>
          <text x="54" y="157" textAnchor="middle" fill="#F7F3EC" fontSize="13" fontFamily="sans-serif" fontWeight="700" letterSpacing="1">AFỌ</text>
          <rect x="126" y="114" width="26" height="26" stroke="#F7F3EC" strokeWidth="4.5" fill="none" rx="1"/>
          <text x="139" y="157" textAnchor="middle" fill="#F7F3EC" fontSize="12" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">NKWỌ</text>
        </g>
      </svg>
    </>
  )
}
