# Decisiones

Registro de lo acordado. Si algo de acá cambia, se edita este archivo en el
mismo commit que cambia el código.

---

## Qué es esto

Herramienta para el vendedor de Plasmart, parado frente a una casa, con el
cliente al lado. Saca la foto del frente, marca cuatro esquinas, elige un modelo
del catálogo y ve el paño puesto sobre la foto.

**Muestra cómo queda. No cotiza.** Si el trabajo se confirma, después viene una
medición formal y un presupuesto detallado. Los números que muestra la app son
orientativos y se rotulan como tales.

El determinismo del render igual importa, pero por otro motivo del que decía el
brief: no es que la máquina vaya a cortar mal, para eso está la medición formal.
Es que si el mismo frente da dos renders distintos en dos visitas, el vendedor
queda como que improvisa. **Lo que protege el determinismo es que le crean.**

---

## Decisiones acordadas

| # | Tema | Decisión |
|---|------|----------|
| 1 | Teléfonos | Sin definir, así que se diseña para el caso exigente (iPhone): el render **se comparte**, no se descarga; la app se instala en la pantalla de inicio; se pide permiso de almacenamiento persistente |
| 2 | Usuarios | 1 a 3 vendedores. Sin panel de administración |
| 3 | Ingreso | Google con cuenta de empresa, restringido por dominio y **validado en el servidor** |
| 4 | Sesión | Lo más larga posible. Si se pierde un teléfono, se suspende la cuenta en Google |
| 5 | Visibilidad | Todos ven todo. Igual se guarda `creado_por` en cada registro |
| 6 | Conflictos | Gana el último en sincronizar, **con aviso** de que otro también lo tocó. Requiere `updated_at` en todas las tablas |
| 7 | Borrado | Real con confirmación para el usuario. Por dentro es una marca `deleted_at` con purga a 30 días, porque es la única forma de que no reaparezca solo al sincronizar |
| 8 | Volumen | Menos de 10 obras por mes. Entra todo en el teléfono para siempre: sin desalojo, sin paginación |
| 9 | Catálogo | Sale del PDF oficial. 63 modelos en 4 líneas |
| 10 | Paso y abertura | `paso` = centro a centro, `abertura` = ancho del agujero. **Ver el hallazgo de abajo: casi no aplica** |
| 11 | Borde | Macizo sin perforar, 30 mm por defecto, ajustable por modelo |
| 12 | Chapa | 1000 × 2000 mm por defecto, y 1220 × 2440 mm |
| 13 | Números en pantalla | Los cuatro a la vista (superficie, área libre, peso, chapas y recorte), rotulados "estimado" |
| 14 | Color | Es el material, no un dato aparte |
| 15 | Paños por foto | Uno en pantalla. El modelo de datos y la matemática soportan varios desde el día uno |

### Unidades

Adentro todo en milímetros. **El vendedor carga en centímetros**, porque es la
unidad que Plasmart ya le pide al cliente por WhatsApp ("envianos fotos y
medidas en centímetros"). El brief decía metros; manda el negocio.

### Materiales

Acero, acero inoxidable y chapa galvanizada, de 1,25 a 25,4 mm. Plegado hasta
3 m de largo. **No aparece el aluminio**, que el brief sí mencionaba. Pendiente
de confirmar.

---

## Hallazgo: el catálogo no es chapa perforada

El brief asumía paños de chapa perforada: una grilla regular de agujeros
definida por `paso_mm` y `abertura_mm`. **El catálogo real es otra cosa.**

Son 63 modelos de **corte decorativo**, repartidos en cuatro líneas:

| Línea | Modelos | Ejemplo |
|-------|---------|---------|
| Botánicos | 16 | B.01: composición orgánica de hojas |
| Ornamentales | 3 | O.01 |
| Geométricos | 18 | G.01: galones; G.02: laberinto |
| Abstractos | 26 | A.01 |

Son **obras de arte cortadas**, no grillas de perforación. Un B.01 no tiene paso
ni abertura: tiene hojas.

### Qué NO cambia

- `lib/geometry` — **nada**. La homografía no sabe ni le importa qué hay adentro
  del paño. El incremento 1 quedó terminado tal cual estaba planeado.
- `lib/render` — el deformado es idéntico. Cambia de dónde saca el dibujo.
- `lib/takeoff` — superficie, peso, chapas y recorte siguen igual.
- Todo lo de offline, sincronización, cuentas y permisos.

### Qué sí cambia

- `lib/pattern` deja de **generar** patrones por parámetros y pasa a **cargar**
  el dibujo del modelo.
- La fuente de verdad son los archivos vectoriales que Plasmart **ya tiene**,
  porque son los que manda a cortar. El brief ponía el DXF como extensión
  futura; es el origen principal.
- En el modelo de datos, `paso_mm` y `abertura_mm` se reemplazan por
  `modelo_id` + escala + modo de ajuste.
- El área libre deja de calcularse por celda y pasa a medirse una vez por
  modelo y guardarse en el catálogo. Sale más barato y más exacto.

### Resuelto: los tres modos están implementados y se pueden ver

Se implementaron los tres y se compararon corriendo el código real, no una
maqueta. Resultado:

| Modo | Veredicto |
|------|-----------|
| `estirar` | **Nunca sirve.** Deforma: las hojas quedan aplastadas y los cuadrados de G.13 se vuelven rectángulos. Queda implementado pero no es el que va por defecto |
| `mosaico` | **El mejor para los orgánicos.** B.01 fluye continuo a lo largo de todo el paño. Requirió un arreglo, abajo |
| `recortar` | **Siempre funciona.** Nunca deforma ni deja costuras, pero en un paño 3:1 el motivo queda gigante. Bueno cuando se busca justamente eso |

En los geométricos rígidos, `mosaico` deja costuras verticales tenues. No es un
bug: esos dibujos no son periódicos, el motivo está centrado en su paño. Los
orgánicos repiten limpio.

**Recomendación:** `mosaico` por defecto, con control de escala para que el
vendedor elija el tamaño del motivo, y `recortar` a un toque para el efecto
grande. `estirar` no debería ser nunca el valor por defecto.

### Hallazgo: cada modelo trae su propio marco, y repetirlo rompe el mosaico

54 de los 63 modelos vienen con un marco macizo dibujado, de un 5,5% del ancho
en la mediana. Repetir el dibujo tal cual repite ese marco, y el paño aparece
cruzado por una grilla de líneas negras: parece una pared de azulejos.

La solución es la que aplicaría a mano el que prepara el archivo de corte:
**repetir solo el interior del dibujo y poner un único marco alrededor de todo
el paño**, de los 30 mm que se decidieron. El grosor del marco de cada modelo se
mide una vez al construir el catálogo y queda guardado en el índice.

### Pregunta que sigue abierta

Cuando un cliente pide un B.01 de 2,40 × 1,10 m, **¿qué pasa con el dibujo?**
En el catálogo el B.01 se muestra vertical y en la foto de aplicación es una
baranda larga y horizontal con las hojas fluyendo a lo ancho. O sea que alguien
**recompone el dibujo para cada trabajo**.

Si es así, la app no puede predecir el resultado exacto, y está bien: para
mostrarle al cliente alcanza con que se vea fiel, y el ajuste fino se hace en la
medición formal. Pero hay que elegir qué hace la app, y son tres cosas distintas:

1. **Estirar** el dibujo hasta llenar el paño (deforma las hojas).
2. **Escalar** manteniendo la proporción y repetir en mosaico (no deforma, pero
   se ven las costuras).
3. **Escalar** manteniendo la proporción y recortar (no deforma y no hay
   costuras, pero se pierde parte de la composición).

---

## Sistema de diseño

Sacado del PDF del catálogo.

| Rol | Valor |
|-----|-------|
| Dorado de marca | `#B9802E` |
| Gris de fondo | `#DEDEDF` |
| Negro | `#000000` |
| Blanco | `#FFFFFF` |
| Tipografía principal | Barlow Condensed (Regular y Bold), gratis en Google Fonts |
| Tipografía de acento | Bodoni MT Condensed Bold Italic, solo para la palabra "Línea" |

Tono: limpio, mucho aire, los paños siempre en negro sobre gris claro.

---

## Fotos de referencia

Tres casos, de fácil a exigente:

1. **Frente de hormigón, tarde.** Foto real, casi de frente, luz cálida dura.
   Dos arbolitos delante del portón.
2. **Render de arquitecto, 16:9.** Casi de frente, luz pareja, sin ruido ni
   deformación de lente. El caso más fácil de punta a punta.
3. **Galería vidriada, mediodía.** Foto real **en ángulo**, con fuga fuerte y
   sombras duras. El caso exigente.

Las tres primeras están **casi de frente**, porque el vendedor se para enfrente
de la casa y saca derecho. De ahí salen dos decisiones:

- Los cuatro puntos arrancan como un rectángulo: casi siempre van a estar cerca.
- El caso "casi paralelogramo" es el **caso normal**, no un borde raro. Ver
  abajo.

### Obstáculos delante del paño

En las tres fotos hay algo tapando: arbolitos, autos, un árbol. Si el vendedor
marca el portón, el patrón se dibuja **encima del tronco** y el árbol desaparece.

**No se resuelve en la fase 1.** Por ahora el vendedor encuadra esquivando. La
solución real es un borrador con el dedo para repintar lo tapado, y es barata,
pero no entra en el alcance acordado.

---

## Correcciones a la matemática del brief

### 1. El caso especial afín se eliminó

El brief tenía dos fórmulas: una afín cuando `sx` y `sy` son "casi" cero, y la
proyectiva en los demás casos. Ese "casi" hay que medirlo con un umbral en
píxeles, y no existe un umbral correcto para una foto de 4000 px y para una de
800 a la vez. Peor: produce un salto visible al arrastrar.

Y no hace falta. El denominador `den` es el doble del área del triángulo
p1-p2-p3, que **no tiende a cero** cuando el cuadrilátero tiende a
paralelogramo. En ese límite `g` y `h` tienden suavemente a cero y las dos
fórmulas coinciden exactamente. Hay un test que lo demuestra.

Importa más de lo que parece: como las fotos están casi de frente, el caso donde
saltaba era el caso de todos los días.

### 2. El signo de la matriz inversa se normaliza

La homografía está definida a menos de una escala, **incluido el signo**. `u` y
`v` no se enteran porque salen de un cociente. El que sí se entera es el
descarte de `w <= 0` que usa el render: con el signo dado vuelta, ese descarte
**se come todos los píxeles** y el paño sale vacío, sin ningún error.

Validar el orden de las esquinas ya evita que eso llegue desde la pantalla, así
que la normalización es el segundo cinturón: `invertir()` es pública y puede
recibir una matriz armada a mano o un dato viejo. Cuesta nueve multiplicaciones
una vez por render.

### 3. `LOCAL_W = 2000` se eliminó

Era un tercer sistema de unidades que la propia regla del brief prohibía. Se
mapea `(u,v) ∈ [0,1]²` directo a milímetros y `paso_mm` entra sin conversiones.

### 4. Las esquinas se guardan normalizadas

`esquinas` va en coordenadas `[0,1]` relativas a la foto, no en píxeles. Así
vale para cualquier resolución: miniatura, exportación al doble, o una foto
recodificada a otro tamaño. Es lo que hace que reabrir una obra al otro día
devuelva los puntos exactamente donde quedaron.

### 5. Los umbrales son relativos, nunca absolutos

Un epsilon fijo es correcto para una foto y equivocado para otra. Todos los
umbrales de `quad.ts` se dividen por el cuadrado de la diagonal, así quedan sin
unidades. Hay un test con un paño de menos de un milímetro de lado que lo
comprueba.

---

## Estado del plan

- [x] **0 · Andamio** — TypeScript estricto, vitest, fast-check
- [x] **1 · `lib/units` + `lib/geometry`** — 42 tests en verde
- [ ] **0b · Prueba de Google en iPhone** — media jornada, antes de construir encima
- [x] **2 · `lib/pattern`** — 63 modelos extraídos del PDF, tres modos, 67 tests
- [ ] **3 · `lib/takeoff`** — falta el prototipo HTML para comprobar paridad
- [ ] **4 · `lib/render`** + `medirFidelidad`
- [ ] **5 · Pantalla, sin backend**
- [ ] **6 · PWA y offline**
- [ ] **7 · Supabase: esquema, permisos, login**
- [ ] **8 · Sincronización y archivos**
- [ ] **9 · Endurecimiento en dispositivo real**

### El catálogo salió del propio PDF

No hizo falta esperar los DXF. Adentro del PDF cada paño está dibujado como una
trayectoria de recorte de entre 168 y 89.407 segmentos: esa trayectoria **es** el
contorno del corte. Se extraen los 63 modelos a SVG con
`tools/extraer-catalogo.py` y se rasterizan a máscaras con
`tools/rasterizar-modelos.py`.

El área libre de cada modelo se mide una vez ahí, sobre el dibujo completo y con
precisión de sub-píxel, y queda guardada en el índice. Va de **8,6% (A.15) a
49,6% (A.35)**, con 29,3% de promedio.

Las máscaras viajan en binario crudo de un bit por píxel, no como PNG, para que
cargar el catálogo no dependa de un decodificador de imágenes. Son 1,4 MB
comprimidos los 63 modelos, así que entra cómodo para andar sin señal.

Si algún día hace falta la geometría exacta de producción, se reemplazan los SVG
por los DXF y no cambia nada más: `lib/pattern` ya trabaja contra máscaras.

### Pendiente de recibir

- **El prototipo HTML.** Bloquea el incremento 3.
- **Si hacen aluminio o no.**
- **Qué modo de ajuste va por defecto** (hay recomendación arriba).
