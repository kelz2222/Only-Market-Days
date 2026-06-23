const ORIE_NTIGHA_ANCHOR = new Date('2025-06-18T00:00:00')
const ORIE_UKWU_ANCHOR   = new Date('2025-06-22T00:00:00')
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
      'No middleman. No markup. Just the farm.',
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
  PREORDER_OPEN_HOUR: 18,
  PREORDER_CLOSE_HOUR: 22,
  ORDER_OPEN_HOUR: 7,
  ORDER_CLOSE_HOUR: 10,
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
  const diff = daysDiff(fromDate, anchor)
  if (diff < 0) {
    const cyclesPassed = Math.floor(Math.abs(diff) / CYCLE_DAYS)
    const candidate = new Date(anchor)
    candidate.setDate(candidate.getDate() + (cyclesPassed * CYCLE_DAYS))
    if (daysDiff(candidate, fromDate) < 0) {
      candidate.setDate(candidate.getDate() + CYCLE_DAYS)
    }
    return candidate
  } else {
    return new Date(anchor)
  }
}

export function getTodaysMarket(now = new Date()) {
  const today = stripTime(now)
  for (const market of Object.values(MARKETS)) {
    const diff = daysDiff(today, market.anchor)
    if (diff >= 0 && diff % CYCLE_DAYS === 0) return market
    if (diff < 0 && Math.abs(diff) % CYCLE_DAYS === 0) return market
  }
  return null
}

export function getNextMarket(now = new Date()) {
  const ntighaNext = getNextMarketDate(ORIE_NTIGHA_ANCHOR, now)
  const ukwuNext   = getNextMarketDate(ORIE_UKWU_ANCHOR, now)
  const ntighaDay  = stripTime(ntighaNext)
  const ukwuDay    = stripTime(ukwuNext)
  const today      = stripTime(now)

  const ntighaIsToday = daysDiff(ntighaDay, today) === 0
  const ukwuIsToday   = daysDiff(ukwuDay, today) === 0

  let ntighaFuture = new Date(ntighaNext)
  let ukwuFuture   = new Date(ukwuNext)

  if (ntighaIsToday) ntighaFuture.setDate(ntighaFuture.getDate() + CYCLE_DAYS)
  if (ukwuIsToday)   ukwuFuture.setDate(ukwuFuture.getDate() + CYCLE_DAYS)

  if (ntighaFuture <= ukwuFuture) {
    return { market: MARKETS.NTIGHA, date: ntighaFuture }
  } else {
    return { market: MARKETS.UKWU, date: ukwuFuture }
  }
}

export function isPreorderOpen(now = new Date()) {
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowMarket = getTodaysMarket(tomorrow)
  if (!tomorrowMarket) return false
  const hour = now.getHours()
  return hour >= TIMING.PREORDER_OPEN_HOUR && hour < TIMING.PREORDER_CLOSE_HOUR
}

export function isOrderOpen(now = new Date()) {
  const todayMarket = getTodaysMarket(now)
  if (!todayMarket) return false
  const hour = now.getHours()
  return hour >= TIMING.ORDER_OPEN_HOUR && hour < TIMING.ORDER_CLOSE_HOUR
}

export function daysUntilNext(now = new Date()) {
  const { date } = getNextMarket(now)
  return daysDiff(date, now)
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
