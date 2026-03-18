"use client";

import { setAdminToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold">Login Admin</h1>
      <p className="mt-2 text-sm text-white/70">
        Cole o token configurado no backend em <code className="text-white">ADMIN_TOKEN_CHANGE_ME</code>.
      </p>

      <div className="mt-4 space-y-3">
        <input
          className="input"
          placeholder="x-admin-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        {error ? <div className="text-sm text-red-300">{error}</div> : null}
        <button
          className="btn btn-primary w-full"
          onClick={() => {
            if (!token.trim()) {
              setError("Informe o token.");
              return;
            }
            setAdminToken(token.trim());
            router.push("/admin/dashboard");
          }}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}

