// Manifesto — large thin statement; on the site words scrub gray→white→indigo
// on scroll. Here it shows the resolved (final) state.
function Manifesto() {
  return (
    <section style={{ paddingBlock: "var(--section-y-lg)" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", paddingInline: "var(--pad)" }}>
        <p style={{ fontSize: "var(--fs-mani)", fontWeight: 200, lineHeight: 1.12, letterSpacing: "-.03em", maxWidth: "22ch", color: "var(--text)" }}>
          Unimos ingeniería y diseño para fabricar exactamente la pieza que tu proyecto necesita.{" "}
          <span style={{ color: "var(--accent)" }}>Con precisión absoluta.</span>
        </p>
      </div>
    </section>
  );
}
window.Manifesto = Manifesto;
