# App Bilancio — v3

Questa è la **v3** dello scheletro di progetto per l'app di bilancio personale.

## Novità della v3
- PWA offline-ready per inserire spese/entrate anche senza rete
- Endpoint `/stats` per riepiloghi mensili (spese, entrate, saldo)
- Categorie personalizzabili con colori
- Docker compose per avvio rapido
- Seed iniziale di esempio

## Struttura
- `frontend/` — PWA (HTML/JS/CSS) minimale
- `backend/` — API Node.js + Express con SQLite (persistenza file)
- `docs/` — API e changelog
- `data/` — database/seed di esempio
- `.env.example` — variabili d'ambiente
- `docker-compose.yml` — esegue backend e un semplice static server per la PWA

## Avvio rapido (senza Docker)
1. **Backend**
   ```bash
   cd backend
   npm install
   cp ../.env.example .env
   npm start
   ```
   Di default ascolta su `http://localhost:8080` e usa `./budget.sqlite` nel folder `backend/`.

2. **Frontend**
   Apri `frontend/index.html` con un server statico, ad esempio:
   ```bash
   cd frontend
   python3 -m http.server 5173
   ```
   Poi vai su `http://localhost:5173`.

## Avvio con Docker
```bash
docker compose up --build
```
- Backend: http://localhost:8080
- Frontend: http://localhost:5173

## Note
- Questo è uno scheletro pronto per estensioni. Non è pensato per produzione senza ulteriori hardening.
