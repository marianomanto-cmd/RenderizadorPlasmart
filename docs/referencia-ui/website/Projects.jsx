// Projects — 3-column grid; on the site each column parallaxes at its own speed.
// Cards are grayscale, resaturate + lift on hover; caption shows only number + name.
function Projects() {
  const { Card } = window.PlasmartDesignSystem_e9cdad;
  const imgs = [
    "portfolio-cuad-02", "portfolio-cuad-06", "portfolio-cuad-08",
    "portfolio-cuad-12", "portfolio-cuad-13", "portfolio-cuad-15",
    "arq-escalera", "arq-pergola", "arq-porton",
    "arq-revestimiento", "ind-plegadora", "ind-serie",
  ];
  const names = ["Gómez", "Arévalo", "Follis", "Campi", "Bianchi", "Pérez", "Arrutia", "Marchetti", "López", "Uano", "Benavidez", "Soto"];
  const items = imgs.map((f, i) => ({ img: `../../assets/${f}.webp`, nm: names[i], n: String(i + 1).padStart(2, "0") }));
  const cols = [[], [], []];
  items.forEach((it, i) => cols[i % 3].push(it));

  return (
    <section id="trabajo" style={{ position: "relative" }}>
      <div style={{ padding: "clamp(60px,8vh,120px) var(--pad) 40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap", maxWidth: "var(--maxw)", margin: "0 auto" }}>
        <h2 style={{ fontSize: "var(--fs-h1)", fontWeight: 200, letterSpacing: "-.035em", lineHeight: 0.98 }}>
          Proyectos de<br />nuestros clientes
        </h2>
        <span className="mono">18 registros</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(16px,2vw,30px)", maxWidth: "var(--maxw)", margin: "0 auto", padding: "20px var(--pad) clamp(40px,6vw,90px)", alignItems: "start" }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: "clamp(16px,2vw,30px)", marginTop: ci === 1 ? "clamp(40px,8vw,130px)" : 0 }}>
            {col.map((it) => (
              <Card key={it.n} image={it.img} aspect="4/5" padding={14}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".06em" }}>
                  <span style={{ color: "var(--text)", textTransform: "uppercase" }}>{it.n} · {it.nm}</span>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
window.Projects = Projects;
