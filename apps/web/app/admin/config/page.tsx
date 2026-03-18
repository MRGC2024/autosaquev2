"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type AppConfig = {
  enabled: boolean;
  thresholdCents: number;
  pixKey: string;
  pixKeyType: string;
  minIntervalSeconds: number;
  quantumBasicAuth?: string | null;
  quantumWithdrawKey?: string | null;
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
  quantumTransferPayload?: any;
};

export default function ConfigPage() {
  const [cfg, setCfg] = useState<AppConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const c = await api<AppConfig | null>("/api/config", { admin: true });
        setCfg(
          c ?? {
            enabled: false,
            thresholdCents: 0,
            pixKey: "",
            pixKeyType: "random",
            minIntervalSeconds: 60,
            quantumTransferPayload: {},
          }
        );
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar config");
      }
    })();
  }, []);

  async function save() {
    if (!cfg) return;
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      await api("/api/config", { method: "PUT", admin: true, body: cfg });
      setOk("Config salva com sucesso.");
    } catch (e: any) {
      setError(e?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold">Configurações</h1>
      <p className="mt-2 text-sm text-white/70">
        Configure limite, chave PIX, credenciais Quantum e Telegram.
      </p>

      {error ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}
      {ok ? <div className="mt-4 text-sm text-green-300">{ok}</div> : null}

      {!cfg ? (
        <div className="mt-6 text-sm text-white/70">Carregando…</div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Saque automático</div>
                <div className="text-xs text-white/60">
                  Quando o saldo disponível atingir o limite, o worker solicita o saque.
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={cfg.enabled}
                  onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })}
                />
                Ativo
              </label>
            </div>

            <label className="block text-sm">
              <div className="mb-1 text-white/70">Limite (R$)</div>
              <input
                className="input"
                value={(cfg.thresholdCents / 100).toFixed(2)}
                onChange={(e) => {
                  const v = Number(String(e.target.value).replace(",", "."));
                  setCfg({ ...cfg, thresholdCents: Number.isFinite(v) ? Math.max(0, Math.round(v * 100)) : 0 });
                }}
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-white/70">Chave PIX</div>
              <input className="input" value={cfg.pixKey} onChange={(e) => setCfg({ ...cfg, pixKey: e.target.value })} />
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-white/70">Tipo da chave</div>
              <select
                className="input"
                value={cfg.pixKeyType}
                onChange={(e) => setCfg({ ...cfg, pixKeyType: e.target.value })}
              >
                <option value="random">Aleatória</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone</option>
              </select>
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-white/70">Intervalo mínimo (segundos)</div>
              <input
                className="input"
                value={cfg.minIntervalSeconds}
                onChange={(e) => setCfg({ ...cfg, minIntervalSeconds: Math.max(10, Number(e.target.value || 0)) })}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <div className="font-medium">QuantumPayments</div>
              <div className="text-xs text-white/60">
                Use o Basic Auth e a chave de saque (header <code>x-withdraw-key</code>).
              </div>
            </div>

            <label className="block text-sm">
              <div className="mb-1 text-white/70">Authorization (Basic ...)</div>
              <input
                className="input"
                value={cfg.quantumBasicAuth ?? ""}
                onChange={(e) => setCfg({ ...cfg, quantumBasicAuth: e.target.value || null })}
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-white/70">x-withdraw-key</div>
              <input
                className="input"
                value={cfg.quantumWithdrawKey ?? ""}
                onChange={(e) => setCfg({ ...cfg, quantumWithdrawKey: e.target.value || null })}
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-white/70">Payload extra (JSON)</div>
              <textarea
                className="input min-h-[140px] font-mono text-xs"
                value={JSON.stringify(cfg.quantumTransferPayload ?? {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value || "{}");
                    setCfg({ ...cfg, quantumTransferPayload: parsed });
                  } catch {
                    // mantém texto inválido sem quebrar
                    setCfg({ ...cfg, quantumTransferPayload: cfg.quantumTransferPayload });
                  }
                }}
              />
              <div className="mt-1 text-xs text-white/60">
                Serve para ajustar campos exigidos pela Quantum sem mudar código.
              </div>
            </label>

            <div className="pt-2">
              <div className="font-medium">Telegram</div>
              <div className="text-xs text-white/60">
                Avisos quando o saque for solicitado / processando / finalizado / falhar.
              </div>
            </div>

            <label className="block text-sm">
              <div className="mb-1 text-white/70">Bot token</div>
              <input
                className="input"
                value={cfg.telegramBotToken ?? ""}
                onChange={(e) => setCfg({ ...cfg, telegramBotToken: e.target.value || null })}
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-white/70">Chat ID</div>
              <input
                className="input"
                value={cfg.telegramChatId ?? ""}
                onChange={(e) => setCfg({ ...cfg, telegramChatId: e.target.value || null })}
              />
            </label>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button className="btn btn-primary" disabled={saving || !cfg} onClick={save}>
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );
}

