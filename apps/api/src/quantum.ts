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
    async getAvailableBalance(): Promise<unknown> {
      const res = await http.get("/balance/available");
      return res.data;
    },
    async createTransfer(payload: unknown): Promise<unknown> {
      const res = await http.post("/transfers", payload);
      return res.data;
    },
    async getTransfer(id: string): Promise<unknown> {
      const res = await http.get(`/transfers/${encodeURIComponent(id)}`);
      return res.data;
    },
    async listTransfers(): Promise<unknown> {
      const res = await http.get("/transfers/");
      return res.data;
    },
  };
}

