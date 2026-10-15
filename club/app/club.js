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
    if (!U) return ruta === "registro" ? vRegistro() : ruta === "entrar" ? vEntrar() : vBienvenida();
    const V = { inicio: vInicio, pedir: vPedir, pedidos: vPedidos, tarjeta: vTarjeta, red: vRed, perfil: vPerfil, chat: vChat, publicar: vPublicar, editar: vEditar, post: vPost };
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
          <div class="botones">
            <a class="boton" href="#registro">Crear mi cuenta</a>
            <a class="boton contorno" href="#entrar">Ya tengo cuenta</a>
          </div>
          ${A.demo ? `<p class="demo">Versión de demostración: los datos se guardan solo en este móvil.</p>` : ""}
        </div>
      </section>`;
  }

  function vEntrar() {
    app.classList.add("sin-nav");
    app.innerHTML = `${barra("", "", "#")}
      <form class="formulario" id="f">
        <h2>Entrar</h2>
        <label class="campo"><span>Correo</span><input class="entrada" name="email" type="email" autocomplete="email" required></label>
        <div class="campo"><span>Contraseña</span><div class="clave"><input class="entrada" name="clave" type="password" autocomplete="current-password" required><button type="button" class="ver-clave">Mostrar</button></div></div>
        <p style="margin:10px 0 0"><a class="enlace nota" href="#" id="olvido">¿Has olvidado tu contraseña?</a></p>
        <p class="error" id="err"></p>
        <button class="boton ancho" style="margin-top:12px">Entrar</button>
        <p class="nota" style="margin-top:18px">¿Aún no tienes cuenta? <a class="enlace" href="#registro">Créala aquí</a></p>
      </form>`;
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
    app.innerHTML = `${barra("", "", "#")}
      <form class="formulario" id="f" novalidate>
        <h2>Crea tu cuenta</h2>
        <p class="nota">Tu perfil sirve para pedir con descuento, guardar tu tarjeta y conectar con otras empresas.</p>
        <div class="campo"><span>Tipo de perfil</span>
          <div class="segmentos" id="tipo">${C.tiposPerfil.map((t, i) => `<button type="button" data-t="${esc(t)}" class="${i === 0 ? "on" : ""}">${esc(t)}</button>`).join("")}</div></div>
        <label class="campo"><span>Nombre y apellidos</span><input class="entrada" name="nombre" autocomplete="name" autocapitalize="words"></label>
        <label class="campo" id="cEmpresa"><span>Empresa o agencia</span><input class="entrada" name="empresa" autocomplete="organization"></label>
        <label class="campo"><span>Cargo <small>Opcional</small></span><input class="entrada" name="cargo" autocomplete="organization-title" placeholder="Ej.: Office manager"></label>
        <div class="campo"><span>Ciudad</span>
          <div class="segmentos" id="ciudad">${[...N.sedes.map(s => s.nombre), "Otra"].map((c, i) => `<button type="button" data-c="${esc(c)}" class="${i === 0 ? "on" : ""}">${esc(c)}</button>`).join("")}</div></div>
        <label class="campo"><span>Correo</span><input class="entrada" name="email" type="email" autocomplete="email"></label>
        <div class="campo"><span>Contraseña <small>Mínimo 8 caracteres</small></span><div class="clave"><input class="entrada" name="clave" type="password" autocomplete="new-password"><button type="button" class="ver-clave">Mostrar</button></div></div>
        <div class="campo"><span>Repite la contraseña <small id="coinciden"></small></span><div class="clave"><input class="entrada" name="clave2" type="password" autocomplete="new-password"><button type="button" class="ver-clave">Mostrar</button></div></div>
        <label class="casilla"><input type="checkbox" name="privado"><span><b>Perfil privado.</b> Solo verán tus fotos las personas a las que aceptes.</span></label>
        <label class="casilla"><input type="checkbox" name="acepto"><span>He leído y acepto la <a class="enlace" href="#" id="verPriv">política de privacidad</a>.</span></label>
        <p class="error" id="err"></p>
        <button class="boton ancho" style="margin-top:12px">Crear mi cuenta</button>
      </form>`;
    let tipo = C.tiposPerfil[0], ciudad = N.sedes[0].nombre;
    const seg = (sel, attr, fn) => document.querySelectorAll(`${sel} button`).forEach(b => b.onclick = () => { document.querySelectorAll(`${sel} button`).forEach(x => x.classList.toggle("on", x === b)); fn(b.dataset[attr]); });
    seg("#tipo", "t", v => { tipo = v; document.getElementById("cEmpresa").hidden = v === "Particular"; });
    seg("#ciudad", "c", v => { ciudad = v; });
    const fr = document.getElementById("f"), marca = () => {
      const a = fr.clave.value, b = fr.clave2.value, el = document.getElementById("coinciden");
      el.textContent = !b ? "" : a === b ? "Coinciden" : "No coinciden"; el.style.color = !b ? "" : a === b ? "var(--ok)" : "var(--no)";
    };
    fr.clave.oninput = marca; fr.clave2.oninput = marca;
    document.getElementById("verPriv").onclick = e => { e.preventDefault(); hojaTexto("Política de privacidad", C.textoPrivacidad); };
    document.getElementById("f").onsubmit = async e => {
      e.preventDefault(); const f = e.target, err = document.getElementById("err");
      if (!f.nombre.value.trim()) return err.textContent = "Escribe tu nombre.";
      if (tipo !== "Particular" && !f.empresa.value.trim()) return err.textContent = "Escribe el nombre de tu empresa o agencia.";
      if (f.clave.value.length < 8) return err.textContent = "La contraseña necesita al menos 8 caracteres.";
      if (f.clave.value !== f.clave2.value) { f.clave2.focus(); return err.textContent = "Las contraseñas no coinciden. Pulsa «Mostrar» para revisarlas."; }
      if (!f.acepto.checked) return err.textContent = "Para crear la cuenta tienes que aceptar la política de privacidad.";
      try {
        await A.registrar({ email: f.email.value, clave: f.clave.value, nombre: f.nombre.value, tipo, empresa: tipo === "Particular" ? "" : f.empresa.value, cargo: f.cargo.value, ciudad, privado: f.privado.checked });
        vibrar(); location.hash = "#inicio"; setTimeout(() => aviso("Cuenta creada. Ya tienes tu tarjeta de socio."), 300);
      } catch (er) { err.textContent = er.message; }
    };
  }

  // ================================================================ INICIO (fotos de la comunidad)
  async function vInicio() {
    const [soc, pedidos, posts] = await Promise.all([A.socio(), A.pedidos(), A.publicaciones({ filtro: S.filtroFeed })]);
    const pts = soc.puntos, nv = nivelDe(soc), ult = pedidos[0];
    const faltan = [!U.foto && "la foto de perfil", !U.portada && "la foto de portada", !U.bio && "la biografía"].filter(Boolean);
    const html = `
      ${barra(esc(C.marca), `<a class="icono-btn" href="#publicar" aria-label="Subir foto">${I.mas}</a>`)}
      <section class="saludo"><h2>Hola, ${esc(U.nombre.split(" ")[0])}</h2><p>Socio ${esc(nv.nombre)} con ${puntosTxt(pts)}. Tienes un ${nv.descuento} % de descuento en tus pedidos.</p></section>
      ${faltan.length ? `<a class="completar" href="#editar"><b>Completa tu perfil</b><span>Te falta ${listaNatural(faltan)}. Así las empresas del club sabrán quién eres.</span><div class="barra-progreso"><i style="width:${Math.round((3 - faltan.length) / 3 * 100)}%"></i></div></a>` : ""}
      <div class="atajos">
        ${ult ? `<button class="atajo oscuro" id="repetir"><b>Repetir pedido</b><span>${esc(ult.menu)} para ${ult.personas} personas</span></button>`
              : `<a class="atajo oscuro" href="#pedir"><b>Hacer un pedido</b><span>Con tu ${nv.descuento} % de descuento de socio</span></a>`}
        <a class="atajo" href="#publicar"><b>Subir fotos</b><span>De tu último evento, +${C.puntos.porFoto} puntos cada una</span></a>
      </div>
      <div class="filtro-feed"><div class="segmentos" id="filtro"><button data-f="todos" class="${S.filtroFeed === "todos" ? "on" : ""}">Todo el club</button><button data-f="siguiendo" class="${S.filtroFeed === "siguiendo" ? "on" : ""}">A quién sigo</button></div></div>
      ${posts.length ? (await Promise.all(posts.map(tarjetaPost))).join("") : `<p class="vacio">${S.filtroFeed === "siguiendo" ? "Aún no sigues a nadie que haya publicado. Busca empresas en «Red»." : "Todavía no hay fotos. ¡Sube la primera!"}</p>`}`;
    await pintar(html, "inicio");
    document.querySelectorAll("#filtro button").forEach(b => b.onclick = () => { S.filtroFeed = b.dataset.f; vInicio(); });
    const rep = document.getElementById("repetir"); if (rep) rep.onclick = () => { S.repetir = ult; location.hash = "#pedir"; };
    enlazarPosts();
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
      <div class="pie">${p.texto ? `<b>${esc(u.nombre)}</b> ${esc(p.texto)}` : ""}
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
        <small>${hace(x.fecha)}${x.autor === U.id ? ` · <button class="borrar-com" data-c="${esc(x.id)}">Borrar</button>` : ""}</small></div></div>`).join("")
      : `<p class="vacio">Aún no hay comentarios. Escribe el primero.</p>`;
    c.querySelectorAll(".borrar-com").forEach(b => b.onclick = async () => { await A.borrarComentario(postAbierto, b.dataset.c); pintarComentarios(); });
    const n = document.querySelector(".post a[href^='#post/'] span"); if (n) n.textContent = cs.length;
    if (alFinal) window.scrollTo(0, document.body.scrollHeight);
  }

  // ================================================================ PEDIR (carta con descuento de socio)
  async function vPedir() {
    const soc = await A.socio(), nv = nivelDe(soc), dto = nv.descuento;
    if (S.repetir) { const r = S.repetir; S.repetir = null; return hojaPedido(r.cat, r.idx, dto, r); }
    const cats = N.carta;
    const cat = cats[S.categoria] || cats[0];
    const precioDe = m => m.variantes ? Math.min(...m.variantes.map(v => v.precio)) : m.precio;
    const fotoCat = (cat.menus.find(x => x.foto) || {}).foto;   // los menús sin foto usan la de su categoría
    const html = `
      ${barra("Pedir", `<a class="boton mini suave" href="#pedidos">Mis pedidos</a>`)}
      <div class="categorias" id="cats">${cats.map((c, i) => `<button data-i="${i}" class="${c === cat ? "on" : ""}">${esc(c.categoria)}</button>`).join("")}</div>
      <p class="descuento-banda">Como ${esc(nv.nombre)} tienes un ${dto} % de descuento en todos los menús.</p>
      ${cat.descripcion ? `<p class="nota zona" style="margin:12px 0 0">${esc(cat.descripcion)}</p>` : ""}
      <div>${cat.menus.map((m, j) => `
        <div class="menu" data-j="${j}">${(m.foto || fotoCat) ? `<img src="${esc(m.foto || fotoCat)}" alt="" loading="lazy">` : `<span class="sin-foto"></span>`}
          <div><b>${esc(m.nombre)}</b><small>${esc(m.platos.slice(0, 3).join(", "))}${m.platos.length > 3 ? "…" : ""}</small></div>
          <div class="precio">${m.variantes ? "<s>desde</s>" : `<s>${euros(precioDe(m))}</s>`}<strong>${euros(precioDe(m) * (1 - dto / 100))}</strong></div>
        </div>`).join("")}</div>
      <p class="nota zona" style="margin-top:14px">Precios por persona, sin IVA (${N.iva} %).</p>`;
    await pintar(html, "pedir");
    document.querySelectorAll("#cats button").forEach(b => b.onclick = () => { S.categoria = +b.dataset.i; vPedir(); });
    document.querySelectorAll(".menu").forEach(el => el.onclick = () => hojaPedido(N.carta.indexOf(cat), +el.dataset.j, dto));
  }

  async function hojaPedido(ci, mi, dto, previo) {
    const cat = N.carta[ci], m = cat && cat.menus[mi];
    if (!m) { aviso("Ese menú ya no está en la carta."); return vPedir(); }
    let sede = previo?.sede || N.sedes[0].nombre, variante = previo?.variante ?? 0;
    const minimo = () => !m.minimo ? 1 : typeof m.minimo === "number" ? m.minimo : (m.minimo[sede] ?? Math.min(...Object.values(m.minimo)));
    let personas = Math.max(previo?.personas || minimo(), minimo());
    const html = `
      ${barra("", "", "#pedir")}
      <section class="hoja">
        <p class="nota" style="margin:0">${esc(cat.categoria)}</p>
        <h2>${esc(m.nombre)}</h2>
        <ul class="platos">${m.platos.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
        ${N.sedes.length > 1 ? `<div class="campo"><span>Ciudad</span><div class="segmentos" id="sede">${N.sedes.map(s => `<button data-s="${esc(s.nombre)}" class="${s.nombre === sede ? "on" : ""}">${esc(s.nombre)}</button>`).join("")}</div></div>` : ""}
        ${m.variantes ? `<div class="campo"><span>Montaje</span><div class="segmentos" id="var">${m.variantes.map((v, k) => `<button data-v="${k}" class="${k === variante ? "on" : ""}">${esc(v.nombre)}</button>`).join("")}</div></div>` : ""}
        <div class="campo"><span>Personas <small id="min"></small></span>
          <div class="personas"><button class="redondo" data-p="-5" aria-label="Cinco menos">−</button><b id="pers"></b><button class="redondo" data-p="5" aria-label="Cinco más">+</button></div></div>
        <label class="campo"><span>Fecha del evento</span><input class="entrada" type="date" id="fecha" value="${esc(previo?.fechaEvento || "")}"></label>
        <div class="resumen" id="res"></div>
        <p class="error" id="err"></p>
        <div style="display:grid;gap:10px;margin-top:14px">
          ${C.stripe.enlacePago ? `<button class="boton ancho" id="pagar">Pagar con tarjeta</button>` : `<button class="boton ancho" disabled>Pago con tarjeta: muy pronto</button>`}
          <button class="boton wa ancho" id="wa">Pedir por WhatsApp</button>
        </div>
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
      const c = calc(), sedeObj = N.sedes.find(s => s.nombre === sede) || N.sedes[0];
      const p = await A.crearPedido({ cat: ci, idx: mi, menu: m.nombre + (m.variantes ? ` (${m.variantes[variante].nombre})` : ""), variante, personas, sede, fechaEvento: fechaEl.value, base: c.neto, descuentoPct: dto, ahorro: c.ahorro, total: c.total, canal });
      const fechaTxt = new Date(fechaEl.value + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
      const texto = [`Hola ${N.nombre} ${sede}, hago este pedido desde la app del club:`, `• Menú: ${p.menu}`, `• Personas: ${personas}`, `• Fecha: ${fechaTxt}`,
        `• Total con descuento de socio (${dto} %) e IVA: ${euros(c.total)}`, `• Socio: ${U.nombre}${U.empresa ? ", " + U.empresa : ""} (${numeroSocio(U)})`].join("\n");
      return { p, texto, sedeObj };
    }
    document.getElementById("wa").onclick = async () => {
      const r = await registrar("WhatsApp"); if (!r) return;
      vibrar(); aviso(`Pedido guardado. +${Math.floor(r.p.base * C.puntos.porEuro)} puntos`);
      abrirFuera(`https://wa.me/${String(r.sedeObj.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(r.texto)}`);
      location.hash = "#pedidos";
    };
    const pg = document.getElementById("pagar");
    if (pg) pg.onclick = async () => { const r = await registrar("Tarjeta"); if (!r) return; abrirFuera(C.stripe.enlacePago); location.hash = "#pedidos"; };
  }

  async function vPedidos() {
    const ps = await A.pedidos();
    const html = `${barra("Mis pedidos", "", "#pedir")}
      ${ps.length ? ps.map(p => `
        <div class="pedido-fila"><div><b>${esc(p.menu)}</b>
          <small>${p.personas} personas en ${esc(p.sede)}, ${new Date(p.fechaEvento + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</small>
          <small>${euros(p.total)}, ahorraste ${euros(p.ahorro)}. ${esc(p.estado)}</small></div>
          <button class="boton mini" data-id="${esc(p.id)}">Repetir</button></div>`).join("")
        : `<p class="vacio">Aún no has hecho pedidos desde la app.<br><a class="enlace" href="#pedir">Ver la carta</a></p>`}`;
    await pintar(html, "pedir");
    document.querySelectorAll("[data-id]").forEach(b => b.onclick = () => { S.repetir = ps.find(p => p.id === b.dataset.id); location.hash = "#pedir"; });
  }

  // ================================================================ TARJETA DE SOCIO
  async function vTarjeta() {
    const soc = await A.socio(), pts = soc.puntos, nv = nivelDe(soc), sig = siguienteNivel(soc);
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
      <ul class="niveles"><li><div><b>1 punto por cada ${eurosPorPunto()} €</b><small>De los pedidos que hagas desde la app, sin IVA.</small></div></li>
        <li><div><b>${puntosTxt(C.puntos.porFoto)} por foto</b><small>Sube las fotos de tus eventos con ${esc(C.marca)}.</small></div></li>
        <li><div><b>${puntosTxt(C.puntos.porSeguidor)} por seguidor</b><small>Cuantas más empresas te sigan, más subes.</small></div></li>
        <li><div><b>${puntosTxt(C.puntos.porCompartida)} cada vez que compartan tu foto</b><small>Las fotos que gustan llegan más lejos.</small></div></li>
        <li><div><b>Los puntos duran ${C.puntos.caducanMeses} meses</b><small>El nivel se calcula con lo del último año: para mantenerlo, sigue pidiendo.</small></div></li></ul>`;
    await pintar(html, "tarjeta");
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
    const nv = nivelDe(soc);
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
    document.getElementById("salir").onclick = async () => { await A.salir(); location.hash = "#"; router(); };
    document.getElementById("borrar").onclick = async () => { if (await confirmar("Se borrarán tu cuenta, tus fotos, tus mensajes y tus pedidos. No se puede deshacer.", "Borrar mi cuenta")) { await A.borrarCuenta(); location.hash = "#"; router(); } };
    const r = document.getElementById("reiniciar"); if (r) r.onclick = async () => { if (await confirmar("Se borra todo lo que has hecho en esta demostración.", "Reiniciar")) { await A.reiniciarDemo(); location.hash = "#"; router(); } };
  }

  // ================================================================ PUBLICAR FOTO
  async function vPublicar() {
    app.classList.add("sin-nav");
    app.innerHTML = `${barra("Subir foto", "", "javascript:history.back()")}
      <form class="formulario" id="f">
        <label class="elegir-foto" for="foto" id="vista">${I.camara}<span>Elige una foto de tu evento</span></label>
        <input type="file" id="foto" class="oculto" accept="image/*">
        <div class="campo"><span>Tipo de evento</span><select class="entrada" name="evento">${C.tiposEvento.map(t => `<option>${esc(t)}</option>`).join("")}</select></div>
        <label class="campo"><span>Cuéntalo <small>Opcional</small></span><textarea class="entrada" name="texto" maxlength="400" placeholder="Ej.: Desayuno de equipo en la oficina de Madrid"></textarea></label>
        <p class="error" id="err"></p>
        <button class="boton ancho" style="margin-top:12px">Publicar (+${C.puntos.porFoto} puntos)</button>
        <p class="nota" style="margin-top:12px">Publica solo fotos tuyas y con permiso de quien salga en ellas.</p>
      </form>`;
    let foto = null;
    const cargar = async f => { if (!f) return; try { foto = await comprimir(f, 1400, .75, 650000); document.getElementById("vista").innerHTML = `<img src="${foto}" alt="">`; } catch (e) { document.getElementById("err").textContent = e.message; } };
    document.getElementById("foto").onchange = e => cargar(e.target.files[0]);
    if (S.fotoPendiente) { cargar(S.fotoPendiente); S.fotoPendiente = null; }
    document.getElementById("f").onsubmit = async e => {
      e.preventDefault(); const f = e.target, err = document.getElementById("err");
      const b = f.querySelector("button"); b.disabled = true; b.textContent = "Subiendo…";
      try { await A.publicar({ foto, texto: f.texto.value, evento: f.evento.value }); vibrar(); aviso(`Foto publicada. +${C.puntos.porFoto} puntos`); location.hash = "#inicio"; }
      catch (er) { err.textContent = er.message; const b = f.querySelector("button"); b.disabled = false; b.textContent = `Publicar (+${C.puntos.porFoto} puntos)`; }
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

  router();
})();
