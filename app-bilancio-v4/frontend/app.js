const API = localStorage.getItem('apiBase') || 'http://localhost:8080';
document.getElementById('apiBase').textContent = API;

async function fetchJSON(url, options) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadCategories() {
  const cats = await fetchJSON(`${API}/categories`);
  const sel = document.getElementById('category');
  sel.innerHTML = '';
  for (const c of cats) {
    const o = document.createElement('option');
    o.value = c.id; o.textContent = c.name;
    sel.appendChild(o);
  }
}

async function loadTx() {
  const tx = await fetchJSON(`${API}/transactions`);
  const list = document.getElementById('txList');
  list.innerHTML = '';
  tx.slice(0,20).forEach(t => {
    const div = document.createElement('div');
    div.className = `tx-card ${t.type}`;
    div.innerHTML = `<div><strong>${t.categoryId}</strong> — ${t.note||''}<br><small>${t.date}</small></div><div>${t.type==='expense' ? '-' : '+'}${t.amount.toFixed(2)}</div>`;
    list.appendChild(div);
  });
}

async function refreshSummary() {
  const m = document.getElementById('month').value || new Date().toISOString().slice(0,7);
  const s = await fetchJSON(`${API}/stats?month=${m}`);
  document.getElementById('inc').textContent = s.income.toFixed(2);
  document.getElementById('exp').textContent = s.expense.toFixed(2);
  document.getElementById('bal').textContent = s.balance.toFixed(2);
}

// Modal logic
const modal = document.getElementById('modal');
document.getElementById('newTxnBtn').addEventListener('click', () => modal.classList.remove('hidden'));
document.getElementById('cancelBtn').addEventListener('click', () => modal.classList.add('hidden'));
document.getElementById('txnForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    type: document.getElementById('type').value,
    categoryId: document.getElementById('category').value,
    amount: parseFloat(document.getElementById('amount').value),
    date: document.getElementById('date').value,
    note: document.getElementById('note').value || null
  };
  await fetchJSON(`${API}/transactions`, { method: 'POST', body: JSON.stringify(body) });
  e.target.reset();
  modal.classList.add('hidden');
  loadTx(); refreshSummary();
});

document.getElementById('refresh').addEventListener('click', refreshSummary);

(async function init() {
  await loadCategories();
  await loadTx();
  const today = new Date().toISOString().slice(0,7);
  document.getElementById('month').value = today;
  await refreshSummary();
})();