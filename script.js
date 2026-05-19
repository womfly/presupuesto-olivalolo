// ============================================================
//  TABLA DE PRECIOS
//  Aquí están todos los precios del formulario en un solo sitio.
//  Si tu jefa quiere cambiar algún precio, solo se toca aquí,
//  el resto del código se actualiza solo.
// ============================================================

const PRECIOS = {
  tipoSesion: {
    foto_producto:   150,
    marca_personal:  200,
    redes_sociales:  180,
    evento:          250,
    video_promo:     350,
    pack_foto_video: 480,
  },
  duracion: {
    "":               0,
    "1h":             0,
    "2h":            80,
    "4h":           180,
    media_jornada:   280,
    jornada_completa:450,
  },
  contenido: {
    solo_foto:  0,
    solo_video: 120,
    foto_video: 180,
  },
  edicion: {
    basico: 0,
    medio:  60,
    alto:   130,
  },
  desplazamiento: {
    sin:        0,
    local:      25,
    provincial: 60,
    nacional:   150,
  },
  extras: {
    fotos_adicionales: 40,
    entrega_urgente:   80,
    formato_redes:     35,
    nocturna_exterior: 60,
    asistente:         100,
  },
};

// ============================================================
//  NOMBRES LEGIBLES
//  Traduce los valores internos del formulario (como "foto_producto")
//  al texto que verá el usuario en el PDF ("Fotografía de producto").
// ============================================================

const NOMBRES = {
  tipoSesion: {
    foto_producto:   "Fotografía de producto",
    marca_personal:  "Marca personal",
    redes_sociales:  "Redes sociales",
    evento:          "Evento",
    video_promo:     "Vídeo promocional",
    pack_foto_video: "Pack foto + vídeo",
  },
  duracion: {
    "1h":             "1 hora",
    "2h":             "2 horas",
    "4h":             "4 horas",
    media_jornada:    "Media jornada",
    jornada_completa: "Jornada completa",
  },
  contenido: {
    solo_foto:  "Solo fotografía",
    solo_video: "Solo vídeo",
    foto_video: "Fotografía + vídeo",
  },
  edicion: {
    basico: "Básico (incluido)",
    medio:  "Retoque profesional",
    alto:   "Edición avanzada",
  },
  desplazamiento: {
    sin:        "Sin desplazamiento",
    local:      "Local (≤20 km)",
    provincial: "Provincial",
    nacional:   "Nacional",
  },
  extras: {
    fotos_adicionales: "Fotos adicionales editadas",
    entrega_urgente:   "Entrega urgente (24/48h)",
    formato_redes:     "Formato redes optimizado",
    nocturna_exterior: "Fotografía nocturna/exterior",
    asistente:         "Asistente adicional",
  },
};

// ============================================================
//  COLORES DE MARCA (los mismos que en el CSS, para usarlos en el PDF)
//  jsPDF trabaja con arrays [R, G, B] — son los componentes rojo,
//  verde y azul de cada color, de 0 a 255.
//  Puedes convertir cualquier hex a RGB aquí: https://www.color-hex.com
// ============================================================

const COLOR = {
  // #35454c → R=53  G=69  B=76  — verde oscuro (cabecera del PDF)
  primary:  [53,  69,  76],

  // #2f9ea7 → R=47  G=158 B=167 — azul petróleo (líneas, acentos)
  accent:   [47,  158, 167],

  // #5c8491 → R=92  G=132 B=145 — azul medio (texto de categorías)
  accent2:  [92,  132, 145],

  // #d4af37 → R=212 G=175 B=55  — dorado (precios, total)
  warm:     [212, 175, 55],

  // #f4efe8 → R=244 G=239 B=232 — crema (fondo de filas alternas)
  bgCream:  [244, 239, 232],

  // Blanco y negro puros
  white:    [255, 255, 255],
  black:    [0,   0,   0],

  // Gris suave para el texto secundario
  muted:    [95,  111, 117],
};

// ============================================================
//  REFERENCIAS AL DOM
//  document.getElementById("...") busca un elemento HTML por su id.
//  Lo guardamos en variables para no tener que buscarlo cada vez.
// ============================================================

const form          = document.getElementById("budgetForm");
const totalAmountEl = document.getElementById("totalAmount");
const summaryBodyEl = document.getElementById("summaryBody");
const progressBarEl = document.getElementById("progressBar");
const btnGenerar    = document.getElementById("btnGenerar");
const btnReset      = document.getElementById("btnReset");
const toastEl       = document.getElementById("toast");

// ============================================================
//  FUNCIÓN PRINCIPAL: leer el formulario y recalcular todo
//  Se llama cada vez que el usuario cambia algo en el formulario.
// ============================================================

function calcular() {
  const datos    = leerFormulario();
  const desglose = construirDesglose(datos);
  renderizarResumen(desglose);
  actualizarProgreso(datos);
  actualizarBoton(datos);
}

// ============================================================
//  LEER FORMULARIO
//  Recorre todos los campos y devuelve un objeto con los valores.
//  Un "objeto" en JS es como una caja con etiquetas:
//  { tipoSesion: "evento", duracion: "2h", ... }
// ============================================================

function leerFormulario() {
  // querySelector busca el primer elemento que coincida con el selector CSS.
  // 'input[name="tipoSesion"]:checked' = el radio button con ese nombre que esté marcado.
  const tipoSesionEl = form.querySelector('input[name="tipoSesion"]:checked');
  const tipoSesion   = tipoSesionEl ? tipoSesionEl.value : null;
  // El ? significa: "si tipoSesionEl existe, dame su .value; si no, dame null"

  const duracion = form.querySelector('#duracion').value;
  const edicion  = form.querySelector('#edicion').value;

  // querySelectorAll devuelve TODOS los que coincidan (no solo el primero).
  // Array.from() convierte esa lista en un array de JS para poder usar .map()
  // .map() recorre el array y devuelve uno nuevo con lo que le digas (aquí, el .value de cada uno)
  const contenidoChecks = form.querySelectorAll('input[name="contenido"]:checked');
  const contenido       = Array.from(contenidoChecks).map(el => el.value);

  const desplazamientoEl = form.querySelector('input[name="desplazamiento"]:checked');
  const desplazamiento   = desplazamientoEl ? desplazamientoEl.value : "sin";

  const extrasChecks = form.querySelectorAll('input[name="extras"]:checked');
  const extras       = Array.from(extrasChecks).map(el => el.value);

  // .trim() elimina espacios en blanco al principio y al final del texto
  const clienteNombre = form.querySelector('#clienteNombre').value.trim();
  const clienteEmail  = form.querySelector('#clienteEmail').value.trim();

  // Devolvemos todo en un objeto
  return { tipoSesion, duracion, contenido, edicion, desplazamiento, extras, clienteNombre, clienteEmail };
}

// ============================================================
//  CONSTRUIR DESGLOSE
//  Recibe los datos del formulario y calcula cuánto cuesta cada parte.
//  Devuelve un array de "líneas" (cada partida) y el total.
// ============================================================

function construirDesglose(datos) {
  const lineas = []; // Array vacío donde iremos metiendo cada partida
  let total = 0;     // Acumulador del precio total

  // — Tipo de sesión —
  if (datos.tipoSesion) {
    // Buscamos el precio en la tabla PRECIOS usando el valor del formulario como clave
    const precio = PRECIOS.tipoSesion[datos.tipoSesion] || 0;
    // || 0 significa: "si no existe esa clave, usa 0 en vez de undefined"
    lineas.push({ categoria: "Tipo de sesión", nombre: NOMBRES.tipoSesion[datos.tipoSesion], precio });
    // .push() añade un elemento al final del array
    total += precio;
  }

  // — Duración —
  if (datos.duracion && datos.duracion !== "") {
    const precio = PRECIOS.duracion[datos.duracion] || 0;
    lineas.push({ categoria: "Duración", nombre: NOMBRES.duracion[datos.duracion] || datos.duracion, precio });
    total += precio;
  }

  // — Tipo de contenido (puede haber varios) —
  // .forEach() recorre cada elemento del array y ejecuta la función para cada uno
  datos.contenido.forEach(val => {
    const precio = PRECIOS.contenido[val] || 0;
    lineas.push({ categoria: "Contenido", nombre: NOMBRES.contenido[val], precio });
    total += precio;
  });

  // — Edición —
  if (datos.edicion) {
    const precio = PRECIOS.edicion[datos.edicion] || 0;
    lineas.push({ categoria: "Edición", nombre: NOMBRES.edicion[datos.edicion], precio });
    total += precio;
  }

  // — Desplazamiento —
  if (datos.desplazamiento) {
    const precio = PRECIOS.desplazamiento[datos.desplazamiento] || 0;
    lineas.push({ categoria: "Desplazamiento", nombre: NOMBRES.desplazamiento[datos.desplazamiento], precio });
    total += precio;
  }

  // — Extras (puede haber varios) —
  datos.extras.forEach(val => {
    const precio = PRECIOS.extras[val] || 0;
    lineas.push({ categoria: "Extra", nombre: NOMBRES.extras[val], precio });
    total += precio;
  });

  return { lineas, total };
}

// ============================================================
//  RENDERIZAR RESUMEN en el panel lateral derecho
//  Construye el HTML del desglose y lo mete en el div #summaryBody
// ============================================================

function renderizarResumen(desglose) {
  // Si no hay ninguna línea todavía, mostramos el mensaje inicial
  if (desglose.lineas.length === 0) {
    summaryBodyEl.innerHTML = '<p class="summary-hint">Selecciona las opciones del formulario y verás aquí el desglose en tiempo real.</p>';
    totalAmountEl.textContent = "0 €";
    return; // "return" sale de la función aquí, no sigue ejecutando lo de abajo
  }

  // Construimos el HTML de todas las líneas usando template literals (los backticks `)
  // Un template literal es un string que puede tener variables dentro con ${variable}
  let html = "";
  desglose.lineas.forEach(linea => {
    const precioStr = linea.precio === 0 ? "Incluido" : `+${linea.precio} €`;
    // El operador ternario: condición ? "si true" : "si false"
    html += `
      <div class="summary-line">
        <span>
          <span class="line-label">${linea.categoria}</span><br/>
          <span class="line-value">${linea.nombre}</span>
        </span>
        <span class="line-price">${precioStr}</span>
      </div>
    `;
  });

  // innerHTML asigna ese HTML directamente al div del panel
  summaryBodyEl.innerHTML = html;

  // Animamos el número del total
  animarTotal(desglose.total);
}

// ============================================================
//  ANIMACIÓN DEL TOTAL
//  En vez de que el número cambie de golpe, va contando suavemente
//  usando requestAnimationFrame (el sistema de animación del navegador)
// ============================================================

let animFrameId = null;         // Guarda el id del frame actual para poder cancelarlo
let currentDisplayedTotal = 0;  // Recuerda desde qué número hay que animar

function animarTotal(objetivo) {
  // Si ya había una animación corriendo, la cancelamos para no acumularlas
  if (animFrameId) cancelAnimationFrame(animFrameId);

  const duracion = 350;                // Duración de la animación en milisegundos
  const inicio   = performance.now();  // Marca el momento exacto de inicio
  const desde    = currentDisplayedTotal;

  // Esta función se llama ~60 veces por segundo gracias a requestAnimationFrame
  function paso(ahora) {
    // t va de 0 (inicio) a 1 (fin), calculado en función del tiempo transcurrido
    const t = Math.min((ahora - inicio) / duracion, 1);

    // Easing cuadrático: hace que la animación acelere y luego frene suavemente
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    // Calculamos el valor actual interpolando entre "desde" y "objetivo"
    const valor = Math.round(desde + (objetivo - desde) * eased);
    totalAmountEl.textContent = valor.toLocaleString("es-ES") + " €";
    // .toLocaleString("es-ES") formatea el número con puntos de millar (ej: 1.250 €)

    if (t < 1) {
      // Si todavía no hemos llegado al final, pedimos otro frame
      animFrameId = requestAnimationFrame(paso);
    } else {
      // Cuando terminamos, actualizamos el valor actual para la próxima animación
      currentDisplayedTotal = objetivo;
    }
  }

  animFrameId = requestAnimationFrame(paso);
}

// ============================================================
//  BARRA DE PROGRESO
//  Va del 0% al 100% según cuántos campos "importantes" están rellenos
// ============================================================

function actualizarProgreso(datos) {
  let completados = 0;
  const totalCampos = 4;

  if (datos.tipoSesion)                        completados++;
  if (datos.duracion && datos.duracion !== "")  completados++;
  if (datos.edicion)                            completados++;
  if (datos.desplazamiento)                     completados++;

  // Math.round redondea al entero más cercano
  const porcentaje = Math.round((completados / totalCampos) * 100);
  progressBarEl.style.width = porcentaje + "%";
}

// ============================================================
//  ACTIVAR/DESACTIVAR BOTÓN DE GENERAR PDF
//  Solo se activa cuando hay un mínimo de datos rellenos
// ============================================================

function actualizarBoton(datos) {
  const listo = datos.tipoSesion !== null && datos.duracion !== "";
  btnGenerar.disabled = !listo;
  // ! es el operador NOT: si listo=true, disabled=false (botón activo)
}

// ============================================================
//  RESET DEL FORMULARIO
// ============================================================

function resetearFormulario() {
  form.reset();               // Devuelve todos los inputs a su valor por defecto
  currentDisplayedTotal = 0;  // Reiniciamos el contador de la animación
  calcular();                 // Recalculamos para que el panel se limpie
  mostrarToast("Formulario reiniciado");
}

// ============================================================
//  TOAST (aviso flotante que aparece y desaparece)
// ============================================================

let toastTimeout = null; // Guardamos el temporizador para poder cancelarlo si hay uno activo

function mostrarToast(mensaje) {
  toastEl.textContent = mensaje;
  toastEl.classList.add("show");    // Añadimos la clase CSS que lo hace visible

  if (toastTimeout) clearTimeout(toastTimeout); // Cancelamos el anterior si existía
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("show"); // Después de 2.8 segundos lo volvemos a ocultar
  }, 2800);
}


// ============================================================
// ============================================================
//
//   GENERADOR DE PDF — AQUÍ EMPIEZA LA CHICHA
//
// ============================================================
// ============================================================

function generarPDF() {

  // — Leemos el formulario y calculamos el desglose —
  const datos    = leerFormulario();
  const desglose = construirDesglose(datos);

  // ── PASO 2: Crear el documento ──────────────────────────────
  //
  // jsPDF está disponible como window.jspdf.jsPDF (así lo expone la versión UMD).
  // Creamos una instancia nueva con:
  //   - orientation: "p" = portrait (vertical). La otra opción es "l" = landscape
  //   - unit: "mm" = milímetros. Todas las coordenadas X,Y que usemos serán en mm
  //   - format: "a4" = hoja A4 estándar (210mm × 297mm)
  //
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

  // Medidas de la página A4 en milímetros — las usaremos mucho para calcular posiciones
  const paginaAncho  = 210; // mm de ancho total del A4
  const paginaAlto   = 297; // mm de alto total del A4
  const margenIzq    = 20;  // margen izquierdo de los contenidos
  const margenDer    = 20;  // margen derecho (espejo del izquierdo)
  const anchoUtil    = paginaAncho - margenIzq - margenDer; // ancho usable = 170mm

  // Variable que irá bajando a medida que añadimos contenido.
  // Es el "cursor" vertical: empieza en 0 y vamos sumando la altura de cada elemento.
  let y = 0;

  // ── PASO 3: Cabecera ─────────────────────────────────────────
  //
  // Dibujamos un rectángulo de fondo que ocupe todo el ancho de la página.
  // setFillColor(r, g, b) establece el color de relleno para lo siguiente que dibujemos.
  // rect(x, y, ancho, alto, "F") dibuja un rectángulo relleno ("F" = Fill = rellenar).
  //   Las otras opciones son "S" (solo borde) o "FD" (relleno + borde).
  //
  doc.setFillColor(...COLOR.primary);
  // El spread operator (...) expande el array [53, 69, 76] como tres argumentos separados
  doc.rect(0, 0, paginaAncho, 42, "F");

  // — Nombre de la empresa —
  // setTextColor(r, g, b) establece el color del texto.
  // setFont(fuente, estilo) cambia la fuente. jsPDF solo trae "helvetica" por defecto.
  //   Estilos disponibles: "normal", "bold", "italic", "bolditalic"
  // setFontSize(tamaño) establece el tamaño en puntos tipográficos (pt).
  // text(texto, x, y) escribe el texto en esas coordenadas (esquina inferior izquierda del texto).
  //
  doc.setTextColor(...COLOR.warm);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("Olivaloló", margenIzq, 20);

  // — Subtítulo "Presupuesto de servicios" —
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR.accent);
  doc.text("PRESUPUESTO DE SERVICIOS", margenIzq, 29);

  // — Fecha en la esquina derecha de la cabecera —
  // new Date() crea un objeto con la fecha y hora actuales.
  // .toLocaleDateString("es-ES") la formatea en formato español.
  const fechaHoy = new Date().toLocaleDateString("es-ES", {
    day: "2-digit", month: "long", year: "numeric"
    // Resultado: "18 de mayo de 2026"
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.white);
  // Para alinear a la derecha usamos el parámetro "align" dentro del objeto de opciones
  doc.text(fechaHoy, paginaAncho - margenDer, 20, { align: "right" });

  // — Número de presupuesto (generado a partir del timestamp para que sea único) —
  const numPresupuesto = "OLV-" + Date.now().toString().slice(-6);
  // Date.now() devuelve los milisegundos desde 1970 (un número muy grande).
  // .toString() lo convierte en texto, y .slice(-6) coge solo los últimos 6 caracteres.
  // Resultado: "OLV-834291"
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 205);
  doc.text("Ref. " + numPresupuesto, paginaAncho - margenDer, 27, { align: "right" });

  // — Línea decorativa dorada debajo de la cabecera —
  // setDrawColor establece el color de los bordes y líneas.
  // setLineWidth establece el grosor de la línea en mm.
  // line(x1, y1, x2, y2) dibuja una línea recta entre dos puntos.
  doc.setDrawColor(...COLOR.warm);
  doc.setLineWidth(0.8);
  doc.line(0, 42, paginaAncho, 42);

  // Movemos el cursor justo debajo de la cabecera, con un margen de 12mm
  y = 42 + 12;

  // ── PASO 4: Datos del cliente ─────────────────────────────────
  //
  // Comprobamos si el usuario introdujo su nombre o email.
  // Si no introdujo nada, nos saltamos esta sección entera.
  //
  const tieneNombre = datos.clienteNombre !== "";
  const tieneEmail  = datos.clienteEmail  !== "";

  if (tieneNombre || tieneEmail) {

    // — Título de sección —
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR.accent2);
    doc.text("CLIENTE", margenIzq, y);

    // Línea fina bajo el título de sección
    doc.setDrawColor(...COLOR.accent2);
    doc.setLineWidth(0.3);
    doc.line(margenIzq, y + 2, margenIzq + anchoUtil, y + 2);

    y += 8; // Bajamos 8mm para el contenido

    // — Nombre del cliente —
    if (tieneNombre) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...COLOR.primary);
      doc.text(datos.clienteNombre, margenIzq, y);
      y += 7;
    }

    // — Email del cliente —
    if (tieneEmail) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLOR.muted);
      doc.text(datos.clienteEmail, margenIzq, y);
      y += 6;
    }

    y += 6; // Espacio extra antes de la siguiente sección
  }

  // ── PASO 5: Desglose de precios ──────────────────────────────
  //
  // Dibujamos una tabla manualmente.
  // jsPDF no tiene tablas automáticas en su versión básica (hay un plugin llamado
  // jspdf-autotable que sí las hace, pero las hacemos a mano para entenderlo bien).
  //
  // Cada fila tiene tres columnas: categoría | descripción | precio
  // Definimos el ancho de cada columna en mm (deben sumar anchoUtil = 170mm):
  const colCat    = 38;  // Columna categoría
  const colDesc   = 95;  // Columna descripción
  const colPrecio = 37;  // Columna precio (alineada a la derecha)

  // — Cabecera de la tabla —
  // Rectángulo de fondo azul petróleo para la fila de cabecera
  doc.setFillColor(...COLOR.accent);
  doc.rect(margenIzq, y, anchoUtil, 8, "F");

  // Textos de la cabecera en blanco
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.white);
  doc.text("CATEGORÍA",   margenIzq + 3,                          y + 5.5);
  doc.text("DESCRIPCIÓN", margenIzq + colCat + 3,                 y + 5.5);
  doc.text("IMPORTE",     margenIzq + colCat + colDesc + colPrecio, y + 5.5, { align: "right" });

  y += 8; // Bajamos el cursor la altura de la cabecera de tabla

  // — Filas del desglose —
  desglose.lineas.forEach((linea, indice) => {
    // indice empieza en 0, luego 1, 2, 3...
    // Las filas pares tendrán fondo crema, las impares fondo blanco (efecto zebra)
    if (indice % 2 === 0) {
      // % es el operador módulo: el resto de la división. 4%2=0, 5%2=1
      doc.setFillColor(...COLOR.bgCream);
    } else {
      doc.setFillColor(...COLOR.white);
    }
    doc.rect(margenIzq, y, anchoUtil, 9, "F");

    // Borde inferior de la fila (línea muy suave)
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margenIzq, y + 9, margenIzq + anchoUtil, y + 9);

    // — Columna CATEGORÍA (en azul medio, mayúsculas) —
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR.accent2);
    doc.text(linea.categoria.toUpperCase(), margenIzq + 3, y + 6);
    // .toUpperCase() convierte el texto a mayúsculas

    // — Columna DESCRIPCIÓN (en color oscuro) —
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR.primary);
    doc.text(linea.nombre, margenIzq + colCat + 3, y + 6);

    // — Columna PRECIO (alineada a la derecha) —
    // Si el precio es 0 ponemos "Incluido", si no ponemos el número formateado
    const precioStr = linea.precio === 0
      ? "Incluido"
      : linea.precio.toLocaleString("es-ES") + " €";

    if (linea.precio === 0) {
      doc.setTextColor(...COLOR.muted);    // "Incluido" en gris
      doc.setFont("helvetica", "italic");
    } else {
      doc.setTextColor(...COLOR.warm);     // Precio con coste en dorado
      doc.setFont("helvetica", "bold");
    }
    doc.setFontSize(9);
    doc.text(precioStr, margenIzq + colCat + colDesc + colPrecio, y + 6, { align: "right" });

    y += 9; // Avanzamos el cursor la altura de una fila
  });

  // ── PASO 6: Total final ───────────────────────────────────────
  //
  // Dibujamos la fila del total con fondo oscuro para que destaque.
  //
  y += 2; // Pequeño espacio visual antes del total

  // Rectángulo de fondo con el color primario oscuro
  doc.setFillColor(...COLOR.primary);
  doc.rect(margenIzq, y, anchoUtil, 14, "F");

  // Etiqueta "TOTAL ESTIMADO" a la izquierda en blanco
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.white);
  doc.text("TOTAL ESTIMADO", margenIzq + 3, y + 9);

  // Importe total a la derecha, en grande y en dorado
  const totalStr = desglose.total.toLocaleString("es-ES") + " €";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLOR.warm);
  doc.text(totalStr, margenIzq + anchoUtil - 2, y + 9.5, { align: "right" });

  y += 14 + 10; // Bajamos: altura de la fila total + margen

  // ── PASO 7: Nota legal / aviso orientativo ───────────────────
  //
  // Un bloque con borde izquierdo en azul petróleo y el texto de aviso.
  //

  // Rectángulo de fondo crema para el bloque de nota
  doc.setFillColor(...COLOR.bgCream);
  doc.rect(margenIzq, y, anchoUtil, 18, "F");

  // Borde izquierdo decorativo en azul petróleo (rectángulo estrecho de 3mm)
  doc.setFillColor(...COLOR.accent);
  doc.rect(margenIzq, y, 3, 18, "F");

  // Texto de la nota
  // splitTextToSize(texto, anchoMax) parte el texto automáticamente
  // cuando supera el ancho indicado (en mm) y devuelve un array de líneas.
  const notaTexto = "Este presupuesto es orientativo y puede ajustarse tras reunión de proyecto. Los precios indicados no incluyen IVA. La validez de este presupuesto es de 30 días desde la fecha de emisión.";
  const notaLineas = doc.splitTextToSize(notaTexto, anchoUtil - 10);
  // Le dejamos 10mm menos para los márgenes internos del bloque

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.muted);
  // text() acepta un array de strings: los escribe uno debajo del otro automáticamente
  doc.text(notaLineas, margenIzq + 7, y + 6);

  y += 18 + 8;

  // ── Pie de página ────────────────────────────────────────────
  //
  // Lo ponemos fijo en la parte inferior de la página, no con "y"
  // sino con una coordenada calculada desde el borde inferior del A4.
  //
  const yPie = paginaAlto - 16; // 16mm desde el borde inferior

  // Línea separadora del pie
  doc.setDrawColor(...COLOR.accent2);
  doc.setLineWidth(0.4);
  doc.line(margenIzq, yPie, paginaAncho - margenDer, yPie);

  // Texto izquierdo: nombre de la empresa
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR.muted);
  doc.text("Olivaloló · Fotografía y vídeo profesional", margenIzq, yPie + 5);

  // Texto derecho: web
  doc.text("www.womfly.com", paginaAncho - margenDer, yPie + 5, { align: "right" });

  // Número de página centrado
  // internal.getNumberOfPages() devuelve el total de páginas del documento
  const totalPaginas = doc.internal.getNumberOfPages();
  doc.setTextColor(180, 200, 205);
  doc.text(`Página 1 de ${totalPaginas}`, paginaAncho / 2, yPie + 5, { align: "center" });

  // ── Descarga ─────────────────────────────────────────────────
  //
  // .save(nombreArchivo) genera el PDF y lo descarga automáticamente.
  // Usamos el nombre del cliente si existe, o un nombre genérico si no.
  //
  const nombreArchivo = datos.clienteNombre
    ? `presupuesto_${datos.clienteNombre.replace(/\s+/g, "_")}.pdf`
    : "presupuesto_Olivalolo.pdf";
  // .replace(/\s+/g, "_") reemplaza todos los espacios por guiones bajos.
  // /\s+/g es una expresión regular: \s = cualquier espacio, + = uno o más, g = todos.
  // Los espacios en nombres de archivo pueden dar problemas en algunos sistemas.

  doc.save(nombreArchivo);

  // Avisamos al usuario con el toast
  mostrarToast("✓ PDF generado y descargado");
}

// ============================================================
//  EVENTOS
//  addEventListener("evento", función) hace que cuando ocurra
//  el evento indicado se ejecute la función automáticamente.
//
//  "change" → cuando cambia el valor de un input (radio, checkbox, select)
//  "input"  → cuando el usuario escribe en un campo de texto
//  "click"  → cuando el usuario hace click en un elemento
// ============================================================

form.addEventListener("change", calcular);
form.addEventListener("input",  calcular);
btnReset.addEventListener("click",   resetearFormulario);
btnGenerar.addEventListener("click", generarPDF);

// ============================================================
//  INICIO — Ejecutamos calcular() una vez al cargar la página
//  para que el panel de resumen empiece en su estado inicial correcto.
// ============================================================

calcular();
