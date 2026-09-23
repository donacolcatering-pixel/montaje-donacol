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
     mucho fondo. Por eso no cuadraban en la barra.

     El ancho, 20 cm, lo dio el dueño mirando una caja: «un poquito menos de
     20, 20 pondría». Es la medida de la que cuelga todo el cálculo de mesas,
     así que cuando la mida exacta hay que cambiarla AQUÍ y solo aquí. */
  cafe:       {nm:'Caja de CAFÉ',           wc:20,  hc:25,   mk:'CA', col:'#8a4f22', bd:'#4a2a0f', zc:28},
  lecheNormal:{nm:'Leche normal',           wc:20,  hc:25,   mk:'LE', col:'#f0e4cd', bd:'#b9a179', zc:28},
  sinLactosa: {nm:'Leche sin lactosa',      wc:20,  hc:25,   mk:'SL', col:'#e3edf3', bd:'#8aa7b8', zc:28},
  soja:       {nm:'Leche de soja',          wc:20,  hc:25,   mk:'SO', col:'#e7f0d9', bd:'#96ae77', zc:28},
  aguaCal:    {nm:'Agua caliente',          wc:20,  hc:25,   mk:'AC', col:'#f5ddd6', bd:'#c08c7e', zc:28},
  zumo:       {nm:'Caja de zumo',           wc:20,  hc:25,   mk:'ZU', col:'#f6e2b0', bd:'#c2a044', zc:28},
  fuente:     {nm:'Garrafa de agua 8 L',    wc:28,  hc:28,   mk:'F',  col:'#bcd4e6', bd:'#5a7fa0', zc:36},
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
// Las aguas se COMPRAN de dos en dos (una normal y otra de limón con
// hierbabuena), pero en una barra puede ir una sola marcando el centro.

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

/* --- REPARTO ENTRE GRUPOS -------------------------------------------------

   Lo que va en cada grupo. Tres reglas:

     · lo proporcional a las MESAS del grupo (un grupo de 3 lleva el triple que
       uno de 1), que es lo que llena la mesa;
     · las AGUAS se reparten POR PAREJAS, nunca sueltas: antes el reparto
       partía la pareja, cada mitad caía en un grupo distinto y como una fuente
       suelta no se puede montar, las dos acababan sin dibujarse;
     · lo que depende del café —mini box, pila de vasos— y lo que depende de la
       mesa —servilletas— NO se reparte: se deriva. Así no puede descuadrar.  */
function repartir(grupos) {
  const n = grupos.length, mesas = grupos.reduce((a, g) => a + g, 0);
  const porGrupo = grupos.map(() => ({}));
  const orden = grupos.map((g, i) => i).sort((a, b) => grupos[b] - grupos[a]);

  // a) proporcional a las mesas, y lo que sobra del redondeo a los grupos grandes
  const proporcional = (tipo, total) => {
    let dado = 0;
    grupos.forEach((g, i) => {
      const toca = Math.floor(total * g / mesas);
      porGrupo[i][tipo] = toca; dado += toca;
    });
    for (let k = 0, resto = total - dado; resto > 0; k = (k + 1) % n, resto--) {
      porGrupo[orden[k]][tipo]++;
    }
  };
  ['cafe', 'lecheNormal', 'sinLactosa', 'soja', 'aguaCal', 'zumo',
   'bandeja', 'chafing', 'floral'].forEach(t => proporcional(t, INV[t] || 0));

  /* b) EL AGUA. Se compran de dos en dos —una normal y otra de limón con
     hierbabuena— pero eso es del pedido, no de la barra: en un grupo puede
     caer UNA SOLA, y cuando cae sola va al centro, marcándolo. Así está
     montada la foto de La Romareda. Antes se forzaba la pareja dentro de cada
     grupo y salían dos garrafas donde va una. */
  proporcional('fuente', INV.fuente || 0);

  // c) lo que se deriva, que por definición cuadra
  porGrupo.forEach((c, i) => {
    c.minibox  = c.cafe;                 // una mini box por caja de café
    /* UNA PILA POR PUESTO DE CAFÉ. En la foto de La Romareda hay 8 cajas y
       cuatro pilas, y por un momento pareció que los vasos se compartían de
       dos en dos. No: son DOS de los dos puestos de café y DOS flanqueando la
       garrafa de agua. Cada puesto de café lleva la suya.

       El ZUMO es el caso aparte: lleva vasos pero no mini box, y cuando cae
       junto a la garrafa se sirve de la pila del agua en vez de llevar otra.
       Por eso se coloca pegado al agua siempre que haya agua. */
    c.vaso = c.cafe;
    c.vasoAgua = c.fuente * 2;           // 10 + 10 a cada lado de cada fuente
    c.servis   = grupos[i] * 2;          // dos servilleteros por mesa
    c.miniboxCal = c.aguaCal;            // la de infusiones va con el agua caliente
    c.floral   = Math.min(c.floral, grupos[i] * 2);   // nunca más de dos por mesa
  });
  return porGrupo;
}

/* --- LOS PUESTOS DE CAFÉ ---------------------------------------------------

   Un PUESTO es una caja de café con la leche que le toque al lado. Hay tantos
   puestos como cafés, y las leches se van colgando de ellos EN PAREJAS
   ESPEJADAS —el puesto 1 y el último, el 2 y el penúltimo…— para que la barra
   se vea igual desde los dos lados. Si de una leche hay un número impar, la
   suelta va al puesto del centro.                                            */
function puestosDeCafe(cuantos) {
  const nCafes = cuantos.cafe || 0;
  if (!nCafes) {
    return ['lecheNormal', 'sinLactosa', 'soja', 'aguaCal', 'zumo']
      .filter(b => cuantos[b] > 0)
      .flatMap(b => Array.from({length: cuantos[b]}, () => [b]));
  }
  const puestos = Array.from({length: nCafes}, () => ['cafe']);
  const centro = (nCafes - 1) / 2;

  // pares de posiciones, de fuera hacia dentro: (0, n-1), (1, n-2)…
  const pares = [];
  for (let i = 0, j = nCafes - 1; i < j; i++, j--) pares.push([i, j]);
  const medio = nCafes % 2 ? (nCafes - 1) / 2 : null;

  let p = 0;
  // El zumo NO se cuelga de un café: va junto a la garrafa, compartiendo su
  // pila de vasos, y además no lleva mini box.
  ['lecheNormal', 'sinLactosa', 'soja', 'aguaCal'].forEach(tipo => {
    let quedan = cuantos[tipo] || 0;
    while (quedan >= 2 && p < pares.length) {
      puestos[pares[p][0]].push(tipo);
      puestos[pares[p][1]].push(tipo);
      quedan -= 2; p++;
    }
    if (quedan === 1) {
      // la impar al centro si lo hay; si no, al primer puesto libre
      const donde = medio !== null ? medio : (p < pares.length ? pares[p][0] : 0);
      puestos[donde].push(tipo);
      quedan = 0;
    }
    if (quedan > 0) {                      // no había pares libres: se reparten
      for (let i = 0; i < nCafes && quedan > 0; i++) { puestos[i].push(tipo); quedan--; }
    }
  });
  return puestos;
}

/* --- LA FILA DE DELANTE ----------------------------------------------------

   Se colocan TODAS las columnas de una vez, de izquierda a derecha, repartidas
   a lo ancho. La simetría ya viene dada por cómo se repartieron las leches y
   por dónde se meten las aguas y las servilletas, así que no hace falta
   reflejar el dibujo — que es lo que antes duplicaba piezas.

   En cada puesto: la MINI BOX por fuera y la PILA DE VASOS por dentro. En la
   mitad derecha se invierte, para que la mini box quede siempre hacia el
   extremo de la barra.                                                       */
function filaDelante(cuantos, anchoCm, nMesas) {
  const W = (t) => PIEZAS[t].wc;
  const puestos = puestosDeCafe(cuantos);
  const nP = puestos.length;

  /* Separadores: las aguas (en pareja) y los servilleteros.

     Hay un hueco ANTES del primer puesto, uno entre cada dos, y otro DESPUÉS
     del último: nP + 1 en total. Antes solo se contaban los de en medio, y en
     una mesa con un solo café no había ningún hueco — así que una mesa de un
     evento de 20 personas se quedaba sin agua y sin servilletas. Con los
     extremos, el agua cae a un lado y a otro del puesto, que además es como
     se monta. */
  const huecos = nP + 1;
  const ranuras = Array.from({length: huecos}, () => []);
  const meterEnPareja = (tipo, cuantas) => {
    // se colocan en ranuras espejadas, de fuera hacia dentro
    const pares = [];
    for (let i = 0, j = huecos - 1; i < j; i++, j--) pares.push([i, j]);
    const medio = huecos % 2 ? (huecos - 1) / 2 : null;
    let q = cuantas, p = 0;
    while (q >= 2 && p < pares.length) {
      ranuras[pares[p][0]].push(tipo); ranuras[pares[p][1]].push(tipo); q -= 2; p++;
    }
    if (q === 1 && medio !== null) { ranuras[medio].push(tipo); q--; }
    if (q === 1 && pares.length) { ranuras[pares[0][0]].push(tipo); q--; }
    return cuantas - q;                 // cuántas se han podido meter
  };
  const aguasPuestas = meterEnPareja('fuente', cuantos.fuente || 0);

  /* EL ZUMO, PEGADO A LA GARRAFA. Lleva vasos pero no mini box, y cuando cae
     junto al agua se sirve de la pila de la garrafa en vez de pedir otra. Así
     se montó en La Romareda: la caja de zumo justo después de la pila del
     agua. Si no hay garrafa, el zumo va a un hueco cualquiera. */
  let zumosPorPoner = cuantos.zumo || 0;
  ranuras.forEach(r => {
    if (zumosPorPoner > 0 && r.includes('fuente')) { r.push('zumo'); zumosPorPoner--; }
  });
  if (zumosPorPoner > 0) meterEnPareja('zumo', zumosPorPoner);

  const servisPuestos = meterEnPareja('servis', cuantos.servis || 0);

  // La fila completa: puesto, lo que haya en su ranura, puesto, …
  const columnas = [];
  puestos.forEach((pu, i) => {
    (ranuras[i] || []).forEach(t => columnas.push({sep: t}));   // el hueco de antes
    columnas.push({puesto: pu, lado: i < nP / 2 ? 'izq' : 'der'});
  });
  (ranuras[nP] || []).forEach(t => columnas.push({sep: t}));    // y el del final

  const anchoCol = (c) => {
    if (c.sep === 'fuente') return W('vasoAgua') + 2 + W('fuente') + 2 + W('vasoAgua');
    if (c.sep) return W(c.sep);
    return c.puesto.reduce((a, t) => a + W(t), 0) + (c.puesto.length - 1) * 2
         + W('minibox') + 2 + W('vaso') + 2
         + (c.puesto.includes('aguaCal') && (cuantos.miniboxCal || 0) ? W('miniboxCal') + 2 : 0);
  };

  /* SI NO CABE, NO SE MIENTE.

     Lo que manda la mesa es el ancho: un puesto de café con su mini box y su
     pila de vasos ocupa casi 60 cm, así que en una mesa de 180 caben tres
     justos. Cuando el checklist pide más cajas de las que entran, antes se
     dibujaban igual, saliéndose del tablero. Ahora se quitan de DENTRO HACIA
     FUERA y en pareja —para no romper el espejo— y se dice cuántas mesas
     harían falta de verdad. */
  const sitio = anchoCm - MARGEN * 2;
  const mide = (cols) => cols.reduce((a, c) => a + anchoCol(c), 0)
                       + SEPARA * Math.max(0, cols.length - 1);
  const necesario = mide(columnas);
  const noCaben = [];
  while (columnas.length > 0 && mide(columnas) > sitio) {
    const medio = Math.floor(columnas.length / 2);
    const quita = columnas.length % 2 ? [medio] : [medio, medio - 1];
    quita.sort((a, b) => b - a).forEach(i => {
      const c = columnas.splice(i, 1)[0];
      if (c.sep === 'fuente') noCaben.push('fuente', 'vasoAgua', 'vasoAgua');
      else if (c.sep) noCaben.push(c.sep);
      else { c.puesto.forEach(t => noCaben.push(t)); noCaben.push('minibox', 'vaso'); }
    });
  }

  const suma = columnas.reduce((a, c) => a + anchoCol(c), 0);
  const hueco = columnas.length > 1
    ? Math.max(SEPARA, (sitio - suma) / (columnas.length - 1)) : 0;

  const puntos = [];
  puntos.necesario = necesario;                    // cm de barra que pedía
  puntos.cabe = noCaben.length === 0;
  puntos.noCaben = noCaben;
  // cuántas mesas harían falta para que entrara entero
  puntos.mesasQueHacenFalta = Math.ceil(necesario / (PIEZAS.buffet.wc - MARGEN * 2 / nMesas));
  let x = (anchoCm - (suma + hueco * (columnas.length - 1))) / 2;

  columnas.forEach(c => {
    let dx = x;
    if (c.sep === 'fuente') {
      puntos.push({tipo: 'vasoAgua', x: dx, adelante: true}); dx += W('vasoAgua') + 2;
      puntos.push({tipo: 'fuente', x: dx});                   dx += W('fuente') + 2;
      puntos.push({tipo: 'vasoAgua', x: dx, adelante: true});
    } else if (c.sep) {
      puntos.push({tipo: c.sep, x: dx});
    } else {
      /* La MINI BOX por fuera del puesto y la PILA DE VASOS por dentro: a la
         izquierda en la mitad izquierda de la barra y al revés en la otra,
         para que la mini box quede siempre hacia el extremo. */
      const derecha = c.lado === 'der';
      const cajas = derecha ? c.puesto.slice().reverse() : c.puesto;
      if (!derecha) { puntos.push({tipo: 'minibox', x: dx}); dx += W('minibox') + 2; }
      else { puntos.push({tipo: 'vaso', x: dx}); dx += W('vaso') + 2; }
      cajas.forEach(t => {
        puntos.push({tipo: t, x: dx}); dx += W(t) + 2;
        if (t === 'aguaCal' && (cuantos.miniboxCal || 0) > 0) {
          puntos.push({tipo: 'miniboxCal', x: dx}); dx += W('miniboxCal') + 2;
        }
      });
      if (!derecha) puntos.push({tipo: 'vaso', x: dx});
      else puntos.push({tipo: 'minibox', x: dx});
    }
    x += anchoCol(c) + hueco;
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
  puntos.noCaben = [];
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
    // El hueco entre bandejas se aprieta si hace falta, pero la fila NUNCA se
    // sale de su mesa: lo que no entre se queda fuera y se dice.
    let hueco = anchoPieza * HUECO_BANDEJA;
    const sitioMesa = anchoMesa - MARGEN * 2;
    const anchoCon = (h) => mias.reduce((a, t) => a + PIEZAS[t].wc, 0) + (mias.length - 1) * h;
    if (anchoCon(hueco) > sitioMesa) hueco = Math.max(2, (sitioMesa - anchoCon(0)) / Math.max(1, mias.length - 1));
    while (mias.length > 1 && anchoCon(hueco) > sitioMesa) { puntos.noCaben.push(mias.pop()); }
    const ancho = anchoCon(hueco);
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
  const noCaben = (delante.noCaben || []).concat(detras.noCaben || []);
  return {piezas, anchoCm, fondoCm,
          secFrente: leer(delante), secDetras: leer(detras),
          noCaben,
          cabeTodo: noCaben.length === 0,
          mesasQueHacenFalta: delante.mesasQueHacenFalta || nMesas};
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
