import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { prisma } from "./db.js";
import { requireAdminToken } from "./auth.js";
import { createQuantumClient } from "./quantum.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/config", requireAdminToken, async (_req, res) => {
  const cfg = await prisma.appConfig.findFirst();
  res.json(cfg);
});

const upsertConfigSchema = z.object({
  enabled: z.boolean().optional(),
  thresholdCents: z.number().int().nonnegative().optional(),
  pixKey: z.string().min(1).optional(),
  pixKeyType: z.string().min(1).optional(),
  quantumTransferPayload: z.unknown().optional(),
  telegramBotToken: z.string().min(1).nullable().optional(),
  telegramChatId: z.string().min(1).nullable().optional(),
  quantumBasicAuth: z.string().min(1).nullable().optional(),
  quantumWithdrawKey: z.string().min(1).nullable().optional(),
  minIntervalSeconds: z.number().int().min(10).optional(),
});

app.put("/api/config", requireAdminToken, async (req, res) => {
  const parsed = upsertConfigSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Body inválido", details: parsed.error.flatten() });
  }

  const existing = await prisma.appConfig.findFirst();
  const cfg = existing
    ? await prisma.appConfig.update({ where: { id: existing.id }, data: parsed.data })
    : await prisma.appConfig.create({ data: { enabled: false, thresholdCents: 0, pixKey: "", pixKeyType: "random", ...parsed.data } });

  await prisma.eventLog.create({
    data: { type: "config.updated", message: "Config atualizada", data: parsed.data },
  });

  res.json(cfg);
});

app.get("/api/withdrawals", requireAdminToken, async (_req, res) => {
  const items = await prisma.withdrawal.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  res.json(items);
});

app.get("/api/logs", requireAdminToken, async (_req, res) => {
  const items = await prisma.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  res.json(items);
});

app.get("/api/quantum/balance", requireAdminToken, async (_req, res) => {
  const baseUrl = process.env.QUANTUM_API_BASE || "https://api.quantumpayments.com.br/v1";
  const basic = process.env.QUANTUM_BASIC_AUTH;
  if (!basic) return res.status(500).json({ error: "QUANTUM_BASIC_AUTH não configurado" });

  const q = createQuantumClient({
    baseUrl,
    basicAuthHeader: basic,
    withdrawKey: process.env.QUANTUM_WITHDRAW_KEY,
  });

  const data = await q.getAvailableBalance();
  res.json(data);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API rodando em http://localhost:${PORT}`);
});

