// Exchange rate utilities - all prices converted to USD

// Free exchange rate API (no key needed)
const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/USD'

export interface ExchangeRates {
  USD: number
  GBP: number
  EUR: number
  AUD: number
  CAD: number
  CNY: number
  [key: string]: number
}

// Cache rates for 1 hour
let cachedRates: ExchangeRates | null = null
let cacheTime: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function getExchangeRates(): Promise<ExchangeRates> {
  // Return cached if still valid
  if (cachedRates && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedRates
  }
  
  try {
    const response = await fetch(EXCHANGE_API)
    const data = await response.json()
    
    cachedRates = {
      USD: 1,
      GBP: data.rates.GBP || 0.79,
      EUR: data.rates.EUR || 0.92,
      AUD: data.rates.AUD || 1.53,
      CAD: data.rates.CAD || 1.36,
      CNY: data.rates.CNY || 7.24,
    }
    cacheTime = Date.now()
    
    return cachedRates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    // Return defaults if API fails
    return {
      USD: 1,
      GBP: 0.79,
      EUR: 0.92,
      AUD: 1.53,
      CAD: 1.36,
      CNY: 7.24,
    }
  }
}

// Convert any currency to USD
export async function toUSD(amount: number, fromCurrency: string): Promise<number> {
  const rates = await getExchangeRates()
  const rate = rates[fromCurrency.toUpperCase()] || 1
  return amount / rate // Divide because rates are USD -> other
}

// Format as USD
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Get currency from country
export function getCurrencyFromCountry(country: string): string {
  const map: Record<string, string> = {
    'UK': 'GBP',
    'USA': 'USD',
    'Italy': 'EUR',
    'Germany': 'EUR',
    'France': 'EUR',
    'Australia': 'AUD',
    'Canada': 'CAD',
    'China': 'CNY',
  }
  return map[country] || 'USD'
}
