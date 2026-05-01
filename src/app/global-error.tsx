"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">Algo deu errado</h2>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
