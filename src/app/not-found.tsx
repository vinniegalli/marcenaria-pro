export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
        Página não encontrada
      </h2>
      <a href="/" style={{ color: "#f59e0b", textDecoration: "underline" }}>
        Voltar ao início
      </a>
    </div>
  );
}
