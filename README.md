# Agento - MPP Crypto API 🤖

AI Agent service untuk MPP (Micropayment Protocol) dengan multi-endpoint crypto dari CoinGecko.

## Endpoints

| Path | Method | Price | Description |
|------|--------|-------|-------------|
| `/api/crypto-price` | POST | $0.005 | Get real-time crypto price |
| `/api/crypto-list` | POST | $0.005 | Get top 10 cryptocurrencies |
| `/api/crypto-history` | POST | $0.008 | Get price history (7-30 days) |
| `/api/convert` | POST | $0.005 | Convert crypto to fiat |

---

## 1. Crypto Price

Get real-time price untuk satu cryptocurrency.

**Request:**
```json
{
  "symbol": "BTC"
}
```

**Response:**
```json
{
  "symbol": "BTC",
  "price_usd": 65000.42,
  "change_24h_percent": 2.5,
  "timestamp": "2026-03-20T14:30:00.000Z",
  "source": "coingecko"
}
```

---

## 2. Crypto List

Get top 10 cryptocurrencies by market cap.

**Request:**
```json
{}
```

**Response:**
```json
{
  "count": 10,
  "cryptocurrencies": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "price_usd": 65000.42,
      "change_24h_percent": 2.5,
      "market_cap": 1200000000000,
      "volume_24h": 30000000000
    }
  ],
  "timestamp": "2026-03-20T14:30:00.000Z",
  "source": "coingecko"
}
```

---

## 3. Crypto History

Get price history untuk 7-30 hari terakhir.

**Request:**
```json
{
  "symbol": "BTC",
  "days": 7
}
```

**Response:**
```json
{
  "symbol": "BTC",
  "days": 7,
  "price_history": [
    {"date": "2026-03-13T00:00:00.000Z", "price_usd": 62000.00},
    {"date": "2026-03-20T00:00:00.000Z", "price_usd": 65000.42}
  ],
  "current_price": 65000.42,
  "timestamp": "2026-03-20T14:30:00.000Z",
  "source": "coingecko"
}
```

---

## 4. Convert

Convert cryptocurrency ke fiat currency.

**Request:**
```json
{
  "from": "BTC",
  "to": "usd",
  "amount": 2.5
}
```

**Response:**
```json
{
  "from": "BTC",
  "to": "USD",
  "amount": 2.5,
  "rate": 65000.42,
  "result": 162501.05,
  "timestamp": "2026-03-20T14:30:00.000Z",
  "source": "coingecko"
}
```

---

## Usage with Tempo CLI

```bash
# Crypto Price
tempo request -t -X POST --json '{"symbol":"BTC"}' https://agento-nu.vercel.app/api/crypto-price

# Crypto List
tempo request -t -X POST --json '{}' https://agento-nu.vercel.app/api/crypto-list

# Crypto History
tempo request -t -X POST --json '{"symbol":"ETH","days":7}' https://agento-nu.vercel.app/api/crypto-history

# Convert
tempo request -t -X POST --json '{"from":"BTC","to":"usd","amount":1}' https://agento-nu.vercel.app/api/convert
```

---

## Supported Symbols

BTC, ETH, SOL, BNB, ARB, OP, MATIC, AVAX, DOGE, LINK

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MPP_SECRET_KEY` | Tempo secret key | - |
| `MPP_CURRENCY` | USDC contract address | `0x20c0...8b50` |
| `MPP_RECIPIENT` | Wallet recipient | `0x2028...8c62` |

---

Built with ❤️ for MPP Tempo
