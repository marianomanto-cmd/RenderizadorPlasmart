// Hero — full-viewport, content bottom-aligned. Kicker, giant thin H1 with the
// indigo accent phrase, two magnetic CTAs, and a mono services line + scroll cue.
function Hero() {
  const { Kicker, Button } = window.PlasmartDesignSystem_e9cdad;
  return (
    <section
      id="top"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 var(--pad) clamp(40px,7vh,80px)",
        overflow: "hidden",
      }}
    >
      {/* full-bleed image, heavily attenuated under a darkening gradient */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img
          src="../../assets/arq-fachada.webp"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.4, filter: "grayscale(.25)", transform: "scale(1.04)" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(8,9,11,.55) 0%, rgba(8,9,11,.12) 32%, rgba(8,9,11,.32) 60%, rgba(8,9,11,.9) 90%, var(--bg) 100%)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: "clamp(30px,6vh,80px)" }}>
          <Kicker>Córdoba · AR — Desde 2006</Kicker>
          <span className="mono">Nº/ 03 — Signal</span>
        </div>

        <h1 style={{ fontWeight: 200, fontSize: "var(--fs-hero)", lineHeight: 0.94, letterSpacing: "-.04em", maxWidth: "16ch", color: "var(--text)", margin: 0 }}>
          <span style={{ display: "block" }}>Precisión y</span>
          <span style={{ display: "block" }}>tecnología en</span>
          <span style={{ display: "block", color: "var(--accent)" }}>corte de acero</span>
        </h1>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: "clamp(34px,4vw,54px)" }}>
          <Button variant="solid" icon="arrow-right" magnetic>Pedí tu presupuesto</Button>
          <Button variant="outline" icon="download" magnetic>Descargar catálogo</Button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap", marginTop: "clamp(28px,4vw,48px)" }}>
          <span className="mono" style={{ maxWidth: "30ch" }}>Corte láser · plasma · plegado CNC · metalúrgica general</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <span className="mono" style={{ fontSize: 11 }}>Scroll</span>
            <span style={{ width: 1, height: 50, background: "linear-gradient(var(--accent), transparent)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
window.Hero = Hero;
