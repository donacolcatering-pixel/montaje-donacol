// -*- coding: utf-8 -*-
/* ===========================================================================
   MOTOR DE MONTAJE · Doña Col
   ---------------------------------------------------------------------------
   Aquí viven las medidas de cada pieza y TODAS las reglas de colocación: el
   café manda, la mini box por fuera y los vasos por dentro, las aguas de dos
   en dos, la comida repartida mesa a mesa y escalonada en V, las flores al
   centro y a los lados.

   Está en un fichero aparte a propósito. Lo usan la HOJA IMPRESA
   (hoja_montaje.html) y el VISOR QUE GIRA (vista3d.html), y si cada uno
   tuviera su copia acabarían diciendo cosas distintas del mismo evento. Una
   regla se cambia aquí y cambia en los dos sitios.
   =========================================================================== */

/* ---------------------------------------------------------------------------
   Piezas: medidas REALES en cm, vistas desde arriba. La mesa es 180 × 70 de
   planta (los 74 cm son la altura y aquí no pintan nada).
   La marca es la letra que sale dibujada en la pieza y en el listado lateral.
--------------------------------------------------------------------------- */
/* zc = ALTURA en cm, la que hace falta para el dibujo en 3D. Estas alturas
   son estimadas: la caja de bebida, la fuente y la pila de vasos habria que
   medirlas como el resto. En planta no influyen; en la isometrica, si. */
const PIEZAS = {
  buffet:     {nm:'Mesa buffet',            wc:180, hc:70,   mk:'',   col:'#f7ecd8', bd:'#5A3B27', zc:74},
  bandeja:    {nm:'Bandeja de comida',      wc:35,  hc:26.5, mk:'B',  col:'#cda36a', bd:'#8a6a3a', zc:6},
  chafing:    {nm:'Chafing dish',           wc:53,  hc:33,   mk:'C',  col:'#b9bfc4', bd:'#6c7379', zc:22},
  /* Las bebidas, una a una: el café manda y la leche normal va con él.
     OJO A LA ORIENTACIÓN: la caja se pone con el MORRO —el grifo— de frente, y
     el cuerpo se va hacia atrás, a lo largo de la mesa. Estaban puestas de
     ancho (17 de frente por 10 de fondo) y es al revés: ocupan poco frente y
     mucho fondo. Por eso no cuadraban en la barra. */
  cafe:       {nm:'Caja de CAFÉ',           wc:17,  hc:25,   mk:'CA', col:'#8a4f22', bd:'#4a2a0f', zc:28},
  lecheNormal:{nm:'Leche normal',           wc:17,  hc:25,   mk:'LE', col:'#f0e4cd', bd:'#b9a179', zc:28},
  sinLactosa: {nm:'Leche sin lactosa',      wc:17,  hc:25,   mk:'SL', col:'#e3edf3', bd:'#8aa7b8', zc:28},
  soja:       {nm:'Leche de soja',          wc:17,  hc:25,   mk:'SO', col:'#e7f0d9', bd:'#96ae77', zc:28},
  aguaCal:    {nm:'Agua caliente',          wc:17,  hc:25,   mk:'AC', col:'#f5ddd6', bd:'#c08c7e', zc:28},
  zumo:       {nm:'Caja de zumo',           wc:17,  hc:25,   mk:'ZU', col:'#f6e2b0', bd:'#c2a044', zc:28},
  fuente:     {nm:'Fuente de agua 5 L',     wc:25,  hc:25,   mk:'F',  col:'#bcd4e6', bd:'#5a7fa0', zc:36},
  vaso:       {nm:'Pila de 15 vasos',       wc:6.5, hc:6.5,  mk:'V',  col:'#e4eef5', bd:'#7a98ad', zc:24},
  vasoAgua:   {nm:'Pila de 10 vasos (agua)',wc:6.5, hc:6.5,  mk:'V',  col:'#dce9f2', bd:'#7a98ad', zc:16},
  minibox:    {nm:'Mini box de café',        wc:12,  hc:6.5,  mk:'M',  col:'#e2cf9f', bd:'#a07f3a', zc:9},
  miniboxCal: {nm:'Mini box de infusiones',  wc:12,  hc:6.5,  mk:'MI', col:'#e9dcc4', bd:'#a07f3a', zc:9},
  servis:     {nm:'Servilletas (platito)',  wc:10,  hc:10,   mk:'S',  col:'#eadfca', bd:'#b09a72', zc:2},
  floral:     {nm:'Arreglo floral',         wc:11,  hc:11,   mk:'L',  col:'#d4ebc2', bd:'#5a8a4a', zc:26},
  alta:       {nm:'Mesa alta de cóctel',    wc:70,  hc:70,   mk:'T',  col:'#e9d3ad', bd:'#5A3B27', zc:110},
  papelera:   {nm:'Papelera',               wc:10,  hc:10,   mk:'P',  col:'#c9c9c9', bd:'#666', zc:60},
};

// Las bebidas que van en caja, por orden de mando: el café primero.
const BEBIDAS = ['cafe','lecheNormal','sinLactosa','soja','aguaCal','zumo'];

/* Franjas: la bebida al borde de delante, la comida detrás. Sale de las fotos
   de los montajes reales, no de una idea mía. */
const DELANTE = [...BEBIDAS, 'fuente', 'vaso', 'servis', 'minibox'];
const DETRAS  = ['chafing','bandeja','floral'];
const EN_PAREJA = ['fuente'];        // las aguas van de dos en dos, nunca impar

/* MARGEN: centímetros libres en el filo de la mesa. Estaba en 4 y las piezas
   de las puntas quedaban al ras: en el dibujo en 3D, con el mantel cayendo
   justo debajo, parecían colgando fuera aunque estuvieran dentro. Y en la mesa
   de verdad, una mini box al filo se cae. Con 6 sigue cabiendo todo de fondo:
   6 + 25 de caja + 3 + 26,5 de bandeja + 6 son 66,5 de los 70. */
const MARGEN = 6, SEPARA = 3, MAX_JUNTAS = 3;

/* --- Inventario que viene del checklist ---------------------------------- */
let INV = {}, META = {};
try {
  const g = JSON.parse(localStorage.getItem('montaje_inv') || 'null');
  if (g && g.inv) { INV = g.inv; META = g.meta || {}; }
} catch (e) {}

/* --- Agrupaciones: las tres únicas maneras ------------------------------- */
function agrupaciones(n) {
  const salida = [];
  for (let k = 1; k <= Math.min(n, MAX_JUNTAS); k++) {
    const grupos = [];
    let quedan = n;
    while (quedan > 0) { grupos.push(Math.min(k, quedan)); quedan -= k; }
    salida.push({k, grupos});
  }
  return salida;
}

function nombreDe(ag, n) {
  const k = ag.k, enteros = ag.grupos.filter(g => g === k).length, sobra = n - enteros * k;
  if (n === k) return n === 1 ? 'Una mesa sola' : n + ' mesas juntas';
  const base = k === 1 ? 'De una en una' : k === 2 ? 'De dos en dos' : 'De tres en tres';
  const cuantos = k === 1 ? enteros + ' mesas'
                : enteros === 1 ? 'un grupo de ' + k : enteros + ' grupos de ' + k;
  return base + ' · ' + cuantos
       + (sobra ? ' y ' + (sobra === 1 ? 'una suelta' : sobra + ' sueltas') : '');
}

/* --- LA FILA DE DELANTE: EL CAFÉ MANDA -----------------------------------

   En un coffee break el café dicta el montaje. De él salen las cantidades
   (una caja cada 10 personas) y a su alrededor se coloca lo demás:

     · la LECHE NORMAL va pegada a su café — van de dos en dos, y hay la mitad
       de leches que de cafés, así que no todos los cafés llevan la suya: las
       que hay se reparten a lo largo buscando las esquinas y el centro;
     · sin lactosa, soja y agua caliente se reparten entre los cafés restantes;
     · las AGUAS van en pareja, una a cada lado, nunca en el centro;
     · las SERVILLETAS van ENTRE cajas, dos por mesa, nunca en el centro;
     · cada caja lleva su pila de vasos al lado.

   Todo se construye montando MEDIA fila y reflejándola, así la simetría está
   garantizada y no depende de cómo caigan las cuentas.                      */

function bloquesDeBebida(cuantos) {
  /* Un «bloque» es una caja con lo que la acompaña. El café es el que abre:
     se hacen tantos bloques como cafés haya y se les va colgando la leche
     normal primero (a los de las puntas y el centro, que es donde se ve),
     y luego el resto de leches a los que queden libres. */
  const nCafes = cuantos.cafe || 0;
  if (!nCafes) {
    // Sin café no hay coffee: se ponen las cajas que haya, sin emparejar.
    return BEBIDAS.filter(b => cuantos[b] > 0)
                  .flatMap(b => Array.from({length: cuantos[b]}, () => [b]));
  }
  const bloques = Array.from({length: nCafes}, () => ['cafe']);

  // Orden en que se van ocupando los cafés: primero las puntas, luego el
  // centro, luego lo de en medio. Es como se mira una barra.
  const orden = [];
  let i = 0, j = nCafes - 1;
  while (i <= j) { orden.push(i); if (i !== j) orden.push(j); i++; j--; }
  const centro = Math.floor((nCafes - 1) / 2);
  orden.sort((a, b) => {
    const rango = (x) => (x === 0 || x === nCafes - 1) ? 0 : (x === centro ? 1 : 2);
    return rango(a) - rango(b) || a - b;
  });

  let k = 0;
  ['lecheNormal', 'sinLactosa', 'soja', 'aguaCal', 'zumo'].forEach(tipo => {
    for (let n = 0; n < (cuantos[tipo] || 0); n++) {
      bloques[orden[k % nCafes]].push(tipo);
      k++;
    }
  });
  return bloques;
}

function filaDelante(cuantos, anchoCm, nMesas) {
  /* SE MONTA POR PUESTOS.

     Un PUESTO es un café con su leche —café + leche normal, o café + leche sin
     lactosa— y lleva siempre dos cosas pegadas:
       · una MINI BOX (15 azucarillos, 4-5 sacarinas y 15 paletinas), y
       · una PILA DE 15 VASOS.

     Y van a lados contrarios, en espejo: en la mitad izquierda de la barra la
     mini box va a la IZQUIERDA del puesto y los vasos a la derecha; en la
     mitad derecha, al revés. Así la mini box queda siempre por fuera y los
     vasos por dentro, y la barra se ve simétrica desde el centro.

     Las fuentes de agua son la excepción: llevan su propia pila de 10 vasos a
     cada lado, y esas van un poco MÁS ADELANTE que todo lo demás, que sí está
     alineado a la misma altura. */
  const puestos = bloquesDeBebida(cuantos);      // cada uno: [cafe, leche, …]
  const paresAgua = Math.floor((cuantos.fuente || 0) / 2);

  const mitadP = puestos.slice(0, Math.floor(puestos.length / 2));
  const central = puestos.length % 2 ? puestos[Math.floor(puestos.length / 2)] : null;

  // Media fila: puestos y, repartidas entre ellos, las fuentes de agua.
  const mitad = [];
  let aguas = paresAgua;
  mitadP.forEach((pu, i) => {
    mitad.push({puesto: pu});
    const restan = mitadP.length - i - 1;
    if (aguas > 0 && restan > 0
        && (i + 1) % Math.max(1, Math.round(mitadP.length / (paresAgua + 1))) === 0) {
      mitad.push({agua: true}); aguas--;
    }
  });
  while (aguas-- > 0) mitad.push({agua: true});
  if (!mitad.length && !central) return [];

  const W = (t) => PIEZAS[t].wc;
  const llevaInfusiones = (pu) => pu.includes('aguaCal') && (cuantos.miniboxCal || 0) > 0;
  const anchoPuesto = (pu) => pu.reduce((a, t) => a + W(t), 0) + (pu.length - 1) * 2
                            + W('minibox') + 2 + W('vaso') + 2
                            + (llevaInfusiones(pu) ? W('miniboxCal') + 2 : 0);
  const anchoAgua = () => W('vasoAgua') + 2 + W('fuente') + 2 + W('vasoAgua');
  const anchoDe = (c) => c.agua ? anchoAgua() : anchoPuesto(c.puesto);

  const columnas = [
    ...mitad,
    ...(central ? [{puesto: central, centro: true}] : []),
    ...mitad.slice().reverse().map(c => ({...c, espejo: true})),
  ];

  /* SI NO CABE, NO SE CUELGA DE LA MESA.

     Antes se apretaba el hueco al mínimo y, si aun así no entraba, la fila
     empezaba en negativo: las mini box de las puntas quedaban colgando fuera
     del tablero. Eso en el plano es mentira y en el montaje es una caja en el
     suelo. Ahora se van quitando columnas desde el centro hacia fuera —que es
     donde menos se nota— hasta que la fila entra, y lo que sale se devuelve
     como sobrante para que la hoja lo diga. */
  const sitio = anchoCm - MARGEN * 2;
  const mide = (cols) => cols.reduce((a, c) => a + anchoDe(c), 0)
                       + SEPARA * Math.max(0, cols.length - 1);
  const noCaben = [];
  while (columnas.length > 1 && mide(columnas) > sitio) {
    // se quita la pareja más cercana al centro: una de cada lado, para no
    // romper la simetría
    const medio = Math.floor(columnas.length / 2);
    const quitadas = columnas.splice(columnas.length % 2 ? medio + 1 : medio - 1, 1)
      .concat(columnas.splice(columnas.length % 2 ? medio - 1 : medio, 1));
    quitadas.forEach(c => (c.puesto || c.piezas || []).forEach(t => noCaben.push(t)));
  }

  const suma = columnas.reduce((a, c) => a + anchoDe(c), 0);
  const hueco = columnas.length > 1
    ? Math.max(SEPARA, (sitio - suma) / (columnas.length - 1)) : 0;
  let x = (anchoCm - (suma + hueco * (columnas.length - 1))) / 2;

  const puntos = [];
  puntos.noCaben = noCaben;          // lo que se ha quedado fuera por falta de mesa
  columnas.forEach(c => {
    let dx = x;
    if (c.agua) {
      // Los vasos del agua, un poco más adelante: adelante = true.
      puntos.push({tipo: 'vasoAgua', x: dx, adelante: true}); dx += W('vasoAgua') + 2;
      puntos.push({tipo: 'fuente', x: dx});                   dx += W('fuente') + 2;
      puntos.push({tipo: 'vasoAgua', x: dx, adelante: true});
    } else {
      const cajas = c.espejo ? c.puesto.slice().reverse() : c.puesto;
      const fuera = c.espejo ? 'der' : 'izq';                 // dónde va la mini box
      if (fuera === 'izq') { puntos.push({tipo: 'minibox', x: dx}); dx += W('minibox') + 2; }
      else { puntos.push({tipo: 'vaso', x: dx}); dx += W('vaso') + 2; }
      cajas.forEach(t => {
        puntos.push({tipo: t, x: dx}); dx += W(t) + 2;
        // La mini box de infusiones va pegada al AGUA CALIENTE, que es lo que
        // acompaña: descafeinados y tés. Con el café no pinta nada.
        if (t === 'aguaCal' && (cuantos.miniboxCal || 0) > 0) {
          puntos.push({tipo: 'miniboxCal', x: dx}); dx += W('miniboxCal') + 2;
        }
      });
      if (fuera === 'izq') puntos.push({tipo: 'vaso', x: dx});
      else puntos.push({tipo: 'minibox', x: dx});
    }
    x += anchoDe(c) + hueco;
  });
  return puntos;
}

/* --- LA COMIDA: MESA A MESA, NO POR TODA LA BARRA --------------------------

   Esto estaba mal montado. Se centraba la comida en el conjunto de la barra y
   quedaba un socavón a los lados: dos bandejas juntas en medio y dos metros de
   mantel vacío a cada extremo. La mesa hay que LLENARLA.

   Cómo se hace de verdad: se parte cada mesa y se le ponen SUS bandejas,
   repartidas en su trozo, dejando entre ellas un hueco de una bandeja o algo
   menos, sin llegar a los bordes. Y no en línea recta: escalonadas, de modo que
   al mirar la barra se lee una V.

   Las flores rematan: una en el centro del grupo y las demás a los lados, que
   es lo que acaba de llenar la mesa.                                         */

const HUECO_BANDEJA = 0.8;   // el hueco entre bandejas, en anchos de bandeja
const DESVIO_V = 7;          // cm que se adelantan las del centro: la V

function filaDetras(cuantos, anchoCm, nMesas, fondoDisponible) {
  const puntos = [];
  const anchoMesa = PIEZAS.buffet.wc;

  // --- la comida, repartida mesa a mesa ---
  const comida = [];
  for (let i = 0; i < (cuantos.chafing || 0); i++) comida.push('chafing');
  for (let i = 0; i < (cuantos.bandeja || 0); i++) comida.push('bandeja');

  const base = Math.floor(comida.length / nMesas), resto = comida.length % nMesas;
  let k = 0;
  for (let m = 0; m < nMesas; m++) {
    const cuantas = base + (m < resto ? 1 : 0);
    if (!cuantas) continue;
    const mias = comida.slice(k, k + cuantas); k += cuantas;
    const x0 = m * anchoMesa, centroMesa = x0 + anchoMesa / 2;

    const anchoPieza = Math.max(...mias.map(t => PIEZAS[t].wc));
    const hueco = anchoPieza * HUECO_BANDEJA;
    const ancho = mias.reduce((a, t) => a + PIEZAS[t].wc, 0) + (mias.length - 1) * hueco;
    let x = centroMesa - ancho / 2;                 // centradas en SU mesa
    const maxDist = Math.max(1, ancho / 2);

    mias.forEach(t => {
      const w = PIEZAS[t].wc, centroPieza = x + w / 2;
      // La V: las del centro de la mesa se adelantan, las de los lados quedan
      // atrás. Como depende de la DISTANCIA al centro, las parejas de un lado
      // y otro caen a la misma altura y la mesa se ve simétrica.
      const dist = Math.abs(centroPieza - centroMesa) / maxDist;
      puntos.push({tipo: t, x, desv: (1 - dist) * DESVIO_V});
      x += w + hueco;
    });
  }

  // --- las flores: una al centro del grupo, las demás a los lados ---
  const flores = Math.min(cuantos.floral || 0, nMesas * 2);
  if (flores) {
    const w = PIEZAS.floral.wc;
    let puestas = 0;
    if (flores % 2 === 1) { puntos.push({tipo: 'floral', x: (anchoCm - w) / 2, desv: 0}); puestas = 1; }
    for (let i = 0; puestas + 2 <= flores; i++, puestas += 2) {
      // van a los extremos de cada mesa, de fuera hacia dentro
      const x = MARGEN + i * anchoMesa;
      puntos.push({tipo: 'floral', x, desv: 0});
      puntos.push({tipo: 'floral', x: anchoCm - x - w, desv: 0});
    }
  }
  return puntos;
}

function montarGrupo(tamGrupo, cuantos) {
  const anchoCm = tamGrupo * PIEZAS.buffet.wc, fondoCm = PIEZAS.buffet.hc;
  const piezas = [];

  // DELANTE: las cajas al borde. Cada bloque puede llevar dos alturas (el café
  // delante y su leche justo detrás), y por eso se mira la «fila» de cada una.
  const delante = filaDelante(cuantos, anchoCm, tamGrupo);
  /* TODO ALINEADO A LA MISMA ALTURA: el borde de delante de cada pieza cae en
     la misma línea, que es lo que hace que la barra se vea recta. La única
     excepción son los vasos de las fuentes de agua, que van un poco más
     adelantados —salen 2 cm del resto— porque se cogen de pie sin acercarse. */
  const LINEA = fondoCm - MARGEN;
  delante.forEach(p => {
    const t = PIEZAS[p.tipo];
    const adelanto = p.adelante ? 2 : 0;
    piezas.push({tipo: p.tipo, x: p.x, y: LINEA - t.hc + adelanto});
  });
  const fondoOcupadoDelante = delante.length
    ? Math.max(...delante.map(p => PIEZAS[p.tipo].hc)) : 0;

  // DETRÁS: la comida y las flores.
  const detras = filaDetras(cuantos, anchoCm, tamGrupo);
  const altoDetras = detras.length
    ? Math.max(...detras.map(p => PIEZAS[p.tipo].hc + (p.desv || 0))) : 0;
  const sitio = fondoCm - MARGEN * 2 - fondoOcupadoDelante - SEPARA;
  if (altoDetras <= sitio) {
    detras.forEach(p => piezas.push({tipo: p.tipo, x: p.x, y: MARGEN + (p.desv || 0)}));
  }

  const leer = (lista) => lista.slice().sort((a, b) => a.x - b.x || (a.fila || 0) - (b.fila || 0))
                                .map(p => p.tipo);
  return {piezas, anchoCm, fondoCm,
          secFrente: leer(delante), secDetras: leer(detras)};
}

/* --- Reparto del inventario entre los grupos ------------------------------ */
function repartir(grupos) {
  /* A cada grupo, lo que le corresponde POR MESAS, no por grupo.
     Repartiendo a partes iguales, la mesa suelta de «un grupo de 3 y una
     suelta» recibía la carga de tres mesas, no le cabía, y salía vacía en el
     plano. Ahora un grupo de 3 lleva el triple que uno de 1, y lo que sobra
     del redondeo va a los grupos grandes, que son los que tienen sitio. */
  const porGrupo = grupos.map(() => ({}));
  const mesasTotal = grupos.reduce((a, g) => a + g, 0);
  const orden = grupos.map((g, i) => i).sort((a, b) => grupos[b] - grupos[a]);

  Object.keys(PIEZAS).forEach(tipo => {
    if (tipo === 'buffet' || tipo === 'alta' || tipo === 'papelera') return;
    const total = INV[tipo] || 0;
    if (!total) return;
    let dado = 0;
    grupos.forEach((g, i) => {
      const toca = Math.floor(total * g / mesasTotal);
      porGrupo[i][tipo] = toca;
      dado += toca;
    });
    let resto = total - dado;
    for (let k = 0; resto > 0; k = (k + 1) % orden.length, resto--) {
      porGrupo[orden[k]][tipo]++;
    }
  });
  return porGrupo;
}

/* --- Dibujo de una variante ---------------------------------------------- */
const ESC = 1.0;                        // mm de papel por cm real; el SVG se ajusta
const SEP_GRUPOS = 80;                  // cm entre grupos separados

/* Cada pieza lleva, además del color, una TRAMA propia. En la oficina se
   imprime en blanco y negro casi siempre, y con solo color todo acaba siendo
   el mismo gris. Con trama se distinguen aunque salga en láser. */
function tramas() {
  const t = (id, d) => `<pattern id="t-${id}" width="4" height="4"
      patternUnits="userSpaceOnUse" patternTransform="rotate(45)">${d}</pattern>`;
  return `<defs>
    ${t('cafe',  '<rect width="4" height="4" fill="#8a4f22"/><path d="M0,0 V4" stroke="#3a2109" stroke-width="1.6"/>')}
    ${t('leche', '<rect width="4" height="4" fill="#f4ead6"/><path d="M0,0 V4" stroke="#b9a179" stroke-width="0.8"/>')}
    ${t('otra',  '<rect width="4" height="4" fill="#fff"/><circle cx="2" cy="2" r="0.7" fill="#7d6c5c"/>')}
    ${t('band',  '<rect width="4" height="4" fill="#dcbb8c"/><path d="M0,2 H4" stroke="#8a6a3a" stroke-width="0.7"/>')}
  </defs>`;
}
const TRAMA = {cafe: 't-cafe', lecheNormal: 't-leche', sinLactosa: 't-otra',
               soja: 't-otra', aguaCal: 't-otra', zumo: 't-otra', bandeja: 't-band'};

/* Una barra dibujada: mesas, lo que va encima, el eje, la escala y el lado
   por el que llega la gente. */
function dibujar(ag, n) {
  const cuantos = repartir(ag.grupos);
  const anchoCm = ag.grupos.reduce((a, g) => a + g * PIEZAS.buffet.wc, 0)
                + (ag.grupos.length - 1) * SEP_GRUPOS;
  const fondoCm = PIEZAS.buffet.hc;
  const E = ESC;
  let cuerpo = '', x0 = 0, secF = [], secD = [];

  ag.grupos.forEach((tam, gi) => {
    const m = montarGrupo(tam, cuantos[gi]);
    const X = x0 * E, W = tam * PIEZAS.buffet.wc * E, H = fondoCm * E;

    // el mantel del grupo, con sombra suave
    cuerpo += `<rect x="${X}" y="0" width="${W}" height="${H}" rx="1.5"
      fill="#fffdf9" stroke="#5A3B27" stroke-width="0.9"/>`;
    // las juntas entre mesas, en fino
    for (let i = 1; i < tam; i++) {
      const jx = X + i * PIEZAS.buffet.wc * E;
      cuerpo += `<line x1="${jx}" y1="1.5" x2="${jx}" y2="${H - 1.5}"
        stroke="#cdbb9d" stroke-width="0.5" stroke-dasharray="2 2"/>`;
    }

    m.piezas.forEach(p => {
      const t = PIEZAS[p.tipo], w = t.wc * E, h = t.hc * E;
      const x = X + p.x * E, y = p.y * E;
      const relleno = TRAMA[p.tipo] ? `url(#${TRAMA[p.tipo]})` : t.col;
      const redondo = (p.tipo === 'vaso' || p.tipo === 'vasoAgua' || p.tipo === 'floral');
      cuerpo += redondo
        ? `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2}"
             fill="${t.col}" stroke="${t.bd}" stroke-width="0.6"/>`
        : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.8"
             fill="${relleno}" stroke="${t.bd}" stroke-width="0.7"/>`;
      if (w >= 7 && h >= 5) {
        const claro = p.tipo === 'cafe';
        cuerpo += `<text x="${x + w / 2}" y="${y + h / 2 + 2}" font-size="5.2"
          font-weight="800" text-anchor="middle" fill="${claro ? '#fff' : '#33271f'}"
          style="font-family:system-ui,sans-serif">${t.mk}</text>`;
      }
    });
    if (tam >= Math.max(...ag.grupos) && !secF.length) { secF = m.secFrente; secD = m.secDetras; }
    x0 += tam * PIEZAS.buffet.wc + SEP_GRUPOS;
  });

  const W = anchoCm * E, H = fondoCm * E;

  // --- el eje, que es con lo que se cuadra la barra ---
  const ejeX = W / 2;
  const eje = `<line x1="${ejeX}" y1="-7" x2="${ejeX}" y2="${H + 9}"
      stroke="#c0413b" stroke-width="0.8" stroke-dasharray="4 3"/>
    <text x="${ejeX}" y="-9" font-size="5" text-anchor="middle" fill="#c0413b"
      font-weight="800" style="font-family:system-ui,sans-serif">EJE</text>`;

  // --- el lado por el que llega la gente: sin esto se monta del revés ---
  const publico = `<line x1="0" y1="${H + 5}" x2="${W}" y2="${H + 5}"
      stroke="#5A3B27" stroke-width="0.6" stroke-dasharray="6 4"/>
    <text x="${W / 2}" y="${H + 12}" font-size="5" text-anchor="middle" fill="#5A3B27"
      letter-spacing="1.4" style="font-family:system-ui,sans-serif">POR AQUÍ LLEGA LA GENTE</text>`;

  // --- regla de escala: un plano sin escala no es un plano ---
  const metros = Math.max(1, Math.floor(anchoCm / 100));
  let regla = `<line x1="0" y1="-4" x2="${100 * metros * E}" y2="-4"
      stroke="#8c7a68" stroke-width="0.6"/>`;
  for (let i = 0; i <= metros; i++) {
    regla += `<line x1="${i * 100 * E}" y1="-6" x2="${i * 100 * E}" y2="-2"
      stroke="#8c7a68" stroke-width="0.6"/>`;
  }
  regla += `<text x="${100 * metros * E + 3}" y="-2.5" font-size="4.4" fill="#8c7a68"
    style="font-family:system-ui,sans-serif">${metros} m</text>`;

  const resumir = (sec) => {
    if (!sec.length) return '—';
    const out = []; let ant = null, n2 = 0;
    sec.forEach(t => { if (t === ant) n2++; else { if (ant) out.push({t: ant, n: n2}); ant = t; n2 = 1; } });
    if (ant) out.push({t: ant, n: n2});
    return out.map(o => `<span class="mk2">${(o.n > 1 ? o.n + '×' : '') + PIEZAS[o.t].mk}</span>`).join('');
  };

  return {
    svg: `<svg viewBox="-2 -16 ${W + 16} ${H + 32}" width="100%"
            preserveAspectRatio="xMidYMid meet">${tramas()}${regla}${cuerpo}${eje}${publico}</svg>`,
    largo: (anchoCm / 100).toFixed(1),
    secFrente: resumir(secF), secDetras: resumir(secD),
    colas: ag.grupos.length,
  };
}


/* ===========================================================================
   VISTA ISOMÉTRICA — para verlo, no para medirlo.

   No hace falta renderizar nada ni pasar imágenes por ningún filtro: todo lo
   que hay en una barra son cajas y cilindros, así que el 3D se dibuja con las
   MISMAS coordenadas de la planta, en vectorial. Pesa lo mismo que el plano,
   se imprime nítido a cualquier tamaño y, cuando cambian las cantidades, se
   actualiza solo. Con imágenes renderizadas habría que rehacerlas cada vez.

   La proyección es isométrica de manual: un punto (x, y, z) en centímetros
   —x a lo ancho de la barra, y hacia el fondo, z hacia arriba— cae en
     sx = (x - y) · cos30
     sy = (x + y) · sen30 - z
   Y se pinta de atrás hacia delante (mayor x+y = más cerca del que mira), que
   es lo que hace que unas cosas tapen a otras como en la realidad.
=========================================================================== */
const COS30 = Math.cos(Math.PI / 6), SEN30 = 0.5;
const iso = (x, y, z) => [(x - y) * COS30, (x + y) * SEN30 - z];

/** Aclara u oscurece un color para las caras: la luz viene de arriba. */
function tono(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map(v => Math.max(0, Math.min(255, Math.round(f < 1 ? v * f : v + (255 - v) * (f - 1)))));
  return 'rgb(' + c.join(',') + ')';
}

/** Una caja en 3D: la tapa, el frente y el costado. */
function caja3d(x, y, z, w, d, h, col, bd) {
  const p = (X, Y, Z) => iso(X, Y, Z).join(',');
  const tapa   = [p(x,y,z+h), p(x+w,y,z+h), p(x+w,y+d,z+h), p(x,y+d,z+h)].join(' ');
  const frente = [p(x,y+d,z+h), p(x+w,y+d,z+h), p(x+w,y+d,z), p(x,y+d,z)].join(' ');
  const lado   = [p(x+w,y,z+h), p(x+w,y+d,z+h), p(x+w,y+d,z), p(x+w,y,z)].join(' ');
  const t = 'stroke="' + bd + '" stroke-width="0.7" stroke-linejoin="round"';
  return '<polygon points="' + lado   + '" fill="' + tono(col, .78) + '" ' + t + '/>'
       + '<polygon points="' + frente + '" fill="' + tono(col, .92) + '" ' + t + '/>'
       + '<polygon points="' + tapa   + '" fill="' + tono(col, 1.12) + '" ' + t + '/>';
}

/** Un cilindro (pila de vasos, floral): elipse arriba, cuerpo y elipse abajo. */
function cil3d(x, y, z, diam, h, col, bd) {
  const r = diam / 2, cx = x + r, cy = y + r;
  const [ax, ay] = iso(cx, cy, z + h), [bx, by] = iso(cx, cy, z);
  const rx = r * COS30 * 1.42, ry = r * SEN30 * 1.42;
  const t = 'stroke="' + bd + '" stroke-width="0.7"';
  return '<path d="M' + (ax - rx) + ',' + ay + ' L' + (bx - rx) + ',' + by
       + ' A' + rx + ',' + ry + ' 0 0 0 ' + (bx + rx) + ',' + by
       + ' L' + (ax + rx) + ',' + ay + ' Z" fill="' + tono(col, .88) + '" ' + t + '/>'
       + '<ellipse cx="' + ax + '" cy="' + ay + '" rx="' + rx + '" ry="' + ry
       + '" fill="' + tono(col, 1.12) + '" ' + t + '/>';
}

/** UN grupo en isométrica: como todos los grupos se montan igual, con ver
 *  uno se ve la barra entera. */
function dibujarIso(tamGrupo, cuantos) {
  const m = montarGrupo(tamGrupo, cuantos);
  const W = tamGrupo * PIEZAS.buffet.wc, D = PIEZAS.buffet.hc, ALTO = PIEZAS.buffet.zc;

  // la mesa, con el mantel cayendo
  let cuerpo = caja3d(0, 0, 0, W, D, ALTO, '#fdfbf6', '#b9a888');

  // lo de encima, de atrás hacia delante para que se tapen bien
  const orden = m.piezas.slice().sort((a, b) => (a.x + a.y) - (b.x + b.y));
  orden.forEach(p => {
    const t = PIEZAS[p.tipo], h = t.zc || 10;
    const redondo = (p.tipo === 'vaso' || p.tipo === 'vasoAgua' || p.tipo === 'floral');
    cuerpo += redondo
      ? cil3d(p.x, p.y, ALTO, t.wc, h, t.col, t.bd)
      : caja3d(p.x, p.y, ALTO, t.wc, t.hc, h, t.col, t.bd);
  });

  // encuadre: se calculan las cuatro esquinas de la caja que lo contiene todo
  const xs = [], ys = [];
  [[0,0,0],[W,0,0],[0,D,0],[W,D,0],[0,0,ALTO+40],[W,0,ALTO+40],[0,D,ALTO+40],[W,D,ALTO+40]]
    .forEach(([a,b,c]) => { const [u,v] = iso(a,b,c); xs.push(u); ys.push(v); });
  const x0 = Math.min(...xs) - 6, y0 = Math.min(...ys) - 6;
  const anc = Math.max(...xs) - x0 + 12, alt = Math.max(...ys) - y0 + 12;

  return '<svg viewBox="' + x0 + ' ' + y0 + ' ' + anc + ' ' + alt + '" width="100%"'
       + ' preserveAspectRatio="xMidYMid meet">' + cuerpo + '</svg>';
}
