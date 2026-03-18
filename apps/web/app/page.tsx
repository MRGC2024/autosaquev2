import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white/70">AUTOMAÇÃO DE SAQUE V2</div>
            <h1 className="text-2xl font-semibold">Painel Admin</h1>
          </div>
          <Link className="btn btn-primary" href="/admin/dashboard">
            Entrar no Dashboard
          </Link>
        </header>

        <section className="card p-6">
          <h2 className="text-lg font-medium">O que este sistema faz</h2>
          <ul className="mt-3 space-y-2 text-white/80">
            <li>
              - Monitora o saldo disponível na QuantumPayments e, ao atingir um
              montante configurado, solicita o saque automaticamente.
            </li>
            <li>
              - Acompanha o status do saque (processando/finalizado/erro) e
              envia avisos no Telegram.
            </li>
            <li>
              - Painel para configurações (limite, chave PIX, chaves da API,
              Telegram) e histórico completo.
            </li>
          </ul>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="card p-5">
            <div className="text-sm text-white/70">Saldo</div>
            <div className="mt-2 text-2xl font-semibold">—</div>
            <div className="mt-1 text-xs text-white/60">
              (carrega do backend)
            </div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-white/70">Saques</div>
            <div className="mt-2 text-2xl font-semibold">—</div>
            <div className="mt-1 text-xs text-white/60">
              (histórico + status)
            </div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-white/70">Telegram</div>
            <div className="mt-2 text-2xl font-semibold">—</div>
            <div className="mt-1 text-xs text-white/60">
              (avisos automáticos)
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

