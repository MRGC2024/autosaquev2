# AUTOMAÇÃO DE SAQUE V2

Monorepo (pnpm) com:

- `apps/web`: painel admin (Next.js)
- `apps/api`: API (Express) para configurações, saques, logs e integração QuantumPayments
- `apps/worker`: worker (Node) para monitorar saldo, disparar saque automático e enviar alertas no Telegram

## Deploy com 1 clique

- **Railway (API + Worker + Postgres)**: clique em [Deploy on Railway](https://railway.com/new/template?template=https://github.com/MRGC2024/autosaquev2)
- **Vercel (Web/painel)**: clique em [Deploy to Vercel](https://vercel.com/new/git/external?repository-url=https://github.com/MRGC2024/autosaquev2&root-directory=apps/web&project-name=autosaquev2-web&env=NEXT_PUBLIC_API_URL&envDescription=URL%20p%C3%BAblica%20da%20API%20(Railway))

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

