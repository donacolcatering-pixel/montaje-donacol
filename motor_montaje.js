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
/* MEDIDAS TOMADAS EN EL ALMACEN el 25/9/2026, pieza a pieza. Del COFFEE
   BREAK no queda ni una medida inventada: mesa, caja de bebida, mini box,
   vaso, bandeja, dispensador, platito con servilletas, arreglo floral y mini
   papelera.

   La altura de las pilas de vasos sale de dos medidas: un vaso suelto mide 8
   cm y una pila de 10 mide 13,5, asi que cada vaso de mas anade 0,61 cm. De
   ahi los 16,6 de la pila de 15. Una regla de tres daria 20,2 y seria falso:
   el primer vaso ya pone 8 cm el solo.

   SIGUEN SIN MEDIR el chafing dish y la mesa alta de coctel, que son del
   montaje de coctel y del elegante. Se miden cuando se llegue a ellos.
   zc = altura, que solo influye en el dibujo isometrico. */
const PIEZAS = {
  buffet:     {nm:'Mesa buffet',            wc:180, hc:70,   mk:'',   col:'#f7ecd8', bd:'#5A3B27', zc:74},
  bandeja:    {nm:'Bandeja de comida',      wc:35,  hc:26, mk:'B',  col:'#cda36a', bd:'#8a6a3a', zc:6},
  chafing:    {nm:'Chafing dish',           wc:53,  hc:33,   mk:'C',  col:'#b9bfc4', bd:'#6c7379', zc:22},
  /* Las bebidas, una a una: el café manda y la leche normal va con él.
     OJO A LA ORIENTACIÓN: la caja se pone con el MORRO —el grifo— de frente, y
     el cuerpo se va hacia atrás, a lo largo de la mesa. Estaban puestas de
     ancho (17 de frente por 10 de fondo) y es al revés: ocupan poco frente y
     mucho fondo. Por eso no cuadraban en la barra.

     MEDIDA DE VERDAD el 25/9/2026, en el almacén, con la caja delante:
     10 cm de frente, 16,6 cm de fondo y 22,4 cm de alto.

     Antes estaba deducida de la foto de La Romareda (10,5 x 20 x 28). El
     frente estaba casi bien; el fondo se pasaba 3,4 cm por caja, y ese sitio
     es justo el que le falta a la comida en la fila de detrás.

     De este número cuelgan el tope por mesa, las mesas que hacen falta y el
     dibujo entero: si algún día cambia el envase, se cambia AQUÍ y solo aquí. */
  cafe:       {nm:'Caja de CAFÉ',           wc:10  , hc:16.6,   mk:'CA', col:'#8a4f22', bd:'#4a2a0f', zc:22.4},
  lecheNormal:{nm:'Leche normal',           wc:10  , hc:16.6,   mk:'LE', col:'#f0e4cd', bd:'#b9a179', zc:22.4},
  sinLactosa: {nm:'Leche sin lactosa',      wc:10  , hc:16.6,   mk:'SL', col:'#e3edf3', bd:'#8aa7b8', zc:22.4},
  soja:       {nm:'Leche de soja',          wc:10  , hc:16.6,   mk:'SO', col:'#e7f0d9', bd:'#96ae77', zc:22.4},
  aguaCal:    {nm:'Agua caliente',          wc:10  , hc:16.6,   mk:'AC', col:'#f5ddd6', bd:'#c08c7e', zc:22.4},
  zumo:       {nm:'Caja de zumo',           wc:10  , hc:16.6,   mk:'ZU', col:'#f6e2b0', bd:'#c2a044', zc:22.4},
  fuente:     {nm:'Dispensador de agua con grifo',    wc:18,  hc:18,   mk:'F',  col:'#bcd4e6', bd:'#5a7fa0', zc:19.5},
  vaso:       {nm:'Pila de 15 vasos',       wc:7, hc:7,  mk:'V',  col:'#e4eef5', bd:'#7a98ad', zc:16.6},
  vasoAgua:   {nm:'Pila de 10 vasos (agua)',wc:7, hc:7,  mk:'V',  col:'#dce9f2', bd:'#7a98ad', zc:13.5},
  minibox:    {nm:'Mini box de café',        wc:12.3,  hc:6.4,  mk:'M',  col:'#e2cf9f', bd:'#a07f3a', zc:5.3},
  miniboxCal: {nm:'Mini box de infusiones',  wc:12.3,  hc:6.4,  mk:'MI', col:'#e9dcc4', bd:'#a07f3a', zc:5.3},
  /* MEDIDO el 25/9/2026: la servilleta es de 10 x 10, pero va SOBRE UN PLATO
     de 15,5 cm de diámetro, y lo que se apoya en la mesa es el plato. Antes
     estaba la medida de la servilleta sola y cada puesto ocupaba 5,5 cm menos
     de lo real. */
  servis:     {nm:'Platito con servilletas', wc:15.5, hc:15.5, mk:'S',  col:'#eadfca', bd:'#b09a72', zc:2.5},
  floral:     {nm:'Arreglo floral',         wc:10,  hc:10,   mk:'L',  col:'#d4ebc2', bd:'#5a8a4a', zc:30},
  alta:       {nm:'Mesa alta de cóctel',    wc:70,  hc:70,   mk:'T',  col:'#e9d3ad', bd:'#5A3B27', zc:110},
  papelera:   {nm:'Mini papelera metalica',               wc:10.4,  hc:10.4,   mk:'P',  col:'#c9c9c9', bd:'#666', zc:9.5},
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
  /* EL SOBRANTE ROTA. Antes cada tipo empezaba a repartir el resto por el
     mismo grupo, asi que el sin lactosa, la soja, el agua caliente y la
     garrafa caian TODOS en la primera mesa. Con 62 personas en tres mesas esa
     mesa pedia 207 cm de los 180 que hay -- y perdia el agua al recortar --
     mientras la tercera se quedaba a 108. El cursor sigue donde lo dejo el
     tipo anterior: cada mesa recibe su parte de los sobrantes. */
  let vuelta = 0;
  const proporcional = (tipo, total) => {
    let dado = 0;
    grupos.forEach((g, i) => {
      const toca = Math.floor(total * g / mesas);
      porGrupo[i][tipo] = toca; dado += toca;
    });
    for (let resto = total - dado; resto > 0; vuelta++, resto--) {
      porGrupo[orden[vuelta % n]][tipo]++;
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

  /* Las leches se cuelgan de los cafés EN PAREJAS ESPEJADAS. Las parejas se
     recorren en círculo: antes el contador se agotaba y las últimas leches se
     repartían a dedo, así que a un puesto le caían soja y agua caliente y a su
     gemelo no. Dando la vuelta, cada leche entra siempre en una pareja y la
     barra se ve igual desde los dos lados.

     El zumo no se cuelga de ningún café: va junto a la garrafa, compartiendo
     su pila de vasos, y no lleva mini box. */
  let p = 0, impares = 0;
  ['lecheNormal', 'sinLactosa', 'soja', 'aguaCal'].forEach(tipo => {
    let quedan = cuantos[tipo] || 0;
    while (quedan >= 2 && pares.length) {
      const [a, b] = pares[p % pares.length];
      puestos[a].push(tipo);
      puestos[b].push(tipo);
      quedan -= 2; p++;
    }
    if (quedan === 1) {
      /* LA IMPAR, AL PUESTO MÁS VACÍO. Si hay puesto central, ahí. Si no, al
         que menos cajas lleve — y en empate, alternando lado.

         Antes iban TODAS las impares al mismo puesto y salía un montaje
         cojo: con dos cafés, uno se quedaba con café, leche, sin lactosa,
         soja y agua caliente, y el otro con el café pelado. Con seis cajas
         entre dos puestos tienen que quedar tres y tres. */
      let donde;
      if (medio !== null) {
        donde = medio;
      } else {
        const menos = Math.min(...puestos.map(x => x.length));
        const libres = puestos.map((x, i) => x.length === menos ? i : -1).filter(i => i >= 0);
        donde = libres[impares % libres.length];
        impares++;
      }
      puestos[donde].push(tipo);
    }
  });
  return puestos;
}

/* --- LA FILA DE DELANTE, POR BLOQUES SIMETRICOS ---------------------------

   Un BLOQUE es una pieza principal con lo que la acompaña: el cafe con su
   leche, su mini box y su pila de vasos; el agua con una pila a cada lado; el
   zumo con la suya.

   El orden se construye ALTERNANDO cafe y bebida, y se arma por la MITAD:
   se coloca media barra y se refleja. Asi la simetria no depende de que quede
   bien por casualidad — es exacta por construccion.

   Los cafes caen en los extremos y las bebidas entre ellos, que es como se
   monta: cafe, agua, cafe, zumo, cafe, agua, cafe. El agua va en las
   posiciones de bebida mas separadas del centro y el zumo hacia dentro.     */

function bloquesDeLaBarra(cuantos) {
  /* CADA TIPO SE PARTE POR LA MITAD, y la otra mitad la pone el espejo. Si se
     refleja la lista entera se DUPLICAN las piezas: en la primera prueba
     salian cuatro aguas donde hay dos. La simetria sale del reparto, no de
     copiar el dibujo. */
  const puestos = puestosDeCafe(cuantos);
  const cafes = puestos.map(p => ({clase: 'cafe', piezas: p.slice()}));
  const aguas = [], zumos = [];
  for (let i = 0; i < (cuantos.fuente || 0); i++) aguas.push({clase: 'agua', piezas: ['fuente']});
  for (let i = 0; i < (cuantos.zumo || 0); i++) zumos.push({clase: 'zumo', piezas: ['zumo']});

  const parte = (lista) => ({
    media: lista.slice(0, Math.floor(lista.length / 2)),
    impar: lista.length % 2 ? lista[lista.length - 1] : null,
  });
  const C = parte(cafes), A = parte(aguas), Z = parte(zumos);

  // el agua, la primera bebida de la media: queda mas hacia el borde.
  // el zumo, hacia dentro. Asi sale cafe · agua · cafe · zumo · cafe.
  const bebidasMedia = A.media.concat(Z.media);

  const media = [];
  let i = 0, j = 0;
  while (i < C.media.length || j < bebidasMedia.length) {
    if (i < C.media.length) media.push(C.media[i++]);
    if (j < bebidasMedia.length) media.push(bebidasMedia[j++]);
  }

  // LAS SERVILLETAS VAN CON EL CAFE, como el mini box y los vasos: asi nunca
  // rompen la simetria ni caen dos juntas en medio de la barra.
  let servis = cuantos.servis || 0;
  const conServilleta = new Set();
  media.forEach(b => {
    if (b.clase === 'cafe' && servis >= 2) { conServilleta.add(b); servis -= 2; }
  });
  media.forEach(b => {
    if (b.clase !== 'cafe' && servis >= 2) { conServilleta.add(b); servis -= 2; }
  });
  media.forEach(b => { if (conServilleta.has(b)) b.servis = true; });

  const centro = [];
  if (C.impar) centro.push(C.impar);
  if (A.impar) centro.push(A.impar);
  if (Z.impar) centro.push(Z.impar);
  if (servis >= 1 && centro.length) centro[0].servis = true;

  const espejo = media.slice().reverse().map(b => ({
    clase: b.clase, piezas: b.piezas.slice(), servis: b.servis, reflejado: true}));
  return media.concat(centro, espejo);
}


/* Las piezas de un bloque, en orden. El bloque reflejado las lleva al reves:
   si a la izquierda va cafe-leche-minibox-vasos, a la derecha tiene que ir
   vasos-minibox-leche-cafe. Sin esto la barra parece simetrica de lejos y no
   lo es de cerca, que es lo que se veia en el plano del Colegio. */
function piezasDe(b) {
  let l;
  if (b.clase === 'agua') l = ['vasoAgua', 'fuente', 'vasoAgua'];
  else if (b.clase === 'cafe') l = b.piezas.concat(['minibox', 'vaso']);
  else if (b.clase === 'zumo') l = ['zumo', 'vaso'];
  else l = b.piezas.slice();
  if (b.servis) l = l.concat(['servis']);
  return b.reflejado ? l.slice().reverse() : l;
}

function anchoBloque(b) {
  const l = piezasDe(b);
  return l.reduce((a, t) => a + PIEZAS[t].wc, 0) + (l.length - 1) * 2;
}

function filaDelante(cuantos, anchoCm, nMesas) {
  let bloques = bloquesDeLaBarra(cuantos);

  // servilletas: dos por mesa, simetricas, entre bloques
  const nServis = cuantos.servis || 0;

  const sitio = anchoCm - MARGEN * 2;
  const mide = (bs) => bs.reduce((a, b) => a + anchoBloque(b), 0)
                     + SEPARA * Math.max(0, bs.length - 1);
  const necesario = mide(bloques);

  // si no cabe, se quitan bloques DEL CENTRO y EN PAREJA, para no romper el espejo
  /* EL AGUA, LA ULTIMA EN CAER. Se quita del centro hacia fuera, pero
     saltandose los bloques de agua mientras quede cualquier otra cosa. Al
     armar la barra por mitades, un agua impar queda justo en el centro, que
     es por donde empieza el recorte: sin esta regla la barra del Colegio se
     quedaba sin agua. Sin agua no se monta; una caja de cafe de menos se
     aguanta. */
  const fuera = [];
  const aQuitar = (bs) => {
    const medio = Math.floor(bs.length / 2);
    const porDistancia = bs.map((b, i) => i)
      .sort((a, b) => Math.abs(a - medio) - Math.abs(b - medio) || a - b);
    const otros = porDistancia.filter(i => bs[i].clase !== 'agua');
    const lista = otros.length ? otros : porDistancia;
    const i = lista[0];
    const espejo = bs.length - 1 - i;
    return (espejo !== i && lista.includes(espejo)) ? [i, espejo] : [i];
  };
  while (bloques.length > 1 && mide(bloques) > sitio) {
    aQuitar(bloques).sort((a, b) => b - a).forEach(i => {
      const b = bloques.splice(i, 1)[0];
      piezasDe(b).forEach(t => fuera.push(t));
    });
  }

  // --- posiciones: el sobrante se reparte por igual, asi queda centrado ---
  const suma = bloques.reduce((a, b) => a + anchoBloque(b), 0);
  const hueco = bloques.length > 1
    ? Math.max(SEPARA, (sitio - suma) / (bloques.length - 1)) : 0;

  const puntos = [];
  let x = (anchoCm - (suma + hueco * (bloques.length - 1))) / 2;
  bloques.forEach(b => {
    let dx = x;
    piezasDe(b).forEach((t, k) => {
      puntos.push({tipo: t, x: dx, fila: k,
                   adelante: t === 'vasoAgua'});
      dx += PIEZAS[t].wc + 2;
    });
    x += anchoBloque(b) + hueco;
  });

  puntos.necesario = necesario;
  puntos.cabe = fuera.length === 0;
  puntos.noCaben = fuera;
  puntos.mesasQueHacenFalta = Math.ceil(necesario / (PIEZAS.buffet.wc - MARGEN * 2 / nMesas));
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
  const anchoMesa = PIEZAS.buffet.wc, Wf = PIEZAS.floral.wc;

  // Lo que va detrás, repartido mesa a mesa
  const comida = [];
  for (let i = 0; i < (cuantos.chafing || 0); i++) comida.push('chafing');
  for (let i = 0; i < (cuantos.bandeja || 0); i++) comida.push('bandeja');
  const flores = Math.min(cuantos.floral || 0, nMesas * 2);

  const repartoDe = (total) => {
    const base = Math.floor(total / nMesas), resto = total % nMesas;
    return Array.from({length: nMesas}, (_, i) => base + (i < resto ? 1 : 0));
  };
  const comidaPorMesa = repartoDe(comida.length);
  const floresPorMesa = repartoDe(flores);

  let k = 0;
  for (let m = 0; m < nMesas; m++) {
    const x0 = m * anchoMesa, centroMesa = x0 + anchoMesa / 2;
    const mias = comida.slice(k, k + comidaPorMesa[m]); k += comidaPorMesa[m];
    const nFlores = floresPorMesa[m];

    /* LAS FLORES PRIMERO, QUE MARCAN. Dos por mesa como mucho: una a cada
       punta, o una sola al centro. Se colocan antes que la comida y se
       reserva su hueco — antes se ponían encima y una bandeja acababa
       pisando el floral. */
    let desde = x0 + MARGEN, hasta = x0 + anchoMesa - MARGEN;
    let centroOcupado = 0;
    if (nFlores >= 2) {
      puntos.push({tipo: 'floral', x: desde, desv: 0});
      puntos.push({tipo: 'floral', x: hasta - Wf, desv: 0});
      desde += Wf + SEPARA;
      hasta -= Wf + SEPARA;
      if (nFlores > 2) puntos.noCaben.push(...Array(nFlores - 2).fill('floral'));
    } else if (nFlores === 1) {
      puntos.push({tipo: 'floral', x: centroMesa - Wf / 2, desv: 0});
      centroOcupado = Wf + SEPARA * 2;
    }

    if (!mias.length) continue;

    /* LA COMIDA, repartida en el hueco que queda y escalonada en V: las del
       centro de la mesa se adelantan y las de los lados quedan atrás. Como el
       adelanto depende de la DISTANCIA al centro, las parejas de un lado y
       otro caen a la misma altura y la mesa se ve simétrica. */
    const sitio = (hasta - desde) - centroOcupado;
    const anchoPiezas = mias.reduce((a, t) => a + PIEZAS[t].wc, 0);
    while (mias.length > 1 && anchoPiezas > sitio) {
      puntos.noCaben.push(mias.pop());
    }
    const suma = mias.reduce((a, t) => a + PIEZAS[t].wc, 0);
    const hueco = mias.length > 1
      ? Math.min(PIEZAS.bandeja.wc * HUECO_BANDEJA, (sitio - suma) / (mias.length - 1))
      : 0;
    const ancho = suma + Math.max(0, hueco) * (mias.length - 1);
    const maxDist = Math.max(1, ancho / 2);

    // Si hay floral en el centro, la comida se parte en dos mitades
    const mitad = centroOcupado ? Math.ceil(mias.length / 2) : mias.length;
    let x = centroOcupado
      ? centroMesa - centroOcupado / 2 - (ancho / 2)     // empieza a la izquierda
      : centroMesa - ancho / 2;
    mias.forEach((t, i) => {
      if (centroOcupado && i === mitad) x += centroOcupado;   // saltar el floral
      const w = PIEZAS[t].wc, c = x + w / 2;
      const dist = Math.abs(c - centroMesa) / Math.max(maxDist, 1);
      puntos.push({tipo: t, x, desv: Math.max(0, 1 - dist) * DESVIO_V});
      x += w + Math.max(0, hueco);
    });
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

  /* DETRÁS: la comida y las flores.

     ANTES ERA TODO O NADA. Si la fila de detrás no entraba en el fondo que
     queda, no se dibujaba ni una bandeja ni una flor, y además en silencio.
     Bastaba que esa mesa tuviera una garrafa delante —28 cm de fondo— para
     que las bandejas no entraran con su escalonado en V: el Colegio de
     Trabajo Social pedía 8 bandejas y el plano enseñaba 3 en una alternativa
     y ninguna en las otras dos.

     Ahora se cede por orden: primero se intenta con la V; si no cabe, las
     bandejas van rectas (26,5 cm entran donde 33,5 no); y lo que siga sin
     caber se queda fuera PERO SE DICE en la lista de la hoja. */
  const detras = filaDetras(cuantos, anchoCm, tamGrupo);
  const sitio = fondoCm - MARGEN * 2 - fondoOcupadoDelante - SEPARA;
  const alto = (p, conV) => PIEZAS[p.tipo].hc + (conV ? (p.desv || 0) : 0);
  const cabeConV = !detras.length
    || Math.max(...detras.map(p => alto(p, true))) <= sitio;
  const fueraDetras = [];
  detras.forEach(p => {
    if (alto(p, cabeConV) <= sitio) {
      piezas.push({tipo: p.tipo, x: p.x, y: MARGEN + (cabeConV ? (p.desv || 0) : 0)});
    } else {
      fueraDetras.push(p.tipo);
    }
  });

  const leer = (lista) => lista.slice().sort((a, b) => a.x - b.x || (a.fila || 0) - (b.fila || 0))
                                .map(p => p.tipo);
  const noCaben = (delante.noCaben || []).concat(detras.noCaben || [])
                    .concat(fueraDetras);
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
      const redondo = (p.tipo === 'vaso' || p.tipo === 'vasoAgua' || p.tipo === 'floral' || p.tipo === 'servis');
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
    const redondo = (p.tipo === 'vaso' || p.tipo === 'vasoAgua' || p.tipo === 'floral' || p.tipo === 'servis');
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
