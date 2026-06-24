// ============================================
// ONLY MARKET DAYS — Weather Service
// Uses Open-Meteo API (free, no key required)
// Coordinates: Isiala Ngwa North, Abia State
// ============================================

const ISIALA_NGWA_LAT = 5.4167
const ISIALA_NGWA_LON = 7.5333

// WMO weather interpretation codes
// https://open-meteo.com/en/docs
const WEATHER_CODES = {
  0:  { label: 'Clear sky',           emoji: '☀️',  type: 'clear' },
  1:  { label: 'Mainly clear',        emoji: '🌤️', type: 'clear' },
  2:  { label: 'Partly cloudy',       emoji: '⛅',  type: 'cloudy' },
  3:  { label: 'Overcast',            emoji: '☁️',  type: 'cloudy' },
  45: { label: 'Foggy',               emoji: '🌫️', type: 'fog' },
  48: { label: 'Icy fog',             emoji: '🌫️', type: 'fog' },
  51: { label: 'Light drizzle',       emoji: '🌦️', type: 'rain' },
  53: { label: 'Drizzle',             emoji: '🌦️', type: 'rain' },
  55: { label: 'Heavy drizzle',       emoji: '🌧️', type: 'rain' },
  61: { label: 'Light rain',          emoji: '🌧️', type: 'rain' },
  63: { label: 'Rain',                emoji: '🌧️', type: 'rain' },
  65: { label: 'Heavy rain',          emoji: '🌧️', type: 'heavy_rain' },
  80: { label: 'Light rain showers',  emoji: '🌦️', type: 'rain' },
  81: { label: 'Rain showers',        emoji: '🌧️', type: 'rain' },
  82: { label: 'Heavy rain showers',  emoji: '⛈️',  type: 'heavy_rain' },
  95: { label: 'Thunderstorm',        emoji: '⛈️',  type: 'storm' },
  96: { label: 'Thunderstorm',        emoji: '⛈️',  type: 'storm' },
  99: { label: 'Heavy thunderstorm',  emoji: '⛈️',  type: 'storm' },
}

// Market-specific weather message
function getMarketMessage(weatherType, isMarketDay, isPreorderWindow) {
  if (isMarketDay) {
    switch (weatherType) {
      case 'clear':
        return 'Perfect market conditions in Isiala Ngwa. Sellers are out in full.'
      case 'cloudy':
        return 'Cloudy but dry in Isiala Ngwa. Market is running normally.'
      case 'rain':
        return 'Light rain in Isiala Ngwa. Most sellers are still out but stock may be slightly reduced.'
      case 'heavy_rain':
        return 'Heavy rain at the market today. Some sellers may not come out — pre-order last night would have been safer.'
      case 'storm':
        return 'Storm conditions in Isiala Ngwa. Market activity is disrupted — please check WhatsApp for updates.'
      default:
        return 'Market is running in Isiala Ngwa today.'
    }
  }

  if (isPreorderWindow) {
    switch (weatherType) {
      case 'rain':
      case 'heavy_rain':
      case 'storm':
        return 'Rain is forecast for tomorrow\'s market. We recommend pre-ordering tonight to guarantee your items.'
      case 'clear':
        return 'Good weather forecast for tomorrow\'s market. Pre-order tonight for first pick at 5AM.'
      default:
        return 'Pre-order tonight for guaranteed first pick tomorrow morning.'
    }
  }

  switch (weatherType) {
    case 'clear':
      return 'Clear weather in Isiala Ngwa today.'
    case 'rain':
    case 'heavy_rain':
      return 'It\'s raining in Isiala Ngwa right now.'
    case 'storm':
      return 'Storm in Isiala Ngwa right now.'
    default:
      return 'Weather in Isiala Ngwa, Abia State.'
  }
}

// Background color per weather type
export function getWeatherTheme(weatherType) {
  switch (weatherType) {
    case 'clear':
      return { bg: 'linear-gradient(135deg, #1B6CA8, #2980B9)', text: 'white', accent: '#FFD700' }
    case 'cloudy':
      return { bg: 'linear-gradient(135deg, #636e72, #74b9ff)', text: 'white', accent: '#dfe6e9' }
    case 'fog':
      return { bg: 'linear-gradient(135deg, #888, #aaa)', text: 'white', accent: '#ddd' }
    case 'rain':
      return { bg: 'linear-gradient(135deg, #2C3E50, #3498DB)', text: 'white', accent: '#74b9ff' }
    case 'heavy_rain':
      return { bg: 'linear-gradient(135deg, #1a252f, #2c3e50)', text: 'white', accent: '#74b9ff' }
    case 'storm':
      return { bg: 'linear-gradient(135deg, #0d1117, #2c3e50)', text: 'white', accent: '#f39c12' }
    default:
      return { bg: 'linear-gradient(135deg, #1B4332, #2D6A4F)', text: 'white', accent: '#74C69D' }
  }
}

export async function fetchMarketWeather(isMarketDay = false, isPreorderWindow = false) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${ISIALA_NGWA_LAT}&longitude=${ISIALA_NGWA_LON}&current=temperature_2m,relative_humidity_2m,weathercode,windspeed_10m,precipitation&hourly=weathercode,precipitation_probability&timezone=Africa%2FLagos&forecast_days=2`

    const res = await fetch(url)
    if (!res.ok) throw new Error('Weather fetch failed')
    const data = await res.json()

    const current = data.current
    const code = current.weathercode
    const weatherInfo = WEATHER_CODES[code] || { label: 'Unknown', emoji: '🌡️', type: 'unknown' }

    // Tomorrow's forecast (first hour of tomorrow)
    const tomorrowCode = data.hourly?.weathercode?.[24] || code
    const tomorrowInfo = WEATHER_CODES[tomorrowCode] || weatherInfo

    // Max rain probability in next 6 hours
    const rainProbNext6h = Math.max(...(data.hourly?.precipitation_probability?.slice(0, 6) || [0]))

    return {
      current: {
        code,
        label: weatherInfo.label,
        emoji: weatherInfo.emoji,
        type: weatherInfo.type,
        temp: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        wind: Math.round(current.windspeed_10m),
        precipitation: current.precipitation,
      },
      tomorrow: {
        code: tomorrowCode,
        label: tomorrowInfo.label,
        emoji: tomorrowInfo.emoji,
        type: tomorrowInfo.type,
      },
      rainProbNext6h,
      marketMessage: getMarketMessage(weatherInfo.type, isMarketDay, isPreorderWindow),
      isRainy: ['rain', 'heavy_rain', 'storm'].includes(weatherInfo.type),
      isClear: weatherInfo.type === 'clear',
      theme: getWeatherTheme(weatherInfo.type),
    }
  } catch (err) {
    console.error('Weather fetch error:', err)
    return null
  }
}
