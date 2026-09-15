// Applications — auto-rotating accordion. The active panel expands (flex-grow),
// its image resaturates, body fades in; inactive panels show a vertical label.
// An indigo progress bar fills over each interval.
function Applications() {
  const { ArrowLink } = window.PlasmartDesignSystem_e9cdad;
  const panels = [
    { k: "01", v: "Arquitectura", img: "../../assets/app-arquitectura.webp",
      d: "Fachadas, cerramientos y escaleras que vuelven único un espacio, combinando tecnología de corte y diseño contemporáneo.", cta: "Diseñemos tu fachada" },
    { k: "02", v: "Industria", img: "../../assets/app-industria.webp",
      d: "Corte y plegado de alta precisión para producción industrial, con procesos consistentes y más de 20 años de oficio.", cta: "Cotizar producción" },
    { k: "03", v: "Paneles decorativos", img: "../../assets/app-paneles.webp",
      d: "Paños decorativos que elevan el estilo de cualquier ambiente, con una dosis de creatividad y modernidad, interior o exterior.", cta: "Ver proyectos" },
  ];
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % panels.length), 5200);
    return () => clearInterval(id);
  }, [paused, panels.length]);

  // restart progress animation whenever the active panel changes
  React.useEffect(() => { setTick((t) => t + 1); }, [active]);

  return (
    <section style={{ paddingBlock: "var(--section-y)" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", paddingInline: "var(--pad)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20, flexWrap: "wrap", paddingBottom: 28, borderBottom: "1px solid var(--line)", marginBottom: 28 }}>
          <h2 style={{ fontSize: "var(--fs-h3)", fontWeight: 200, letterSpacing: "-.035em" }}>Aplicaciones</h2>
          <span className="mono">[ 03 campos · una planta ]</span>
        </div>

        <div style={{ display: "flex", gap: 12, height: "clamp(440px,64vh,640px)" }}
             onMouseLeave={() => setPaused(false)}>
          {panels.map((p, i) => {
            const on = i === active;
            return (
              <div
                key={p.k}
                onMouseEnter={() => { setActive(i); setPaused(true); }}
                style={{
                  position: "relative", flex: on ? "4.4 1 0" : "1 1 0", minWidth: 0,
                  overflow: "hidden", borderRadius: "var(--radius-sm)", cursor: on ? "default" : "pointer",
                  background: "var(--panel)", transition: "flex-grow .8s var(--ease)",
                }}
              >
                <img src={p.img} alt={p.v} style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                  transform: on ? "scale(1)" : "scale(1.06)",
                  filter: on ? "grayscale(.08) brightness(.82)" : "grayscale(.5) brightness(.5)",
                  transition: "transform 1.2s var(--ease), filter .7s var(--ease)",
                }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(8,9,11,.94) 4%, rgba(8,9,11,.4) 55%, transparent 100%)" }} />

                {/* vertical tab (inactive) */}
                <div style={{
                  position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "flex-end", paddingBottom: 30, gap: 16,
                  opacity: on ? 0 : 1, pointerEvents: on ? "none" : "auto", transition: "opacity .35s var(--ease)",
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>{p.k}</span>
                  <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontWeight: 200, fontSize: "clamp(20px,1.6vw,26px)", letterSpacing: "-.02em", whiteSpace: "nowrap" }}>{p.v}</span>
                </div>

                {/* body (active) */}
                <div style={{
                  position: "absolute", left: 0, right: 0, bottom: 0, padding: "clamp(26px,3vw,48px)",
                  maxWidth: 620, opacity: on ? 1 : 0, transform: on ? "none" : "translateY(18px)",
                  pointerEvents: on ? "auto" : "none", transition: "opacity .55s .12s var(--ease), transform .65s .12s var(--ease)",
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", letterSpacing: ".12em" }}>{p.k}</div>
                  <h3 style={{ fontSize: "clamp(30px,4vw,62px)", fontWeight: 200, letterSpacing: "-.04em", margin: "12px 0 14px" }}>{p.v}</h3>
                  <p style={{ color: "#c9ced8", maxWidth: "44ch" }}>{p.d}</p>
                  <div style={{ marginTop: 20 }}><ArrowLink>{p.cta}</ArrowLink></div>
                </div>

                {/* progress bar */}
                {on && !paused && (
                  <div key={tick} style={{ position: "absolute", left: 0, bottom: 0, height: 2, background: "var(--accent)", boxShadow: "var(--glow-accent)", zIndex: 3, animation: "ap3prog 5200ms linear forwards" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes ap3prog { from { width: 0 } to { width: 100% } }`}</style>
    </section>
  );
}
window.Applications = Applications;
