# 🤖 AGENTO - Cara Memanggil dari Topic Lain

## Lokasi Project
```
/home/admin/.openclaw/workspace/projects/agento/
```

## CLUE: Cara Panggil Agento dari Topic "agento"

### 1. Start Server Agento
```bash
cd /home/admin/.openclaw/workspace/projects/agento
npm install
node server.mjs
```

### 2. Expose dengan Localtunnel
```bash
lt --port 3001
```

### 3. Test Endpoint Crypto Price
```bash
# Test via Tempo CLI
tempo request -t -X POST --json '{"symbol":"BTC"}' https://[YOUR-TUNNEL].loca.lt/api/crypto-price
```

### 4. Integrasi ke Bot Farming (Kalau Mau)
Tambahkan ke script farming di `/home/admin/.openclaw/workspace/projects/mpp-server/ultimate_farmer.js`:

```javascript
async function callAgentoAPI() {
  const symbol = ['BTC', 'ETH', 'SOL'][Math.floor(Math.random() * 3)];
  const command = `"$HOME/.local/bin/tempo" request -t -X POST --json '{"symbol":"${symbol}"}' https://[YOUR-TUNNEL].loca.lt/api/crypto-price`;
  
  try {
    console.log(`[${new Date().toISOString()}] 💰 Hit Agento API (Crypto Price: ${symbol})`);
    const { stdout } = await execPromise(command);
    if (stdout.includes('price_usd')) {
      console.log(`   ✅ Sukses! Jajan Crypto Price dari Agento.`);
    }
  } catch (error) {
    console.log(`   ❌ Gagal Tx: ${error.message}`);
  }
}
```

## Endpoint Tersedia

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/crypto-price` | POST | $0.005 | Get real-time crypto price from CoinGecko |

### Request Format
```json
{
  "symbol": "BTC"
}
```

### Response Format
```json
{
  "symbol": "BTC",
  "price_usd": 65000.42,
  "change_24h_percent": 2.5,
  "timestamp": "2026-03-20T14:30:00.000Z",
  "source": "coingecko"
}
```

## Command untuk Panggil dari Topic Lain

Ketik di topic "agento":
```
Sarah, start agento server dan expose ke localtunnel
```

Atau untuk test endpoint:
```
Sarah, test crypto price BTC via agento
```

## Notes
- Server Agento jalan di port **3001** (berbeda dengan farming server di port 3000)
- Wallet recipient sama: `0x2028c5971087f4fda6f89dc3ebe9021e192a8c62`
- Harga: $0.005 USDC per request
