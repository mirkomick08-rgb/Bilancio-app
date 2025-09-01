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
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const qs = new URLSearchParams();
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  const tx = await fetchJSON(`${API}/transactions?${qs.toString()}`);
  const tbody = document.querySelector('#txTable tbody');
  tbody.innerHTML = '';
  for (const t of tx) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t.date}</td><td>${t.type}</td><td>${t.categoryId}</td><td>${t.amount.toFixed(2)}</td><td>${t.note||''}</td><td><button data-id="${t.id}" class="del">🗑️</button></td>`;
    tbody.appendChild(tr);
  }
  tbody.querySelectorAll('.del').forEach(btn => btn.addEventListener('click', async (e) => {
    const id = e.target.getAttribute('data-id');
    await fetch(`${API}/transactions/${id}`, { method: 'DELETE' });
    loadTx();
  }));
}

async function refreshSummary() {
  const m = document.getElementById('month').value || new Date().toISOString().slice(0,7);
  const s = await fetchJSON(`${API}/stats?month=${m}`);
  document.getElementById('inc').textContent = s.income.toFixed(2);
  document.getElementById('exp').textContent = s.expense.toFixed(2);
  document.getElementById('bal').textContent = s.balance.toFixed(2);
}

document.getElementById('load').addEventListener('click', loadTx);
document.getElementById('refresh').addEventListener('click', refreshSummary);
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
  loadTx(); refreshSummary();
});

(async function init() {
  await loadCategories();
  await loadTx();
  const today = new Date().toISOString().slice(0,7);
  document.getElementById('month').value = today;
  await refreshSummary();
})();