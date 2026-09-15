#!/usr/bin/env python3
"""
Saca la geometria vectorial de los 63 modelos del catalogo PDF.

Adentro del PDF cada pano esta dibujado como una trayectoria de recorte con
cientos o miles de segmentos: esa trayectoria ES el contorno del corte. La
sacamos a SVG, que es lo que despues consume lib/pattern.

No reemplaza a los DXF de produccion, pero alcanza y sobra para mostrarle al
cliente como queda, que es lo que hace esta app.

    python3 tools/extraer-catalogo.py catalogo.pdf public/modelos/
"""
import json
import re
import sys
from pathlib import Path

import pymupdf

# El filtro que importa es el TAMANO de la caja, no la cantidad de segmentos.
# Los modelos con mucho detalle vienen partidos en decenas de fragmentos sueltos
# de 3 a 57 segmentos cada uno, y un filtro por cantidad deja pasar alguno. Un
# pano de verdad mide unos 400 x 800 puntos en una hoja de 1080 x 1500; ningun
# fragmento llega a 30, asi que por tamano no hay ambiguedad.
MIN_LADO = 150
MIN_SEGMENTOS = 20


def bbox_de_items(items):
    xs, ys = [], []
    for it in items:
        for p in it[1:]:
            if isinstance(p, pymupdf.Point):
                xs.append(p.x); ys.append(p.y)
            elif isinstance(p, pymupdf.Rect):
                xs += [p.x0, p.x1]; ys += [p.y0, p.y1]
            elif isinstance(p, pymupdf.Quad):
                for q in (p.ul, p.ur, p.lr, p.ll):
                    xs.append(q.x); ys.append(q.y)
    if not xs:
        return None
    return (min(xs), min(ys), max(xs), max(ys))


def items_a_path(items):
    """Convierte los segmentos de PyMuPDF a datos de path de SVG."""
    partes = []
    actual = None  # ultimo punto dibujado

    def mover(p):
        nonlocal actual
        partes.append(f"M{p.x:.2f} {p.y:.2f}")
        actual = p

    for it in items:
        op = it[0]
        if op == "l":
            a, b = it[1], it[2]
            if actual is None or abs(a.x - actual.x) > 1e-6 or abs(a.y - actual.y) > 1e-6:
                mover(a)
            partes.append(f"L{b.x:.2f} {b.y:.2f}")
            actual = b
        elif op == "c":
            a, c1, c2, b = it[1], it[2], it[3], it[4]
            if actual is None or abs(a.x - actual.x) > 1e-6 or abs(a.y - actual.y) > 1e-6:
                mover(a)
            partes.append(f"C{c1.x:.2f} {c1.y:.2f} {c2.x:.2f} {c2.y:.2f} {b.x:.2f} {b.y:.2f}")
            actual = b
        elif op == "re":
            r = it[1]
            partes.append(
                f"M{r.x0:.2f} {r.y0:.2f}H{r.x1:.2f}V{r.y1:.2f}H{r.x0:.2f}Z"
            )
            actual = None
        elif op == "qu":
            q = it[1]
            partes.append(
                f"M{q.ul.x:.2f} {q.ul.y:.2f}L{q.ur.x:.2f} {q.ur.y:.2f}"
                f"L{q.lr.x:.2f} {q.lr.y:.2f}L{q.ll.x:.2f} {q.ll.y:.2f}Z"
            )
            actual = None
    return "".join(partes)


def modelos_de_pagina(page):
    """Devuelve [(nombre, centro_x)] leyendo las chapitas 'MODELO X.NN'."""
    encontrados = []
    datos = page.get_text("dict")
    for bloque in datos.get("blocks", []):
        for linea in bloque.get("lines", []):
            texto = "".join(s.get("text", "") for s in linea.get("spans", []))
            m = re.search(r"MODELO\s+([BOGA]\.\d+)", texto)
            if m:
                x0, _, x1, _ = linea["bbox"]
                encontrados.append((m.group(1), (x0 + x1) / 2))
    return encontrados


def validar(indice):
    """Un extractor que se equivoca en silencio es peor que uno que falla."""
    problemas = []
    if len(indice) != 63:
        problemas.append(f"se esperaban 63 modelos y salieron {len(indice)}")
    for m in indice:
        if m["ancho"] < MIN_LADO or m["alto"] < MIN_LADO:
            problemas.append(f"{m['id']}: caja chica ({m['ancho']:.0f} x {m['alto']:.0f})")
        prop = m["ancho"] / m["alto"]
        if not 0.2 <= prop <= 1.6:
            problemas.append(f"{m['id']}: proporcion rara ({prop:.2f})")
        # Un diseno rectilineo necesita pocos segmentos y es legitimo (A.35 son
        # rectangulos y le alcanzan 168). El guardian real es el tamano de la caja.
        if m["segmentos"] < 100:
            problemas.append(f"{m['id']}: pocos segmentos ({m['segmentos']})")
    return problemas


def main():
    pdf = Path(sys.argv[1] if len(sys.argv) > 1 else "catalogo.pdf")
    salida = Path(sys.argv[2] if len(sys.argv) > 2 else "public/modelos")
    salida.mkdir(parents=True, exist_ok=True)

    doc = pymupdf.open(pdf)
    indice = []
    vistos = set()

    for npag, page in enumerate(doc, start=1):
        etiquetas = modelos_de_pagina(page)
        if not etiquetas:
            continue

        panos = []
        for obj in page.get_drawings(extended=True):
            if obj["type"] != "clip":
                continue
            items = obj.get("items", [])
            if len(items) < MIN_SEGMENTOS:
                continue
            bb = bbox_de_items(items)
            if bb is None:
                continue
            if bb[2] - bb[0] < MIN_LADO or bb[3] - bb[1] < MIN_LADO:
                continue
            panos.append((bb, items))

        if not panos:
            continue

        # La chapita y su pano estan del mismo lado de la hoja, asi que se
        # emparejan por cercania horizontal. Cada pano se usa una sola vez.
        libres = list(panos)
        for nombre, cx in sorted(etiquetas, key=lambda e: e[1]):
            if nombre in vistos or not libres:
                continue
            libres.sort(key=lambda p: abs((p[0][0] + p[0][2]) / 2 - cx))
            bb, items = libres.pop(0)
            x0, y0, x1, y1 = bb
            ancho, alto = x1 - x0, y1 - y0
            if ancho <= 0 or alto <= 0:
                continue

            d = items_a_path(items)
            svg = (
                f'<svg xmlns="http://www.w3.org/2000/svg" '
                f'viewBox="{x0:.2f} {y0:.2f} {ancho:.2f} {alto:.2f}">'
                f'<path d="{d}" fill="#000" fill-rule="evenodd"/></svg>'
            )
            (salida / f"{nombre}.svg").write_text(svg)
            vistos.add(nombre)
            indice.append({
                "id": nombre,
                "linea": {"B": "botanicos", "O": "ornamentales",
                          "G": "geometricos", "A": "abstractos"}[nombre[0]],
                "archivo": f"{nombre}.svg",
                "ancho": round(ancho, 2),
                "alto": round(alto, 2),
                "segmentos": len(items),
                "pagina": npag,
            })

    indice.sort(key=lambda m: (m["linea"], int(m["id"].split(".")[1])))
    (salida / "indice.json").write_text(json.dumps(indice, indent=2, ensure_ascii=False))
    problemas = validar(indice)
    print(f"{len(indice)} modelos en {salida}")
    if problemas:
        print(f"\n  {len(problemas)} PROBLEMAS:")
        for t in problemas:
            print(f"    {t}")
    else:
        print("  sin anomalias")
    for linea in ("botanicos", "ornamentales", "geometricos", "abstractos"):
        ms = [m for m in indice if m["linea"] == linea]
        print(f"  {linea:14s} {len(ms):2d}  " + " ".join(m["id"] for m in ms))


if __name__ == "__main__":
    main()
