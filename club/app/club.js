// Club Doña Col: app de clientes. Pantallas y navegación.
// Los datos los da window.Almacen (almacen-local.js en la demo; almacen-firebase.js en la versión real).
(() => {
  const N = window.NEGOCIO, C = window.CLUB, A = window.AlmacenFirebase || window.Almacen;   // real si hay Firebase; si no, demostración
  const app = document.getElementById("app");
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const euros = n => (Math.round(n * 100) / 100).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const svg = (p, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 1.8}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const I = {
    inicio: svg('<path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-6h4v6"/>'),
    pedir: svg('<path d="M4 7h16l-1.5 12h-13z"/><path d="M9 7a3 3 0 0 1 6 0"/>'),
    tarjeta: svg('<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M7 14.5h4M3 9.5h18"/>'),
    red: svg('<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5"/><circle cx="17" cy="8" r="2.5"/><path d="M16.5 13.5c2 .2 3.5 1.6 4 4"/>'),
    perfil: svg('<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1-3.8 4-5.5 7.5-5.5s6.5 1.7 7.5 5.5"/>'),
    mas: svg('<path d="M12 5v14M5 12h14"/>', 2.2),
    atras: svg('<path d="m15 18-6-6 6-6"/>', 2.2),
    corazon: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
    mensaje: svg('<path d="M4 5h16v11H9l-5 4z"/>'),
    enviar: svg('<path d="M4 12 20 4l-6 16-3-7z"/>', 2),
    puntos: svg('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>'),
    camara: svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
    compartir: svg('<path d="M17 3l4 4-4 4"/><path d="M3 11V9a2 2 0 0 1 2-2h16"/><path d="M7 21l-4-4 4-4"/><path d="M21 13v2a2 2 0 0 1-2 2H3"/>'),
    comentario: svg('<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z"/>'),
    check: svg('<path d="M5 12.5 10 17 19 7"/>', 3),
    ajustes: svg('<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"/>')
  };
  const S = { filtroFeed: "todos", vistaRed: "personas", categoria: 0, repetir: null };


  // ---------- Identificadores fiscales y provincias (mismas reglas que una factura) ----------
  const PROVINCIAS = ["", "Álava", "Albacete", "Alicante", "Almería", "Ávila", "Badajoz", "Illes Balears", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Castellón",
    "Ciudad Real", "Córdoba", "A Coruña", "Cuenca", "Girona", "Granada", "Guadalajara", "Gipuzkoa", "Huelva", "Huesca", "Jaén", "León", "Lleida", "La Rioja", "Lugo",
    "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Asturias", "Palencia", "Las Palmas", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Cantabria",
    "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Bizkaia", "Zamora", "Zaragoza", "Ceuta", "Melilla"];
  const provinciaDeCP = cp => /^\d{5}$/.test(cp) ? PROVINCIAS[+cp.slice(0, 2)] || "" : "";
  const limpiaId = v => String(v || "").toUpperCase().replace(/[\s.\-\/]/g, "");
  function nifValido(v) {          // DNI o NIE
    v = limpiaId(v); const L = "TRWAGMYFPDXBNJZSQVHLCKE";
    let m = v.match(/^(\d{8})([A-Z])$/); if (m) return L[+m[1] % 23] === m[2];
    m = v.match(/^([XYZ])(\d{7})([A-Z])$/); if (m) return L[+("XYZ".indexOf(m[1]) + m[2]) % 23] === m[3];
    return false;
  }
  function cifValido(v) {          // CIF de sociedades y entidades
    v = limpiaId(v); const m = v.match(/^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/); if (!m) return false;
    let s = 0; [...m[2]].forEach((d, i) => { let n = +d; if (i % 2 === 0) { n *= 2; n = Math.floor(n / 10) + (n % 10); } s += n; });
    const c = (10 - (s % 10)) % 10, letra = "JABCDEFGHI"[c];
    if ("PQRSWN".includes(m[1])) return m[3] === letra;
    if ("ABEH".includes(m[1])) return m[3] === String(c);
    return m[3] === String(c) || m[3] === letra;
  }
  const abrirLegal = ancla => abrirFuera(`${C.legal.url}#${ancla}`);
  // Campos de facturación (registro y «Datos de facturación»). f = datos guardados; part = particular
  function camposFacturacion(f = {}, part = false) {
    return `<div id="fEmpresa"${part ? " hidden" : ""}>
        <label class="campo"><span>Razón social</span><input class="entrada" name="razon" autocomplete="organization" placeholder="Ej.: Eventos Ejemplo, S.L." value="${esc(!part ? f.nombre || "" : "")}"></label>
        <label class="campo"><span>CIF o NIF</span><input class="entrada" name="cif" autocapitalize="characters" placeholder="Ej.: B12345678" value="${esc(!part ? f.cif || "" : "")}"></label>
        <label class="campo"><span>Nombre comercial <small>Opcional, si es distinto</small></span><input class="entrada" name="comercial" value="${esc(f.nombre_comercial || "")}"></label>
      </div>
      <label class="campo" id="fDni"${part ? "" : " hidden"}><span>DNI o NIE</span><input class="entrada" name="dni" autocapitalize="characters" placeholder="Ej.: 12345678Z" value="${esc(part ? f.cif || "" : "")}"></label>
      <label class="campo"><span>Dirección fiscal <small>Calle y número</small></span><input class="entrada" name="direccion" autocomplete="street-address" value="${esc(f.direccion || "")}"></label>
      <div class="dos-campos">
        <label class="campo"><span>Código postal</span><input class="entrada" name="cp" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="${esc(f.cp || "")}"></label>
        <label class="campo"><span>Localidad</span><input class="entrada" name="localidad" autocomplete="address-level2" value="${esc(f.localidad || "")}"></label>
      </div>
      <label class="campo"><span>Provincia</span><input class="entrada" name="provincia" value="${esc(f.provincia || "")}"></label>
      <label class="campo"><span>Correo para las facturas <small>Opcional, si es otro</small></span><input class="entrada" name="emailfe" type="email" value="${esc(f.email_fe || "")}"></label>`;
  }
  function enlazarCP(fr) { fr.cp.oninput = () => { const p = provinciaDeCP(fr.cp.value.trim()); if (p) fr.provincia.value = p; }; }
  // Lee y valida. Devuelve { fact } o { error, campo }
  function leerFacturacion(fr, part, nombre, movil) {
    const v = n => (fr[n] ? fr[n].value.trim() : "");
    if (!part && v("razon").length < 2) return { error: "Escribe la razón social (el nombre que va en la factura).", campo: "razon" };
    if (!part && !cifValido(v("cif")) && !nifValido(v("cif"))) return { error: "El CIF o NIF no es correcto. Revísalo.", campo: "cif" };
    if (part && !nifValido(v("dni"))) return { error: "El DNI o NIE no es correcto. Revísalo.", campo: "dni" };
    if (v("direccion").length < 3) return { error: "Escribe la dirección fiscal.", campo: "direccion" };
    if (!/^\d{5}$/.test(v("cp"))) return { error: "El código postal tiene 5 cifras.", campo: "cp" };
    if (!v("localidad")) return { error: "Escribe la localidad.", campo: "localidad" };
    if (!v("provincia")) return { error: "Escribe la provincia.", campo: "provincia" };
    return { fact: { tipo: part ? "PARTICULAR" : "EMPRESA", nombre: part ? nombre : v("razon"), nombre_comercial: part ? "" : v("comercial"),
      cif: limpiaId(part ? v("dni") : v("cif")), direccion: v("direccion"), cp: v("cp"), localidad: v("localidad"), provincia: v("provincia"), pais: "España",
      movil, email_fe: v("emailfe"), contacto: nombre, mayorEdad: true, legal: C.legal.version } };
  }

  // ---------- Utilidades ----------
  const iniciales = n => String(n || "?").split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
  // Si la foto está en Cloudinary, se pide al tamaño justo y en el formato más ligero para cada móvil
  const optim = (url, ancho) => /res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url || "") ? url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${ancho}/`) : url;
  const avatar = (u, g) => u && u.foto
    ? `<span class="avatar${g ? " g" : ""}${u.oficial ? " oficial" : ""}"><img src="${esc(optim(u.foto, g ? 240 : 120))}" alt=""></span>`
    : `<span class="avatar${g ? " g" : ""}" style="background:${colorDe(u && u.id)}">${esc(iniciales(u && u.nombre))}</span>`;
  const COLORES = ["#61422A", "#907A69", "#7A5A3A", "#4E5D52", "#8A5A44", "#5A5468"];
  const colorDe = id => COLORES[[...String(id || "")].reduce((s, c) => s + c.charCodeAt(0), 0) % COLORES.length];
  const nombreCon = u => `${esc(u.nombre)}${u.oficial ? `<span class="verificado" title="Cuenta oficial">${I.check}</span>` : ""}`;
  const puesto = u => u.oficial || (u.empresa && u.empresa === u.nombre) ? esc(u.cargo || u.tipo || "") : u.cargo && u.empresa && u.cargo !== u.empresa ? `${esc(u.cargo)} en ${esc(u.empresa)}` : esc(u.cargo || u.empresa || u.tipo || "");
  function hace(iso) {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60) return "ahora mismo";
    if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
    if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
    if (s < 86400 * 7) return `hace ${Math.floor(s / 86400)} d`;
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }
  // Un nivel se alcanza con sus puntos Y sus pedidos de los últimos 12 meses
  const alcanza = (s, n) => s.puntos >= n.desde && s.pedidos >= (n.pedidos || 0);
  const nivelDe = s => [...C.niveles].reverse().find(n => alcanza(s, n)) || C.niveles[0];
  const siguienteNivel = s => C.niveles.find(n => !alcanza(s, n)) || null;
  const eurosPorPunto = () => Math.round(1 / C.puntos.porEuro);
  const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const puntosTxt = n => `${miles(n)} ${n === 1 ? "punto" : "puntos"}`;
  const numeroSocio = u => `${C.prefijoSocio}-${String(u.socio || 0).padStart(6, "0")}`;
  let avisoT;
  function aviso(t) { let a = document.querySelector(".aviso"); if (!a) { a = document.createElement("div"); a.className = "aviso"; document.body.appendChild(a); } a.textContent = t; a.classList.add("visible"); clearTimeout(avisoT); avisoT = setTimeout(() => a.classList.remove("visible"), 2600); }
  // Cualquier error que se escape (por ejemplo, seguir sin el correo confirmado) se enseña en un aviso
  window.addEventListener("unhandledrejection", e => { const m = e.reason && e.reason.message; if (m) aviso(m); });
  const cargarScript = src => new Promise((ok, no) => {
    if (document.querySelector(`script[data-src="${src}"]`)) return ok();
    const s = document.createElement("script"); s.src = src; s.dataset.src = src; s.onload = ok; s.onerror = () => no(new Error("No se ha podido cargar el lector."));
    document.head.appendChild(s);
  });
  function vibrar() { try { navigator.vibrate && navigator.vibrate(25); } catch (e) {} }
  function abrirFuera(url) { const a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove(); }
  // Fotos: se reducen en el móvil antes de guardarlas (más rápido y ocupa menos)
  // Las fotos se reducen y comprimen en el móvil antes de subirlas. «maximo» = tamaño máximo del resultado:
  // si no cabe, se baja la calidad y, si hace falta, el tamaño, hasta que quepa.
  function comprimir(archivo, max = 1200, calidad = .72, maximo = 650000) {
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(archivo);
      img.onload = () => {
        let lado = max, q = calidad, dato = "";
        for (let i = 0; i < 8; i++) {
          const k = Math.min(1, lado / Math.max(img.width, img.height));
          const cv = document.createElement("canvas"); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
          cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
          dato = cv.toDataURL("image/jpeg", q);
          if (dato.length <= maximo) break;
          if (q > .5) q -= .1; else lado = Math.round(lado * .8);
        }
        URL.revokeObjectURL(url); res(dato);
      };
      img.onerror = () => rej(new Error("No se ha podido leer la foto."));
      img.src = url;
    });
  }
  function menuHoja(opciones) {
    const h = document.createElement("div"); h.className = "hoja-menu";
    h.innerHTML = `<div>${opciones.map((o, i) => `<button data-i="${i}" class="${o.peligro ? "peligro" : ""}">${esc(o.texto)}</button>`).join("")}<button data-i="x">Cancelar</button></div>`;
    h.onclick = e => { const b = e.target.closest("button"); if (e.target === h || b) h.remove(); if (b && b.dataset.i !== "x") opciones[+b.dataset.i].accion(); };
    document.body.appendChild(h);
  }

  // Confirmación con el diseño de la app (en lugar de la ventana del sistema)
  function confirmar(texto, boton = "Sí", peligro = true) {
    return new Promise(res => {
      const h = document.createElement("div"); h.className = "hoja-menu";
      h.innerHTML = `<div><p class="hoja-texto">${esc(texto)}</p><button data-r="1" class="${peligro ? "peligro" : ""}">${esc(boton)}</button><button data-r="0">Cancelar</button></div>`;
      h.onclick = e => { const b = e.target.closest("button"); if (e.target === h || b) { h.remove(); res(!!b && b.dataset.r === "1"); } };
      document.body.appendChild(h);
    });
  }
  function hojaTexto(titulo, texto) {
    const h = document.createElement("div"); h.className = "hoja-menu";
    h.innerHTML = `<div class="hoja-larga"><h3>${esc(titulo)}</h3><p>${esc(texto)}</p><button class="boton ancho" data-cerrar>Entendido</button></div>`;
    h.onclick = e => { if (e.target === h || e.target.closest("[data-cerrar]")) h.remove(); };
    document.body.appendChild(h);
  }
  const listaNatural = xs => xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " y " + xs[xs.length - 1];
  // 5. Que el teclado no tape el campo en el que escribes
  document.addEventListener("focusin", e => {
    if (e.target.matches("input:not([type=checkbox]):not([type=file]),textarea,select") && !e.target.closest(".escribir"))
      setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 350);
  });

  document.addEventListener("click", e => {
    const b = e.target.closest(".ver-clave"); if (!b) return;
    const i = b.parentElement.querySelector("input"), ver = i.type === "password";
    i.type = ver ? "text" : "password"; b.textContent = ver ? "Ocultar" : "Mostrar";
  });
  // La caja de escribir (chat y comentarios) sube con el teclado del móvil
  function pegarAlTeclado(id) {
    const ajustar = () => { const vv = window.visualViewport, f = document.getElementById(id); if (!vv || !f) return; const tapado = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); f.style.transform = tapado ? `translateY(${-tapado}px)` : ""; };
    if (window.visualViewport) { visualViewport.onresize = ajustar; visualViewport.onscroll = ajustar; }
  }

  // ---------- Esqueleto: barra superior + pestañas ----------
  async function pestanas(activa) {
    const [sol, sinLeer] = await Promise.all([A.solicitudes(), A.sinLeer()]);
    const avisoRed = sol.length + sinLeer;
    const t = (id, texto) => `<a href="#${id}" class="${activa === id ? "on" : ""}">${I[id]}<span>${texto}</span>${id === "red" && avisoRed ? `<b class="punto">${avisoRed}</b>` : ""}</a>`;
    return `<nav class="pestanas"><a class="nav-marca" href="#inicio"><img src="media/logo-marron.png" alt=""><span>${esc(C.nombre)}</span></a>${t("inicio", "Inicio")}${t("pedir", "Pedir")}${t("tarjeta", "Tarjeta")}${t("red", "Red")}${t("perfil", "Perfil")}</nav>`;
  }
  async function pintar(html, activa, conNav = true) {
    app.classList.toggle("sin-nav", !conNav);
    const ancho = conNav && window.innerWidth >= 1200;   // en ordenador, columna derecha con tu resumen
    app.innerHTML = html + (conNav ? await pestanas(activa) : "") + (ancho ? await lateral() : "");
    if (ancho) {
      enlazarSeguir();
      document.querySelectorAll("#lateral [data-aceptar]").forEach(b => b.onclick = async () => { await A.aceptar(b.dataset.aceptar); aviso("Solicitud aceptada"); router(); });
    }
  }
  // Columna derecha (solo ordenador): tarjeta, solicitudes, a quién seguir y últimos mensajes
  async function lateral() {
    const [soc, sol, convs, gente] = await Promise.all([A.socio(), A.solicitudes(), A.conversaciones(), A.perfiles("")]);
    const nv = nivelDe(soc), sig = siguienteNivel(soc);
    const sugeridos = [];
    for (const u of gente) { if (sugeridos.length >= 4) break; if ((await A.relacion(u.id)) === "no") sugeridos.push(u); }
    const fila = (u, boton) => `<div class="lat-fila"><a href="#perfil/${encodeURIComponent(u.id)}">${avatar(u)}<span><b>${nombreCon(u)}</b><small>${puesto(u)}</small></span></a>${boton}</div>`;
    return `<aside id="lateral">
      <a class="lat-tarjeta" href="#tarjeta"><span>Socio ${esc(nv.nombre)}</span><b>${esc(U.nombre)}</b>
        <small>${puntosTxt(soc.puntos)} y un ${nv.descuento} % de descuento${sig ? `. Siguiente nivel: ${esc(sig.nombre)}` : ""}</small></a>
      ${sol.length ? `<section><h3>Solicitudes</h3>${sol.map(x => fila(x.perfil, `<button class="boton mini" data-aceptar="${esc(x.perfil.id)}">Aceptar</button>`)).join("")}</section>` : ""}
      ${sugeridos.length ? `<section><h3>Empresas del club</h3>${sugeridos.map(u => fila(u, `<button class="boton mini suave" data-seguir="${esc(u.id)}">Seguir</button>`)).join("")}</section>` : ""}
      <section><h3>Mensajes</h3>${convs.length ? convs.slice(0, 4).map(c => `<a class="lat-fila" href="#chat/${encodeURIComponent(c.perfil.id)}">${avatar(c.perfil)}<span><b>${nombreCon(c.perfil)}</b><small>${esc(c.ultimo.texto)}</small></span>${c.sinLeer ? `<span class="contador">${c.sinLeer}</span>` : ""}</a>`).join("") : `<p class="nota">Aún no tienes mensajes.</p>`}</section>
    </aside>`;
  }
  const barra = (titulo, extra = "", atras = false) =>
    `<header class="barra">${atras ? `<a class="volver" href="${atras}">${I.atras}</a>` : ""}<h1>${titulo}</h1><div class="acciones">${extra}</div></header>`;

  // ---------- Router ----------
  let U = null;
  async function router() {
    U = await A.sesion();
    const [ruta, arg] = location.hash.slice(1).split("/");
    window.scrollTo(0, 0);
    app.classList.toggle("completa", !U);
    if (!U) return ruta === "registro" ? vRegistro() : ruta === "entrar" ? vEntrar() : vBienvenida();
    const V = { inicio: vInicio, pedir: vPedir, pedidos: vPedidos, tarjeta: vTarjeta, red: vRed, perfil: vPerfil, chat: vChat, publicar: vPublicar, editar: vEditar, post: vPost, gestion: vGestion, historia: vNuevaHistoria, facturacion: vFacturacion };
    try { await (V[ruta] || vInicio)(arg ? decodeURIComponent(arg) : null); }
    catch (e) { console.error(e); app.innerHTML = `<div class="vacio">Algo ha fallado: ${esc(e.message)}<br><a class="enlace" href="#inicio">Volver al inicio</a></div>`; }
  }
  window.addEventListener("hashchange", router);
  // Si llega un mensaje o una solicitud mientras miras la pantalla, se repinta (sin perder lo que escribes)
  window.addEventListener("club:cambio", () => {
    const r = location.hash.slice(1).split("/")[0];
    if (r === "chat") pintarChat();
    else if (r === "post") pintarComentarios();
    else if (["red", "inicio"].includes(r) && !document.activeElement.matches("input,textarea")) router();
  });

  // ================================================================ BIENVENIDA Y CUENTA
  function vBienvenida() {
    app.classList.add("sin-nav");
    app.innerHTML = `
      <section class="bienvenida" style="background-image:url('media/elegante.jpg')">
        <div class="bienvenida-cuerpo">
          <img class="logo" src="${esc(N.logo || "media/logo.png")}" alt="${esc(C.marca)}">
          <h1>${esc(C.nombre)}</h1>
          <p>Pide con un ${C.niveles[0].descuento} % de descuento, lleva tu tarjeta de socio en el móvil y conecta con las empresas que ya celebran con ${esc(C.marca)}.</p>
          <ul class="ventajas">
            <li><b>${C.niveles[0].descuento} %</b><span>de descuento desde tu primer pedido, y hasta un ${C.niveles[C.niveles.length - 1].descuento} % según tu nivel</span></li>
            <li><b>QR</b><span>Tu tarjeta de socio siempre a mano, con tus puntos y tu historial</span></li>
            <li><b>Red</b><span>Las empresas y agencias que ya celebran con ${esc(C.marca)}</span></li>
          </ul>
          <div class="botones">
            <a class="boton" href="#registro">Crear mi cuenta</a>
            <a class="boton contorno" href="#entrar">Ya tengo cuenta</a>
          </div>
          ${A.demo ? `<p class="demo">Versión de demostración: los datos se guardan solo en este dispositivo.</p>` : ""}
        </div>
        <div class="bienvenida-mosaico" aria-hidden="true">
          <img class="m1" src="media/empresas.jpg" alt=""><img class="m2" src="media/elegante.jpg" alt=""><img class="m3" src="media/coffee.jpg" alt="">
          <img class="m4" src="media/congresos.jpg" alt=""><img class="m5" src="media/campana.jpg" alt="">
          <div class="mini-tarjeta"><img src="${esc(N.logo || "media/logo.png")}" alt=""><span>${esc(C.niveles[0].nombre)}</span><b>Socio del club</b><small>${C.niveles[0].descuento} % en cada pedido</small></div>
        </div>
      </section>`;
  }

  // Entrar y crear cuenta: en tablet y ordenador, foto de marca a un lado y el formulario al otro
  function acceso(foto, titulo, texto, contenido) {
    return `<div class="acceso">
      <aside class="acceso-foto" style="background-image:url('${foto}')"><div>
        <img class="logo" src="${esc(N.logo || "media/logo.png")}" alt="${esc(C.marca)}">
        <h2>${esc(titulo)}</h2><p>${esc(texto)}</p></div></aside>
      <div class="acceso-form">${contenido}</div></div>`;
  }
  function vEntrar() {
    app.classList.add("sin-nav");
    app.innerHTML = acceso("media/campana.jpg", "Bienvenido de nuevo", "Tu tarjeta, tus pedidos y tu red te esperan.", `${barra("", "", "#")}
      <form class="formulario" id="f">
        <h2>Entrar</h2>
        <label class="campo"><span>Correo</span><input class="entrada" name="email" type="email" autocomplete="email" required></label>
        <div class="campo"><span>Contraseña</span><div class="clave"><input class="entrada" name="clave" type="password" autocomplete="current-password" required><button type="button" class="ver-clave">Mostrar</button></div></div>
        <p style="margin:10px 0 0"><a class="enlace nota" href="#" id="olvido">¿Has olvidado tu contraseña?</a></p>
        <p class="error" id="err"></p>
        <button class="boton ancho" style="margin-top:12px">Entrar</button>
        <p class="nota" style="margin-top:18px">¿Aún no tienes cuenta? <a class="enlace" href="#registro">Créala aquí</a></p>
      </form>`);
    document.getElementById("olvido").onclick = async e => {
      e.preventDefault(); const f = document.getElementById("f");
      try { await A.recuperarClave(f.email.value); hojaTexto("Revisa tu correo", "Te hemos enviado un enlace para crear una contraseña nueva."); }
      catch (er) { hojaTexto("Recuperar la contraseña", er.message); }
    };
    document.getElementById("f").onsubmit = async e => {
      e.preventDefault(); const f = e.target;
      try { await A.entrar(f.email.value, f.clave.value); location.hash = "#inicio"; }
      catch (er) { document.getElementById("err").textContent = er.message; }
    };
  }

  function vRegistro() {
    app.classList.add("sin-nav");
    app.innerHTML = acceso("media/empresas.jpg", "Únete al club", `Desde hoy, un ${C.niveles[0].descuento} % de descuento en tus pedidos y tu tarjeta de socio en el móvil.`, `${barra("", "", "#")}
      <form class="formulario" id="f" novalidate>
        <h2>Crea tu cuenta</h2>
        <p class="nota">Tu cuenta es personal: entras con tu correo y tu contraseña. Los datos de facturación se ponen después, cuando los necesites.</p>
        <div class="campo"><span>Tipo de cuenta</span>
          <div class="segmentos" id="tipo">${C.tiposPerfil.map((t, i) => `<button type="button" data-t="${esc(t)}" class="${i === 0 ? "on" : ""}">${esc(t)}</button>`).join("")}</div></div>
        <label class="campo"><span>Nombre y apellidos</span><input class="entrada" name="nombre" autocomplete="name" autocapitalize="words"></label>
        <label class="campo" id="cEmpresa"><span>Empresa o agencia <small>La verán los demás socios</small></span><input class="entrada" name="empresa" autocomplete="organization"></label>
        <label class="campo"><span>Tu correo <small>Para entrar</small></span><input class="entrada" name="email" type="email" autocomplete="email"></label>
        <div class="campo"><span>Contraseña <small>Mínimo 8 caracteres</small></span><div class="clave"><input class="entrada" name="clave" type="password" autocomplete="new-password"><button type="button" class="ver-clave">Mostrar</button></div></div>
        <div class="campo"><span>Repite la contraseña <small id="coinciden"></small></span><div class="clave"><input class="entrada" name="clave2" type="password" autocomplete="new-password"><button type="button" class="ver-clave">Mostrar</button></div></div>
        <label class="casilla"><input type="checkbox" name="mayor"><span>Declaro que soy mayor de ${C.edadMinima} años.</span></label>
        <label class="casilla"><input type="checkbox" name="acepto"><span>He leído y acepto las <a class="enlace" href="#" id="verCond">condiciones de uso</a>, las <a class="enlace" href="#" id="verClub">bases del club</a> y la <a class="enlace" href="#" id="verPriv">política de privacidad</a>.</span></label>
        <p class="error" id="err"></p>
        <button class="boton ancho" style="margin-top:12px">Crear mi cuenta</button>
        <p class="nota" style="margin-top:18px">¿Ya tienes cuenta? <a class="enlace" href="#entrar">Entra aquí</a></p>
      </form>`);
    let tipo = C.tiposPerfil[0];
    const fr = document.getElementById("f");
    document.querySelectorAll("#tipo button").forEach(b => b.onclick = () => {
      document.querySelectorAll("#tipo button").forEach(x => x.classList.toggle("on", x === b)); tipo = b.dataset.t;
      document.getElementById("cEmpresa").hidden = tipo === "Particular";
    });
    const marca = () => {
      const a = fr.clave.value, b = fr.clave2.value, el = document.getElementById("coinciden");
      el.textContent = !b ? "" : a === b ? "Coinciden" : "No coinciden"; el.style.color = !b ? "" : a === b ? "var(--ok)" : "var(--no)";
    };
    fr.clave.oninput = marca; fr.clave2.oninput = marca;
    document.getElementById("verPriv").onclick = e => { e.preventDefault(); abrirLegal("privacidad"); };
    document.getElementById("verCond").onclick = e => { e.preventDefault(); abrirLegal("condiciones"); };
    document.getElementById("verClub").onclick = e => { e.preventDefault(); abrirLegal("club"); };
    fr.onsubmit = async e => {
      e.preventDefault(); const f = fr, err = document.getElementById("err");
      const fallo = (t, campo) => { err.textContent = t; if (campo && f[campo]) f[campo].focus(); };
      const nombre = f.nombre.value.trim();
      if (nombre.length < 3) return fallo("Escribe tu nombre y apellidos.", "nombre");
      if (tipo !== "Particular" && f.empresa.value.trim().length < 2) return fallo("Escribe el nombre de tu empresa o agencia.", "empresa");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim())) return fallo("Revisa el correo electrónico.", "email");
      if (f.clave.value.length < 8) return fallo("La contraseña necesita al menos 8 caracteres.", "clave");
      if (f.clave.value !== f.clave2.value) return fallo("Las contraseñas no coinciden. Pulsa «Mostrar» para revisarlas.", "clave2");
      if (!f.mayor.checked) return fallo(`El club es solo para mayores de ${C.edadMinima} años.`);
      if (!f.acepto.checked) return fallo("Para crear la cuenta tienes que aceptar las condiciones, las bases del club y la política de privacidad.");
      const b = f.querySelector("button:not([type])"); b.disabled = true; b.textContent = "Creando tu cuenta…";
      try {
        await A.registrar({ email: f.email.value, clave: f.clave.value, nombre, tipo, empresa: tipo === "Particular" ? "" : f.empresa.value.trim(), cargo: "", ciudad: "",
          privado: false, consentimiento: { mayorEdad: true, legal: C.legal.version } });
        vibrar(); location.hash = "#inicio"; setTimeout(() => aviso("Cuenta creada. Te hemos enviado un correo para confirmarla."), 300);
      } catch (er) { err.textContent = er.message; b.disabled = false; b.textContent = "Crear mi cuenta"; }
    };
  }

  // ---------- Facturación ----------
  // Particular: sus datos (DNI y dirección). Empresa o agencia: se une a la ficha de su empresa por el CIF
  async function vFacturacion() { return U.tipo === "Particular" ? vFactParticular() : vFactEmpresa(); }

  async function vFactParticular() {
    const f = (await A.facturacion()) || {};
    app.classList.add("sin-nav");
    app.innerHTML = `${barra("Facturación", "", "#editar")}
      <form class="formulario" id="f" novalidate>
        <p class="nota">Los datos que irán en tus facturas. Solo los ve ${esc(C.marca)}.</p>
        ${camposFacturacion(f, true)}
        <label class="campo"><span>Móvil</span><input class="entrada" name="movil" type="tel" value="${esc(f.movil || "")}"></label>
        <p class="error" id="err"></p>
        <button class="boton ancho" style="margin-top:12px">Guardar</button>
      </form>`;
    const fr = document.getElementById("f"); enlazarCP(fr);
    fr.onsubmit = async e => {
      e.preventDefault(); const err = document.getElementById("err");
      const movil = fr.movil.value.trim(); if (movil.replace(/\D/g, "").length < 9) { err.textContent = "Escribe tu móvil."; return fr.movil.focus(); }
      const r = leerFacturacion(fr, true, U.nombre, movil);
      if (r.error) { err.textContent = r.error; if (fr[r.campo]) fr[r.campo].focus(); return; }
      try { await A.guardarFacturacion(r.fact); S.factOk = true; aviso("Datos de facturación guardados"); location.hash = "#editar"; }
      catch (er) { err.textContent = er.message; }
    };
  }

  // Campos de la ficha de una empresa (sin el CIF, que se pone antes)
  function camposEmpresa(f = {}) {
    return `<label class="campo"><span>Razón social</span><input class="entrada" name="razon" autocomplete="organization" placeholder="Ej.: Eventos Ejemplo, S.L." value="${esc(f.nombre || "")}"></label>
      <label class="campo"><span>Nombre comercial <small>Opcional, si es distinto</small></span><input class="entrada" name="comercial" value="${esc(f.nombre_comercial || "")}"></label>
      <label class="campo"><span>Dirección fiscal <small>Calle y número</small></span><input class="entrada" name="direccion" autocomplete="street-address" value="${esc(f.direccion || "")}"></label>
      <div class="dos-campos">
        <label class="campo"><span>Código postal</span><input class="entrada" name="cp" inputmode="numeric" maxlength="5" value="${esc(f.cp || "")}"></label>
        <label class="campo"><span>Localidad</span><input class="entrada" name="localidad" value="${esc(f.localidad || "")}"></label>
      </div>
      <label class="campo"><span>Provincia</span><input class="entrada" name="provincia" value="${esc(f.provincia || "")}"></label>
      <label class="campo"><span>Correo de facturación de la empresa <small>A donde enviar las facturas</small></span><input class="entrada" name="emailfe" type="email" value="${esc(f.email_fe || "")}"></label>`;
  }
  function leerEmpresa(fr) {
    const v = n => fr[n].value.trim();
    if (v("razon").length < 2) return { error: "Escribe la razón social (el nombre que va en la factura).", campo: "razon" };
    if (v("direccion").length < 3) return { error: "Escribe la dirección fiscal.", campo: "direccion" };
    if (!/^\d{5}$/.test(v("cp"))) return { error: "El código postal tiene 5 cifras.", campo: "cp" };
    if (!v("localidad")) return { error: "Escribe la localidad.", campo: "localidad" };
    if (!v("provincia")) return { error: "Escribe la provincia.", campo: "provincia" };
    if (v("emailfe") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("emailfe"))) return { error: "Revisa el correo de facturación.", campo: "emailfe" };
    return { e: { nombre: v("razon"), nombre_comercial: v("comercial"), direccion: v("direccion"), cp: v("cp"), localidad: v("localidad"), provincia: v("provincia"), email_fe: v("emailfe") } };
  }

  async function vFactEmpresa() {
    const mi = await A.miEmpresa(), quien = U.tipo === "Agencia" ? "agencia" : "empresa";
    app.classList.add("sin-nav");
    const cab = barra("Facturación", "", "#editar");
    // Ya unido (o pendiente) a una empresa
    if (mi && mi.empresa) {
      const e = mi.empresa, fis = mi.fiscal || {};
      const estado = mi.soyTitular ? "titular" : (mi.miembro && mi.miembro.estado) || "pendiente", verificada = !!e.verificada;
      const miembros = mi.soyTitular ? await A.miembrosEmpresa(e.cif) : [];
      const pend = miembros.filter(m => m.estado === "pendiente"), oks = miembros.filter(m => m.estado === "ok" && m.uid !== U.id);
      const chip = !verificada && (estado === "titular" || estado === "ok") ? ["pend-chip", `Pendiente de que ${C.marca} verifique la ${quien}`] : { titular: ["ok-chip", "Eres la persona titular"], ok: ["ok-chip", "Aprobado: facturas con esta empresa"],
        rechazado: ["", "No te han aprobado"], pendiente: ["pend-chip", `Pendiente de que te apruebe ${e.titularNombre || "la titular"}`] }[estado];
      const notaVerif = !verificada ? `<p class="nota" style="margin-top:12px">${esc(C.marca)} comprueba cada ${quien} nueva antes de que se pueda facturar con ella y de que se unan compañeros. Te avisaremos si necesitamos algo.</p>` : "";
      app.innerHTML = `${cab}
        <section class="formulario">
          <div class="empresa-ficha"><small>Facturas a nombre de</small><b>${esc(e.nombre)}</b><span>${esc(e.cif)}${e.localidad ? " · " + esc(e.localidad) : ""}</span>
            <em class="chip ${chip[0]}">${esc(chip[1])}</em></div>
          ${notaVerif}
          ${estado === "pendiente" ? `<p class="nota" style="margin-top:12px">Mientras tanto puedes usar el club con normalidad. ${esc(C.marca)} también puede aprobarte.</p>` : ""}
          ${estado === "ok" && mi.fiscal ? `<dl class="fiscal"><dt>Dirección fiscal</dt><dd>${esc([fis.direccion, [fis.cp, fis.localidad].filter(Boolean).join(" "), fis.provincia].filter(Boolean).join(", "))}</dd>
            ${fis.email_fe ? `<dt>Facturas a</dt><dd>${esc(fis.email_fe)}</dd>` : ""}</dl><p class="nota">Si hay que cambiar algo, lo hace ${esc(e.titularNombre || "la persona titular")}.</p>` : ""}
          ${mi.soyTitular ? `<h3 class="form-seccion">Compañeros</h3>
            ${pend.length ? pend.map(m => `<p class="fila-miembro"><span><b>${esc(m.nombre || "Un socio")}</b> quiere facturar con vuestra ${quien}.</span>
              ${verificada ? `<span class="gestion-botones"><button class="boton mini" data-aprobar="${esc(m.uid)}">Aprobar</button><button class="boton mini suave" data-denegar="${esc(m.uid)}">No es de la ${quien}</button></span>`
                : `<span class="nota">Podrás aprobarlo cuando ${esc(C.marca)} verifique la ${quien}.</span>`}</p>`).join("")
              : `<p class="nota">No hay solicitudes pendientes. Tus compañeros solo tienen que poner el CIF en su Facturación.</p>`}
            ${oks.length ? `<p class="nota" style="margin-top:10px">Ya facturan con vosotros: ${oks.map(m => esc(m.nombre)).join(", ")}.</p>` : ""}
            <h3 class="form-seccion">Datos de la ${quien}</h3>
            <form id="fe" novalidate>${camposEmpresa({ ...e, ...fis })}<p class="error" id="err"></p><button class="boton ancho" style="margin-top:12px">Guardar cambios</button></form>` : ""}
          <button class="boton contorno ancho" id="salirEmp" style="margin-top:26px">${estado === "rechazado" ? "Poner otro CIF" : `Dejar de facturar con esta ${quien}`}</button>
        </section>`;
      document.querySelectorAll("[data-aprobar]").forEach(b => b.onclick = async () => { await A.resolverMiembro(e.cif, b.dataset.aprobar, true); aviso("Aprobado"); vFactEmpresa(); });
      document.querySelectorAll("[data-denegar]").forEach(b => b.onclick = async () => { if (await confirmar("¿No trabaja en vuestra empresa? No podrá facturar con ella.", "No es de la empresa")) { await A.resolverMiembro(e.cif, b.dataset.denegar, false); vFactEmpresa(); } });
      const fe = document.getElementById("fe");
      if (fe) { enlazarCP(fe); fe.onsubmit = async ev => { ev.preventDefault(); const r = leerEmpresa(fe); const err = document.getElementById("err"); if (r.error) { err.textContent = r.error; return fe[r.campo].focus(); } try { await A.guardarEmpresa(e.cif, r.e); aviso("Datos guardados"); } catch (er) { err.textContent = er.message; } }; }
      document.getElementById("salirEmp").onclick = async () => {
        if (estado === "titular" && oks.length) return hojaTexto("Antes de salir", `Eres la persona titular y hay compañeros que facturan con esta ${quien}. Pide a ${C.marca} que pase la titularidad a otra persona.`);
        if (await confirmar(`Dejarás de facturar con ${e.nombre}.`, "Dejar de facturar")) { await A.salirEmpresa(e.cif); S.factOk = false; vFactEmpresa(); }
      };
      return;
    }
    // Paso 1: el CIF
    const viejo = (mi && mi.fact) || {};   // datos de la versión anterior (si los había), para no volver a escribirlos
    app.innerHTML = `${cab}
      <form class="formulario" id="fc" novalidate>
        <p class="nota">Tus facturas irán a nombre de tu ${quien}. Si ya está en el club, solo tienes que unirte.</p>
        <label class="campo"><span>CIF o NIF de la ${quien}</span><input class="entrada" name="cif" autocapitalize="characters" placeholder="Ej.: B12345678" value="${esc(viejo.cif || "")}"></label>
        <label class="campo"><span>Tu móvil</span><input class="entrada" name="movil" type="tel" autocomplete="tel" value="${esc(viejo.movil || "")}"></label>
        <p class="error" id="err"></p>
        <button class="boton ancho" style="margin-top:12px">Continuar</button>
      </form>
      <div id="paso2"></div>`;
    const fc = document.getElementById("fc");
    fc.onsubmit = async ev => {
      ev.preventDefault(); const err = document.getElementById("err"); err.textContent = "";
      const cif = limpiaId(fc.cif.value), movil = fc.movil.value.trim();
      if (!cifValido(cif) && !nifValido(cif)) { err.textContent = "El CIF o NIF no es correcto. Revísalo."; return fc.cif.focus(); }
      if (movil.replace(/\D/g, "").length < 9) { err.textContent = "Escribe tu móvil."; return fc.movil.focus(); }
      const e = await A.empresaPorCif(cif), p2 = document.getElementById("paso2");
      if (e) {
        p2.innerHTML = `<section class="formulario" style="padding-top:0">
          <div class="empresa-ficha"><small>Ya está en el club</small><b>${esc(e.nombre)}</b><span>${esc(cif)}${e.localidad ? " · " + esc(e.localidad) : ""}</span></div>
          <p class="nota" style="margin-top:12px">${esc(e.titularNombre || "La persona titular")} confirmará que trabajas allí. Mientras, puedes usar el club con normalidad.</p>
          <button class="boton ancho" id="unirme" style="margin-top:12px">Sí, es mi ${quien}: pedir unirme</button></section>`;
        document.getElementById("unirme").onclick = async () => {
          try { await A.unirseEmpresa(cif, movil); S.factOk = true; aviso(`Solicitud enviada a ${e.titularNombre || "la titular"}`); vFactEmpresa(); } catch (er) { aviso(er.message); }
        };
      } else {
        p2.innerHTML = `<form class="formulario" id="fe" novalidate style="padding-top:0">
          <h3 class="form-seccion">Da de alta tu ${quien}</h3>
          <p class="nota">Eres la primera persona de esta ${quien} en el club. Tus compañeros solo tendrán que poner el CIF y tú los aprobarás.</p>
          ${camposEmpresa(viejo.tipo === "EMPRESA" ? viejo : { nombre: U.empresa })}
          <p class="error" id="err2"></p>
          <button class="boton ancho" style="margin-top:12px">Dar de alta la ${quien}</button></form>`;
        const fe = document.getElementById("fe"); enlazarCP(fe);
        fe.onsubmit = async ev2 => {
          ev2.preventDefault(); const r = leerEmpresa(fe), err2 = document.getElementById("err2");
          if (r.error) { err2.textContent = r.error; return fe[r.campo].focus(); }
          try { await A.crearEmpresa({ ...r.e, cif }, movil); S.factOk = true; aviso(`Dada de alta. ${C.marca} la verificará en breve.`); vFactEmpresa(); }
          catch (er) { err2.textContent = er.message; }
        };
      }
      p2.scrollIntoView({ behavior: "smooth", block: "start" });
    };
  }

  // ================================================================ INICIO (fotos de la comunidad)
  async function vInicio() {
    const [soc, pedidos, posts] = await Promise.all([A.socio(), A.pedidos(), A.publicaciones({ filtro: S.filtroFeed })]);
    const pts = soc.puntos, nv = nivelDe(soc), ult = pedidos[0];
    const faltan = [!U.foto && "la foto de perfil", !U.portada && "la foto de portada", !U.bio && "la biografía"].filter(Boolean);
    if (!U.oficial && !S.factOk) S.factOk = !!(await A.facturacion());
    const solEmp = !U.oficial && U.tipo !== "Particular" ? await A.solicitudesMiEmpresa() : null;
    const correoOk = await A.correoVerificado(), sig = siguienteNivel(soc);
    const progreso = sig ? Math.round((Math.min(1, pts / Math.max(1, sig.desde)) + Math.min(1, soc.pedidos / Math.max(1, sig.pedidos || 1))) * 50) : 100;
    let iosVisto = false; try { iosVisto = !!localStorage.getItem("club_ios_instalar"); } catch (e) {}
    const iosInstalar = /iPhone|iPad|iPod/.test(navigator.userAgent) && !navigator.standalone && !window.Capacitor && !iosVisto;
    const html = `
      ${barra(esc(C.marca), `<a class="icono-btn" href="#publicar" aria-label="Subir foto">${I.mas}</a>`)}
      ${await tiraHistorias()}
      ${U.oficial ? `<section class="saludo"><h2>${esc(C.marca)}</h2><p>Cuenta oficial. Publica historias y gestiona pedidos, fotos y opiniones desde el <a class="enlace" href="#gestion">Panel</a>.</p></section>`
        : `<a class="resumen-socio" href="#tarjeta"><span class="rs-hola">Hola, ${esc(U.nombre.split(" ")[0])}</span>
            <span class="rs-fila"><b>${esc(nv.nombre)}</b><strong>${nv.descuento} %</strong></span>
            <small>${puntosTxt(pts)}${sig ? `. Siguiente nivel: ${esc(sig.nombre)}` : ". Nivel máximo"}</small>
            <span class="rs-barra"><i style="width:${Math.max(4, progreso)}%"></i></span>
            <img src="${esc(N.logo || "media/logo.png")}" alt="" class="rs-logo"></a>`}
      ${!correoOk ? `<section class="aviso-correo"><b>Confirma tu correo</b><span>Te hemos enviado un enlace a tu correo. Hasta que lo confirmes no podrás publicar, comentar, seguir ni escribir mensajes.</span>
          <span class="gestion-botones"><button class="boton mini" id="yaVerif">Ya lo he confirmado</button><button class="boton mini suave" id="reenviar">Reenviar el correo</button></span></section>` : ""}
      ${iosInstalar ? `<section class="instalar-ios"><b>Instala el club en tu iPhone</b><span>Pulsa el botón Compartir de Safari y luego «Añadir a pantalla de inicio». Se abrirá como una app.</span><button id="iosCerrar" aria-label="Cerrar">×</button></section>` : ""}
      ${solEmp && solEmp.n ? `<a class="completar" href="#facturacion"><b>${solEmp.n === 1 ? "Un compañero quiere" : solEmp.n + " compañeros quieren"} facturar con ${esc(solEmp.empresa.nombre)}</b><span>Confirma que trabajan con vosotros.</span></a>` : ""}
      ${!U.oficial && !S.factOk ? `<a class="completar suave" href="#facturacion"><b>Datos de facturación</b><span>${U.tipo === "Particular" ? "Ponlos cuando quieras: los necesitaremos para tus facturas." : "Une tu cuenta a tu empresa con su CIF. Si ya está en el club, solo tienes que unirte."}</span></a>` : ""}
      ${faltan.length ? `<a class="completar" href="#editar"><b>Completa tu perfil</b><span>Te falta ${listaNatural(faltan)}. Así las empresas del club sabrán quién eres.</span><div class="barra-progreso"><i style="width:${Math.round((3 - faltan.length) / 3 * 100)}%"></i></div></a>` : ""}
      <div class="atajos">
        ${ult && ult.menu && ult.personas ? `<button class="atajo oscuro" id="repetir"><b>Repetir pedido</b><span>${esc(ult.menu)} para ${ult.personas} personas</span></button>`
              : `<a class="atajo oscuro" href="#pedir"><b>${C.pedidos.activos ? "Hacer un pedido" : "Ver la carta"}</b><span>${C.pedidos.activos ? `Con tu ${nv.descuento} % de descuento de socio` : `Con tus precios de socio. Pedidos desde la app, muy pronto`}</span></a>`}
        <a class="atajo" href="#publicar"><b>Subir fotos</b><span>Etiqueta a ${esc(C.marca)} y suma ${C.puntos.porFoto} puntos cuando la verifique</span></a>
      </div>
      <div class="filtro-feed"><div class="segmentos" id="filtro"><button data-f="todos" class="${S.filtroFeed === "todos" ? "on" : ""}">Todo el club</button><button data-f="siguiendo" class="${S.filtroFeed === "siguiendo" ? "on" : ""}">A quién sigo</button></div></div>
      ${posts.length ? (await Promise.all(posts.map(tarjetaPost))).join("") : S.filtroFeed === "siguiendo" ? `<p class="vacio">Aún no sigues a nadie que haya publicado. Busca empresas en «Red».</p>`
        : `<a class="vacio-foto" href="#publicar" style="background-image:url('media/elegante.jpg')"><b>Las fotos del club aparecerán aquí</b><span>Sube la de tu último evento con ${esc(C.marca)}.</span><span class="boton">Subir una foto</span></a>`}`;
    await pintar(html, "inicio");
    document.querySelectorAll("#filtro button").forEach(b => b.onclick = () => { S.filtroFeed = b.dataset.f; vInicio(); });
    const rep = document.getElementById("repetir"); if (rep) rep.onclick = () => { S.repetir = ult; location.hash = "#pedir"; };
    document.querySelectorAll("[data-historia]").forEach(b => b.onclick = () => abrirHistorias(+b.dataset.historia));
    const yv = document.getElementById("yaVerif");
    if (yv) yv.onclick = async () => { if (await A.comprobarCorreo()) { aviso("Correo confirmado. ¡Ya puedes publicar!"); vInicio(); } else aviso("Aún no nos consta. Abre el enlace del correo y vuelve a pulsar."); };
    const rv = document.getElementById("reenviar");
    if (rv) rv.onclick = async () => { try { await A.reenviarCorreo(); aviso(`Te lo hemos enviado otra vez a ${U.email || "tu correo"}. Mira también en spam.`); } catch (e) { aviso(e.message); } };
    const ic = document.getElementById("iosCerrar");
    if (ic) ic.onclick = () => { try { localStorage.setItem("club_ios_instalar", "1"); } catch (e) {} ic.parentElement.remove(); };
    enlazarPosts();
  }

  // ================================================================ HISTORIAS (de Doña Col, duran 12 horas)
  const VISTAS_K = "club_historias_vistas";
  const vistasLocal = () => { try { return JSON.parse(localStorage.getItem(VISTAS_K)) || []; } catch (e) { return []; } };
  const marcarVista = id => { try { localStorage.setItem(VISTAS_K, JSON.stringify([...new Set([...vistasLocal(), id])].slice(-200))); } catch (e) {} };
  const quedan = iso => { const h = Math.max(0, (new Date(iso) - Date.now()) / 3600e3); return h >= 1 ? `quedan ${Math.floor(h)} h` : `quedan ${Math.max(1, Math.round(h * 60))} min`; };
  async function tiraHistorias() {
    const [hs, gestiona] = await Promise.all([A.historias(), A.puedeGestionar()]);
    S.historias = hs;
    if (!hs.length && !gestiona) return "";
    const vistas = new Set(vistasLocal());
    return `<div class="historias" aria-label="Historias de ${esc(C.marca)}">
      ${gestiona ? `<a class="historia nueva" href="#historia">${I.mas}<span>Nueva historia${A.demo ? " (simulación)" : ""}</span></a>` : ""}
      ${hs.map((h, i) => `<button class="historia${vistas.has(h.id) ? " vista" : ""}" data-historia="${i}">
        <img src="${esc(optim(h.foto, 320))}" alt="" loading="lazy"><span>${esc(h.texto || C.marca)}<small>${quedan(h.caduca)}</small></span></button>`).join("")}
    </div>`;
  }
  async function abrirHistorias(inicio) {
    const hs = S.historias || []; if (!hs.length) return;
    const gestiona = await A.puedeGestionar(), seg = (C.historias.segundos || 6) * 1000;
    let i = inicio, t0 = 0, raf = 0, pausa = false;
    const v = document.createElement("div"); v.className = "visor-historia";
    document.body.appendChild(v); document.body.style.overflow = "hidden";
    const cerrar = () => { cancelAnimationFrame(raf); v.remove(); document.body.style.overflow = ""; if (location.hash.startsWith("#inicio") || !location.hash) vInicio(); };
    const buscarMenu = ref => buscarProducto(ref);
    const pintarUna = async () => {
      const h = hs[i]; marcarVista(h.id); if (!gestiona) A.verHistoria(h.id);
      const dest = h.menu && buscarMenu(h.menu);
      v.innerHTML = `<div class="vh-barras">${hs.map((_, j) => `<i><b style="width:${j < i ? 100 : 0}%"></b></i>`).join("")}</div>
        <div class="vh-cab">${avatar(h.perfil)}<b>${esc((h.perfil && h.perfil.nombre) || C.marca)}</b><small>${hace(h.fecha)}</small><button class="vh-cerrar" aria-label="Cerrar">×</button></div>
        <img class="vh-foto" src="${esc(optim(h.foto, 1080))}" alt="">
        <button class="vh-zona vh-atras" aria-label="Anterior"></button><button class="vh-zona vh-sig" aria-label="Siguiente"></button>
        <div class="vh-pie">${h.texto ? `<p>${esc(h.texto)}</p>` : ""}
          ${dest ? `<button class="boton vh-pedir">Pedir ${esc(N.carta[dest[0]].menus[dest[1]].nombre)}</button>` : ""}
          ${gestiona ? `<p class="vh-gestion"><span id="vhVistas">Vista por …</span> · ${quedan(h.caduca)} · <button class="vh-borrar">Borrar</button></p>` : ""}</div>`;
      v.querySelector(".vh-cerrar").onclick = cerrar;
      v.querySelector(".vh-atras").onclick = () => { if (i > 0) { i--; pintarUna(); } else { t0 = performance.now(); } };
      v.querySelector(".vh-sig").onclick = () => { if (i < hs.length - 1) { i++; pintarUna(); } else cerrar(); };
      const pd = v.querySelector(".vh-pedir");
      if (pd) pd.onclick = async () => { const [ci, mi] = dest, soc = await A.socio(); cerrar(); S.categoria = ci; location.hash = "#pedir"; setTimeout(() => hojaPedido(ci, mi, nivelDe(soc).descuento), 350); };
      if (gestiona) {
        A.vistasHistoria(h.id).then(n => { const e = v.querySelector("#vhVistas"); if (e) e.textContent = `Vista por ${n} ${n === 1 ? "persona" : "personas"}`; });
        v.querySelector(".vh-borrar").onclick = async () => { pausa = true; if (await confirmar("¿Borrar esta historia? Dejará de verse ya.", "Borrar")) { await A.borrarHistoria(h.id); aviso("Historia borrada"); cerrar(); } else pausa = false; };
      }
      t0 = performance.now();
    };
    const tic = ahora => {
      if (!v.isConnected) return;
      if (pausa) t0 += 16; else {
        const k = Math.min(1, (ahora - t0) / seg), b = v.querySelectorAll(".vh-barras b")[i];
        if (b) b.style.width = k * 100 + "%";
        if (k >= 1) { if (i < hs.length - 1) { i++; pintarUna(); } else return cerrar(); }
      }
      raf = requestAnimationFrame(tic);
    };
    v.addEventListener("pointerdown", e => { if (e.target.closest(".vh-zona")) pausa = true; });
    v.addEventListener("pointerup", () => { pausa = false; });
    await pintarUna(); raf = requestAnimationFrame(tic);
  }
  async function vNuevaHistoria() {
    if (!(await A.puedeGestionar())) { location.hash = "#inicio"; return; }
    app.classList.add("sin-nav");
    app.innerHTML = `${barra("Nueva historia", "", "#inicio")}
      <form class="formulario" id="f">
        <label class="elegir-foto vertical" for="foto" id="vista">${I.camara}<span>Elige una foto, mejor en vertical</span></label>
        <input type="file" id="foto" class="oculto" accept="image/*">
        <label class="campo"><span>Texto <small>Opcional, hasta 160 caracteres</small></span><textarea class="entrada" name="texto" maxlength="160" placeholder="Ej.: Solo hoy, un 10 % extra en coffee break para mañana"></textarea></label>
        <div class="campo"><span>Botón «Pedir» <small>Opcional: lleva al menú de la carta</small></span>
          <select class="entrada" name="menu"><option value="">Sin botón</option>${N.carta.map(c => `<optgroup label="${esc(c.categoria)}">${c.menus.map(m => `<option value="${esc(m.id ?? m.nombre)}">${esc(m.nombre)}</option>`).join("")}</optgroup>`).join("")}</select></div>
        <p class="error" id="err"></p>
        <button class="boton ancho" style="margin-top:12px">Publicar historia</button>
        <p class="nota" style="margin-top:12px">La verán todos los socios durante ${C.historias.horas} horas y luego desaparecerá.${A.demo ? " En la demostración se publica como la cuenta de " + esc(C.marca) + "." : ""}</p>
      </form>`;
    let foto = null;
    document.getElementById("foto").onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { foto = await comprimir(f, 1400, .78, 650000); document.getElementById("vista").innerHTML = `<img src="${foto}" alt="">`; }
      catch (er) { document.getElementById("err").textContent = er.message; }
    };
    document.getElementById("f").onsubmit = async e => {
      e.preventDefault(); const f = e.target, b = f.querySelector("button"); b.disabled = true; b.textContent = "Publicando…";
      try { await A.publicarHistoria({ foto, texto: f.texto.value, menu: f.menu.value }); vibrar(); aviso("Historia publicada"); location.hash = "#inicio"; }
      catch (er) { document.getElementById("err").textContent = er.message; b.disabled = false; b.textContent = "Publicar historia"; }
    };
  }

  // ================================================================ OPINIÓN EN GOOGLE (suma puntos cuando Doña Col la encuentra)
  function hojaResena(previa) {
    const h = document.createElement("div"); h.className = "hoja-menu";
    h.innerHTML = `<form class="hoja-larga hoja-resena">
        <h3>Tu opinión en Google</h3>
        <p>Cuéntanos qué tal fue en la ficha de ${esc(C.marca)} en Google. Cuando la encontremos, te sumamos ${puntosTxt(C.puntos.porResena)}, sea cual sea tu opinión.</p>
        <a class="boton ancho" href="${esc(C.enlaceResena)}" target="_blank" rel="noopener">1. Abrir la ficha de ${esc(C.marca)}</a>
        <label class="campo"><span>2. ¿Con qué nombre aparece tu opinión?</span><input class="entrada" name="nombre" maxlength="80" placeholder="Ej.: Laura M." value="${esc(previa || "")}"></label>
        <p class="error" id="errR"></p>
        <button class="boton ancho contorno" type="submit">3. Ya la he publicado</button>
        <button type="button" data-cerrar class="hoja-cancelar">Cancelar</button>
      </form>`;
    h.onclick = e => { if (e.target === h || e.target.closest("[data-cerrar]")) h.remove(); };
    h.querySelector("form").onsubmit = async e => {
      e.preventDefault();
      try { await A.avisarResena(e.target.nombre.value); h.remove(); aviso(`Gracias. ${C.marca} la comprobará y te sumará los puntos.`); vTarjeta(); }
      catch (er) { h.querySelector("#errR").textContent = er.message; }
    };
    document.body.appendChild(h);
  }
  async function tarjetaPost(p) {
    if (p.repostDe) {
      const quien = p.perfil.id === U.id ? "Tú" : esc(p.perfil.nombre);
      return `<article class="post compartida" data-id="${esc(p.original.id)}" data-autor="${esc(p.original.perfil.id)}" data-repost="${esc(p.id)}" data-repostero="${esc(p.perfil.id)}">
        <p class="compartido-por">${I.compartir}<span><a href="#perfil/${encodeURIComponent(p.perfil.id)}">${quien}</a> ${p.perfil.id === U.id ? "has" : "ha"} compartido, ${hace(p.fecha)}</span></p>
        ${p.texto ? `<p class="compartido-texto">${esc(p.texto)}</p>` : ""}
        ${await cuerpoPost(p.original)}</article>`;
    }
    return `<article class="post" data-id="${esc(p.id)}" data-autor="${esc(p.perfil.id)}">${await cuerpoPost(p)}</article>`;
  }
  async function cuerpoPost(p) {
    const u = p.perfil, mio = u.id === U.id, rel = mio ? "ok" : await A.relacion(u.id);
    const puedeCompartir = !mio && !u.privado;
    return `
      <header><a class="autor" href="#perfil/${encodeURIComponent(u.id)}">${avatar(u)}<span><b>${nombreCon(u)}</b><small>${puesto(u)}</small></span></a>
        ${!mio && rel === "no" ? `<button class="seguir-mini" data-seguir="${esc(u.id)}">Seguir</button>` : ""}
        <button class="icono-btn" data-menu aria-label="Más opciones">${I.puntos}</button></header>
      <img class="foto" src="${esc(optim(p.foto, 1080))}" alt="${esc(p.texto || "Foto de un evento")}" loading="lazy">
      <div class="acciones-post"><button class="gusta${p.meGustaYo ? " on" : ""}" data-gusta aria-label="Me gusta">${I.corazon}<span>${p.meGusta.length}</span></button>
        <a class="gusta" href="#post/${encodeURIComponent(p.id)}" aria-label="Comentarios">${I.comentario}<span>${p.nComentarios || 0}</span></a>
        ${puedeCompartir ? `<button class="gusta${p.compartidaPorMi ? " hecho" : ""}" data-compartir aria-label="Compartir en mi perfil">${I.compartir}<span>${p.nCompartida || 0}</span></button>` : ""}
        ${p.evento ? `<span class="chip" style="margin-left:auto">${esc(p.evento)}</span>` : ""}</div>
      <div class="pie">${p.verificacion === "verificada" ? `<p class="sello-dc">${I.check} Evento verificado por ${esc(C.marca)}</p>`
          : mio && p.verificacion === "pendiente" ? `<p class="sello-dc pendiente">Pendiente de que ${esc(C.marca)} la verifique</p>`
          : mio && p.verificacion === "rechazada" ? `<p class="sello-dc rechazada">${esc(C.marca)} no la ha podido verificar: no suma puntos</p>` : ""}
        ${p.texto ? `<b>${esc(u.nombre)}</b> ${esc(p.texto)}` : ""}
        ${p.nComentarios ? `<a class="ver-comentarios" href="#post/${encodeURIComponent(p.id)}">Ver ${p.nComentarios === 1 ? "el comentario" : `los ${p.nComentarios} comentarios`}</a>` : ""}
        <time>${hace(p.fecha)}</time></div>`;
  }
  function enlazarPosts() {
    document.querySelectorAll(".post").forEach(el => {
      const id = el.dataset.id, autor = el.dataset.autor;
      const g = el.querySelector("[data-gusta]");
      if (g) g.onclick = async () => { const on = await A.meGusta(id); g.classList.toggle("on", on); const n = g.querySelector("span"); n.textContent = +n.textContent + (on ? 1 : -1); if (on) vibrar(); };
      const s = el.querySelector("[data-seguir]");
      if (s) s.onclick = async () => { const est = await A.seguir(autor); s.remove(); aviso(est === "pendiente" ? "Solicitud enviada" : "Ahora le sigues"); };
      const c = el.querySelector("[data-compartir]");
      if (c) c.onclick = () => hojaCompartir(id);
      const miRepost = el.dataset.repostero === U.id ? [{ texto: "Quitar de mi perfil", peligro: true, accion: async () => { await A.borrarPublicacion(el.dataset.repost); aviso("Quitada de tu perfil"); router(); } }] : [];
      el.querySelector("[data-menu]").onclick = () => menuHoja(autor === U.id
        ? [...miRepost, { texto: "Borrar esta foto", peligro: true, accion: async () => { if (await confirmar("¿Borrar esta foto? También desaparecerá donde la hayan compartido.", "Borrar")) { await A.borrarPublicacion(id); router(); } } }]
        : [...miRepost,
           ...(U.oficial ? [{ texto: "Borrar (moderación)", peligro: true, accion: async () => { if (await confirmar("¿Borrar esta foto de la red? Desaparecerá para todos.", "Borrar")) { try { await A.moderarPublicacion(id); aviso("Foto borrada"); router(); } catch (e) { aviso(e.message); } } } }] : []),
           { texto: "Ver perfil", accion: () => location.hash = "#perfil/" + encodeURIComponent(autor) },
           { texto: "Enviar mensaje", accion: () => location.hash = "#chat/" + encodeURIComponent(autor) },
           { texto: "Denunciar esta foto", accion: async () => { await A.denunciar(id, "inapropiada"); aviso("Gracias. Doña Col la revisará."); } },
           { texto: "Bloquear a este usuario", peligro: true, accion: async () => { await A.bloquear(autor); aviso("Usuario bloqueado"); router(); } }]);
    });
  }

  function hojaCompartir(id) {
    const h = document.createElement("div"); h.className = "hoja-menu";
    h.innerHTML = `<div class="hoja-larga"><h3>Compartir en tu perfil</h3>
      <p class="nota" style="margin:0 0 12px">La verán quienes te siguen, con el nombre de quien la subió.</p>
      <textarea class="entrada" id="txtCompartir" maxlength="300" placeholder="Añade un comentario (opcional)"></textarea>
      <p class="error" id="errCompartir"></p>
      <button class="boton ancho" id="okCompartir" style="margin-top:8px">Compartir</button>
      <button class="boton suave ancho" data-cerrar style="margin-top:8px">Cancelar</button></div>`;
    h.onclick = e => { if (e.target === h || e.target.closest("[data-cerrar]")) h.remove(); };
    document.body.appendChild(h);
    h.querySelector("#okCompartir").onclick = async () => {
      try { await A.compartir(id, h.querySelector("#txtCompartir").value); h.remove(); vibrar(); aviso("Compartida en tu perfil"); router(); }
      catch (er) { h.querySelector("#errCompartir").textContent = er.message; }
    };
  }

  let postAbierto = null;
  async function vPost(id) {
    const p = await A.publicacion(id);
    if (!p) { aviso("Esa foto ya no está disponible."); return vInicio(); }
    postAbierto = id;
    app.classList.add("sin-nav");
    app.innerHTML = `${barra("Comentarios", "", "javascript:history.back()")}
      ${await tarjetaPost(p)}
      <div class="comentarios" id="coms"></div>
      <form class="escribir" id="fc"><input id="txtc" placeholder="Escribe un comentario" autocomplete="off" enterkeyhint="send" maxlength="500"><button aria-label="Publicar comentario">${I.enviar}</button></form>`;
    enlazarPosts();
    await pintarComentarios();
    pegarAlTeclado("fc");
    document.getElementById("fc").onsubmit = async e => {
      e.preventDefault(); const t = document.getElementById("txtc"); if (!t.value.trim()) return;
      await A.comentar(id, t.value); t.value = ""; await pintarComentarios(true);
    };
  }
  async function pintarComentarios(alFinal) {
    const c = document.getElementById("coms"); if (!c || !postAbierto) return;
    const cs = await A.comentarios(postAbierto);
    c.innerHTML = cs.length ? cs.map(x => `
      <div class="comentario">${avatar(x.perfil)}<div><p><a href="#perfil/${encodeURIComponent(x.perfil.id)}"><b>${nombreCon(x.perfil)}</b></a> ${esc(x.texto)}</p>
        <small>${hace(x.fecha)}${x.autor === U.id || U.oficial ? ` · <button class="borrar-com" data-c="${esc(x.id)}">Borrar</button>` : ""}</small></div></div>`).join("")
      : `<p class="vacio">Aún no hay comentarios. Escribe el primero.</p>`;
    c.querySelectorAll(".borrar-com").forEach(b => b.onclick = async () => { await A.borrarComentario(postAbierto, b.dataset.c); pintarComentarios(); });
    const n = document.querySelector(".post a[href^='#post/'] span"); if (n) n.textContent = cs.length;
    if (alFinal) window.scrollTo(0, document.body.scrollHeight);
  }

  // ================================================================ PEDIR (carta con descuento de socio)
  async function vPedir() {
    const soc = await A.socio(), nv = nivelDe(soc), dto = nv.descuento;
    if (S.repetir) {
      const r = S.repetir; S.repetir = null;
      const pos = buscarProducto({ productoId: r.productoId, nombreMenu: r.nombreMenu }) || [r.cat, r.idx];
      return hojaPedido(pos[0], pos[1], dto, r);
    }
    const cats = N.carta;
    const cat = cats[S.categoria] || cats[0];
    const precioDe = m => m.variantes ? Math.min(...m.variantes.map(v => v.precio)) : m.precio;
    const fotoCat = cat.foto || (cat.menus.find(x => x.foto) || {}).foto;   // los menús sin foto usan la de su categoría
    const html = `
      ${barra("Pedir", `<a class="boton mini suave" href="#pedidos">Mis pedidos</a>`)}
      <div class="categorias" id="cats">${cats.map((c, i) => `<button data-i="${i}" class="${c === cat ? "on" : ""}">${esc(c.categoria)}</button>`).join("")}</div>
      <div class="cat-hero"${fotoCat ? ` style="background-image:url('${esc(fotoCat)}')"` : ""}><span>${esc(cat.categoria)}</span>${cat.descripcion ? `<small>${esc(cat.descripcion)}</small>` : ""}<em>${cat.menus.length} ${cat.menus.length === 1 ? "opción" : "opciones"}</em></div>
      <p class="descuento-banda">Como ${esc(nv.nombre)} tienes un ${dto} % de descuento en todos los menús.</p>
      ${C.pedidos.activos ? "" : `<p class="aviso-pedidos">Muy pronto podrás pedir desde la app. Mientras, consulta la carta con tus precios de socio y pide como siempre.</p>`}
      <button class="fila-alergenos" id="alergenos">Alérgenos de todos los platos <span>Ver carta de alérgenos</span></button>

      <div>${cat.menus.map((m, j) => `${m.grupo && m.grupo !== (cat.menus[j - 1] || {}).grupo && m.grupo !== cat.categoria ? `<h4 class="subgrupo">${esc(m.grupo)}</h4>` : ""}
        <div class="menu" data-j="${j}">${m.foto && m.foto !== fotoCat ? `<img src="${esc(m.foto)}" alt="" loading="lazy">` : ""}
          <div><b>${esc(m.nombre)}</b><small>${esc(m.platos.slice(0, 3).join(", "))}${m.platos.length > 3 ? "…" : ""}</small></div>
          <div class="precio">${m.variantes ? "<s>desde</s>" : `<s>${euros(precioDe(m))}</s>`}<strong>${euros(precioDe(m) * (1 - dto / 100))}</strong>${m.unidad && m.unidad !== "persona" ? `<em>por ${esc(unidadTxt(m.unidad, 1))}</em>` : ""}</div>
        </div>`).join("")}</div>
      <p class="nota zona" style="margin-top:14px">Precios sin IVA (${N.iva} %), por persona salvo que se indique otra cosa.</p>`;
    await pintar(html, "pedir");
    document.getElementById("alergenos").onclick = () => abrirFuera(C.alergenos);
    document.querySelectorAll("#cats button").forEach(b => b.onclick = () => { S.categoria = +b.dataset.i; vPedir(); });
    document.querySelectorAll(".menu").forEach(el => el.onclick = () => hojaPedido(N.carta.indexOf(cat), +el.dataset.j, dto));
  }

  async function hojaPedido(ci, mi, dto, previo) {
    const cat = N.carta[ci], m = cat && cat.menus[mi];
    if (!m) { aviso("Ese menú ya no está en la carta."); return vPedir(); }
    let sede = previo?.sede || N.sedes[0].nombre, variante = previo?.variante ?? 0;
    const minimo = () => !m.minimo ? 1 : typeof m.minimo === "number" ? m.minimo : (m.minimo[sede] ?? Math.min(...Object.values(m.minimo)));
    let personas = Math.max(previo?.personas || minimo(), minimo());
    const paso = !m.unidad || m.unidad === "persona" || m.unidad === "niño" ? 5 : 1;
    const html = `
      ${barra("", "", "#pedir")}
      <section class="hoja">
        <p class="nota" style="margin:0">${esc(cat.categoria)}</p>
        <h2>${esc(m.nombre)}</h2>
        <ul class="platos">${m.platos.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
        ${N.sedes.length > 1 ? `<div class="campo"><span>Ciudad</span><div class="segmentos" id="sede">${N.sedes.map(s => `<button data-s="${esc(s.nombre)}" class="${s.nombre === sede ? "on" : ""}">${esc(s.nombre)}</button>`).join("")}</div></div>` : ""}
        ${m.variantes ? `<div class="campo"><span>Montaje</span><div class="segmentos" id="var">${m.variantes.map((v, k) => `<button data-v="${k}" class="${k === variante ? "on" : ""}">${esc(v.nombre)}</button>`).join("")}</div></div>` : ""}
        <div class="campo"><span>${esc(unidadTxt(m.unidad).replace(/^./, c => c.toUpperCase()))} <small id="min"></small></span>
          <div class="personas"><button class="redondo" data-p="-${paso}" aria-label="Menos">−</button><b id="pers"></b><button class="redondo" data-p="${paso}" aria-label="Más">+</button></div></div>
        <label class="campo"><span>Fecha del evento</span><input class="entrada" type="date" id="fecha" value="${esc(previo?.fechaEvento || "")}"></label>
        ${C.pedidos.activos ? `<label class="campo"><span>Hora de entrega</span><input class="entrada" type="time" id="hora" value="${esc(previo?.entrega?.hora || "")}"></label>
          <label class="campo"><span>Dirección de entrega</span><input class="entrada" id="dirEntrega" autocomplete="street-address" placeholder="Calle, número, planta y ciudad" value="${esc(previo?.entrega?.direccion || "")}"></label>
          <div class="dos-campos"><label class="campo"><span>Quién lo recibe</span><input class="entrada" id="recibe" value="${esc(previo?.entrega?.persona || U.nombre)}"></label>
          <label class="campo"><span>Su teléfono</span><input class="entrada" id="telRecibe" type="tel" value="${esc(previo?.entrega?.telefono || "")}"></label></div>` : ""}
        <div class="resumen" id="res"></div>
        <p class="error" id="err"></p>
        <p class="nota" style="margin-top:12px">¿Alergias o intolerancias? <a class="enlace" href="#" id="alergenosH">Consulta los alérgenos</a> y cuéntanoslo al pedir.</p>
        ${C.pedidos.activos ? `<div style="display:grid;gap:10px;margin-top:14px">
          ${C.stripe.enlacePago ? `<button class="boton ancho" id="pagar">Pagar con tarjeta</button>` : `<button class="boton ancho" disabled>Pago con tarjeta: muy pronto</button>`}
          <button class="boton wa ancho" id="wa">Pedir por WhatsApp</button>
        </div>` : `<div style="display:grid;gap:10px;margin-top:14px">
          <button class="boton ancho" disabled>Pedidos desde la app: muy pronto</button>
          <button class="boton wa ancho" id="consulta">Consultar por WhatsApp</button>
        </div>`}
        <p class="nota" style="margin-top:12px">${esc(N.presupuesto?.nota || "Precio orientativo. Te confirmamos el precio final.")}</p>
      </section>`;
    await pintar(html, "pedir");
    window.scrollTo(0, 0);
    const calc = () => {
      const precio = m.variantes ? m.variantes[variante].precio : m.precio;
      const base = precio * personas, ahorro = base * dto / 100, neto = base - ahorro, iva = neto * N.iva / 100;
      return { precio, base, ahorro, neto, iva, total: neto + iva };
    };
    const refrescar = () => {
      const min = minimo(); if (personas < min) personas = min;
      document.getElementById("pers").textContent = personas;
      document.getElementById("min").textContent = `Mínimo ${min}`;
      const c = calc();
      document.getElementById("res").innerHTML = `
        <div><span>${personas} × ${euros(c.precio)}</span><span>${euros(c.base)}</span></div>
        <div class="ahorro"><span>Descuento de socio (${dto} %)</span><span>−${euros(c.ahorro)}</span></div>
        <div><span>IVA ${N.iva} %</span><span>${euros(c.iva)}</span></div>
        <div class="total"><span>Total</span><span>${euros(c.total)}</span></div>`;
    };
    document.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { personas = Math.max(minimo(), personas + +b.dataset.p); refrescar(); });
    document.querySelectorAll("#sede button").forEach(b => b.onclick = () => { sede = b.dataset.s; document.querySelectorAll("#sede button").forEach(x => x.classList.toggle("on", x === b)); refrescar(); });
    document.querySelectorAll("#var button").forEach(b => b.onclick = () => { variante = +b.dataset.v; document.querySelectorAll("#var button").forEach(x => x.classList.toggle("on", x === b)); refrescar(); });
    const fechaEl = document.getElementById("fecha"); fechaEl.min = new Date().toISOString().slice(0, 10);
    refrescar();
    async function registrar(canal) {
      const err = document.getElementById("err");
      if (!fechaEl.value) { err.textContent = "Elige la fecha del evento."; fechaEl.focus(); return null; }
      const val = id => (document.getElementById(id) || {}).value || "";
      const entrega = { hora: val("hora"), direccion: val("dirEntrega").trim(), persona: val("recibe").trim(), telefono: val("telRecibe").trim() };
      if (!entrega.hora) { err.textContent = "Elige la hora de entrega."; return null; }
      if (entrega.direccion.length < 5) { err.textContent = "Escribe la dirección de entrega."; return null; }
      const c = calc(), sedeObj = N.sedes.find(s => s.nombre === sede) || N.sedes[0];
      const p = await A.crearPedido({ cat: ci, idx: mi, productoId: m.id ?? null, nombreMenu: m.nombre, unidad: m.unidad || "persona", menu: m.nombre + (m.variantes ? ` (${m.variantes[variante].nombre})` : ""), variante, personas, sede, fechaEvento: fechaEl.value, entrega, base: c.neto, descuentoPct: dto, ahorro: c.ahorro, total: c.total, canal });
      const fechaTxt = new Date(fechaEl.value + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
      const texto = [`Hola ${N.nombre} ${sede}, hago este pedido desde la app del club:`, `• Menú: ${p.menu}`, `• ${unidadTxt(m.unidad).replace(/^./, c => c.toUpperCase())}: ${personas}`, `• Fecha: ${fechaTxt} a las ${entrega.hora}`, `• Entrega: ${entrega.direccion}`, `• Recibe: ${entrega.persona}${entrega.telefono ? " (" + entrega.telefono + ")" : ""}`,
        `• Total con descuento de socio (${dto} %) e IVA: ${euros(c.total)}`, `• Socio: ${U.nombre}${U.empresa ? ", " + U.empresa : ""} (${numeroSocio(U)})`].join("\n");
      return { p, texto, sedeObj };
    }
    document.getElementById("alergenosH").onclick = e => { e.preventDefault(); abrirFuera(C.alergenos); };
    const cq = document.getElementById("consulta");
    if (cq) cq.onclick = () => {
      const sedeObj = N.sedes.find(x => x.nombre === sede) || N.sedes[0];
      const fechaTxt = fechaEl.value ? new Date(fechaEl.value + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long" }) : "fecha por decidir";
      const texto = `Hola ${N.nombre} ${sede}, soy ${U.nombre}${U.empresa ? " (" + U.empresa + ")" : ""}, socio ${numeroSocio(U)} del club. Quería consultar ${m.nombre}${m.variantes ? " (" + m.variantes[variante].nombre + ")" : ""} para ${personas} ${unidadTxt(m.unidad, personas)}, ${fechaTxt}.`;
      abrirFuera(`https://wa.me/${String(sedeObj.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`);
    };
    const wa = document.getElementById("wa");
    if (wa) wa.onclick = async () => {
      const r = await registrar("WhatsApp"); if (!r) return;
      vibrar(); aviso(`Pedido enviado. Sumarás ${Math.floor(r.p.base * C.puntos.porEuro)} puntos cuando Doña Col lo confirme.`);
      abrirFuera(`https://wa.me/${String(r.sedeObj.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(r.texto)}`);
      location.hash = "#pedidos";
    };
    const pg = document.getElementById("pagar");
    if (pg) pg.onclick = async () => { const r = await registrar("Tarjeta"); if (!r) return; abrirFuera(C.stripe.enlacePago); location.hash = "#pedidos"; };
  }

  function estadoPedido(p) {
    const pts = Math.floor((p.base || 0) * C.puntos.porEuro);
    if ((C.estadosConPuntos || []).includes(p.estado)) return `<span class="chip ok-chip">${esc(p.estado)} por Doña Col, +${puntosTxt(pts)}</span>`;
    if (p.estado === "Cancelado") return `<span class="chip">Cancelado</span>`;
    return `<span class="chip pend-chip">Pendiente de confirmar, ${puntosTxt(pts)} al confirmarlo</span>`;
  }
  async function vPedidos() {
    const ps = await A.pedidos();
    const html = `${barra("Mis pedidos", "", "#pedir")}
      ${ps.length ? ps.map(p => `
        <div class="pedido-fila"><div><b>${esc(p.menu)}</b>
          <small>${p.personas} personas en ${esc(p.sede)}, ${new Date(p.fechaEvento + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</small>
          <small>${euros(p.total)}, ahorraste ${euros(p.ahorro)}.</small>
          ${estadoPedido(p)}</div>
          <button class="boton mini" data-id="${esc(p.id)}">Repetir</button></div>`).join("")
        : `<p class="vacio">Aún no has hecho pedidos desde la app.<br><a class="enlace" href="#pedir">Ver la carta</a></p>`}
      ${ps.length ? `<p class="nota zona" style="margin-top:14px">Los puntos de cada pedido se suman cuando Doña Col lo confirma.</p>` : ""}`;
    await pintar(html, "pedir");
    document.querySelectorAll("[data-id]").forEach(b => b.onclick = () => { S.repetir = ps.find(p => p.id === b.dataset.id); location.hash = "#pedir"; });
  }

  // ================================================================ TARJETA DE SOCIO
  async function vTarjeta() {
    const [soc, res] = await Promise.all([A.socio(), C.puntos.porResena ? A.miResena() : null]);
    const pts = soc.puntos, nv = nivelDe(soc), sig = siguienteNivel(soc);
    const faltaP = sig ? Math.max(0, sig.desde - pts) : 0, faltaO = sig ? Math.max(0, (sig.pedidos || 0) - soc.pedidos) : 0;
    const falta = listaNatural([faltaP && puntosTxt(faltaP), faltaO && `${faltaO} ${faltaO === 1 ? "pedido" : "pedidos"}`].filter(Boolean));
    let qr = "";
    try { const q = window.qrcode(0, "M"); q.addData(`${numeroSocio(U)}|${U.id}`); q.make(); qr = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); } catch (e) {}
    const progreso = sig ? Math.round((Math.min(1, pts / Math.max(1, sig.desde)) + Math.min(1, soc.pedidos / Math.max(1, sig.pedidos || 1))) * 50) : 100;
    const html = `${barra("Tarjeta")}
      <div class="tarjeta">
        <div class="arriba"><img class="logo" src="${esc(N.logo || "media/logo.png")}" alt=""><div class="nivel">${esc(nv.nombre)}<small>${nv.descuento} % en pedidos</small></div></div>
        <div class="abajo"><b>${esc(U.nombre)}</b><span>${esc(U.empresa || C.nombre)}</span><div class="numero">${esc(numeroSocio(U))}</div></div>
      </div>
      ${qr ? `<div class="qr" aria-label="Código de socio">${qr}</div><p class="nota" style="text-align:center;margin:8px 0 0">Enséñalo en los eventos de ${esc(C.marca)}</p>` : ""}
      <div class="progreso-nivel">
        <b>${puntosTxt(pts)} y ${soc.pedidos} ${soc.pedidos === 1 ? "pedido" : "pedidos"}</b> <span class="nota">en los últimos 12 meses.</span>
        <p class="nota" style="margin:4px 0 0">${sig ? `Te ${(faltaP && faltaO) || faltaP > 1 || faltaO > 1 ? "faltan" : "falta"} ${falta} para ser ${esc(sig.nombre)}.` : "Tienes el nivel más alto. ¡Gracias!"}</p>
        <div class="barra-progreso"><i style="width:${Math.max(3, progreso)}%"></i></div>
      </div>
      <h3 class="seccion-titulo">Niveles</h3>
      <ul class="niveles">${C.niveles.map(n => `<li class="${alcanza(soc, n) ? "hecho" : ""}"><span class="marca-nivel"></span><div><b>${esc(n.nombre)} <span class="nota">${n.desde ? `${miles(n.desde)} puntos y ${n.pedidos} pedidos al año` : "al registrarte"}</span></b><small>${n.ventajas.map(esc).join(". ")}.</small></div></li>`).join("")}</ul>
      <h3 class="seccion-titulo">Cómo ganar puntos</h3>
      <ul class="niveles"><li><div><b>1 punto por cada ${eurosPorPunto()} €</b><small>De los pedidos que hagas desde la app, sin IVA, cuando Doña Col los confirma.${C.pedidos.activos ? "" : " Muy pronto."}</small></div></li>
        <li><div><b>${puntosTxt(C.puntos.porFoto)} por foto verificada</b><small>Etiqueta a ${esc(C.marca)} en las fotos de vuestros eventos. Cuentan cuando ${esc(C.marca)} comprueba que son suyos.</small></div></li>
        ${C.puntos.porResena ? `<li><div><b>${puntosTxt(C.puntos.porResena)} por tu opinión en Google</b><small>Una vez. Cuenta cuando ${esc(C.marca)} la encuentra en su ficha, sea cual sea tu opinión.</small>
          ${!res ? `<button class="boton mini" id="resena" style="margin-top:8px">Dejar mi opinión</button>`
            : res.estado === "pendiente" ? `<span class="chip pend-chip">Pendiente de comprobar</span>`
            : res.estado === "verificada" ? `<span class="chip ok-chip">Comprobada, +${puntosTxt(C.puntos.porResena)}</span>`
            : `<span class="chip">No la hemos encontrado</span> <button class="boton mini suave" id="resena" style="margin-top:8px">Volver a avisar</button>`}</div></li>` : ""}
        <li><div><b>${puntosTxt(C.puntos.porSeguidor)} por seguidor</b><small>Hasta ${puntosTxt(C.puntos.topeSeguidores)} al año.</small></div></li>
        <li><div><b>${puntosTxt(C.puntos.porCompartida)} cada vez que compartan tu foto</b><small>Solo en fotos verificadas por ${esc(C.marca)}.</small></div></li>
        <li><div><b>Los puntos duran ${C.puntos.caducanMeses} meses</b><small>El nivel se calcula con lo del último año: para mantenerlo, sigue pidiendo.</small></div></li></ul>
      ${!C.puntos.porResena && C.enlaceResena ? `<div class="opinar"><b>¿Qué tal tu último evento?</b><span>Tu opinión en Google ayuda a otras empresas a conocernos.</span>
        <a class="boton contorno ancho" href="${esc(C.enlaceResena)}" target="_blank" rel="noopener">Déjanos tu opinión en Google</a></div>` : ""}`;
    await pintar(html, "tarjeta");
    const br = document.getElementById("resena"); if (br) br.onclick = () => hojaResena(res && res.nombreGoogle);
  }

  // ================================================================ RED (personas, mensajes, solicitudes)
  async function vRed(sub) {
    if (sub) S.vistaRed = sub;
    const [sol, convs] = await Promise.all([A.solicitudes(), A.conversaciones()]);
    const sinLeer = convs.reduce((s, c) => s + c.sinLeer, 0);
    let cuerpo = "";
    if (S.vistaRed === "mensajes") {
      cuerpo = convs.length ? convs.map(c => `
        <a class="conversacion${c.sinLeer ? " nuevo" : ""}" href="#chat/${encodeURIComponent(c.perfil.id)}">${avatar(c.perfil)}
          <div><b>${nombreCon(c.perfil)}</b><small>${c.ultimo.de === U.id ? "Tú: " : ""}${esc(c.ultimo.texto)}</small></div>
          ${c.sinLeer ? `<span class="contador">${c.sinLeer}</span>` : `<small class="nota">${hace(c.ultimo.fecha)}</small>`}</a>`).join("")
        : `<p class="vacio">No tienes mensajes. Entra en el perfil de una empresa y pulsa «Mensaje».</p>`;
    } else if (S.vistaRed === "solicitudes") {
      cuerpo = sol.length ? sol.map(s => `
        <div class="persona"><a class="datos" href="#perfil/${encodeURIComponent(s.perfil.id)}">${avatar(s.perfil)}<span><b>${nombreCon(s.perfil)}</b><small>${puesto(s.perfil)}</small></span></a>
          <button class="boton mini" data-aceptar="${esc(s.perfil.id)}">Aceptar</button><button class="boton mini suave" data-rechazar="${esc(s.perfil.id)}">No</button></div>`).join("")
        : `<p class="vacio">No tienes solicitudes pendientes.</p>`;
    } else {
      cuerpo = `<div class="buscar"><input class="entrada" id="q" type="search" placeholder="Buscar empresas, agencias o personas" value="${esc(S.buscar || "")}"></div><div id="lista"></div>`;
    }
    const html = `${barra("Red")}
      <div class="zona"><div class="segmentos" id="sub">
        <button data-v="personas" class="${S.vistaRed === "personas" ? "on" : ""}">Personas</button>
        <button data-v="mensajes" class="${S.vistaRed === "mensajes" ? "on" : ""}">Mensajes${sinLeer ? ` (${sinLeer})` : ""}</button>
        <button data-v="solicitudes" class="${S.vistaRed === "solicitudes" ? "on" : ""}">Solicitudes${sol.length ? ` (${sol.length})` : ""}</button></div></div>
      ${cuerpo}`;
    await pintar(html, "red");
    document.querySelectorAll("#sub button").forEach(b => b.onclick = () => { S.vistaRed = b.dataset.v; vRed(); });
    document.querySelectorAll("[data-aceptar]").forEach(b => b.onclick = async () => { await A.aceptar(b.dataset.aceptar); aviso("Solicitud aceptada"); vRed(); });
    document.querySelectorAll("[data-rechazar]").forEach(b => b.onclick = async () => { await A.rechazar(b.dataset.rechazar); vRed(); });
    const q = document.getElementById("q");
    if (q) { const pinta = async () => { S.buscar = q.value; document.getElementById("lista").innerHTML = await listaPersonas(q.value); enlazarSeguir(); }; q.oninput = pinta; pinta(); }
  }
  async function listaPersonas(texto) {
    const ps = await A.perfiles(texto);
    if (!ps.length) return `<p class="vacio">No hay nadie con «${esc(texto)}».</p>`;
    const filas = await Promise.all(ps.map(async u => {
      const rel = await A.relacion(u.id);
      const boton = rel === "ok" ? `<button class="boton mini suave" data-dejar="${esc(u.id)}">Siguiendo</button>`
        : rel === "pendiente" ? `<button class="boton mini suave" disabled>Solicitado</button>`
        : `<button class="boton mini" data-seguir="${esc(u.id)}">Seguir</button>`;
      return `<div class="persona"><a class="datos" href="#perfil/${encodeURIComponent(u.id)}">${avatar(u)}<span><b>${nombreCon(u)}</b><small>${puesto(u)}${u.ciudad ? ", " + esc(u.ciudad) : ""}</small></span></a>${boton}</div>`;
    }));
    return filas.join("");
  }
  function enlazarSeguir() {
    document.querySelectorAll("[data-seguir]").forEach(b => b.onclick = async e => { e.preventDefault(); const est = await A.seguir(b.dataset.seguir); aviso(est === "pendiente" ? "Solicitud enviada. Su perfil es privado." : "Ahora le sigues"); vibrar(); router(); });
    document.querySelectorAll("[data-dejar]").forEach(b => b.onclick = async e => { e.preventDefault(); if (await confirmar("¿Dejar de seguir a este perfil?", "Dejar de seguir")) { await A.dejarDeSeguir(b.dataset.dejar); router(); } });
  }

  // ================================================================ CHAT
  let chatCon = null;
  async function vChat(otro) {
    const o = await A.perfil(otro); if (!o) return vRed("mensajes");
    chatCon = otro;
    app.classList.add("sin-nav");
    app.innerHTML = `${barra(`<a href="#perfil/${encodeURIComponent(o.id)}" style="display:flex;align-items:center;gap:10px;font-family:var(--texto);font-size:17px;font-weight:800">${avatar(o)}<span>${nombreCon(o)}</span></a>`, "", "#red/mensajes")}
      <div class="chat" id="chat"></div>
      <form class="escribir" id="f"><input id="txt" placeholder="Escribe un mensaje" autocomplete="off" enterkeyhint="send"><button aria-label="Enviar">${I.enviar}</button></form>`;
    await pintarChat();
    pegarAlTeclado("f");
    document.getElementById("f").onsubmit = async e => {
      e.preventDefault(); const t = document.getElementById("txt"); if (!t.value.trim()) return;
      await A.enviarMensaje(otro, t.value); t.value = ""; await pintarChat(); t.focus();
    };
  }
  async function pintarChat() {
    const c = document.getElementById("chat"); if (!c || !chatCon) return;
    const ms = await A.mensajes(chatCon);
    c.innerHTML = ms.length ? ms.map(m => `<div class="burbuja${m.de === U.id ? " mia" : ""}">${esc(m.texto)}<time>${new Date(m.fecha).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</time></div>`).join("")
      : `<p class="vacio">Escribe el primer mensaje. Es la forma más directa de hablar con otras empresas del club.</p>`;
    window.scrollTo(0, document.body.scrollHeight);
  }

  // ================================================================ PERFIL (propio y ajeno)
  async function vPerfil(id) {
    const mio = !id || id === U.id;
    const u = mio ? U : await A.perfil(id);
    if (!u) { aviso("Ese perfil ya no existe."); return vRed(); }
    const [cuentas, rel, ver, soc] = await Promise.all([A.cuentas(u.id), mio ? "ok" : A.relacion(u.id), A.puedeVer(u.id), A.socio(u.id)]);
    const posts = ver ? await A.publicaciones({ autor: u.id }) : [];
    const nv = nivelDe(soc), gestiona = mio && await A.puedeGestionar();
    const botones = mio
      ? `<a class="boton suave" href="#editar">Editar perfil</a><a class="boton" href="#publicar">${I.camara} Subir foto</a>`
      : `${rel === "ok" ? `<button class="boton suave" data-dejar="${esc(u.id)}">Siguiendo</button>` : rel === "pendiente" ? `<button class="boton suave" disabled>Solicitado</button>` : `<button class="boton" data-seguir="${esc(u.id)}">Seguir</button>`}
         <a class="boton suave" href="#chat/${encodeURIComponent(u.id)}">${I.mensaje} Mensaje</a>`;
    const html = `${barra(mio ? "Perfil" : "", mio ? `<a class="icono-btn" href="#editar" aria-label="Ajustes">${I.ajustes}</a>` : `<button class="icono-btn" id="menuPerfil" aria-label="Más opciones">${I.puntos}</button>`, mio ? false : "javascript:history.back()")}
      <div class="portada${u.portada ? "" : " vacia"}">${u.portada ? `<img src="${esc(optim(u.portada, 1400))}" alt="">` : mio ? `<a href="#editar">${I.camara}<span>Añadir foto de portada</span></a>` : ""}</div>
      <section class="cabeza-perfil">
        <div class="fila">${avatar(u, true)}<div class="cifras"><div><b>${cuentas.publicaciones}</b><span>fotos</span></div><div><b>${cuentas.seguidores}</b><span>seguidores</span></div><div><b>${cuentas.siguiendo}</b><span>siguiendo</span></div></div></div>
        <h2>${nombreCon(u)}</h2>
        <p class="cargo">${puesto(u)}</p>
        <p class="lugar">${[u.tipo, u.ciudad].filter(Boolean).map(esc).join(", ")}${u.oficial ? "" : `. Socio ${esc(nv.nombre)}`}</p>
        ${u.bio ? `<p class="bio">${esc(u.bio)}</p>` : mio ? `<p class="bio"><a class="enlace" href="#editar">Añade una biografía</a></p>` : ""}
        <div class="botones-perfil">${botones}</div>
        ${mio && gestiona ? `<a class="boton contorno ancho" style="margin-top:10px" href="#gestion">Panel de ${esc(C.marca)}${A.demo ? " (simulación)" : ""}</a>` : ""}
      </section>
      ${ver ? `<div class="rejilla">
          ${mio ? `<label for="subir">${I.camara}<span>Subir foto</span></label><input type="file" id="subir" class="oculto" accept="image/*">` : ""}
          ${posts.map(p => `<a href="#" data-ver="${esc(p.id)}"${p.repostDe ? ` class="es-compartida" aria-label="Compartida"` : ""}><img src="${esc(optim(p.repostDe ? p.original.foto : p.foto, 400))}" alt="" loading="lazy">${p.repostDe ? `<i>${I.compartir}</i>` : ""}</a>`).join("")}</div>
          ${!posts.length && !mio ? `<p class="vacio">Todavía no ha publicado fotos.</p>` : ""}`
        : `<p class="candado"><b>Perfil privado.</b><br>Síguele para ver sus fotos${rel === "pendiente" ? ". Tu solicitud está pendiente." : "."}</p>`}`;
    await pintar(html, mio ? "perfil" : "red");
    enlazarSeguir();
    document.querySelectorAll("[data-ver]").forEach(a => a.onclick = async e => {
      e.preventDefault(); const p = posts.find(x => x.id === a.dataset.ver);
      app.insertAdjacentHTML("beforeend", `<div class="hoja-menu" id="verPost"><div style="padding:0">${await tarjetaPost(p)}</div></div>`);
      const v = document.getElementById("verPost"); v.onclick = e2 => { if (e2.target === v) v.remove(); }; enlazarPosts();
    });
    const subir = document.getElementById("subir"); if (subir) subir.onchange = () => { S.fotoPendiente = subir.files[0]; location.hash = "#publicar"; };
    const mp = document.getElementById("menuPerfil");
    if (mp) mp.onclick = () => menuHoja([{ texto: "Bloquear a este usuario", peligro: true, accion: async () => { await A.bloquear(u.id); aviso("Usuario bloqueado"); location.hash = "#red"; } }]);
  }

  async function vEditar() {
    const u = U;
    app.classList.add("sin-nav");
    app.innerHTML = `${barra("Editar perfil", "", "#perfil")}
      <form class="formulario" id="f">
        <div class="editar-portada" id="pt">${u.portada ? `<img src="${esc(u.portada)}" alt="">` : ""}
          <label class="boton suave mini" for="portada">${I.camara} ${u.portada ? "Cambiar portada" : "Añadir portada"}</label><input type="file" id="portada" class="oculto" accept="image/*"></div>
        <div class="editar-avatar"><span id="av">${avatar(u, true)}</span>
          <label class="boton suave mini" for="foto">${u.foto ? "Cambiar foto de perfil" : "Añadir foto de perfil"}</label><input type="file" id="foto" class="oculto" accept="image/*"></div>
        <label class="campo"><span>Nombre</span><input class="entrada" name="nombre" value="${esc(u.nombre)}"></label>
        <label class="campo"><span>Empresa o agencia</span><input class="entrada" name="empresa" value="${esc(u.empresa)}"></label>
        <label class="campo"><span>Cargo</span><input class="entrada" name="cargo" value="${esc(u.cargo)}"></label>
        <label class="campo"><span>Ciudad</span><input class="entrada" name="ciudad" value="${esc(u.ciudad)}"></label>
        <label class="campo"><span>Biografía <small id="cuentaBio"></small></span><textarea class="entrada" name="bio" maxlength="300" placeholder="Ej.: Agencia de eventos en Madrid. Organizamos presentaciones y convenciones para empresas.">${esc(u.bio)}</textarea></label>
        <label class="casilla"><input type="checkbox" name="privado" ${u.privado ? "checked" : ""}><span><b>Perfil privado.</b> Tendrás que aceptar a quien quiera ver tus fotos.</span></label>
        ${u.oficial ? "" : `<a class="fila-enlace" href="#facturacion"><b>Datos de facturación</b><span>Razón social, CIF o DNI y dirección fiscal</span></a>`}
        <p class="nota" style="margin-top:16px"><a class="enlace" href="#" id="legalPriv">Privacidad</a> · <a class="enlace" href="#" id="legalCond">Condiciones de uso</a> · <a class="enlace" href="#" id="legalClub">Bases del club</a></p>
        <button class="boton ancho" style="margin-top:20px">Guardar</button>
        <button type="button" class="boton contorno ancho" id="salir" style="margin-top:28px">Cerrar sesión</button>
        <button type="button" class="boton ancho" id="borrar" style="margin-top:10px;background:transparent;color:var(--no)">Borrar mi cuenta y mis datos</button>
        ${A.demo ? `<button type="button" class="boton ancho suave" id="reiniciar" style="margin-top:10px">Reiniciar la demostración</button>` : ""}
      </form>`;
    let foto = u.foto, portada = u.portada;
    const bio = document.querySelector("[name=bio]"), cuenta = () => document.getElementById("cuentaBio").textContent = `${bio.value.length} de 300`;
    bio.oninput = cuenta; cuenta();
    document.getElementById("portada").onchange = async e => { const f = e.target.files[0]; if (!f) return; portada = await comprimir(f, 1400, .72, 370000); const pt = document.getElementById("pt"); let im = pt.querySelector("img"); if (!im) { im = document.createElement("img"); pt.prepend(im); } im.src = portada; };
    document.getElementById("foto").onchange = async e => { const f = e.target.files[0]; if (!f) return; foto = await comprimir(f, 400, .8, 130000); document.getElementById("av").innerHTML = avatar({ ...u, foto }, true); };
    document.getElementById("f").onsubmit = async e => {
      e.preventDefault(); const f = e.target;
      const b = f.querySelector("button:not([type])"); b.disabled = true; b.textContent = "Guardando…";
      try { await A.actualizarPerfil({ nombre: f.nombre.value.trim() || u.nombre, empresa: f.empresa.value.trim(), cargo: f.cargo.value.trim(), ciudad: f.ciudad.value.trim(), bio: f.bio.value.trim(), privado: f.privado.checked, foto, portada }); }
      catch (er) { b.disabled = false; b.textContent = "Guardar"; return aviso(er.message); }
      aviso("Perfil guardado"); location.hash = "#perfil";
    };
    document.getElementById("legalPriv").onclick = e => { e.preventDefault(); abrirLegal("privacidad"); };
    document.getElementById("legalCond").onclick = e => { e.preventDefault(); abrirLegal("condiciones"); };
    document.getElementById("legalClub").onclick = e => { e.preventDefault(); abrirLegal("club"); };
    document.getElementById("salir").onclick = async () => { await A.salir(); location.hash = "#"; router(); };
    document.getElementById("borrar").onclick = async () => { if (await confirmar("Se borrarán tu cuenta, tu perfil, tus fotos, tus datos de facturación y los mensajes que has enviado. No se puede deshacer.", "Borrar mi cuenta")) { await A.borrarCuenta(); location.hash = "#"; router(); } };
    const r = document.getElementById("reiniciar"); if (r) r.onclick = async () => { if (await confirmar("Se borra todo lo que has hecho en esta demostración.", "Reiniciar")) { await A.reiniciarDemo(); location.hash = "#"; router(); } };
  }

  // ================================================================ PANEL DE DOÑA COL (confirmar pedidos y verificar fotos)
  const navPanel = act => `<nav class="segmentos panel-nav">${[["", "Pendientes"], ["socios", "Socios"], ["qr", "Escanear"], ["cifras", "Cifras"]]
    .map(([k, t]) => `<a href="#gestion${k ? "/" + k : ""}" class="${act === k ? "on" : ""}">${t}</a>`).join("")}</nav>`;
  async function vGestion(sub) {
    if (!(await A.puedeGestionar())) { location.hash = "#inicio"; return; }
    if (sub === "socios") return vGestionSocios();
    if (sub === "qr") return vGestionQR();
    if (sub === "cifras") return vGestionCifras();
    const [d, dens, uniones, porVerif] = await Promise.all([A.panel(), A.denuncias(), A.unionesPendientes(), A.empresasPorVerificar()]);
    const correoGenerico = m => /@(gmail|hotmail|outlook|yahoo|icloud|live|me|msn|protonmail)\./i.test(m || "");
    const fecha = f => f ? new Date(f + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "sin fecha";
    const html = `${barra(`Panel de ${esc(C.marca)}`, "", "#perfil")}${navPanel("")}
      ${A.demo ? `<p class="descuento-banda" style="background:var(--sup2);color:var(--tinta)">Simulación: en la versión real solo lo ve la cuenta oficial de ${esc(C.marca)}.</p>` : ""}
      <div class="zona" style="margin-top:14px"><a class="boton ancho" href="#historia">${I.camara} Publicar una historia</a></div>
      <h3 class="seccion-titulo">Empresas por verificar (${porVerif.length})</h3>
      ${porVerif.length ? porVerif.map(x => `<div class="gestion-item">
          <p><b>${esc(x.nombre)}</b>, ${esc(x.cif)}${x.nombre_comercial ? ` («${esc(x.nombre_comercial)}»)` : ""}</p>
          <p class="nota">${esc([x.fiscal.direccion, [x.fiscal.cp, x.fiscal.localidad].filter(Boolean).join(" "), x.fiscal.provincia].filter(Boolean).join(", "))}${x.fiscal.email_fe ? `. Facturas a ${esc(x.fiscal.email_fe)}` : ""}</p>
          <p>La da de alta <b>${esc(x.titularNombre || "?")}</b>: ${esc(x.titularCorreo)}${x.titularMovil ? ", " + esc(x.titularMovil) : ""}.</p>
          <p class="${correoGenerico(x.titularCorreo) ? "aviso-rojo" : "nota"}">${correoGenerico(x.titularCorreo) ? "Usa un correo personal, no de la empresa: compruébalo con más cuidado." : "Usa un correo con dominio propio: comprueba que es el de la empresa."}
            Búscala por el CIF en la app central: si ya es cliente, confirma con su contacto de siempre.</p>
          <div class="gestion-botones"><button class="boton mini" data-emp-ok="${esc(x.cif)}">Verificar</button><button class="boton mini suave" data-emp-no="${esc(x.cif)}">Rechazar</button></div>
        </div>`).join("") : `<p class="vacio">No hay empresas por verificar.</p>`}
      <h3 class="seccion-titulo">Uniones a empresas (${uniones.length})</h3>
      ${uniones.length ? uniones.map(x => `<div class="gestion-item">
          <p><b>${esc(x.nombre || "Un socio")}</b> quiere facturar con <b>${esc(x.empresa)}</b> (${esc(x.cif)}).</p>
          <p class="nota">Lo aprueba normalmente ${esc(x.titularNombre || "la persona titular")}. Hazlo tú solo si te consta que trabaja allí.</p>
          <div class="gestion-botones"><button class="boton mini" data-union-ok="${esc(x.cif)}|${esc(x.uid)}">Aprobar</button><button class="boton mini suave" data-union-no="${esc(x.cif)}|${esc(x.uid)}">Rechazar</button></div>
        </div>`).join("") : `<p class="vacio">No hay uniones pendientes.</p>`}
      <h3 class="seccion-titulo">Denuncias (${dens.length})</h3>
      ${dens.length ? dens.map(x => `<div class="gestion-item">
          <div class="gestion-cab">${avatar(x.perfil)}<div><b>${esc((x.perfil && x.perfil.nombre) || "Un socio")} ha denunciado</b><small>${hace(x.fecha)}. Motivo: ${esc(x.motivo || "inapropiada")}</small></div></div>
          ${x.pub ? `${x.pub.foto ? `<img class="gestion-foto" src="${esc(optim(x.pub.foto, 800))}" alt="">` : ""}<p>De <b>${esc((x.autorPub && x.autorPub.nombre) || "?")}</b>${x.pub.texto ? `: ${esc(x.pub.texto)}` : ""}</p>` : `<p class="nota">La publicación ya no existe.</p>`}
          <div class="gestion-botones">${x.pub ? `<button class="boton mini" data-moderar="${esc(x.publicacion)}">Borrar la publicación</button>` : ""}<button class="boton mini suave" data-descartar="${esc(x.id)}">${x.pub ? "No pasa nada" : "Quitar"}</button></div>
        </div>`).join("") : `<p class="vacio">No hay denuncias.</p>`}
      <h3 class="seccion-titulo">Pedidos por confirmar (${d.pedidos.length})</h3>
      ${d.pedidos.length ? d.pedidos.map(p => {
        const real = nivelDe(p.socio), sobra = (p.descuentoPct || 0) > real.descuento;
        return `<div class="gestion-item">
          <div class="gestion-cab">${avatar(p.perfil)}<div><b>${esc(p.perfil.nombre)}</b><small>${esc(p.perfil.empresa || p.perfil.tipo || "")}. Socio ${esc(numeroSocio(p.perfil))}</small></div></div>
          <p><b>${esc(p.menu)}</b> para ${p.personas} personas en ${esc(p.sede)}, ${fecha(p.fechaEvento)}.</p>
          <p>Total ${euros(p.total)} con ${p.descuentoPct} % de descuento. Pedido por ${esc(p.canal || "la app")}. Al confirmarlo sumará ${puntosTxt(Math.floor((p.base || 0) * C.puntos.porEuro))}.</p>
          ${p.entrega ? `<p class="nota">Entrega a las ${esc(p.entrega.hora)} en ${esc(p.entrega.direccion)}. Recibe ${esc(p.entrega.persona)}${p.entrega.telefono ? ", " + esc(p.entrega.telefono) : ""}.</p>` : ""}
          <p class="${sobra ? "aviso-rojo" : "nota"}">Nivel real del cliente: ${esc(real.nombre)} (${real.descuento} %).${sobra ? " ¡El descuento aplicado es mayor del que le corresponde!" : ""}</p>
          <div class="gestion-botones"><button class="boton mini" data-confirmar="${esc(p.id)}">Confirmar pedido</button><button class="boton mini suave" data-cancelar="${esc(p.id)}">Cancelar</button></div>
        </div>`; }).join("") : `<p class="vacio">No hay pedidos pendientes.</p>`}
      <h3 class="seccion-titulo">Fotos por verificar (${d.fotos.length})</h3>
      ${d.fotos.length ? d.fotos.map(f => `<div class="gestion-item">
          <div class="gestion-cab">${avatar(f.perfil)}<div><b>${esc(f.perfil.nombre)}</b><small>${esc(f.perfil.empresa || f.perfil.tipo || "")}, ${hace(f.fecha)}</small></div></div>
          <img class="gestion-foto" src="${esc(optim(f.foto, 800))}" alt="">
          ${f.texto ? `<p>${esc(f.texto)}</p>` : ""}
          <p class="nota">${esc(f.evento || "Sin tipo de evento")}. ${f.pedido ? `Dice que es del pedido «${esc(f.pedido.menu)}» del ${fecha(f.pedido.fechaEvento)} (${esc(f.pedido.estado)}).` : "No ha indicado el pedido."}</p>
          <div class="gestion-botones"><button class="boton mini" data-verificar="${esc(f.id)}">Es nuestro: verificar</button><button class="boton mini suave" data-rechazar-foto="${esc(f.id)}">No es nuestro</button></div>
        </div>`).join("") : `<p class="vacio">No hay fotos pendientes.</p>`}
      ${C.puntos.porResena ? `<h3 class="seccion-titulo">Opiniones en Google por comprobar (${(d.resenas || []).length})</h3>
      ${(d.resenas || []).length ? d.resenas.map(r => `<div class="gestion-item">
          <div class="gestion-cab">${avatar(r.perfil)}<div><b>${esc(r.perfil.nombre)}</b><small>${esc(r.perfil.empresa || r.perfil.tipo || "")}, ${hace(r.fecha)}</small></div></div>
          <p>Dice que ha dejado su opinión en Google como <b>«${esc(r.nombreGoogle)}»</b>.</p>
          <p class="nota">Búscala en vuestra ficha de Google. Si está, da ${puntosTxt(C.puntos.porResena)}, sea buena o mala.</p>
          <div class="gestion-botones"><a class="boton mini suave" href="${esc(C.enlaceResena)}" target="_blank" rel="noopener">Abrir la ficha</a><button class="boton mini" data-resena-ok="${esc(r.uid)}">La he encontrado</button><button class="boton mini suave" data-resena-no="${esc(r.uid)}">No está</button></div>
        </div>`).join("") : `<p class="vacio">No hay opiniones pendientes.</p>`}` : ""}`;
    await pintar(html, "perfil");
    const hecho = async (fn, texto) => { try { await fn(); aviso(texto); vGestion(); } catch (e) { aviso(e.message); } };
    document.querySelectorAll("[data-emp-ok]").forEach(b => b.onclick = () => hecho(() => A.verificarEmpresa(b.dataset.empOk, true), "Empresa verificada. Su titular ya puede aprobar compañeros."));
    document.querySelectorAll("[data-emp-no]").forEach(b => b.onclick = async () => { if (await confirmar("Se borra la ficha de esta empresa y quien la dio de alta tendrá que volver a ponerla. ¿Rechazar?", "Rechazar")) hecho(() => A.verificarEmpresa(b.dataset.empNo, false), "Empresa rechazada."); });
    document.querySelectorAll("[data-union-ok]").forEach(b => b.onclick = () => { const [cif, uid] = b.dataset.unionOk.split("|"); hecho(() => A.resolverMiembro(cif, uid, true), "Unión aprobada."); });
    document.querySelectorAll("[data-union-no]").forEach(b => b.onclick = () => { const [cif, uid] = b.dataset.unionNo.split("|"); hecho(() => A.resolverMiembro(cif, uid, false), "Unión rechazada."); });
    document.querySelectorAll("[data-moderar]").forEach(b => b.onclick = async () => { if (await confirmar("¿Borrar esta publicación? Desaparecerá para todos.", "Borrar")) hecho(() => A.moderarPublicacion(b.dataset.moderar), "Publicación borrada."); });
    document.querySelectorAll("[data-descartar]").forEach(b => b.onclick = () => hecho(() => A.descartarDenuncia(b.dataset.descartar), "Denuncia cerrada."));
    document.querySelectorAll("[data-confirmar]").forEach(b => b.onclick = () => hecho(() => A.confirmarPedido(b.dataset.confirmar, "Confirmado"), "Pedido confirmado. El cliente ya tiene sus puntos."));
    document.querySelectorAll("[data-cancelar]").forEach(b => b.onclick = async () => { if (await confirmar("¿Cancelar este pedido? No sumará puntos.", "Cancelar pedido")) hecho(() => A.confirmarPedido(b.dataset.cancelar, "Cancelado"), "Pedido cancelado."); });
    document.querySelectorAll("[data-verificar]").forEach(b => b.onclick = () => hecho(() => A.verificarFoto(b.dataset.verificar, true), "Foto verificada. El cliente ya tiene sus puntos."));
    document.querySelectorAll("[data-rechazar-foto]").forEach(b => b.onclick = () => hecho(() => A.verificarFoto(b.dataset.rechazarFoto, false), "Foto marcada como no verificada."));
    document.querySelectorAll("[data-resena-ok]").forEach(b => b.onclick = () => hecho(() => A.verificarResena(b.dataset.resenaOk, true), "Opinión comprobada. El cliente ya tiene sus puntos."));
    document.querySelectorAll("[data-resena-no]").forEach(b => b.onclick = () => hecho(() => A.verificarResena(b.dataset.resenaNo, false), "Marcada como no encontrada. El cliente podrá volver a avisar."));
  }

  // ---------- Panel: socios ----------
  async function vGestionSocios() {
    const todos = (await A.socios()).filter(u => !u.oficial).sort((a, b) => (b.socio || 0) - (a.socio || 0));
    const html = `${barra(`Panel de ${esc(C.marca)}`, "", "#perfil")}${navPanel("socios")}
      <div class="zona" style="margin-top:12px"><input class="entrada" id="buscaSocio" type="search" placeholder="Buscar por nombre, empresa o número de socio"></div>
      <p class="nota zona" id="nSocios" style="margin:8px 0 0"></p>
      <div id="listaSocios" class="lista-socios"></div>`;
    await pintar(html, "perfil");
    const lista = t => {
      t = t.trim().toLowerCase();
      const xs = todos.filter(u => !t || [u.nombre, u.empresa, u.ciudad, numeroSocio(u), String(u.socio)].join(" ").toLowerCase().includes(t));
      document.getElementById("nSocios").textContent = `${xs.length} de ${todos.length} socios`;
      document.getElementById("listaSocios").innerHTML = xs.slice(0, 300).map(u => `<button class="fila-socio" data-uid="${esc(u.id)}">${avatar(u)}<span><b>${esc(u.nombre)}</b><small>${esc(numeroSocio(u))} · ${puesto(u) || esc(u.tipo || "")}${u.ciudad ? ", " + esc(u.ciudad) : ""}</small></span><em>${hace(u.creado)}</em></button>`).join("")
        || `<p class="vacio">No hay socios con ese nombre.</p>`;
      document.querySelectorAll(".fila-socio").forEach(b => b.onclick = () => fichaSocio(b.dataset.uid));
    };
    document.getElementById("buscaSocio").oninput = e => lista(e.target.value); lista("");
  }
  async function fichaSocio(uid) {
    const [u, f0, soc] = await Promise.all([A.perfil(uid), A.facturacionDe(uid), A.socioReal(uid)]);
    if (!u) return aviso("No encuentro a ese socio.");
    let f = f0, union = "";
    if (f0 && f0.tipo === "EMPRESA" && f0.cif && !f0.direccion) {
      const x = await A.empresaDe(f0.cif, uid);
      if (x) { f = { ...(x.fiscal || {}), ...x.empresa, cif: f0.cif, movil: f0.movil, email: f0.email };
        union = x.empresa.titular === uid ? "Titular de la empresa" : ({ ok: "Aprobado en la empresa", pendiente: "Pendiente de aprobar en la empresa", rechazado: "No aprobado en la empresa" }[(x.miembro || {}).estado] || ""); }
    }
    const nv = nivelDe(soc), fila = (t, v) => v ? `<dt>${t}</dt><dd>${esc(v)}</dd>` : "";
    const h = document.createElement("div"); h.className = "hoja-menu";
    h.innerHTML = `<div class="hoja-larga ficha-socio">
      <header>${avatar(u, true)}<span><b>${esc(u.nombre)}</b><small>${esc(numeroSocio(u))} · ${esc(u.tipo || "")}${u.empresa ? " · " + esc(u.empresa) : ""}</small></span></header>
      <p class="ficha-nivel"><b>${esc(nv.nombre)}, ${nv.descuento} %</b><span>${puntosTxt(soc.puntos)} y ${soc.pedidos} ${soc.pedidos === 1 ? "pedido" : "pedidos"} en 12 meses</span></p>
      ${f ? `<dl>${fila(f.tipo === "PARTICULAR" ? "Nombre" : "Razón social", f.nombre)}${fila("Nombre comercial", f.nombre_comercial)}${fila(f.tipo === "PARTICULAR" ? "DNI o NIE" : "CIF o NIF", f.cif)}
        ${fila("Dirección", [f.direccion, [f.cp, f.localidad].filter(Boolean).join(" "), f.provincia].filter(Boolean).join(", "))}${fila("Móvil", f.movil)}${fila("Correo", f.email)}${fila("Facturas a", f.email_fe)}${fila("Empresa", union)}</dl>`
        : `<p class="nota">Aún no ha puesto sus datos de facturación.</p>`}
      <p class="gestion-botones"><a class="boton mini" href="#perfil/${encodeURIComponent(uid)}" data-cerrar>Ver perfil</a><a class="boton mini suave" href="#chat/${encodeURIComponent(uid)}" data-cerrar>Escribirle</a><a class="boton mini suave" href="javascript:void 0" data-cerrar>Cerrar</a></p>
    </div>`;
    h.onclick = e => { if (e.target === h || e.target.closest("[data-cerrar]")) h.remove(); };
    document.body.appendChild(h);
  }
  // ---------- Panel: leer el QR de la tarjeta ----------
  async function vGestionQR() {
    const html = `${barra(`Panel de ${esc(C.marca)}`, "", "#perfil")}${navPanel("qr")}
      <div class="zona" style="margin-top:14px"><div class="lector"><video id="cam" playsinline muted></video><span class="marco"></span></div>
      <p class="nota" id="estadoQR" style="text-align:center">Apunta a la tarjeta de socio.</p></div>
      <form id="manual" class="zona"><label class="campo"><span>O escribe su número de socio</span><input class="entrada" name="n" inputmode="numeric" placeholder="Ej.: 1001"></label>
      <button class="boton ancho" style="margin-top:10px">Buscar</button></form>`;
    await pintar(html, "perfil");
    let stream = null, activo = true;
    const parar = () => { activo = false; if (stream) stream.getTracks().forEach(t => t.stop()); };
    window.addEventListener("hashchange", parar, { once: true });
    const estado = t => { const e = document.getElementById("estadoQR"); if (e) e.textContent = t; };
    document.getElementById("manual").onsubmit = async e => {
      e.preventDefault(); const n = String(e.target.n.value).replace(/\D/g, "");
      const u = (await A.socios()).find(x => String(x.socio) === String(+n));
      if (u) fichaSocio(u.id); else aviso("No hay ningún socio con ese número.");
    };
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("sin cámara");
      await cargarScript("vendor/jsqr.js");
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (!activo) return parar();
      const v = document.getElementById("cam"); v.srcObject = stream; await v.play();
      const cv = document.createElement("canvas"), cx = cv.getContext("2d", { willReadFrequently: true });
      const mirar = () => {
        if (!activo || !v.isConnected) return parar();
        if (v.readyState >= 2 && v.videoWidth) {
          const k = Math.min(1, 640 / v.videoWidth); cv.width = Math.round(v.videoWidth * k); cv.height = Math.round(v.videoHeight * k);
          cx.drawImage(v, 0, 0, cv.width, cv.height);
          const q = window.jsQR(cx.getImageData(0, 0, cv.width, cv.height).data, cv.width, cv.height, { inversionAttempts: "dontInvert" });
          const m = q && q.data && q.data.match(/^[^|]+\|(.+)$/);
          if (m) { vibrar(); parar(); estado("Tarjeta leída."); return fichaSocio(m[1]); }
        }
        requestAnimationFrame(mirar);
      };
      mirar();
    } catch (e) {
      estado(e && e.name === "NotAllowedError" ? "No hay permiso para usar la cámara. Escribe el número de socio." : "No se puede usar la cámara aquí. Escribe el número de socio.");
    }
  }
  // ---------- Panel: cifras ----------
  async function vGestionCifras() {
    const c = await A.cifras();
    const t = (n, txt) => `<div class="cifra"><b>${miles(n)}</b><span>${txt}</span></div>`;
    const html = `${barra(`Panel de ${esc(C.marca)}`, "", "#perfil")}${navPanel("cifras")}
      <div class="cifras">${t(c.socios, "socios")}${t(c.nuevos7, "nuevos esta semana")}${t(c.nuevos30, "nuevos en 30 días")}
        ${t(c.fotos, "fotos publicadas")}${t(c.verificadas, "fotos verificadas")}${t(c.pendientes, "fotos por verificar")}
        ${t(c.historias, "historias activas")}${t(c.vistas, "vistas de esas historias")}</div>`;
    await pintar(html, "perfil");
  }

  // ================================================================ PUBLICAR FOTO
  async function vPublicar() {
    const misPedidos = (await A.pedidos()).filter(p => p.estado !== "Cancelado");
    app.classList.add("sin-nav");
    app.innerHTML = `${barra("Subir foto", "", "javascript:history.back()")}
      <form class="formulario" id="f">
        <label class="elegir-foto" for="foto" id="vista">${I.camara}<span>Elige una foto de tu evento</span></label>
        <input type="file" id="foto" class="oculto" accept="image/*">
        <div class="campo"><span>Tipo de evento</span><select class="entrada" name="evento">${C.tiposEvento.map(t => `<option>${esc(t)}</option>`).join("")}</select></div>
        <label class="campo"><span>Cuéntalo <small>Opcional</small></span><textarea class="entrada" name="texto" maxlength="400" placeholder="Ej.: Desayuno de equipo en la oficina de Madrid"></textarea></label>
        <label class="casilla etiqueta-dc"><input type="checkbox" name="etiqueta" checked><span><b>Es un evento de ${esc(C.marca)}.</b> La etiquetas y, cuando ${esc(C.marca)} lo compruebe, sumas ${puntosTxt(C.puntos.porFoto)}.</span></label>
        ${misPedidos.length ? `<div class="campo" id="cPedido"><span>¿De qué pedido es? <small>Opcional, así se verifica antes</small></span>
          <select class="entrada" name="pedido"><option value="">No lo sé</option>${misPedidos.map(p => `<option value="${esc(p.id)}">${esc(p.menu)}, ${new Date(p.fechaEvento + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</option>`).join("")}</select></div>` : ""}
        <p class="error" id="err"></p>
        <button class="boton ancho" style="margin-top:12px">Publicar</button>
        <p class="nota" style="margin-top:12px">Publica solo fotos tuyas y con permiso de quien salga en ellas.</p>
      </form>`;
    let foto = null;
    const cargar = async f => { if (!f) return; try { foto = await comprimir(f, 1400, .75, 650000); document.getElementById("vista").innerHTML = `<img src="${foto}" alt="">`; } catch (e) { document.getElementById("err").textContent = e.message; } };
    document.getElementById("foto").onchange = e => cargar(e.target.files[0]);
    if (S.fotoPendiente) { cargar(S.fotoPendiente); S.fotoPendiente = null; }
    const et = document.querySelector("[name=etiqueta]"), cp = document.getElementById("cPedido");
    if (cp) et.onchange = () => { cp.hidden = !et.checked; };
    document.getElementById("f").onsubmit = async e => {
      e.preventDefault(); const f = e.target, err = document.getElementById("err");
      const b = f.querySelector("button"); b.disabled = true; b.textContent = "Subiendo…";
      const etiqueta = f.etiqueta.checked;
      try {
        await A.publicar({ foto, texto: f.texto.value, evento: f.evento.value, etiqueta, pedidoId: etiqueta && f.pedido ? f.pedido.value : "" });
        vibrar(); aviso(etiqueta ? `Foto publicada. ${C.marca} la revisará para darte los puntos.` : "Foto publicada."); location.hash = "#inicio";
      }
      catch (er) { err.textContent = er.message; const b = f.querySelector("button"); b.disabled = false; b.textContent = "Publicar"; }
    };
  }

  // ¿Hay una APK más nueva publicada? (solo dentro de la app instalada; la web siempre está al día)
  (async () => {
    try {
      const nativa = window.Capacitor && typeof Capacitor.isNativePlatform === "function" && Capacitor.isNativePlatform();
      if (!nativa || !C.version || !C.version.comprobar) return;
      const r = await fetch(C.version.comprobar + "?t=" + Date.now(), { cache: "no-store" }); if (!r.ok) return;
      const v = await r.json();
      if (+v.codigo > C.version.codigo) {
        const b = document.createElement("a"); b.className = "aviso-version"; b.href = "#";
        b.innerHTML = `<b>Hay una versión nueva (${esc(v.nombre)})</b><span>Toca para descargarla e instalarla encima.</span>`;
        b.onclick = e => { e.preventDefault(); abrirFuera(v.apk); };
        document.body.appendChild(b);
      }
    } catch (e) {}
  })();

  // ---------- La carta: la de la app central (publicada), con respaldo sin conexión ----------
  const CARTA_K = "club_carta";
  const usarCarta = d => { if (d && Array.isArray(d.carta) && d.carta.length) { N.carta = d.carta; if (d.iva) N.iva = d.iva; return true; } return false; };
  async function cargarCarta() {
    try { usarCarta(JSON.parse(localStorage.getItem(CARTA_K))); } catch (e) {}
    const traer = async url => { const r = await fetch(url, { cache: "no-store" }); if (!r.ok) throw new Error(r.status); return r.json(); };
    const conTiempo = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error("tiempo")), ms))]);
    try {
      const d = await conTiempo(traer((C.carta && C.carta.url) + "?t=" + Math.floor(Date.now() / 300000)), 5000);
      if (usarCarta(d)) { try { localStorage.setItem(CARTA_K, JSON.stringify(d)); } catch (e) {} return; }
    } catch (e) {}
    if (!localStorage.getItem(CARTA_K)) { try { usarCarta(await traer("carta.json")); } catch (e) {} }   // la que va dentro de la app
  }
  const unidadTxt = (u, n = 2) => ({ persona: n === 1 ? "persona" : "personas", "niño": n === 1 ? "niño" : "niños", pack: n === 1 ? "pack" : "packs", bandeja: n === 1 ? "bandeja" : "bandejas", unidad: n === 1 ? "unidad" : "unidades" }[u || "persona"] || u);
  // Para «repetir pedido» y el botón de las historias: el producto por su id de la central (o por el nombre)
  function buscarProducto(ref) {
    if (ref == null || ref === "") return null;
    for (let ci = 0; ci < N.carta.length; ci++) {
      const mi = N.carta[ci].menus.findIndex(m => (m.id != null && String(m.id) === String(ref.productoId ?? ref)) || m.nombre === (ref.nombreMenu ?? ref));
      if (mi >= 0) return [ci, mi];
    }
    return null;
  }

  if ("serviceWorker" in navigator && !window.Capacitor && (location.protocol === "https:" || location.hostname === "localhost"))
    navigator.serviceWorker.register("sw.js").catch(() => {});
  cargarCarta().finally(router);
})();
