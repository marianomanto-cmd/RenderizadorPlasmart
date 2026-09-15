/* @ds-bundle: {"format":3,"namespace":"PlasmartDesignSystem_e9cdad","components":[{"name":"ArrowLink","sourcePath":"components/core/ArrowLink.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Kicker","sourcePath":"components/core/Kicker.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"CapabilityRow","sourcePath":"components/data/CapabilityRow.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"Stat","sourcePath":"components/surfaces/Stat.jsx"}],"sourceHashes":{"components/core/ArrowLink.jsx":"511f87ad9bd0","components/core/Button.jsx":"032f04243846","components/core/Icon.jsx":"945cfaf825ce","components/core/Kicker.jsx":"8a5836c93899","components/core/Tag.jsx":"4fe6fc7f8630","components/data/CapabilityRow.jsx":"7ff8ada33bc3","components/surfaces/Card.jsx":"e353b463c3a1","components/surfaces/Stat.jsx":"2d5244ba2a69","ui_kits/website/Applications.jsx":"940d93bc5541","ui_kits/website/Capabilities.jsx":"7acda732ffc7","ui_kits/website/Contact.jsx":"39955a0baf5b","ui_kits/website/Footer.jsx":"1095cf35fb80","ui_kits/website/Hero.jsx":"b63aeb4e8f9a","ui_kits/website/Manifesto.jsx":"fa6359e409d4","ui_kits/website/Nav.jsx":"f758160c83df","ui_kits/website/Projects.jsx":"cd7c51993842"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PlasmartDesignSystem_e9cdad = window.PlasmartDesignSystem_e9cdad || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/ArrowLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ArrowLink — the brand's mono, uppercase micro-link with a hairline that
 * extends on hover. Used for "Diseñemos tu fachada", "Ver proyectos", etc.
 */
function ArrowLink({
  children,
  href = "#",
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-mono)",
      fontSize: "var(--fs-mono)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: hover ? "var(--text)" : "var(--muted)",
      transition: "color .3s var(--ease)",
      textDecoration: "none",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", null, children), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: hover ? 46 : 28,
      height: 1,
      background: "currentColor",
      transition: "width .35s var(--ease)",
      flex: "0 0 auto"
    }
  }));
}
Object.assign(__ds_scope, { ArrowLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ArrowLink.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Plasmart icon set — inline SVG, 1.5px stroke, round caps, currentColor.
 * The brand uses a tiny, utilitarian set: arrows carry most of the meaning;
 * WhatsApp is the one filled brand glyph. Icons inherit text color.
 */

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const PATHS = {
  "arrow-right": /*#__PURE__*/React.createElement("g", STROKE, /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "12",
    x2: "21",
    y2: "12"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "14 5 21 12 14 19"
  })),
  "arrow-down": /*#__PURE__*/React.createElement("g", STROKE, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "3",
    x2: "12",
    y2: "21"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "5 14 12 21 19 14"
  })),
  "arrow-up-right": /*#__PURE__*/React.createElement("g", STROKE, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "18",
    x2: "18",
    y2: "6"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "8 6 18 6 18 16"
  })),
  download: /*#__PURE__*/React.createElement("g", STROKE, /*#__PURE__*/React.createElement("path", {
    d: "M12 3v12"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "7 10 12 15 17 10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 19h16"
  })),
  plus: /*#__PURE__*/React.createElement("g", STROKE, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "4",
    x2: "12",
    y2: "20"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "12",
    x2: "20",
    y2: "12"
  })),
  minus: /*#__PURE__*/React.createElement("g", STROKE, /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "12",
    x2: "20",
    y2: "12"
  })),
  close: /*#__PURE__*/React.createElement("g", STROKE, /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "5",
    x2: "19",
    y2: "19"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "19",
    y1: "5",
    x2: "5",
    y2: "19"
  })),
  whatsapp:
  /*#__PURE__*/
  // single filled brand glyph
  React.createElement("path", {
    fill: "currentColor",
    d: "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.38-.49.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.65.49.24.57.81 1.97.88 2.11.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.12.58.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.42.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.65-.14.27.1 1.69.8 1.98.94.29.14.48.22.55.34.07.12.07.7-.17 1.38z"
  })
};
function Icon({
  name = "arrow-right",
  size = 17,
  strokeWidth,
  style,
  ...rest
}) {
  const path = PATHS[name] || PATHS["arrow-right"];
  const isStroked = name !== "whatsapp";
  const g = strokeWidth && isStroked ? React.cloneElement(path, {
    strokeWidth
  }) : path;
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    "aria-hidden": "true",
    focusable: "false",
    style: {
      display: "block",
      flex: "0 0 auto",
      ...style
    }
  }, rest), g);
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Plasmart button — pill, hairline border, and the signature indigo "fill"
 * that slides up from the bottom on hover. Optional magnetic drift toward
 * the cursor (the brand's hero/contact CTAs). Sora medium.
 *
 * Variants: "solid" (near-white field → indigo fill), "outline" (transparent
 * → indigo fill), "ghost" (no border, text only).
 */
function Button({
  children,
  variant = "outline",
  size = "md",
  icon,
  // IconName | ReactNode — trailing glyph
  magnetic = false,
  as = "button",
  href,
  disabled = false,
  style,
  onMouseMove,
  onMouseLeave,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [offset, setOffset] = React.useState({
    x: 0,
    y: 0
  });
  const ref = React.useRef(null);
  const heights = {
    sm: 44,
    md: 58,
    lg: 66
  };
  const pads = {
    sm: "0 20px",
    md: "0 30px",
    lg: "0 38px"
  };
  const fonts = {
    sm: 13,
    md: 15,
    lg: 16
  };
  const h = heights[size] || heights.md;
  const isSolid = variant === "solid";
  const isGhost = variant === "ghost";
  const handleMove = e => {
    if (magnetic && ref.current && !disabled) {
      const r = ref.current.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.4;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.4;
      setOffset({
        x,
        y
      });
    }
    onMouseMove?.(e);
  };
  const handleLeave = e => {
    setHover(false);
    setOffset({
      x: 0,
      y: 0
    });
    onMouseLeave?.(e);
  };
  const baseColor = isSolid ? "var(--bg)" : "var(--text)";
  const textColor = disabled ? "var(--faint)" : hover && !isGhost ? "#fff" : isGhost && hover ? "var(--text)" : baseColor;
  const wrapStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    position: "relative",
    height: h,
    padding: isGhost ? 0 : pads[size] || pads.md,
    borderRadius: isGhost ? 0 : "var(--radius-pill)",
    fontFamily: "var(--font-display)",
    fontWeight: 500,
    fontSize: fonts[size] || fonts.md,
    letterSpacing: 0,
    lineHeight: 1,
    border: isGhost ? "none" : "1px solid",
    borderColor: isGhost ? "transparent" : disabled ? "var(--line)" : hover ? "var(--accent)" : isSolid ? "var(--text)" : "var(--line-2)",
    background: isGhost ? "transparent" : isSolid ? "var(--text)" : "transparent",
    color: textColor,
    cursor: disabled ? "not-allowed" : "pointer",
    overflow: "hidden",
    opacity: disabled ? 0.55 : 1,
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    transition: "color .3s var(--ease), border-color .3s var(--ease), transform .5s var(--ease)",
    textDecoration: "none",
    WebkitTapHighlightColor: "transparent",
    ...style
  };
  const fillStyle = {
    position: "absolute",
    inset: 0,
    background: "var(--accent)",
    borderRadius: "var(--radius-pill)",
    transform: hover && !disabled && !isGhost ? "translateY(0)" : "translateY(101%)",
    transition: "transform .5s var(--ease)",
    zIndex: 0
  };
  const iconEl = typeof icon === "string" ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === "sm" ? 14 : 17
  }) : icon;
  const Tag = href ? "a" : as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    ref: ref,
    href: href,
    style: wrapStyle,
    "aria-disabled": disabled || undefined,
    onMouseEnter: () => !disabled && setHover(true),
    onMouseMove: handleMove,
    onMouseLeave: handleLeave
  }, rest), !isGhost && /*#__PURE__*/React.createElement("span", {
    style: fillStyle,
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      zIndex: 1,
      display: "inline-flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", null, children), iconEl));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Kicker.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Kicker — the mono, uppercase, wide-tracked status line that sits above
 * headings. Optional glowing indigo "signal" dot at the left.
 */
function Kicker({
  children,
  dot = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--fs-mono-sm)",
      letterSpacing: "var(--ls-kicker)",
      textTransform: "uppercase",
      color: "var(--muted)",
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "var(--accent)",
      boxShadow: "0 0 10px var(--accent)",
      flex: "0 0 auto"
    }
  }), children);
}
Object.assign(__ds_scope, { Kicker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Kicker.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tag — a small mono pill/label. "outline" is a hairline chip; "accent"
 * tints indigo; "solid" is a filled near-white chip. For specs, statuses,
 * filters and metadata.
 */
function Tag({
  children,
  variant = "outline",
  style,
  ...rest
}) {
  const variants = {
    outline: {
      border: "1px solid var(--line-2)",
      color: "var(--muted)",
      background: "transparent"
    },
    accent: {
      border: "1px solid var(--accent)",
      color: "var(--accent)",
      background: "var(--accent-12)"
    },
    solid: {
      border: "1px solid var(--text)",
      color: "var(--bg)",
      background: "var(--text)"
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontFamily: "var(--font-mono)",
      fontSize: "var(--fs-mono-sm)",
      letterSpacing: ".1em",
      textTransform: "uppercase",
      padding: "5px 11px",
      borderRadius: "var(--radius-pill)",
      lineHeight: 1,
      whiteSpace: "nowrap",
      ...(variants[variant] || variants.outline),
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/CapabilityRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CapabilityRow — the brand's signature hover-reveal list row. A mono index,
 * a giant thin name (muted → text on hover), a description that fades in and
 * stays, and a mono spec on the right. On hover the row indents and an indigo
 * tick appears at the left edge.
 */
function CapabilityRow({
  index,
  name,
  spec,
  description,
  style,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  const [seen, setSeen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => {
      setH(true);
      setSeen(true);
    },
    onMouseLeave: () => setH(false),
    style: {
      position: "relative",
      display: "grid",
      gridTemplateColumns: "70px auto 1fr auto",
      alignItems: "center",
      gap: 24,
      padding: "32px 0",
      paddingLeft: h ? 28 : 0,
      borderBottom: "1px solid var(--line)",
      transition: "padding-left .5s var(--ease)",
      cursor: "default",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      left: 0,
      top: "50%",
      width: 12,
      height: 1,
      background: "var(--accent)",
      transform: h ? "scaleX(1)" : "scaleX(0)",
      transformOrigin: "left",
      transition: "transform .45s var(--ease)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: h ? "var(--accent)" : "var(--faint)",
      transition: "color .4s var(--ease)"
    }
  }, index), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 200,
      fontSize: "clamp(26px, 4vw, 60px)",
      letterSpacing: "-.03em",
      whiteSpace: "nowrap",
      color: h ? "var(--text)" : "var(--muted)",
      transition: "color .4s var(--ease)"
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      lineHeight: 1.45,
      color: "var(--muted)",
      maxWidth: "52ch",
      paddingLeft: 26,
      opacity: seen || h ? 1 : 0,
      transform: seen || h ? "none" : "translateY(4px)",
      transition: "opacity .55s var(--ease), transform .55s var(--ease)"
    }
  }, description), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--faint)",
      textAlign: "right",
      letterSpacing: ".08em"
    }
  }, spec));
}
Object.assign(__ds_scope, { CapabilityRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/CapabilityRow.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — Plasmart surface. A panel fill with a hairline border and a small
 * radius; depth comes from the line, not a shadow. Optional "image" header
 * (photo desaturated, resaturates on hover) and "hover" lift.
 */
function Card({
  children,
  image,
  // image URL for the top media well
  alt = "",
  aspect = "4/5",
  // media aspect ratio
  hover = true,
  padding = 24,
  style,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      background: "var(--panel)",
      border: "1px solid",
      borderColor: hover && h ? "var(--line-2)" : "var(--line)",
      borderRadius: "var(--radius-sm)",
      overflow: "hidden",
      transition: "border-color .4s var(--ease), transform .5s var(--ease)",
      transform: hover && h ? "translateY(-3px)" : "none",
      ...style
    }
  }, rest), image && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: aspect,
      overflow: "hidden",
      background: "var(--bg-2)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: alt,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      filter: h ? "none" : "grayscale(.3)",
      transform: h ? "scale(1.03)" : "scale(1)",
      transition: "filter .5s var(--ease), transform .7s var(--ease)"
    }
  })), children != null && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: typeof padding === "number" ? padding : padding
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Stat — giant thin Sora number with a mono indigo unit and a muted label.
 * The animated stats band uses these (20+ años · 12,7 mm · 32 mm · 3 m).
 * Argentine number format (comma decimal) — pass the value as a string.
 */
function Stat({
  value,
  unit,
  label,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 200,
      fontSize: "var(--fs-stat)",
      letterSpacing: "-.04em",
      lineHeight: 1,
      color: "var(--text)",
      display: "flex",
      alignItems: "baseline",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", null, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: ".22em",
      color: "var(--accent)",
      letterSpacing: ".05em"
    }
  }, unit)), label && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--muted)",
      fontSize: "var(--fs-xs)",
      marginTop: 6
    }
  }, label));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Stat.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Applications.jsx
try { (() => {
// Applications — auto-rotating accordion. The active panel expands (flex-grow),
// its image resaturates, body fades in; inactive panels show a vertical label.
// An indigo progress bar fills over each interval.
function Applications() {
  const {
    ArrowLink
  } = window.PlasmartDesignSystem_e9cdad;
  const panels = [{
    k: "01",
    v: "Arquitectura",
    img: "../../assets/app-arquitectura.webp",
    d: "Fachadas, cerramientos y escaleras que vuelven único un espacio, combinando tecnología de corte y diseño contemporáneo.",
    cta: "Diseñemos tu fachada"
  }, {
    k: "02",
    v: "Industria",
    img: "../../assets/app-industria.webp",
    d: "Corte y plegado de alta precisión para producción industrial, con procesos consistentes y más de 20 años de oficio.",
    cta: "Cotizar producción"
  }, {
    k: "03",
    v: "Paneles decorativos",
    img: "../../assets/app-paneles.webp",
    d: "Paños decorativos que elevan el estilo de cualquier ambiente, con una dosis de creatividad y modernidad, interior o exterior.",
    cta: "Ver proyectos"
  }];
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive(a => (a + 1) % panels.length), 5200);
    return () => clearInterval(id);
  }, [paused, panels.length]);

  // restart progress animation whenever the active panel changes
  React.useEffect(() => {
    setTick(t => t + 1);
  }, [active]);
  return /*#__PURE__*/React.createElement("section", {
    style: {
      paddingBlock: "var(--section-y)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--maxw)",
      margin: "0 auto",
      paddingInline: "var(--pad)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 20,
      flexWrap: "wrap",
      paddingBottom: 28,
      borderBottom: "1px solid var(--line)",
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--fs-h3)",
      fontWeight: 200,
      letterSpacing: "-.035em"
    }
  }, "Aplicaciones"), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "[ 03 campos \xB7 una planta ]")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      height: "clamp(440px,64vh,640px)"
    },
    onMouseLeave: () => setPaused(false)
  }, panels.map((p, i) => {
    const on = i === active;
    return /*#__PURE__*/React.createElement("div", {
      key: p.k,
      onMouseEnter: () => {
        setActive(i);
        setPaused(true);
      },
      style: {
        position: "relative",
        flex: on ? "4.4 1 0" : "1 1 0",
        minWidth: 0,
        overflow: "hidden",
        borderRadius: "var(--radius-sm)",
        cursor: on ? "default" : "pointer",
        background: "var(--panel)",
        transition: "flex-grow .8s var(--ease)"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: p.img,
      alt: p.v,
      style: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: on ? "scale(1)" : "scale(1.06)",
        filter: on ? "grayscale(.08) brightness(.82)" : "grayscale(.5) brightness(.5)",
        transition: "transform 1.2s var(--ease), filter .7s var(--ease)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(0deg, rgba(8,9,11,.94) 4%, rgba(8,9,11,.4) 55%, transparent 100%)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 30,
        gap: 16,
        opacity: on ? 0 : 1,
        pointerEvents: on ? "none" : "auto",
        transition: "opacity .35s var(--ease)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "var(--accent)"
      }
    }, p.k), /*#__PURE__*/React.createElement("span", {
      style: {
        writingMode: "vertical-rl",
        transform: "rotate(180deg)",
        fontWeight: 200,
        fontSize: "clamp(20px,1.6vw,26px)",
        letterSpacing: "-.02em",
        whiteSpace: "nowrap"
      }
    }, p.v)), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "clamp(26px,3vw,48px)",
        maxWidth: 620,
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(18px)",
        pointerEvents: on ? "auto" : "none",
        transition: "opacity .55s .12s var(--ease), transform .65s .12s var(--ease)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "var(--accent)",
        letterSpacing: ".12em"
      }
    }, p.k), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "clamp(30px,4vw,62px)",
        fontWeight: 200,
        letterSpacing: "-.04em",
        margin: "12px 0 14px"
      }
    }, p.v), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "#c9ced8",
        maxWidth: "44ch"
      }
    }, p.d), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20
      }
    }, /*#__PURE__*/React.createElement(ArrowLink, null, p.cta))), on && !paused && /*#__PURE__*/React.createElement("div", {
      key: tick,
      style: {
        position: "absolute",
        left: 0,
        bottom: 0,
        height: 2,
        background: "var(--accent)",
        boxShadow: "var(--glow-accent)",
        zIndex: 3,
        animation: "ap3prog 5200ms linear forwards"
      }
    }));
  }))), /*#__PURE__*/React.createElement("style", null, `@keyframes ap3prog { from { width: 0 } to { width: 100% } }`));
}
window.Applications = Applications;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Applications.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Capabilities.jsx
try { (() => {
// Capabilities — hover-reveal list (CapabilityRow) + an animated-looking stats band.
function Capabilities() {
  const {
    CapabilityRow,
    Stat
  } = window.PlasmartDesignSystem_e9cdad;
  const rows = [{
    i: "01",
    nm: "Corte láser",
    sp: "↳ hasta 12,7 mm",
    d: "Tecnología avanzada para cortes finos y detallados en acero, garantizando máxima calidad y exactitud hasta 12,7 mm."
  }, {
    i: "02",
    nm: "Corte plasma",
    sp: "↳ hasta 32 mm",
    d: "Trabajamos con materiales de calidad en espesores de hasta 32 mm."
  }, {
    i: "03",
    nm: "Plegado CNC",
    sp: "↳ hasta 3 m",
    d: "Máxima precisión en plegados de hasta 3 metros."
  }, {
    i: "04",
    nm: "Metalúrgica general",
    sp: "↳ servicios integrales",
    d: "20 años de experiencia en acero, resolviendo tu proyecto de punta a punta."
  }, {
    i: "05",
    nm: "Asesoramiento",
    sp: "↳ a medida",
    d: "Diseñadores a tu disposición para darle un toque único a tu espacio."
  }, {
    i: "06",
    nm: "Envíos al país",
    sp: "↳ logística nacional",
    d: "Coordinamos con las mejores empresas de transporte para hacerte llegar tu producto."
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "capacidades",
    style: {
      paddingBlock: "var(--section-y)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--maxw)",
      margin: "0 auto",
      paddingInline: "var(--pad)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 20,
      flexWrap: "wrap",
      paddingBottom: 28,
      borderBottom: "1px solid var(--line)",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--fs-h3)",
      fontWeight: 200,
      letterSpacing: "-.035em"
    }
  }, "Capacidades"), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "[ 06 procesos \xB7 planta propia ]")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, rows.map(r => /*#__PURE__*/React.createElement(CapabilityRow, {
    key: r.i,
    index: r.i,
    name: r.nm,
    spec: r.sp,
    description: r.d
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      borderTop: "1px solid var(--line)",
      marginTop: 48
    }
  }, [{
    v: "20",
    u: "+ años",
    l: "experiencia en acero"
  }, {
    v: "12,7",
    u: "mm",
    l: "corte láser"
  }, {
    v: "32",
    u: "mm",
    l: "corte plasma"
  }, {
    v: "3",
    u: "m",
    l: "plegado CNC"
  }].map(s => /*#__PURE__*/React.createElement("div", {
    key: s.l,
    style: {
      padding: "clamp(28px,3vw,48px) 0",
      borderBottom: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: s.v,
    unit: s.u,
    label: s.l
  }))))));
}
window.Capabilities = Capabilities;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Capabilities.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Contact.jsx
try { (() => {
// Contact — centered. Kicker, mega thin H2 with indigo final word, two CTAs,
// and a mono data line.
function Contact() {
  const {
    Kicker,
    Button
  } = window.PlasmartDesignSystem_e9cdad;
  return /*#__PURE__*/React.createElement("section", {
    id: "contacto",
    style: {
      paddingBlock: "clamp(100px,18vh,240px) clamp(60px,8vh,120px)",
      textAlign: "center",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--maxw)",
      margin: "0 auto",
      paddingInline: "var(--pad)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement(Kicker, null, "Hablemos de tu proyecto")), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--fs-display)",
      fontWeight: 200,
      letterSpacing: "-.05em",
      lineHeight: 0.9
    }
  }, "Construyamos", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent)"
    }
  }, "algo preciso.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "clamp(36px,5vw,60px)",
      display: "flex",
      justifyContent: "center",
      gap: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    icon: "arrow-right",
    magnetic: true
  }, "Ped\xED tu presupuesto"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    magnetic: true
  }, "Escribinos un mail")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "clamp(50px,7vw,90px)",
      display: "flex",
      justifyContent: "center",
      gap: "clamp(24px,5vw,70px)",
      flexWrap: "wrap",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      letterSpacing: ".06em",
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text)",
      fontWeight: 500
    }
  }, "WA"), " (351) 382 0321"), /*#__PURE__*/React.createElement("span", null, "ventasplasmart@transfil.com.ar"), /*#__PURE__*/React.createElement("span", null, "Francisco de Arteaga 2895, C\xF3rdoba"), /*#__PURE__*/React.createElement("span", null, "Lun\u2013Vie 08\u201317 h"))));
}
window.Contact = Contact;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Contact.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Footer.jsx
try { (() => {
// Footer — infinite marquee, big logo, link columns, copyright bottom.
function Footer() {
  const marq = "Pedí tu presupuesto · Corte de acero · Córdoba · AR · ";
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: "1px solid var(--line)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "26px 0",
      borderBottom: "1px solid var(--line)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 50,
      width: "max-content",
      animation: "footmarq 26s linear infinite"
    }
  }, [0, 1].map(k => /*#__PURE__*/React.createElement("span", {
    key: k,
    style: {
      fontSize: "clamp(28px,4vw,56px)",
      fontWeight: 200,
      letterSpacing: "-.03em",
      color: "var(--muted)",
      whiteSpace: "nowrap"
    }
  }, marq, marq)))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--maxw)",
      margin: "0 auto",
      paddingInline: "var(--pad)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 30,
      flexWrap: "wrap",
      padding: "clamp(40px,5vw,70px) 0 26px"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/plasmart-logo-white.png",
    alt: "Plasmart",
    style: {
      height: "clamp(40px,7vw,84px)",
      width: "auto"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "clamp(30px,5vw,70px)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: ".14em",
      textTransform: "uppercase",
      color: "var(--faint)",
      marginBottom: 14
    }
  }, "\xCDndice"), ["Aplicaciones", "Capacidades", "Proyectos", "Contacto"].map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      display: "block",
      color: "var(--muted)",
      fontSize: 14,
      padding: "4px 0"
    }
  }, l))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: ".14em",
      textTransform: "uppercase",
      color: "var(--faint)",
      marginBottom: 14
    }
  }, "Seguinos"), ["Instagram", "Facebook", "LinkedIn", "WhatsApp"].map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      display: "block",
      color: "var(--muted)",
      fontSize: 14,
      padding: "4px 0"
    }
  }, l))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
      padding: "18px 0 30px",
      borderTop: "1px solid var(--line)",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: ".08em",
      color: "var(--faint)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Plasmart"), /*#__PURE__*/React.createElement("span", null, "Francisco de Arteaga 2895, C\xF3rdoba \xB7 AR"))), /*#__PURE__*/React.createElement("style", null, `@keyframes footmarq { to { transform: translateX(-50%) } }`));
}
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Hero.jsx
try { (() => {
// Hero — full-viewport, content bottom-aligned. Kicker, giant thin H1 with the
// indigo accent phrase, two magnetic CTAs, and a mono services line + scroll cue.
function Hero() {
  const {
    Kicker,
    Button
  } = window.PlasmartDesignSystem_e9cdad;
  return /*#__PURE__*/React.createElement("section", {
    id: "top",
    style: {
      position: "relative",
      minHeight: "100svh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      padding: "0 var(--pad) clamp(40px,7vh,80px)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/arq-fachada.webp",
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity: 0.4,
      filter: "grayscale(.25)",
      transform: "scale(1.04)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, rgba(8,9,11,.55) 0%, rgba(8,9,11,.12) 32%, rgba(8,9,11,.32) 60%, rgba(8,9,11,.9) 90%, var(--bg) 100%)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 2,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 20,
      flexWrap: "wrap",
      marginBottom: "clamp(30px,6vh,80px)"
    }
  }, /*#__PURE__*/React.createElement(Kicker, null, "C\xF3rdoba \xB7 AR \u2014 Desde 2006"), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "N\xBA/ 03 \u2014 Signal")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontWeight: 200,
      fontSize: "var(--fs-hero)",
      lineHeight: 0.94,
      letterSpacing: "-.04em",
      maxWidth: "16ch",
      color: "var(--text)",
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block"
    }
  }, "Precisi\xF3n y"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block"
    }
  }, "tecnolog\xEDa en"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      color: "var(--accent)"
    }
  }, "corte de acero")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 14,
      marginTop: "clamp(34px,4vw,54px)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    icon: "arrow-right",
    magnetic: true
  }, "Ped\xED tu presupuesto"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    icon: "download",
    magnetic: true
  }, "Descargar cat\xE1logo")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 24,
      flexWrap: "wrap",
      marginTop: "clamp(28px,4vw,48px)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      maxWidth: "30ch"
    }
  }, "Corte l\xE1ser \xB7 plasma \xB7 plegado CNC \xB7 metal\xFArgica general"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11
    }
  }, "Scroll"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 50,
      background: "linear-gradient(var(--accent), transparent)"
    }
  })))));
}
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Manifesto.jsx
try { (() => {
// Manifesto — large thin statement; on the site words scrub gray→white→indigo
// on scroll. Here it shows the resolved (final) state.
function Manifesto() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      paddingBlock: "var(--section-y-lg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--maxw)",
      margin: "0 auto",
      paddingInline: "var(--pad)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-mani)",
      fontWeight: 200,
      lineHeight: 1.12,
      letterSpacing: "-.03em",
      maxWidth: "22ch",
      color: "var(--text)"
    }
  }, "Unimos ingenier\xEDa y dise\xF1o para fabricar exactamente la pieza que tu proyecto necesita.", " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent)"
    }
  }, "Con precisi\xF3n absoluta."))));
}
window.Manifesto = Manifesto;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Manifesto.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Nav.jsx
try { (() => {
// Nav — fixed top bar. Logo (white wordmark), center links, WhatsApp CTA.
// Goes from mix-blend / transparent to a blurred space-black bar once scrolled.
function Nav({
  scrolled
}) {
  const {
    Icon
  } = window.PlasmartDesignSystem_e9cdad;
  const links = ["Aplicaciones", "Capacidades", "Proyectos", "Contacto"];
  return /*#__PURE__*/React.createElement("header", {
    style: {
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
      transition: "all .35s var(--ease)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    style: {
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/plasmart-logo-white.png",
    alt: "Plasmart",
    style: {
      height: 30,
      width: "auto"
    }
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: 30
    },
    className: "nav-mid"
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      fontSize: 14,
      color: "#fff",
      opacity: 0.7,
      transition: "opacity .3s"
    },
    onMouseEnter: e => e.currentTarget.style.opacity = 1,
    onMouseLeave: e => e.currentTarget.style.opacity = 0.7
  }, l))), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      color: "#fff",
      borderBottom: "1px solid var(--accent)",
      paddingBottom: 3,
      display: "inline-flex",
      alignItems: "center",
      gap: 7
    }
  }, "Presupuesto ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 13
  })));
}
window.Nav = Nav;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Nav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Projects.jsx
try { (() => {
// Projects — 3-column grid; on the site each column parallaxes at its own speed.
// Cards are grayscale, resaturate + lift on hover; caption shows only number + name.
function Projects() {
  const {
    Card
  } = window.PlasmartDesignSystem_e9cdad;
  const imgs = ["portfolio-cuad-02", "portfolio-cuad-06", "portfolio-cuad-08", "portfolio-cuad-12", "portfolio-cuad-13", "portfolio-cuad-15", "arq-escalera", "arq-pergola", "arq-porton", "arq-revestimiento", "ind-plegadora", "ind-serie"];
  const names = ["Gómez", "Arévalo", "Follis", "Campi", "Bianchi", "Pérez", "Arrutia", "Marchetti", "López", "Uano", "Benavidez", "Soto"];
  const items = imgs.map((f, i) => ({
    img: `../../assets/${f}.webp`,
    nm: names[i],
    n: String(i + 1).padStart(2, "0")
  }));
  const cols = [[], [], []];
  items.forEach((it, i) => cols[i % 3].push(it));
  return /*#__PURE__*/React.createElement("section", {
    id: "trabajo",
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "clamp(60px,8vh,120px) var(--pad) 40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 20,
      flexWrap: "wrap",
      maxWidth: "var(--maxw)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--fs-h1)",
      fontWeight: 200,
      letterSpacing: "-.035em",
      lineHeight: 0.98
    }
  }, "Proyectos de", /*#__PURE__*/React.createElement("br", null), "nuestros clientes"), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "18 registros")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "clamp(16px,2vw,30px)",
      maxWidth: "var(--maxw)",
      margin: "0 auto",
      padding: "20px var(--pad) clamp(40px,6vw,90px)",
      alignItems: "start"
    }
  }, cols.map((col, ci) => /*#__PURE__*/React.createElement("div", {
    key: ci,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "clamp(16px,2vw,30px)",
      marginTop: ci === 1 ? "clamp(40px,8vw,130px)" : 0
    }
  }, col.map(it => /*#__PURE__*/React.createElement(Card, {
    key: it.n,
    image: it.img,
    aspect: "4/5",
    padding: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      letterSpacing: ".06em"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text)",
      textTransform: "uppercase"
    }
  }, it.n, " \xB7 ", it.nm))))))));
}
window.Projects = Projects;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Projects.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ArrowLink = __ds_scope.ArrowLink;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Kicker = __ds_scope.Kicker;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.CapabilityRow = __ds_scope.CapabilityRow;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Stat = __ds_scope.Stat;

})();
