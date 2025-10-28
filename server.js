require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;
const DERIV_APP_ID = process.env.DERIV_APP_ID || '107421';
const DERIV_API_TOKEN = process.env.DERIV_API_TOKEN || '';
const MODE = (process.env.MODE || 'demo').toLowerCase();

function derivRequest(payload, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`);
    const timer = setTimeout(() => { try{ ws.terminate(); }catch(e){}; reject(new Error('timeout')); }, timeout);
    ws.on('open', () => {
      if (!DERIV_API_TOKEN) return reject(new Error('DERIV_API_TOKEN_NOT_SET'));
      ws.send(JSON.stringify({ authorize: DERIV_API_TOKEN }));
    });
    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.authorize && data.authorize.error) { clearTimeout(timer); ws.terminate(); return reject(new Error(JSON.stringify(data.authorize.error))); }
        if (data.authorize && data.authorize.token) { ws.send(JSON.stringify(payload)); return; }
        if (!data.echo_req) { clearTimeout(timer); ws.terminate(); return resolve(data); }
      } catch(e){}
    });
    ws.on('error', (err) => { clearTimeout(timer); try{ ws.terminate(); }catch(e){}; reject(err); });
  });
}

// serve static frontend
app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/api/status', (req,res) => res.json({ status: 'ok', mode: MODE, deriv_app_id: DERIV_APP_ID, token_set: !!DERIV_API_TOKEN }));

app.get('/api/balance', async (req,res) => {
  if (MODE === 'demo') return res.json({ balance: 'DEMO_BALANCE', amount: 1000 });
  if (!DERIV_API_TOKEN) return res.status(400).json({ error: 'DERIV_API_TOKEN_NOT_SET' });
  try {
    const payload = { balance: 1, subscribe: 1 };
    const result = await derivRequest(payload, 10000);
    if (result.balance) return res.json({ balance: result.balance.balance });
    return res.json({ result });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/trade', async (req,res) => {
  const { symbol='R_100', contract_type='CALL', amount=1, duration=1, duration_unit='m' } = req.body || {};
  if (MODE === 'demo') return res.json({ status: 'ok', mode: 'demo', executed: true, symbol, amount });
  if (!DERIV_API_TOKEN) return res.status(400).json({ error: 'DERIV_API_TOKEN_NOT_SET' });
  try {
    const buyPayload = {
      buy: 1,
      price: amount,
      parameters: {
        amount,
        basis: 'stake',
        contract_type,
        currency: 'USD',
        duration,
        duration_unit,
        symbol
      }
    };
    const result = await derivRequest(buyPayload, 20000);
    if (result.buy) return res.json({ status: 'ok', contract: result.buy });
    return res.status(400).json({ error: 'unexpected', result });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.get('*', (req,res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

app.listen(PORT, () => console.log('MKTraders server listening on', PORT));
