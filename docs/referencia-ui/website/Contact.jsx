// Contact — centered. Kicker, mega thin H2 with indigo final word, two CTAs,
// and a mono data line.
function Contact() {
  const { Kicker, Button } = window.PlasmartDesignSystem_e9cdad;
  return (
    <section id="contacto" style={{ paddingBlock: "clamp(100px,18vh,240px) clamp(60px,8vh,120px)", textAlign: "center", position: "relative" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", paddingInline: "var(--pad)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <Kicker>Hablemos de tu proyecto</Kicker>
        </div>
        <h2 style={{ fontSize: "var(--fs-display)", fontWeight: 200, letterSpacing: "-.05em", lineHeight: 0.9 }}>
          Construyamos<br /><span style={{ color: "var(--accent)" }}>algo preciso.</span>
        </h2>
        <div style={{ marginTop: "clamp(36px,5vw,60px)", display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <Button variant="solid" icon="arrow-right" magnetic>Pedí tu presupuesto</Button>
          <Button variant="outline" magnetic>Escribinos un mail</Button>
        </div>
        <div style={{ marginTop: "clamp(50px,7vw,90px)", display: "flex", justifyContent: "center", gap: "clamp(24px,5vw,70px)", flexWrap: "wrap", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".06em", color: "var(--muted)" }}>
          <span><b style={{ color: "var(--text)", fontWeight: 500 }}>WA</b> (351) 382 0321</span>
          <span>ventasplasmart@transfil.com.ar</span>
          <span>Francisco de Arteaga 2895, Córdoba</span>
          <span>Lun–Vie 08–17 h</span>
        </div>
      </div>
    </section>
  );
}
window.Contact = Contact;
