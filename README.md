# Agento - MPP Crypto Price API

AI Agent service untuk MPP (Micropayment Protocol) dengan endpoint crypto price dari CoinGecko.

## Endpoint

| Path | Method | Price | Description |
|------|--------|-------|-------------|
| `/api/crypto-price` | POST | $0.005 | Get real-time crypto price |

## Request Format

```json
{
  "symbol": "BTC"
}
```

## Response Format

```json
{
  "symbol": "BTC",
  "price_usd": 65000.42,
  "change_24h_percent": 2.5,
  "timestamp": "2026-03-20T14:30:00.000Z",
  "source": "coingecko"
}
```

## Deploy to Vercel

1. Push repo ke GitHub
2. Import ke [vercel.com](https://vercel.com)
3. Environment variables (opsional):
   - `PORT` - default: 3001
4. Deploy! 🚀

## Local Development

```bash
npm install
npm run dev
```

Server jalan di `http://localhost:3001`

## Supported Symbols

BTC, ETH, SOL, BNB, ARB, OP, MATIC, AVAX, DOGE, LINK

---
Built with ❤️ for MPP Tempo
