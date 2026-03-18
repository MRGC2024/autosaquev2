"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type Withdrawal = {
  id: string;
  createdAt: string;
  providerId?: string | null;
  amountCents: number;
  pixKey: string;
  status: string;
  error?: string | null;
};

export default function WithdrawalsPage() {
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const w = await api<Withdrawal[]>("/api/withdrawals", { admin: true });
        setItems(w);
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar");
      }
    })();
  }, []);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Saques</h1>
        <button
          className="btn"
          onClick={async () => {
            try {
              const w = await api<Withdrawal[]>("/api/withdrawals", { admin: true });
              setItems(w);
            } catch (e: any) {
              setError(e?.message || "Erro ao carregar");
            }
          }}
        >
          Atualizar
        </button>
      </div>

      {error ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}

      <div className="mt-4 overflow-auto rounded-xl ring-1 ring-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-white/70">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Erro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {items.map((w) => (
              <tr key={w.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-white/80">
                  {new Date(w.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-white/80">
                  {w.providerId || w.id}
                </td>
                <td className="px-4 py-3 text-white/80">
                  R$ {(w.amountCents / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-white/5 px-2 py-1 text-xs ring-1 ring-white/10">
                    {w.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-red-200">{w.error || ""}</td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-white/60" colSpan={5}>
                  Nenhum saque ainda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

