const ORIE_NTIGHA_ANCHOR = new Date('2026-06-18T00:00:00')
const ORIE_UKWU_ANCHOR   = new Date('2026-06-22T00:00:00')
const CYCLE_DAYS = 8

export const MARKETS = {
  NTIGHA: {
    id: 'ntigha',
    name: 'Orie Ntigha',
    location: 'Ntigha, Isiala Ngwa North, Abia State',
    anchor: ORIE_NTIGHA_ANCHOR,
    taglines: [
      'The women of Ntigha village woke up at dawn for this.',
      'Harvested yesterday. On your table today.',
      'What Aba market buys from. Now you can too.',
      'No middlemen. No markup. Just the farm.',
      'Your grandmother knew this market. Now it comes to you.',
    ],
  },
  UKWU: {
    id: 'ukwu',
    name: 'Orie Ukwu',
    location: 'Ukwu, Isiala Ngwa North, Abia State',
    anchor: ORIE_UKWU_ANCHOR,
    taglines: [
      'The great market of Isiala Ngwa. Fresh since before sunrise.',
      'Palm oil pressed this week. Not last month.',
      'What is in season is cheapest today.',
      'No cold storage. No yesterday. Just now.',
      'Orie Ukwu — ahịa nke ụmụ nwanyị obodo.',
    ],
  },
}

export const TIMING = {
  // Day before market — listings go live and pre-orders open at noon
  LISTING_OPEN_HOUR: 12,     // 12:00 PM day before

  // Pre-order window: noon day before → 7AM market day
  PREORDER_OPEN_HOUR: 12,    // noon day before
  PREORDER_CLOSE_HOUR: 7,    // 7AM on market day (when same-day opens)

  // Same-day order window: 7AM → 10AM on market day
  ORDER_OPEN_HOUR: 7,
  ORDER_CLOSE_HOUR: 10,

  // Pickup times
  UMUAHIA_PICKUP_HOUR: 12,
  UMUAHIA_PICKUP_MIN: 30,
  ABA_PICKUP_HOUR: 15,
  ABA_PICKUP_MIN: 0,
}

function stripTime(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysDiff(a, b) {
  return Math.round((stripTime(a) - stripTime(b)) / (1000 * 60 * 60 * 24))
}

function getNextMarketDate(anchor, fromDate = new Date()) {
  const today = stripTime(fromDate)
  const anchorStripped = stripTime(anchor)
  const diffFromAnchor = Math.round((today - anchorStripped) / (1000 * 60 * 60 * 24))

  if (diffFromAnchor < 0) {
    return new Date(anchorStripped)
  }

  const cyclesPassed = Math.floor(diffFromAnchor / CYCLE_DAYS)
  const lastMarket = new Date(anchorStripped)
  lastMarket.setDate(lastMarket.getDate() + cyclesPassed * CYCLE_DAYS)
  const nextMarket = new Date(lastMarket)
  nextMarket.setDate(nextMarket.getDate() + CYCLE_DAYS)

  if (Math.round((today - stripTime(lastMarket)) / (1000 * 60 * 60 * 24)) === 0) {
    return nextMarket
  }

  return nextMarket
}

// Returns which market is active TODAY (if any)
export function getTodaysMarket(now = new Date()) {
  const today = stripTime(now)
  for (const market of Object.values(MARKETS)) {
    const anchorStripped = stripTime(market.anchor)
    const diff = Math.round((today - anchorStripped) / (1000 * 60 * 60 * 24))
    if (diff >= 0 && diff % CYCLE_DAYS === 0) return market
    if (diff === 0) return market
  }
  return null
}

// Returns which market day is TOMORROW (if any)
export function getTomorrowsMarket(now = new Date()) {
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return getTodaysMarket(tomorrow)
}

// Returns the next upcoming market and date
export function getNextMarket(now = new Date()) {
  const ntighaNext = getNextMarketDate(ORIE_NTIGHA_ANCHOR, now)
  const ukwuNext   = getNextMarketDate(ORIE_UKWU_ANCHOR, now)
  const ntighaStripped = stripTime(ntighaNext)
  const ukwuStripped   = stripTime(ukwuNext)

  if (ntighaStripped <= ukwuStripped) {
    return { market: MARKETS.NTIGHA, date: ntighaNext }
  } else {
    return { market: MARKETS.UKWU, date: ukwuNext }
  }
}

// LISTING WINDOW
// Listings are visible from 12PM the day before market
// through the end of market day
export function isListingVisible(now = new Date()) {
  const hour = now.getHours()
  const todayMarket = getTodaysMarket(now)
  const tomorrowMarket = getTomorrowsMarket(now)

  // It's market day — listings always visible
  if (todayMarket) return true

  // It's the day before a market and it's past noon — listings visible
  if (tomorrowMarket && hour >= TIMING.LISTING_OPEN_HOUR) return true

  return false
}

// PRE-ORDER WINDOW
// Open from 12PM day before until 7AM market morning
export function isPreorderOpen(now = new Date()) {
  const hour = now.getHours()
  const todayMarket = getTodaysMarket(now)
  const tomorrowMarket = getTomorrowsMarket(now)

  // If today is market day and before 7AM — still pre-order window
  if (todayMarket && hour < TIMING.ORDER_OPEN_HOUR) return true

  // Day before market, after noon
  if (tomorrowMarket && hour >= TIMING.PREORDER_OPEN_HOUR) return true

  return false
}

// SAME-DAY ORDER WINDOW
// Only 7AM–10AM on market day
export function isOrderOpen(now = new Date()) {
  const todayMarket = getTodaysMarket(now)
  if (!todayMarket) return false
  const hour = now.getHours()
  return hour >= TIMING.ORDER_OPEN_HOUR && hour < TIMING.ORDER_CLOSE_HOUR
}

// What ordering state are we in?
// Returns: 'same_day' | 'preorder' | 'browse_only'
export function getOrderingState(now = new Date()) {
  if (isOrderOpen(now)) return 'same_day'
  if (isPreorderOpen(now)) return 'preorder'
  return 'browse_only'
}

// Get the market these current listings belong to
// (tomorrow's market if pre-order, today's if market day)
export function getActiveListingMarket(now = new Date()) {
  const todayMarket = getTodaysMarket(now)
  if (todayMarket) return todayMarket
  const tomorrowMarket = getTomorrowsMarket(now)
  if (tomorrowMarket) return tomorrowMarket
  return null
}

export function daysUntilNext(now = new Date()) {
  const { date } = getNextMarket(now)
  const today = stripTime(now)
  const next = stripTime(date)
  return Math.round((next - today) / (1000 * 60 * 60 * 24))
}

export function getTagline(market, now = new Date()) {
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  return market.taglines[dayOfYear % market.taglines.length]
}

export function formatMarketDate(date) {
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function isInSeason(peakMonths, now = new Date()) {
  return peakMonths.includes(now.getMonth() + 1)
}

export function getSeasonLabel(now = new Date()) {
  const month = now.getMonth() + 1
  if ([12, 1, 2].includes(month)) return 'Harmattan Season'
  if ([3, 4, 5].includes(month)) return 'Dry Season'
  if ([6, 7, 8, 9].includes(month)) return 'Rainy Season'
  return 'Early Harmattan'
}
