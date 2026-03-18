"use client";

import { api } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

type Withdrawal = {
  id: string;
  createdAt: string;
  providerId?: string | null;
  amountCents: number;
  status: string;
};

type AppConfig = {
  enabled: boolean;
  thresholdCents: number;
  pixKey: string;
  minIntervalSeconds: number;
  lastAutoWithdrawalAt?: string | null;
};

export default function DashboardPage() {
  const [cfg, setCfg] = useState<AppConfig | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(() => withdrawals.reduce((acc, w) => acc + (w.amountCents || 0), 0), [withdrawals]);
  const last = withdrawals[0];

  useEffect(() => {
    (async () => {
      try {
        const [cfgRes, wRes, bRes] = await Promise.all([
          api<AppConfig | null>("/api/config", { admin: true }),
          api<Withdrawal[]>("/api/withdrawals", { admin: true }),
          api<any>("/api/quantum/balance", { admin: true }),
        ]);
        setCfg(cfgRes);
        setWithdrawals(wRes);
        setBalance(bRes);
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar");
      }
    })();
  }, []);

  return (
    <>
      <div className="card p-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="mt-2 text-sm text-white/70">
          Visão geral do sistema de saque automático.
        </div>
        {error ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <div className="text-sm text-white/70">Status</div>
          <div className="mt-2 text-2xl font-semibold">
            {cfg ? (cfg.enabled ? "Ativo" : "Desativado") : "—"}
          </div>
          <div className="mt-1 text-xs text-white/60">
            Intervalo: {cfg ? `${cfg.minIntervalSeconds}s` : "—"}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-white/70">Limite para saque</div>
          <div className="mt-2 text-2xl font-semibold">
            {cfg ? `R$ ${(cfg.thresholdCents / 100).toFixed(2)}` : "—"}
          </div>
          <div className="mt-1 text-xs text-white/60">PIX: {cfg?.pixKey || "—"}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-white/70">Último saque</div>
          <div className="mt-2 text-2xl font-semibold">{last ? `R$ ${(last.amountCents / 100).toFixed(2)}` : "—"}</div>
          <div className="mt-1 text-xs text-white/60">
            {last ? `Status: ${last.status}` : "Sem saques ainda"}
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Saldo (Quantum)</h2>
        <pre className="mt-3 overflow-auto rounded-lg bg-black/30 p-4 text-xs text-white/80 ring-1 ring-white/10">
          {balance ? JSON.stringify(balance, null, 2) : "—"}
        </pre>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Resumo</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
            <div className="text-xs text-white/60">Saques (últimos 200)</div>
            <div className="mt-1 text-xl font-semibold">{withdrawals.length}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
            <div className="text-xs text-white/60">Total sacado</div>
            <div className="mt-1 text-xl font-semibold">R$ {(total / 100).toFixed(2)}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
            <div className="text-xs text-white/60">Última execução automática</div>
            <div className="mt-1 text-sm text-white/80">
              {cfg?.lastAutoWithdrawalAt ? new Date(cfg.lastAutoWithdrawalAt).toLocaleString() : "—"}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

