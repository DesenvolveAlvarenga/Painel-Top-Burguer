# Painel Top Burguer

Painel operacional para gerenciar pedidos de delivery via WooCommerce.

## Estrutura

- `backend/`: API Node.js + Express + TypeScript
- `frontend/`: Painel React + TypeScript + Vite
- `docker-compose.yml`: orquestra backend e frontend

## Rodar localmente

1. Backend:
   - `cd backend && npm install && npm run dev`
2. Frontend:
   - `cd frontend && npm install && npm run dev`
3. Acesse `http://localhost:5173`

## Variáveis necessárias

- `backend/.env.example`
- `frontend/.env.example`
