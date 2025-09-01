# App Bilancio — v4

Questa è la **v4** dello scheletro di progetto per l'app di bilancio personale.

## Novità della v4
- Interfaccia frontend **semplificata** e più mobile-friendly
- Form di inserimento transazioni spostato in un **popup/modal**
- Lista transazioni più leggibile in stile "card"
- Riepilogo sempre in alto con saldo, entrate, spese
- Nessun filtro avanzato (carica ultime transazioni)

## Struttura
- `frontend/` — PWA aggiornata (HTML/JS/CSS)
- `backend/` — API Node.js + Express con SQLite (come v3)
- `docs/` — API e changelog
- `data/` — database/seed di esempio
- `.env.example` — variabili d'ambiente
- `docker-compose.yml` — esegue backend e un semplice static server per la PWA
