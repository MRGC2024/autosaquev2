"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminToken, getAdminToken } from "@/lib/api";
import { useEffect, useState } from "react";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/config", label: "Configurações" },
  { href: "/admin/withdrawals", label: "Saques" },
  { href: "/admin/logs", label: "Logs" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasToken, setHasToken] = useState<boolean>(false);

  useEffect(() => {
    setHasToken(Boolean(getAdminToken()));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b1220]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400/30" />
            <div>
              <div className="text-sm text-white/70">AUTOMAÇÃO DE SAQUE V2</div>
              <div className="font-semibold">Painel Admin</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasToken ? (
              <button
                className="btn"
                onClick={() => {
                  clearAdminToken();
                  setHasToken(false);
                  router.push("/admin/login");
                }}
              >
                Sair
              </button>
            ) : (
              <Link className="btn btn-primary" href="/admin/login">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 md:grid-cols-[220px_1fr]">
        <aside className="card p-4">
          <nav className="space-y-1">
            {nav.map((i) => {
              const active = pathname === i.href;
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  className={[
                    "block rounded-lg px-3 py-2 text-sm ring-1 ring-white/10 transition",
                    active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5",
                  ].join(" ")}
                >
                  {i.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 text-xs text-white/60">
            Dica: o token admin fica no backend (`ADMIN_TOKEN_CHANGE_ME`).
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}

