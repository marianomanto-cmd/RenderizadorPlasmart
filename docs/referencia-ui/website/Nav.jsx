// Nav — fixed top bar. Logo (white wordmark), center links, WhatsApp CTA.
// Goes from mix-blend / transparent to a blurred space-black bar once scrolled.
function Nav({ scrolled }) {
  const { Icon } = window.PlasmartDesignSystem_e9cdad;
  const links = ["Aplicaciones", "Capacidades", "Proyectos", "Contacto"];
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: scrolled ? "16px var(--pad)" : "22px var(--pad)",
        background: scrolled ? "rgba(8,9,11,.72)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
        boxShadow: scrolled ? "var(--shadow-nav)" : "none",
        transition: "all .35s var(--ease)",
      }}
    >
      <a href="#top" style={{ display: "flex", alignItems: "center" }}>
        <img src="../../assets/plasmart-logo-white.png" alt="Plasmart" style={{ height: 30, width: "auto" }} />
      </a>
      <nav style={{ display: "flex", gap: 30 }} className="nav-mid">
        {links.map((l) => (
          <a key={l} href="#" style={{ fontSize: 14, color: "#fff", opacity: 0.7, transition: "opacity .3s" }}
             onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
             onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}>
            {l}
          </a>
        ))}
      </nav>
      <a href="#" style={{
        fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".08em",
        textTransform: "uppercase", color: "#fff",
        borderBottom: "1px solid var(--accent)", paddingBottom: 3,
        display: "inline-flex", alignItems: "center", gap: 7,
      }}>
        Presupuesto <Icon name="arrow-up-right" size={13} />
      </a>
    </header>
  );
}
window.Nav = Nav;
