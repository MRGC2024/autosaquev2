"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type EventLog = {
  id: string;
  createdAt: string;
  type: string;
  message: string;
  data?: any;
};

export default function LogsPage() {
  const [items, setItems] = useState<EventLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const logs = await api<EventLog[]>("/api/logs", { admin: true });
      setItems(logs);
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Logs</h1>
        <button className="btn" onClick={load}>
          Atualizar
        </button>
      </div>

      {error ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}

      <div className="mt-4 space-y-3">
        {items.map((l) => (
          <div key={l.id} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium">{l.type}</div>
              <div className="text-xs text-white/60">{new Date(l.createdAt).toLocaleString()}</div>
            </div>
            <div className="mt-1 text-sm text-white/80">{l.message}</div>
            {l.data ? (
              <pre className="mt-3 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-white/80 ring-1 ring-white/10">
                {JSON.stringify(l.data, null, 2)}
              </pre>
            ) : null}
          </div>
        ))}
        {items.length === 0 ? <div className="text-sm text-white/60">Sem logs ainda.</div> : null}
      </div>
    </div>
  );
}

