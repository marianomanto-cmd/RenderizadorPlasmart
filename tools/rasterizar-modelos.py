#!/usr/bin/env python3
"""
Convierte cada modelo SVG a una mascara en blanco y negro y mide su area libre.

Se hace una sola vez, aca, y no en el telefono: los 63 modelos no cambian
nunca, asi que rasterizarlos en cada arranque seria trabajo repetido. La app
recibe mascaras ya hechas, que ademas es lo que le permite andar sin señal.

La mascara es la misma cosa que sirve para cuatro trabajos distintos:
  - el render, que la consulta por pixel (un modulo y un indice, sin geometria)
  - el area libre, que es contar
  - el color del campo lejano, cuando un pixel de pantalla cubre muchos agujeros
  - el oraculo de fidelidad de la fase 2

Blanco = agujero, negro = metal.
"""
import io
import json
import sys
from pathlib import Path

import cairosvg
from PIL import Image

LADO_LARGO = 2048


def miniaturas(carpeta, indice, alto=200):
    """Miniaturas chicas para el selector de modelos de la app.

    Blanco sobre transparente: asi la miniatura se ve igual que el pano sobre la
    foto, metal claro y agujeros que dejan pasar el fondo, y encima pesa nada.
    """
    destino = carpeta / "thumbs"
    destino.mkdir(exist_ok=True)
    for m in indice:
        png = cairosvg.svg2png(
            url=str(carpeta / m["archivo"]),
            output_height=alto,
            output_width=max(1, round(alto * m["ancho"] / m["alto"])),
        )
        im = Image.open(io.BytesIO(png)).convert("LA")
        # el SVG pinta el metal de negro; en la app el metal es claro
        canal_a = im.split()[1]
        salida = Image.merge("LA", (Image.new("L", im.size, 255), canal_a))
        salida.save(destino / f"{m['id']}.png", optimize=True)
        m["thumb"] = f"thumbs/{m['id']}.png"


def main():
    carpeta = Path(sys.argv[1] if len(sys.argv) > 1 else "public/modelos")
    indice = json.loads((carpeta / "indice.json").read_text())
    destino = carpeta / "mascaras"
    destino.mkdir(exist_ok=True)

    for m in indice:
        prop = m["ancho"] / m["alto"]
        if prop >= 1:
            w, h = LADO_LARGO, max(1, round(LADO_LARGO / prop))
        else:
            w, h = max(1, round(LADO_LARGO * prop)), LADO_LARGO

        png = cairosvg.svg2png(
            url=str(carpeta / m["archivo"]),
            output_width=w, output_height=h,
            background_color="white",
        )
        gris = Image.open(io.BytesIO(png)).convert("L")

        # Con suavizado, los pixeles del borde valen la fraccion que cubren, asi
        # que el promedio da el area libre con precision de sub-pixel. Contar
        # pixeles a secas tiene un sesgo que crece con el perimetro, y estos
        # modelos tienen mucho perimetro.
        suma = sum(gris.getdata())
        area_libre = suma / (255 * w * h)

        binaria = gris.point(lambda v: 255 if v >= 128 else 0).convert("1")
        binaria.save(destino / f"{m['id']}.png", optimize=True)

        # Ademas del PNG (que sirve para mirar), un binario crudo de un bit por
        # pixel. Node y el navegador lo leen sin decodificador de imagenes, asi
        # que lib/pattern queda pura y la app no depende de canvas para cargar
        # el catalogo. Bit en 1 = metal.
        bits = bytearray((w * h + 7) // 8)
        datos = binaria.load()
        for iy in range(h):
            fila = iy * w
            for ix in range(w):
                if datos[ix, iy] == 0:  # negro = metal
                    i = fila + ix
                    bits[i >> 3] |= 128 >> (i & 7)
        (destino / f"{m['id']}.bin").write_bytes(bytes(bits))

        # Cada modelo trae su propio marco macizo. Si se repite el dibujo tal
        # cual, se repite el marco y aparece una grilla de lineas negras: parece
        # una pared de azulejos y no un pano. Asi que se mide el marco una vez
        # aca y se guarda, para que el modo mosaico pueda repetir SOLO el
        # interior y poner un unico marco alrededor de todo.
        # Con tolerancia: pedir que la fila sea 100% metal es fragil, porque el
        # suavizado del borde exterior deja algun pixel a medias y un solo pixel
        # tira la fila entera. 99% distingue igual de bien un marco macizo de una
        # fila con dibujo, y no se rompe con un artefacto.
        px = binaria.load()
        TOL = 0.99
        def fila_maciza(iy):
            return sum(1 for ix in range(w) if px[ix, iy] == 0) >= w * TOL
        def col_maciza(ix):
            return sum(1 for iy in range(h) if px[ix, iy] == 0) >= h * TOL
        arriba = next((k for k in range(h // 4) if not fila_maciza(k)), h // 4)
        abajo = next((k for k in range(h // 4) if not fila_maciza(h - 1 - k)), h // 4)
        izq = next((k for k in range(w // 4) if not col_maciza(k)), w // 4)
        der = next((k for k in range(w // 4) if not col_maciza(w - 1 - k)), w // 4)
        # Se toma el maximo de los lados opuestos: un marco es simetrico por
        # construccion, asi que si un lado detecta y el otro no, el que fallo es
        # la deteccion (un pixel del borde que quedo a medias), no el dibujo.
        mh = max(izq, der)
        mv = max(arriba, abajo)
        m["interior"] = {
            "x0": round(mh / w, 5), "x1": round((w - mh) / w, 5),
            "y0": round(mv / h, 5), "y1": round((h - mv) / h, 5),
        }
        m["mascara"] = f"mascaras/{m['id']}.bin"
        m["mascaraPng"] = f"mascaras/{m['id']}.png"
        m["mascaraAncho"] = w
        m["mascaraAlto"] = h
        m["areaLibre"] = round(area_libre, 4)

    miniaturas(carpeta, indice)
    (carpeta / "indice.json").write_text(json.dumps(indice, indent=2, ensure_ascii=False))

    print(f"{len(indice)} mascaras de {LADO_LARGO} px de lado largo\n")
    print("AREA LIBRE por modelo")
    for linea in ("botanicos", "ornamentales", "geometricos", "abstractos"):
        ms = sorted((m for m in indice if m["linea"] == linea), key=lambda m: m["areaLibre"])
        print(f"\n  {linea}:")
        for m in ms:
            barra = "#" * round(m["areaLibre"] * 40)
            print(f"    {m['id']:6s} {m['areaLibre'] * 100:5.1f}%  {barra}")
    todos = [m["areaLibre"] for m in indice]
    print(f"\n  minimo {min(todos)*100:.1f}%   maximo {max(todos)*100:.1f}%   "
          f"promedio {sum(todos)/len(todos)*100:.1f}%")


if __name__ == "__main__":
    main()


