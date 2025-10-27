import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();
const app = express();
app.use(cors()); app.use(express.json());
const PORT = process.env.PORT || 3000;
const DERIV_APP_ID = process.env.DERIV_APP_ID || '105977';
const DERIV_TOKEN = process.env.DERIV_TOKEN || '';
app.get('/api/status', (req,res)=>res.json({status:'ok', deriv_app_id: DERIV_APP_ID}));
app.get('/api/balance', async (req,res)=>{ if(!DERIV_TOKEN) return res.json({balance:'DEMO_MODE'}); try{ const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`); ws.on('open', ()=>{ ws.send(JSON.stringify({ authorize: DERIV_TOKEN })); ws.send(JSON.stringify({ balance:1, subscribe:1 })); }); ws.on('message', msg=>{ try{ const d = JSON.parse(msg.toString()); if(d.balance){ ws.close(); return res.json({balance: d.balance.balance}); } if(d.authorize && d.authorize.error){ ws.close(); return res.status(400).json({error:d.authorize.error}); } }catch(e){} }); setTimeout(()=>{ try{ ws.close(); }catch(e){}; res.status(504).json({error:'timeout'}); },8000); }catch(e){ res.status(500).json({error:String(e)}); } });
app.post('/api/trade', async (req,res)=>{ if(!DERIV_TOKEN) return res.status(400).json({error:'DERIV_TOKEN_NOT_SET'}); const { contract_type='CALL', amount=1, duration=1, symbol='R_100' } = req.body; try{ const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`); ws.on('open', ()=>{ ws.send(JSON.stringify({ authorize: DERIV_TOKEN })); const payload = { buy:1, price: amount, parameters: { contract_type, amount, basis:'stake', duration, duration_unit:'m', symbol, currency:'USD' } }; ws.send(JSON.stringify(payload)); }); ws.on('message', msg=>{ try{ const d = JSON.parse(msg.toString()); if(d.buy){ ws.close(); return res.json({status:'ok', contract: d.buy}); } if(d.error){ ws.close(); return res.status(400).json({error: d.error}); } }catch(e){} }); setTimeout(()=>{ try{ ws.close(); }catch(e){}; res.status(504).json({error:'timeout'}); },15000); }catch(e){ res.status(500).json({error:String(e)}); } });
app.listen(PORT, ()=>console.log('MKTraders server listening on', PORT));
