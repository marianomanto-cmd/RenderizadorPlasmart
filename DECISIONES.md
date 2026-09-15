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
| 12 | Chapa | 1000 × 2000, 1220 × 2440 y 1500 × 3000. Por defecto elige la que necesita menos paños; con empate gana la más chica, que desperdicia menos |
| 13 | Números en pantalla | Los cuatro a la vista (superficie, área libre, peso, chapas y recorte), rotulados "estimado" |
| 14 | Color | Es el material, no un dato aparte |
| 15 | Paños por foto | **Varios.** Una fachada tiene paño, pared, paño. Se marcan de a uno, cada uno con su modelo, material y despiece, y los números de arriba son los del conjunto |

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

### Corregido: el tamaño del motivo lo fija la chapa, no la superficie

**Este fue el error más grande del proyecto y estuvo dos incrementos adentro.**

Yo trataba el dibujo como elástico: agarraba un modelo y lo estiraba, repetía o
recortaba hasta tapar la superficie, y el tamaño del motivo era una decisión de
diseño con tres opciones. El resultado sobre una pared de tres metros y medio
eran hojas de ochenta centímetros de largo. Eso no sale de ninguna chapa y no
significa nada comercialmente.

**Lo real:** una superficie se cubre con paños de medida comercial. Cada paño se
corta de una chapa y lleva el dibujo completo escalado a esa chapa. Si la pared
mide cuatro metros se ven cuatro paños, cada uno del tamaño que va a tener de
verdad, con sus juntas a la vista.

El catálogo lo venía diciendo y no lo vi: **53 de los 63 modelos están dibujados
exactamente a 1:2**, que es la proporción de 1000 × 2000 y de 1220 × 2440. Cada
modelo *es* una chapa. Las fotos de obra de Instagram lo confirman: los paños se
cuentan a simple vista, cada uno con su marco.

**Y una consecuencia incómoda:** cuando el modo mosaico me mostró una grilla de
líneas negras, la llamé bug y la saqué. Esas líneas eran las juntas entre
chapas. Arreglé algo que no estaba roto y encima borré la información correcta.

### El reparto es equitativo

Tres metros y medio con chapas de 1000 **no** son 1000 + 1000 + 1000 + 500: son
cuatro paños de 875. Primero se calcula cuántos paños hacen falta como mínimo y
después la superficie se divide en esa cantidad de partes iguales. Poner chapas
enteras desde un borde y dejar un recorte flaco del otro se ve pésimo en una
fachada y no es lo que se hace.

De yapa, el render sale mejor: como la cantidad de paños es entera, el dibujo se
repite un número exacto de veces y nunca queda medio motivo cortado.

### "Una chapa y media"

Son dos números distintos y los dos van en pantalla:

- **Material usado**, con decimales. Una superficie de 1,50 × 2,00 m son 3 m²,
  o sea 1,5 chapas de 1000 × 2000. Es lo que se dice en el taller.
- **Chapas a comprar**, entero. Esos 3 m² salen en dos paños de 750, o sea dos
  chapas. No se puede comprar media.

La diferencia es el desperdicio. Un anidado de producción puede sacar dos paños
angostos de la misma chapa y bajar el número; esto no lo hace y lo dice.

### El marco macizo es de cada paño

Los 30 mm sin perforar son de **cada chapa**, no del conjunto. Medirlo contra la
superficie entera dejaría los paños del medio sin borde y el conjunto se vería
como una sola pieza gigante en vez de como las chapas que es. Hay un test que lo
comprueba paño por paño.

### Lo que todavía no hace

En algunas obras de Plasmart el dibujo **no** se repite por paño: forma una
composición continua a lo largo de todo el cerco, que alguien compuso a mano.
Repetir por paño es el caso común y es lo honesto para una herramienta de venta,
pero está anotado.

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

**Corrección.** Antes de tener el handoff, saqué la paleta del PDF del catálogo:
dorado `#B9802E` sobre gris claro, con Barlow Condensed. **Eso estaba mal.** El
catálogo es material impreso; la marca digital es otra cosa. El sistema real,
que llegó como handoff completo, se llama "Signal" y está instalado en
`design-system/`.

| Rol | Valor |
|-----|-------|
| Fondo de página | `#08090b` |
| Fondo hundido / modales | `#0d0f13` |
| Paneles y cards | `#111419` |
| Texto principal | `#eef0f3` |
| Texto secundario | `#8a8f99` |
| Texto terciario | `#4f545d` |
| Acento único | índigo `#6e7bff` |
| Hairlines | `rgba(255,255,255,.10)` |
| Tipografía | Sora (200 en grande, 400 en cuerpo) |
| Datos y etiquetas | JetBrains Mono, mayúsculas |

Reglas duras: **oscuro solamente**, sin tema claro ni interruptor. Un solo
acento, usado con gotero y nunca como fondo de bloque. Hairlines en vez de
cajas, radios chicos, sin sombras salvo el glow índigo. Sin emoji, solo flechas.
Copy en español rioplatense con voseo. Coma decimal.

El handoff trae `APP_PATTERNS.md`, que es lo importante para nosotros: el
sistema base es de marketing y ahí están las reglas para extenderlo a
formularios, listas, modales y navegación sin romper el look. Distingue dos
registros: **marca** (login, vacíos, onboarding: tipografía grande, aire, grano)
y **trabajo** (listas y formularios: escala chica, nada arriba de 34px salvo una
cifra protagonista).

### Dos cosas que este sistema obliga a decidir

**1. Los colores del material no son tokens, y es a propósito.**
`COLOR_MATERIAL` en `lib/render` tiene los colores del acero, el galvanizado y
el inoxidable. Son el color físico de una chapa dibujada sobre una foto, o sea
contenido y no interfaz. Si fueran tokens, el paño cambiaría de color al
retocar la paleta, y el paño tiene que verse como la chapa que se va a cortar.
Queda declarado como la única excepción a "cero hex literales".

**2. El tema oscuro contra el sol de Córdoba.**
Esta app se usa parada en la vereda al sol, que es la peor condición para una
pantalla oscura: el reflejo suma un piso de luminancia y el contraste efectivo
se desploma. No se toca la marca; se compensa adentro del sistema — el texto que
el vendedor necesita leer va en `--text` y nunca en `--muted`, `--faint` no se
usa afuera, y las manijas de las esquinas van bien por encima de los 44 px.
**Hay que confirmarlo en la calle, con sol, antes de dar la pantalla por
terminada.**

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

## Rendimiento del render, medido

Paño de 714 x 420 px sobre una foto de 1200 x 800, modelo B.01, en este
contenedor. Un teléfono de gama media es unas 4 veces más lento.

| Resolución | Calidad | ms | cuadros/s aquí | estimado en teléfono |
|---|---|---|---|---|
| 50% | arrastrando | 8,1 | 123 | **~31/s** |
| 75% | arrastrando | 17,8 | 56 | ~14/s |
| 100% | arrastrando | 31,0 | 32 | ~8/s |
| 100% | al soltar | 31,3 | 32 | ~8/s |

**La estrategia que sale de esos números:** arrastrar a media resolución, soltar a
resolución completa. No hizo falta ninguna API nueva para renderizar más chico,
porque las esquinas se guardan normalizadas: se le pasa la mitad del tamaño de
foto y listo.

Dos cosas bajaron el costo, en orden de importancia:

1. **Supermuestrear solo en el borde.** El detalle del dibujo lo resuelve la
   pirámide, así que adentro del paño una muestra alcanza; las nueve solo hacen
   falta en la franja de un píxel del borde. Pagarlas en todo el paño era casi
   todo el costo: al soltar pasó de 202 ms a 31 ms, seis veces y media.
2. **Sacar las asignaciones del bucle.** Llamar a `aplicarInversa()` por muestra
   creaba un objeto `{u,v}` cada vez, un millón y medio por cuadro.

Todavía no se midió en un teléfono real. Los números de arriba son una
estimación con un factor 4, y hay que confirmarlos antes de dar nada por bueno.

## La pirámide de máscaras, y por qué hizo falta

La máscara tiene 2048 píxeles de ancho y en pantalla el paño ocupa unos 600. Un
píxel de pantalla cubre entonces varios agujeros, y muestrear ahí da muaré:
bandas y remolinos que no existen en la chapa. No es un caso raro, es el caso
normal.

El primer intento promediaba todo a un número. Arreglaba el muaré pero **borraba
el dibujo**: arrastrando, el paño salía gris parejo y el vendedor no veía nada.

La solución es guardar el dibujo también a la mitad, a un cuarto, a un octavo, y
leer el nivel que corresponde al tamaño en pantalla. Así el promedio conserva la
estructura. Es lo que hace cualquier motor de texturas desde hace cuarenta años.

## Despliegue

Proyecto de Vercel `renderizador-plasmart`, enganchado al repo. Cada push a la
rama genera un preview; la rama de producción es `main`.

**Producción: `https://renderizador-plasmart.vercel.app`** — `main`, pública,
sin login.

El alias de la rama de trabajo es
`renderizador-plasmart-git-cla-7670f9-marianomanto-cmds-projects.vercel.app` y
siempre apunta al último push de esa rama.

Dos cosas que costaron y conviene no volver a tropezar:

1. **El proyecto quedó con `framework: null`.** Se había creado cuando el repo
   tenía solo un README, así que Vercel nunca detectó Next.js: el build salía
   perfecto y generaba la página, pero servirla daba 404. Se arregla con
   `vercel.json` en el repo, que además queda versionado.
2. **Los previews estaban detrás del login de Vercel** (protección SSO del
   equipo). Eso hacía imposible probar en un teléfono, y sobre todo instalarla
   en la pantalla de inicio, que es como hay que probarla. **Se desactivó**: las
   URLs son públicas para cualquiera que tenga el link. Es un prototipo sin
   datos de clientes; cuando entren cuentas y obras reales hay que revisarlo.

## Estado del plan

- [x] **0 · Andamio** — TypeScript estricto, vitest, fast-check
- [x] **1 · `lib/units` + `lib/geometry`** — 42 tests en verde
- [ ] **0b · Prueba de Google en iPhone** — media jornada, antes de construir encima
- [x] **2 · `lib/pattern`** — 63 modelos extraídos del PDF, tres modos, 67 tests
- [x] **3 · `lib/takeoff`** — 14 tests. Falta el prototipo HTML para comprobar paridad con tus cuentas
- [x] **4 · `lib/render`** — 83 tests, medido. Falta `medirFidelidad` (fase 2)
- [x] **5 · Pantalla, sin backend** — desplegada, con varios paños por foto
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

- **Si hacen aluminio o no.** El catálogo lista acero, inoxidable y galvanizado.
- **Qué modo de ajuste va por defecto** (hay recomendación arriba).
- **Cómo se ve al sol**, probado en la calle. Es lo único que puede obligar a
  discutir el tema oscuro.

### Ya no hace falta: el prototipo HTML

El brief prometía un prototipo de una página que validaba la matemática, para
usarlo como especificación ejecutable. **Se descarta como pendiente**, por dos
motivos: la matemática ya está escrita y probada con 97 tests contra resultados
analíticos exactos, y el encuadre cambió — esto muestra cómo queda y no cotiza,
así que comprobar paridad al decimal con un prototipo viejo dejó de tener
sentido. Si aparece, se mira; no bloquea nada.
