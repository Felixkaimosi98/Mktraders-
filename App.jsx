import React, { useState } from 'react';
import axios from 'axios';
export default function App(){ const [mode,setMode]=useState('demo'); const [balance,setBalance]=useState(null); const [msg,setMsg]=useState(''); const api = process.env.REACT_APP_API_URL || '';
const getBal=async()=>{ try{ if(mode==='demo'){ setBalance((Math.random()*1000).toFixed(2)); } else { const r=await axios.get(`${api}/api/balance`); setBalance(r.data.balance); } }catch(e){ setMsg(String(e)); }};
const doTrade=async()=>{ try{ if(mode==='demo'){ setMsg('Demo trade executed'); } else { const r=await axios.post(`${api}/api/trade`, { contract_type:'CALL', amount:1, duration:1, symbol:'R_100' }); setMsg(JSON.stringify(r.data)); } }catch(e){ setMsg(String(e)); }};
return (<div style={{padding:24}}><h1>MKTraders</h1><div><button onClick={()=>setMode('demo')}>Demo</button><button onClick={()=>setMode('real')}>Real</button></div><div>Mode: {mode}</div><button onClick={getBal}>Balance</button>{balance && <div>Balance: {balance}</div>}<h3>Trade</h3><button onClick={doTrade}>Buy</button><pre>{msg}</pre></div>);
}
