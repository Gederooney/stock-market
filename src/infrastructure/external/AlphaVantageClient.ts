import { z } from 'zod';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

export const QuoteSchema = z.object({
  'Global Quote': z.object({
    '01. symbol': z.string(),
    '02. open': z.string(),
    '03. high': z.string(),
    '04. low': z.string(),
    '05. price': z.string(),
    '06. volume': z.string(),
    '07. latest trading day': z.string(),
    '08. previous close': z.string(),
    '09. change': z.string(),
    '10. change percent': z.string(),
  }),
});

export const TimeSeriesSchema = z.object({
  'Meta Data': z.object({
    '1. Information': z.string(),
    '2. Symbol': z.string(),
    '3. Last Refreshed': z.string(),
    '4. Interval': z.string().optional(),
    '5. Output Size': z.string().optional(),
    '6. Time Zone': z.string(),
  }),
  'Time Series (5min)': z.record(
    z.object({
      '1. open': z.string(),
      '2. high': z.string(),
      '3. low': z.string(),
      '4. close': z.string(),
      '5. volume': z.string(),
    })
  ).optional(),
  'Time Series (Daily)': z.record(
    z.object({
      '1. open': z.string(),
      '2. high': z.string(),
      '3. low': z.string(),
      '4. close': z.string(),
      '5. volume': z.string(),
    })
  ).optional(),
});

export class AlphaVantageClient {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 60000; // 1 minute

  async getQuote(symbol: string) {
    const cacheKey = `quote:${symbol}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const url = new URL(BASE_URL);
    url.searchParams.append('function', 'GLOBAL_QUOTE');
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('apikey', API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();
    
    const parsed = QuoteSchema.parse(data);
    const quote = parsed['Global Quote'];
    
    const result = {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume']),
      previousClose: parseFloat(quote['08. previous close']),
      change: parseFloat(quote['09. change']),
      changePercent: quote['10. change percent'],
      lastTradingDay: quote['07. latest trading day'],
    };

    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  async getIntraday(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min') {
    const url = new URL(BASE_URL);
    url.searchParams.append('function', 'TIME_SERIES_INTRADAY');
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('interval', interval);
    url.searchParams.append('apikey', API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();
    
    return data;
  }

  async getDailyTimeSeries(symbol: string) {
    const url = new URL(BASE_URL);
    url.searchParams.append('function', 'TIME_SERIES_DAILY');
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('apikey', API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();
    
    return data;
  }

  async searchSymbols(keywords: string) {
    const url = new URL(BASE_URL);
    url.searchParams.append('function', 'SYMBOL_SEARCH');
    url.searchParams.append('keywords', keywords);
    url.searchParams.append('apikey', API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();
    
    return data.bestMatches || [];
  }
}