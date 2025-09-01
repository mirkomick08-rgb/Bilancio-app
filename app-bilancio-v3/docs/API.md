# API — v3

Base URL: `http://localhost:8080`

## Modelli
### Transaction
```json
{
  "id": "uuid",
  "type": "expense|income",
  "categoryId": "uuid",
  "amount": 12.34,
  "date": "2025-01-31",
  "note": "string"
}
```
### Category
```json
{
  "id": "uuid",
  "name": "string",
  "color": "#RRGGBB"
}
```

## Endpoints
- `GET /health`
- `GET /categories`
- `POST /categories` body: `{ name, color }`
- `GET /transactions?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `POST /transactions` body: `{ type, categoryId, amount, date, note }`
- `DELETE /transactions/:id`
- `GET /stats?month=YYYY-MM` → `{ income, expense, balance, byCategory }`
