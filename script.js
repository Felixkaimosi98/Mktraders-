
const out = document.getElementById('out');
const balBtn = document.getElementById('bal');
const buyBtn = document.getElementById('buy');
const propBtn = document.getElementById('proposal');
const modeSel = document.getElementById('mode');
const symbolEl = document.getElementById('symbol');
const amountEl = document.getElementById('amount');
const durationEl = document.getElementById('duration');

function log(m){ out.textContent = new Date().toLocaleTimeString() + ' — ' + m + '\n' + out.textContent; }

async function apiFetch(path, opts = {}) {
  const mode = modeSel.value;
  const url = path + (path.includes('?') ? '&' : '?') + 'mode=' + encodeURIComponent(mode);
  const res = await fetch(url, opts);
  return res;
}

propBtn.addEventListener('click', async ()=>{
  log('Requesting proposal...');
  try{
    const payload = {
      symbol: symbolEl.value,
      amount: Number(amountEl.value),
      duration: Number(durationEl.value),
      contract_type: 'CALL'
    };
    const res = await apiFetch('/api/proposal', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const j = await res.json();
    log('Proposal: ' + JSON.stringify(j));
    window.latestProposal = j.proposal || j;
  }catch(e){ log('Error: '+e.message); }
});

buyBtn.addEventListener('click', async ()=>{
  log('Placing buy...');
  try{
    const proposalId = window.latestProposal && (window.latestProposal.id || window.latestProposal.proposal_id || window.latestProposal.request_id) || null;
    const res = await apiFetch('/api/buy', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ proposal_id: proposalId, amount: Number(amountEl.value) }) });
    const j = await res.json();
    log('Buy: ' + JSON.stringify(j));
  }catch(e){ log('Error: '+e.message); }
});

balBtn.addEventListener('click', async ()=>{
  log('Checking balance...');
  try{
    const res = await apiFetch('/api/balance');
    const j = await res.json();
    log('Balance: ' + JSON.stringify(j));
  }catch(e){ log('Error: '+e.message); }
});

(async ()=>{
  try{
    const res = await fetch('/api/history');
    const h = await res.json();
    if(Array.isArray(h)) log('Loaded history: ' + h.length + ' records');
  }catch(e){}
})();
