# Deploy (Vercel + Railway)

Este guia coloca o sistema no ar puxando tudo do GitHub.

## Visão recomendada

- **Web (painel)**: Vercel
- **API + Worker**: Railway (processos sempre ligados)
- **Banco**: Postgres no Railway (ou Supabase/Neon)

## 1) Preparar o banco (Railway)

1. Crie um projeto no Railway.
2. Adicione um serviço **PostgreSQL**.
3. Copie a `DATABASE_URL` gerada pelo Railway.

## 2) Deploy da API (Railway)

1. No Railway, crie um novo serviço a partir do GitHub e selecione o repositório.
2. Configure:
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter api build`
   - **Start Command**: `pnpm --filter api start`
3. Variáveis (Railway → Variables):
   - `DATABASE_URL` = (do Postgres)
   - `PORT` = `4000` (ou deixe vazio)
   - `ADMIN_TOKEN_CHANGE_ME` = (crie um token forte)
   - `QUANTUM_API_BASE` = `https://api.quantumpayments.com.br/v1`
   - `QUANTUM_BASIC_AUTH` = `Basic ...`
   - `QUANTUM_WITHDRAW_KEY` = (sua withdraw key)

4. Após o primeiro deploy, rode as tabelas (uma vez):
   - Abra o shell do Railway (ou rode local apontando `DATABASE_URL`) e execute:

```bash
pnpm --filter api db:push
```

## 3) Deploy do Worker (Railway)

No mesmo projeto do Railway:

1. Crie um novo serviço a partir do GitHub (mesmo repo).
2. Configure:
   - **Root Directory**: `apps/worker`
   - **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter worker build`
   - **Start Command**: `pnpm --filter worker start`
3. Variáveis:
   - `DATABASE_URL` = (do Postgres)
   - `QUANTUM_API_BASE` = `https://api.quantumpayments.com.br/v1`
   - `QUANTUM_BASIC_AUTH` = `Basic ...`
   - `QUANTUM_WITHDRAW_KEY` = (sua withdraw key)
   - `TELEGRAM_BOT_TOKEN` = (token do bot)
   - `TELEGRAM_CHAT_ID` = (id do chat)
   - `WORKER_INTERVAL_SECONDS` = `30` (ou outro valor)

## 4) Deploy do painel (Vercel)

1. Na Vercel, importe o repositório do GitHub.
2. Configure:
   - **Root Directory**: `apps/web`
   - Framework: Next.js
3. Variáveis:
   - `NEXT_PUBLIC_API_URL` = URL pública da sua API no Railway (ex: `https://sua-api.up.railway.app`)

## 5) Configurar o sistema no painel

1. Acesse o painel.
2. Entre em `/admin/login` e cole o token `ADMIN_TOKEN_CHANGE_ME`.
3. Vá em **Configurações**:
   - Ative `Saque automático`
   - Defina o limite (R$)
   - Configure sua chave PIX e tipo
   - Cole o Basic Auth e o x-withdraw-key
   - Configure Telegram (ou deixe via env do worker)

## Observações importantes

- **Segredos**: nunca commite `.env`. Configure tudo como variáveis de ambiente.
- **Payload do saque**: se a Quantum exigir campos específicos no `POST /transfers`, ajuste em `Payload extra (JSON)` no painel.

