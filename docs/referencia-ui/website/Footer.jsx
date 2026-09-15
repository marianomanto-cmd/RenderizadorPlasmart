// Footer — infinite marquee, big logo, link columns, copyright bottom.
function Footer() {
  const marq = "Pedí tu presupuesto · Corte de acero · Córdoba · AR · ";
  return (
    <footer style={{ borderTop: "1px solid var(--line)", overflow: "hidden" }}>
      <div style={{ padding: "26px 0", borderBottom: "1px solid var(--line)", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 50, width: "max-content", animation: "footmarq 26s linear infinite" }}>
          {[0, 1].map((k) => (
            <span key={k} style={{ fontSize: "clamp(28px,4vw,56px)", fontWeight: 200, letterSpacing: "-.03em", color: "var(--muted)", whiteSpace: "nowrap" }}>
              {marq}{marq}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", paddingInline: "var(--pad)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 30, flexWrap: "wrap", padding: "clamp(40px,5vw,70px) 0 26px" }}>
          <img src="../../assets/plasmart-logo-white.png" alt="Plasmart" style={{ height: "clamp(40px,7vw,84px)", width: "auto" }} />
          <div style={{ display: "flex", gap: "clamp(30px,5vw,70px)", flexWrap: "wrap" }}>
            <div>
              <h5 style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 14 }}>Índice</h5>
              {["Aplicaciones", "Capacidades", "Proyectos", "Contacto"].map((l) => (
                <a key={l} href="#" style={{ display: "block", color: "var(--muted)", fontSize: 14, padding: "4px 0" }}>{l}</a>
              ))}
            </div>
            <div>
              <h5 style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 14 }}>Seguinos</h5>
              {["Instagram", "Facebook", "LinkedIn", "WhatsApp"].map((l) => (
                <a key={l} href="#" style={{ display: "block", color: "var(--muted)", fontSize: 14, padding: "4px 0" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "18px 0 30px", borderTop: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", color: "var(--faint)" }}>
          <span>© 2026 Plasmart</span>
          <span>Francisco de Arteaga 2895, Córdoba · AR</span>
        </div>
      </div>
      <style>{`@keyframes footmarq { to { transform: translateX(-50%) } }`}</style>
    </footer>
  );
}
window.Footer = Footer;
