require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const app = express();
app.use(cors()); app.use(bodyParser.json()); app.use(express.static(path.join(__dirname,'public')));
const PORT = process.env.PORT || 10000;
const DERIV_APP_ID = process.env.DERIV_APP_ID || '107421';
const DERIV_API_TOKEN = process.env.DERIV_API_TOKEN || '';
const MODE = (process.env.MODE || 'demo').toLowerCase();
const DATA_FILE = path.join(__dirname,'trades.json');
function readStore(){ try{ return JSON.parse(fs.readFileSync(DATA_FILE,'utf8')||'[]'); }catch(e){ return []; } }
function writeStore(data){ try{ fs.writeFileSync(DATA_FILE, JSON.stringify(data,null,2)); }catch(e){} }
function requestBalanceWS(timeout=10000){ return new Promise((resolve,reject)=>{ const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`); const timer = setTimeout(()=>{ try{ ws.terminate(); }catch(e){}; reject(new Error('timeout')); }, timeout); ws.on('open', ()=>{ if(!DERIV_API_TOKEN) return reject(new Error('DERIV_API_TOKEN_NOT_SET')); ws.send(JSON.stringify({ authorize: DERIV_API_TOKEN })); }); ws.on('message', (m)=>{ try{ const d = JSON.parse(m.toString()); if(d.authorize && d.authorize.error){ clearTimeout(timer); ws.terminate(); return reject(new Error(JSON.stringify(d.authorize.error))); } if(d.balance){ clearTimeout(timer); ws.terminate(); return resolve(d.balance); } if(d.get_balances){ clearTimeout(timer); ws.terminate(); return resolve(d.get_balances); } }catch(e){} }); ws.on('error',(e)=>{ clearTimeout(timer); try{ ws.terminate(); }catch(e){}; reject(e); }); }); }
app.get('/api/status',(req,res)=> res.json({ status:'ok', mode:MODE, deriv_app_id:DERIV_APP_ID, token_set: !!DERIV_API_TOKEN }));
app.get('/api/balance', async (req,res)=>{ if(MODE==='demo') return res.json({ demo:true, balance:1000.00, currency:'USD' }); if(!DERIV_API_TOKEN) return res.status(400).json({ error:'DERIV_API_TOKEN_NOT_SET' }); try{ const b = await requestBalanceWS(10000); if(b && b.balance) return res.json({ balance: Number(b.balance).toFixed(2), currency: b.currency || 'USD' }); if(b && b.get_balances) return res.json({ balance: Number(b.get_balances.balance).toFixed(2), currency: b.get_balances.currency || 'USD' }); return res.json({ result: b }); }catch(err){ return res.status(500).json({ error: String(err) }); } });
app.post('/api/proposal', (req,res)=>{ const { symbol='R_100', amount=1, duration=1, duration_unit='m', contract_type='CALL' } = req.body||{}; if(MODE==='demo') return res.json({ proposal:{ id:'demo-prop', payout: amount*1.8 } }); if(!DERIV_API_TOKEN) return res.status(400).json({ error:'DERIV_API_TOKEN_NOT_SET' }); const tmp = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`); tmp.on('open', ()=> tmp.send(JSON.stringify({ authorize: DERIV_API_TOKEN }))); tmp.on('message',(m)=>{ try{ const d=JSON.parse(m.toString()); if(d.proposal){ tmp.terminate(); return res.json({ proposal:d.proposal }); } }catch(e){} }); setTimeout(()=>{ try{ tmp.terminate(); }catch(e){}; res.status(500).json({ error:'timeout' }); },8000); });
app.post('/api/buy',(req,res)=>{ const { proposal_id=null, amount=1 } = req.body||{}; if(MODE==='demo'){ const id=uuidv4(); const s=readStore(); s.push({ id, mode:'demo', amount, time:Date.now() }); writeStore(s); return res.json({ status:'ok', id }); } if(!DERIV_API_TOKEN) return res.status(400).json({ error:'DERIV_API_TOKEN_NOT_SET' }); const tmp = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`); tmp.on('open', ()=> tmp.send(JSON.stringify({ authorize: DERIV_API_TOKEN }))); tmp.on('message',(m)=>{ try{ const d=JSON.parse(m.toString()); if(d.buy){ tmp.terminate(); const s=readStore(); s.push({ id:d.buy.transaction_id, mode:'live', amount, time:Date.now(), contract:d.buy }); writeStore(s); return res.json({ buy:d.buy }); } if(d.error){ tmp.terminate(); return res.status(400).json({ error:d.error }); } }catch(e){} }); setTimeout(()=>{ try{ tmp.terminate(); }catch(e){}; res.status(500).json({ error:'timeout' }); },15000); });
app.get('/api/history',(req,res)=> res.json(readStore()));
app.get('*',(req,res)=> res.sendFile(path.join(__dirname,'public','dashboard.html')));
app.listen(PORT, ()=> console.log('MKTraders server listening on', PORT));
