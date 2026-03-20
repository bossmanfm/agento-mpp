import express from 'express';
import { Mppx, tempo } from 'mppx/server';

const app = express();

// Initialize MPP middleware with Tempo Bot Wallet as recipient
const mppx = Mppx.create({
  secretKey: process.env.MPP_SECRET_KEY || 'sk_test_placeholder',
  methods: [tempo({
    currency: process.env.MPP_CURRENCY || '0x20c000000000000000000000b9537d11c60e8b50', // USDC on Tempo Mainnet
    recipient: process.env.MPP_RECIPIENT || '0x2028c5971087f4fda6f89dc3ebe9021e192a8c62', // Passkey Wallet
  })],
});

app.use(express.json());

// ============================================
// AGENTO API ENDPOINTS
// ============================================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    name: 'Agento MPP Server',
    version: '1.1.0',
    endpoints: [
      { path: '/api/crypto-price', price: '$0.005', description: 'Get real-time crypto price' },
      { path: '/api/crypto-list', price: '$0.005', description: 'Get top 10 cryptocurrencies' },
      { path: '/api/crypto-history', price: '$0.008', description: 'Get 7-day price history' },
      { path: '/api/convert', price: '$0.005', description: 'Convert crypto to fiat' }
    ]
  });
});

// --------------------------------------------
// /api/crypto-price - Real-time Crypto Price
// Charge: $0.005 per request
// --------------------------------------------
app.post('/api/crypto-price', async (req, res) => {
  const fetchReq = new Request('http://localhost' + req.originalUrl, {
    method: req.method,
    headers: new Headers(req.headers),
    body: JSON.stringify(req.body)
  });

  const response = await mppx.charge({ amount: '0.005' })(fetchReq);

  if (response.status === 402) {
    for (const [key, value] of response.challenge.headers.entries()) {
      res.set(key, value);
    }
    res.status(402).json(await response.challenge.json());
    return;
  }

  const symbol = req.body.symbol?.toUpperCase() || 'BTC';
  
  const symbolToId = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'BNB': 'binancecoin',
    'ARB': 'arbitrum',
    'OP': 'optimism',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'DOGE': 'dogecoin',
    'LINK': 'chainlink'
  };
  
  const coinId = symbolToId[symbol] || symbol.toLowerCase();
  
  try {
    const cgResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
    const cgData = await cgResponse.json();
    
    if (!cgData[coinId]) {
      res.set('mpp-receipt', response.receipt);
      res.status(404).json({ error: 'Symbol not found', symbol });
      return;
    }
    
    const priceData = {
      symbol: symbol,
      price_usd: cgData[coinId].usd,
      change_24h_percent: cgData[coinId].usd_24h_change || 0,
      timestamp: new Date().toISOString(),
      source: 'coingecko'
    };

    res.set('mpp-receipt', response.receipt);
    res.json(priceData);
  } catch (error) {
    res.set('mpp-receipt', response.receipt);
    res.status(500).json({ error: 'Failed to fetch price', message: error.message });
  }
});

// --------------------------------------------
// /api/crypto-list - Top 10 Cryptocurrencies
// Charge: $0.005 per request
// --------------------------------------------
app.post('/api/crypto-list', async (req, res) => {
  const fetchReq = new Request('http://localhost' + req.originalUrl, {
    method: req.method,
    headers: new Headers(req.headers),
    body: JSON.stringify(req.body)
  });

  const response = await mppx.charge({ amount: '0.005' })(fetchReq);

  if (response.status === 402) {
    for (const [key, value] of response.challenge.headers.entries()) {
      res.set(key, value);
    }
    res.status(402).json(await response.challenge.json());
    return;
  }

  try {
    const cgResponse = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false');
    const cgData = await cgResponse.json();
    
    const cryptoList = cgData.map(coin => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price_usd: coin.current_price,
      change_24h_percent: coin.price_change_percentage_24h || 0,
      market_cap: coin.market_cap,
      volume_24h: coin.total_volume
    }));

    res.set('mpp-receipt', response.receipt);
    res.json({
      count: cryptoList.length,
      cryptocurrencies: cryptoList,
      timestamp: new Date().toISOString(),
      source: 'coingecko'
    });
  } catch (error) {
    res.set('mpp-receipt', response.receipt);
    res.status(500).json({ error: 'Failed to fetch crypto list', message: error.message });
  }
});

// --------------------------------------------
// /api/crypto-history - 7-Day Price History
// Charge: $0.008 per request
// --------------------------------------------
app.post('/api/crypto-history', async (req, res) => {
  const fetchReq = new Request('http://localhost' + req.originalUrl, {
    method: req.method,
    headers: new Headers(req.headers),
    body: JSON.stringify(req.body)
  });

  const response = await mppx.charge({ amount: '0.008' })(fetchReq);

  if (response.status === 402) {
    for (const [key, value] of response.challenge.headers.entries()) {
      res.set(key, value);
    }
    res.status(402).json(await response.challenge.json());
    return;
  }

  const symbol = req.body.symbol?.toUpperCase() || 'BTC';
  const days = req.body.days || 7;
  
  const symbolToId = {
    'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana',
    'BNB': 'binancecoin', 'ARB': 'arbitrum', 'OP': 'optimism',
    'MATIC': 'matic-network', 'AVAX': 'avalanche-2',
    'DOGE': 'dogecoin', 'LINK': 'chainlink'
  };
  
  const coinId = symbolToId[symbol] || symbol.toLowerCase();
  
  try {
    const cgResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
    const cgData = await cgResponse.json();
    
    if (!cgData.prices) {
      res.set('mpp-receipt', response.receipt);
      res.status(404).json({ error: 'Symbol not found or no data', symbol });
      return;
    }
    
    const priceHistory = cgData.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toISOString(),
      price_usd: price
    }));

    res.set('mpp-receipt', response.receipt);
    res.json({
      symbol: symbol,
      days: days,
      price_history: priceHistory,
      current_price: priceHistory[priceHistory.length - 1]?.price_usd,
      timestamp: new Date().toISOString(),
      source: 'coingecko'
    });
  } catch (error) {
    res.set('mpp-receipt', response.receipt);
    res.status(500).json({ error: 'Failed to fetch price history', message: error.message });
  }
});

// --------------------------------------------
// /api/convert - Convert Crypto to Fiat
// Charge: $0.005 per request
// --------------------------------------------
app.post('/api/convert', async (req, res) => {
  const fetchReq = new Request('http://localhost' + req.originalUrl, {
    method: req.method,
    headers: new Headers(req.headers),
    body: JSON.stringify(req.body)
  });

  const response = await mppx.charge({ amount: '0.005' })(fetchReq);

  if (response.status === 402) {
    for (const [key, value] of response.challenge.headers.entries()) {
      res.set(key, value);
    }
    res.status(402).json(await response.challenge.json());
    return;
  }

  const fromSymbol = req.body.from?.toUpperCase() || 'BTC';
  const toCurrency = req.body.to?.toLowerCase() || 'usd';
  const amount = parseFloat(req.body.amount) || 1;
  
  const symbolToId = {
    'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana',
    'BNB': 'binancecoin', 'ARB': 'arbitrum', 'OP': 'optimism',
    'MATIC': 'matic-network', 'AVAX': 'avalanche-2',
    'DOGE': 'dogecoin', 'LINK': 'chainlink'
  };
  
  const coinId = symbolToId[fromSymbol] || fromSymbol.toLowerCase();
  
  try {
    const cgResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${toCurrency}`);
    const cgData = await cgResponse.json();
    
    if (!cgData[coinId]) {
      res.set('mpp-receipt', response.receipt);
      res.status(404).json({ error: 'Symbol not found', from: fromSymbol });
      return;
    }
    
    const rate = cgData[coinId][toCurrency];
    const convertedAmount = amount * rate;

    res.set('mpp-receipt', response.receipt);
    res.json({
      from: fromSymbol,
      to: toCurrency.toUpperCase(),
      amount: amount,
      rate: rate,
      result: convertedAmount,
      timestamp: new Date().toISOString(),
      source: 'coingecko'
    });
  } catch (error) {
    res.set('mpp-receipt', response.receipt);
    res.status(500).json({ error: 'Failed to convert', message: error.message });
  }
});

// ============================================
// START SERVER (Local Development)
// ============================================
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🤖 Agento MPP Server running on port ${PORT}`);
    console.log(`💰 Endpoints ready for AI agents!`);
  });
}

// Export for Vercel serverless
export default app;
