# AUTOMAÇÃO DE SAQUE V2

Monorepo (pnpm) com:

- `apps/web`: painel admin (Next.js)
- `apps/api`: API (Express) para configurações, saques, logs e integração QuantumPayments
- `apps/worker`: worker (Node) para monitorar saldo, disparar saque automático e enviar alertas no Telegram

## Requisitos

- Node.js 18+
- pnpm 9+
- PostgreSQL (local ou remoto)

## Rodar localmente

1) Instalar dependências

```bash
pnpm install
```

2) Subir Postgres (opcional via Docker)

```bash
docker compose up -d
```

3) Configurar variáveis de ambiente

- `apps/api/.env.example` → `apps/api/.env`
- `apps/worker/.env.example` → `apps/worker/.env`
- `apps/web/.env.example` → `apps/web/.env.local`

4) Criar tabelas

```bash
pnpm --filter api db:push
```

5) Rodar tudo

```bash
pnpm dev
```

## Deploy (GitHub → Vercel/Railway)

- Web: Vercel
- API + Worker: Railway (recomendado) para ter processo sempre ligado (cron/polling)

