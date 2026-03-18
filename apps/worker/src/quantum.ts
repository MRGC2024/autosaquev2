import axios from "axios";

export type QuantumClientConfig = {
  baseUrl: string;
  basicAuthHeader: string;
  withdrawKey?: string;
};

export function createQuantumClient(cfg: QuantumClientConfig) {
  const http = axios.create({
    baseURL: cfg.baseUrl,
    headers: {
      accept: "application/json",
      authorization: cfg.basicAuthHeader,
      "content-type": "application/json",
      ...(cfg.withdrawKey ? { "x-withdraw-key": cfg.withdrawKey } : {}),
    },
    timeout: 30_000,
  });

  return {
    async getAvailableBalance(): Promise<any> {
      const res = await http.get("/balance/available");
      return res.data;
    },
    async createTransfer(payload: any): Promise<any> {
      const res = await http.post("/transfers", payload);
      return res.data;
    },
    async getTransfer(id: string): Promise<any> {
      const res = await http.get(`/transfers/${encodeURIComponent(id)}`);
      return res.data;
    },
  };
}

export function extractAvailableCents(balancePayload: any): number | null {
  const candidates = [
    balancePayload?.available,
    balancePayload?.available_balance,
    balancePayload?.balance,
    balancePayload?.data?.available,
    balancePayload?.data?.balance,
    balancePayload?.data?.available_balance,
  ];

  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) {
      // Heurística: se vier em reais com centavos, converte.
      if (c > 0 && c < 1_000_000) return Math.round(c * 100);
    }
    if (typeof c === "string") {
      const n = Number(String(c).replace(",", "."));
      if (Number.isFinite(n)) return Math.round(n * 100);
    }
  }
  return null;
}

export function extractTransferId(payload: any): string | null {
  const candidates = [
    payload?.id,
    payload?.transfer?.id,
    payload?.data?.id,
    payload?.transferId,
  ];
  for (const c of candidates) if (typeof c === "string" && c.length > 0) return c;
  return null;
}

export function extractTransferStatus(payload: any): {
  status: "created" | "processing" | "succeeded" | "failed";
  rawStatus?: string;
} {
  const raw =
    payload?.status ??
    payload?.state ??
    payload?.transfer?.status ??
    payload?.data?.status ??
    payload?.data?.state;

  const rawStr = typeof raw === "string" ? raw.toLowerCase() : undefined;

  if (!rawStr) return { status: "processing" };
  if (["created", "pending", "processing", "in_progress"].includes(rawStr))
    return { status: "processing", rawStatus: rawStr };
  if (["paid", "success", "succeeded", "completed", "finished"].includes(rawStr))
    return { status: "succeeded", rawStatus: rawStr };
  if (["failed", "error", "canceled", "cancelled", "refused", "rejected"].includes(rawStr))
    return { status: "failed", rawStatus: rawStr };
  return { status: "processing", rawStatus: rawStr };
}

