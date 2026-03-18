import "dotenv/config";
import { prisma } from "./db.js";
import { createQuantumClient, extractAvailableCents, extractTransferId, extractTransferStatus } from "./quantum.js";
import { telegramSendMessage } from "./telegram.js";

function now() {
  return new Date();
}

async function log(type: string, message: string, data?: any) {
  await prisma.eventLog.create({
    data: { type, message, data },
  });
}

async function notify(text: string, cfg: { telegramBotToken?: string | null; telegramChatId?: string | null }) {
  const botToken = cfg.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = cfg.telegramChatId || process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;
  await telegramSendMessage({ botToken, chatId, text });
}

function buildDefaultTransferPayload(cfg: { pixKey: string; pixKeyType: string }, amountCents: number) {
  // A QuantumPayments pode ter campos específicos. Este payload é um "mínimo" adaptável via config.quantumTransferPayload.
  return {
    amount: Number((amountCents / 100).toFixed(2)),
    pixKey: cfg.pixKey,
    pixKeyType: cfg.pixKeyType,
  };
}

function mergePayload(base: any, overlay: any) {
  if (!overlay || typeof overlay !== "object") return base;
  return { ...base, ...overlay };
}

async function runCycle() {
  const cfg = await prisma.appConfig.findFirst();
  if (!cfg) return;
  if (!cfg.enabled) return;
  if (!cfg.pixKey || cfg.thresholdCents <= 0) return;

  const minInterval = cfg.minIntervalSeconds || 60;
  if (cfg.lastAutoWithdrawalAt) {
    const delta = (Date.now() - cfg.lastAutoWithdrawalAt.getTime()) / 1000;
    if (delta < minInterval) return;
  }

  const q = createQuantumClient({
    baseUrl: process.env.QUANTUM_API_BASE || "https://api.quantumpayments.com.br/v1",
    basicAuthHeader: cfg.quantumBasicAuth || process.env.QUANTUM_BASIC_AUTH || "",
    withdrawKey: cfg.quantumWithdrawKey || process.env.QUANTUM_WITHDRAW_KEY,
  });

  if (!q) return;
  if (!(cfg.quantumBasicAuth || process.env.QUANTUM_BASIC_AUTH)) return;

  // 1) consulta saldo
  const balanceRaw = await q.getAvailableBalance();
  const availableCents = extractAvailableCents(balanceRaw);
  await log("balance.checked", "Saldo consultado", { availableCents, balanceRaw });

  if (availableCents === null) return;
  if (availableCents < cfg.thresholdCents) return;

  // Evita múltiplos saques simultâneos
  const pending = await prisma.withdrawal.findFirst({
    where: { status: { in: ["created", "processing"] } },
    orderBy: { createdAt: "desc" },
  });
  if (pending) return;

  const amountCents = availableCents;
  const basePayload = buildDefaultTransferPayload({ pixKey: cfg.pixKey, pixKeyType: cfg.pixKeyType }, amountCents);
  const payload = mergePayload(basePayload, cfg.quantumTransferPayload);

  await notify(
    `🚀 <b>Iniciando saque</b>\nValor: R$ ${(amountCents / 100).toFixed(2)}\nChave PIX: ${cfg.pixKey}`,
    cfg
  );

  // 2) cria saque
  const transferCreatedRaw = await q.createTransfer(payload);
  const providerId = extractTransferId(transferCreatedRaw);

  const w = await prisma.withdrawal.create({
    data: {
      providerId: providerId || undefined,
      amountCents,
      pixKey: cfg.pixKey,
      status: "created",
      raw: transferCreatedRaw,
    },
  });

  await prisma.appConfig.update({
    where: { id: cfg.id },
    data: { lastAutoWithdrawalAt: now() },
  });

  await log("withdrawal.created", "Saque solicitado", { withdrawalId: w.id, providerId, payload, transferCreatedRaw });
  await notify(
    `✅ <b>Saque solicitado</b>\nID: ${providerId || w.id}\nValor: R$ ${(amountCents / 100).toFixed(2)}\nStatus: criado`,
    cfg
  );

  // 3) acompanha status (poll curto)
  if (!providerId) return;

  const started = Date.now();
  const maxMs = 5 * 60 * 1000;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  while (Date.now() - started < maxMs) {
    await sleep(15_000);
    const transferRaw = await q.getTransfer(providerId);
    const { status, rawStatus } = extractTransferStatus(transferRaw);

    await prisma.withdrawal.update({
      where: { id: w.id },
      data: {
        status,
        raw: transferRaw,
        ...(status === "failed" ? { error: rawStatus || "failed" } : {}),
      },
    });

    await log("withdrawal.status", "Status atualizado", { providerId, status, rawStatus, transferRaw });

    if (status === "succeeded") {
      await notify(`🎉 <b>Saque finalizado</b>\nID: ${providerId}\nValor: R$ ${(amountCents / 100).toFixed(2)}`, cfg);
      return;
    }

    if (status === "failed") {
      await notify(`❌ <b>Saque falhou</b>\nID: ${providerId}\nMotivo: ${rawStatus || "erro"}`, cfg);
      return;
    }

    await notify(`⏳ <b>Saque em processamento</b>\nID: ${providerId}\nStatus: ${rawStatus || "processing"}`, cfg);
  }
}

async function main() {
  const fallback = Number(process.env.WORKER_INTERVAL_SECONDS || 30);

  // eslint-disable-next-line no-console
  console.log("Worker iniciado");

  // Loop simples (Railway mantém processo rodando)
  // Evita concorrência: só roda um ciclo por vez.
  let running = false;
  setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await runCycle();
    } catch (e: any) {
      try {
        await log("worker.error", "Erro no worker", { message: e?.message, stack: e?.stack });
      } catch {}
      // eslint-disable-next-line no-console
      console.error("Worker erro:", e?.message || e);
    } finally {
      running = false;
    }
  }, fallback * 1000);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

