// Capabilities — hover-reveal list (CapabilityRow) + an animated-looking stats band.
function Capabilities() {
  const { CapabilityRow, Stat } = window.PlasmartDesignSystem_e9cdad;
  const rows = [
    { i: "01", nm: "Corte láser", sp: "↳ hasta 12,7 mm", d: "Tecnología avanzada para cortes finos y detallados en acero, garantizando máxima calidad y exactitud hasta 12,7 mm." },
    { i: "02", nm: "Corte plasma", sp: "↳ hasta 32 mm", d: "Trabajamos con materiales de calidad en espesores de hasta 32 mm." },
    { i: "03", nm: "Plegado CNC", sp: "↳ hasta 3 m", d: "Máxima precisión en plegados de hasta 3 metros." },
    { i: "04", nm: "Metalúrgica general", sp: "↳ servicios integrales", d: "20 años de experiencia en acero, resolviendo tu proyecto de punta a punta." },
    { i: "05", nm: "Asesoramiento", sp: "↳ a medida", d: "Diseñadores a tu disposición para darle un toque único a tu espacio." },
    { i: "06", nm: "Envíos al país", sp: "↳ logística nacional", d: "Coordinamos con las mejores empresas de transporte para hacerte llegar tu producto." },
  ];
  return (
    <section id="capacidades" style={{ paddingBlock: "var(--section-y)" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", paddingInline: "var(--pad)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20, flexWrap: "wrap", paddingBottom: 28, borderBottom: "1px solid var(--line)", marginBottom: 8 }}>
          <h2 style={{ fontSize: "var(--fs-h3)", fontWeight: 200, letterSpacing: "-.035em" }}>Capacidades</h2>
          <span className="mono">[ 06 procesos · planta propia ]</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {rows.map((r) => (
            <CapabilityRow key={r.i} index={r.i} name={r.nm} spec={r.sp} description={r.d} />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--line)", marginTop: 48 }}>
          {[
            { v: "20", u: "+ años", l: "experiencia en acero" },
            { v: "12,7", u: "mm", l: "corte láser" },
            { v: "32", u: "mm", l: "corte plasma" },
            { v: "3", u: "m", l: "plegado CNC" },
          ].map((s) => (
            <div key={s.l} style={{ padding: "clamp(28px,3vw,48px) 0", borderBottom: "1px solid var(--line)" }}>
              <Stat value={s.v} unit={s.u} label={s.l} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
window.Capabilities = Capabilities;
