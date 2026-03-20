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
    version: '1.0.0',
    endpoints: [
      { path: '/api/crypto-price', price: '$0.005', description: 'Get real-time crypto prices' }
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
