// ALMACÉN DE DEMOSTRACIÓN: todo se guarda en ESTE móvil (localStorage).
// Tiene exactamente las mismas funciones que tendrá almacen-firebase.js; para pasar a la versión
// real con usuarios de verdad basta con cargar ese archivo en lugar de este.
// Solo hay una cuenta precargada: la oficial de Doña Col (no se puede entrar con ella).
(() => {
  const K = "club_doncol_demo_v2";   // v2: perfiles con foto de portada
  const ahora = () => new Date().toISOString();
  const nuevoId = p => p + Math.random().toString(36).slice(2, 10);
  const avisar = () => window.dispatchEvent(new Event("club:cambio"));

  async function huella(t) {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("club:" + t));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  }

  // Solo la cuenta oficial de Doña Col, con fotos reales de sus montajes. Sin perfiles inventados.
  const FOTOS_OFICIALES = [
    { id: "p1", foto: "media/elegante.jpg", texto: "Montaje elegante para una presentación de producto en Madrid.", evento: "Cóctel", h: 5 },
    { id: "p7", foto: "media/congresos.jpg", texto: "Congreso con 400 asistentes: coffee break y cóctel de clausura.", evento: "Congreso", h: 26 },
    { id: "p8", foto: "media/cateringbox.jpg", texto: "Catering Box® listo para abrir en la oficina.", evento: "Catering Box®", h: 50 },
    { id: "p5", foto: "media/comuniones.jpg", texto: "Temporada de comuniones: buffet con montaje elegante incluido.", evento: "Comunión", h: 120 },
    { id: "p9", foto: "media/empresas.jpg", texto: "Jornada de empresa con montaje completo.", evento: "Evento de empresa", h: 140 }
  ];

  // Puntos de los últimos 12 meses: pedidos CONFIRMADOS por Doña Col, fotos VERIFICADAS por Doña Col,
  // compartidas de esas fotos y seguidores (con tope)
  function calcularPuntos(pedidos, fotos, seguidores, resena) {
    const C = window.CLUB, P = C.puntos, validos = C.estadosConPuntos || ["Confirmado", "Entregado"];
    const d = new Date(); d.setMonth(d.getMonth() - (P.caducanMeses || 12)); const desde = d.toISOString();
    const ok = pedidos.filter(p => validos.includes(p.estado) && p.fecha >= desde);
    const euros = ok.reduce((s, p) => s + (p.base || 0), 0);
    const verificadas = fotos.filter(f => !f.repostDe && f.verificacion === "verificada" && f.fecha >= desde);
    const compartidas = verificadas.reduce((s, f) => s + (f.nCompartida || 0), 0);
    const porSeguidores = Math.min(seguidores * P.porSeguidor, P.topeSeguidores ?? Infinity);
    const porResena = resena && resena.estado === "verificada" && (resena.verificadaEn || "") >= desde ? (P.porResena || 0) : 0;
    return { puntos: Math.floor(euros * P.porEuro) + verificadas.length * P.porFoto + porSeguidores + compartidas * (P.porCompartida || 0) + porResena, pedidos: ok.length };
  }

  function semilla() {
    const hace = h => new Date(Date.now() - h * 3600e3).toISOString();
    const u = (id, nombre, tipo, empresa, cargo, ciudad, bio, extra = {}) =>
      ({ id, email: id + "@ejemplo.invalid", nombre, tipo, empresa, cargo, ciudad, bio, privado: false, foto: "", portada: "", creado: hace(900), socio: 0, ejemplo: true, ...extra });
    return {
      version: 1, sesion: null, contador: 1040,
      usuarios: [
        u("u_donacol", "Doña Col Catering", "Empresa", "Doña Col", "Cuenta oficial", "Madrid y Zaragoza",
          "Catering para empresas, cócteles, comuniones y congresos. Aquí publicamos los montajes de cada semana.", { oficial: true, foto: "media/logo-marron.png", portada: "media/campana.jpg", socio: 1 })
      ],
      seguimientos: [],
      publicaciones: FOTOS_OFICIALES.map(f => ({ ...f, autor: "u_donacol", fecha: hace(f.h), meGusta: [], comentarios: [], etiquetaDonaCol: false, verificacion: "sin" })),
      pedidos: [], mensajes: [], bloqueos: [], denuncias: [], historias: [], resenas: []
    };
  }

  let db;
  try { db = JSON.parse(localStorage.getItem(K)) || semilla(); } catch (e) { db = semilla(); }
  function guardar() {
    try { localStorage.setItem(K, JSON.stringify(db)); }
    catch (e) { throw new Error("El móvil no tiene más espacio para la demostración. Borra alguna foto."); }
  }
  function migrar() {
    db.historias = db.historias || []; db.resenas = db.resenas || []; db.empresas = db.empresas || {};
    db.publicaciones.forEach(p => { p.comentarios = p.comentarios || []; p.meGusta = p.meGusta || []; });
    // 1.2: se borran los perfiles inventados de versiones anteriores (y todo lo suyo); tu cuenta se conserva
    const falsos = new Set(db.usuarios.filter(x => x.ejemplo && !x.oficial).map(x => x.id));
    if (falsos.size) {
      db.usuarios = db.usuarios.filter(x => !falsos.has(x.id));
      const fuera = new Set(db.publicaciones.filter(p => falsos.has(p.autor)).map(p => p.id));
      db.publicaciones = db.publicaciones.filter(p => !falsos.has(p.autor) && !fuera.has(p.repostDe));
      db.publicaciones.forEach(p => { p.comentarios = p.comentarios.filter(c => !falsos.has(c.autor)); p.meGusta = p.meGusta.filter(x => !falsos.has(x)); });
      db.seguimientos = db.seguimientos.filter(x => !falsos.has(x.de) && !falsos.has(x.a));
      db.mensajes = db.mensajes.filter(m => !falsos.has(m.de) && !falsos.has(m.a));
    }
    FOTOS_OFICIALES.forEach(f => { if (!db.publicaciones.some(p => p.id === f.id)) db.publicaciones.push({ ...f, autor: "u_donacol", fecha: new Date(Date.now() - f.h * 3600e3).toISOString(), meGusta: [], comentarios: [] }); });
    guardar();
  }

  const yo = () => db.usuarios.find(x => x.id === db.sesion) || null;
  const usuario = id => db.usuarios.find(x => x.id === id) || null;
  const publico = x => x && (({ clave, ...resto }) => resto)(x);
  const bloqueado = id => db.bloqueos.some(b => b.de === db.sesion && b.a === id);
  const seguimiento = (de, a) => db.seguimientos.find(s => s.de === de && s.a === a);

  migrar();

  const Almacen = {
    demo: true,

    // ---------- Cuenta ----------
    async sesion() { return publico(yo()); },
    async registrar(d) {
      const email = String(d.email || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Revisa el correo electrónico.");
      if (String(d.clave || "").length < 8) throw new Error("La contraseña necesita al menos 8 caracteres.");
      if (db.usuarios.some(x => x.email === email)) throw new Error("Ya hay una cuenta con ese correo. Entra con tu contraseña.");
      const nuevo = {
        id: nuevoId("u_"), email, clave: await huella(d.clave), nombre: d.nombre.trim(), tipo: d.tipo, empresa: (d.empresa || "").trim(),
        cargo: (d.cargo || "").trim(), ciudad: d.ciudad || "", bio: "", privado: !!d.privado, foto: "", portada: "", creado: ahora(), socio: ++db.contador,
        facturacion: d.facturacion ? { ...d.facturacion, email } : null
      };
      db.usuarios.push(nuevo); db.sesion = nuevo.id;
      // La cuenta oficial te da la bienvenida
      db.mensajes.push({ id: nuevoId("m_"), de: "u_donacol", a: nuevo.id, texto: `¡Bienvenido al club, ${nuevo.nombre.split(" ")[0]}! Desde la app tienes un 5 % de descuento en cada pedido. Si necesitas algo, escríbenos por aquí.`, fecha: ahora(), leido: false });
      guardar(); return publico(nuevo);
    },
    async entrar(email, clave) {
      const x = db.usuarios.find(u => u.email === String(email).trim().toLowerCase() && !u.ejemplo);
      if (!x || x.clave !== await huella(clave)) throw new Error("Correo o contraseña incorrectos.");
      db.sesion = x.id; guardar(); return publico(x);
    },
    async salir() { db.sesion = null; guardar(); },
    async recuperarClave() { throw new Error("En la versión real te llegará un correo para crear una contraseña nueva. En esta demostración, si no la recuerdas, crea otra cuenta."); },
    async actualizarPerfil(c) {
      const x = yo(); if (!x) return;
      ["nombre", "tipo", "empresa", "cargo", "ciudad", "bio", "privado", "foto", "portada"].forEach(k => { if (k in c) x[k] = c[k]; });
      if (!x.privado) db.seguimientos.filter(s => s.a === x.id && s.estado === "pendiente").forEach(s => s.estado = "ok");
      guardar(); avisar(); return publico(x);
    },
    async borrarCuenta() {
      const id = db.sesion; if (!id) return;
      db.usuarios = db.usuarios.filter(u => u.id !== id);
      db.publicaciones = db.publicaciones.filter(p => p.autor !== id);
      db.seguimientos = db.seguimientos.filter(s => s.de !== id && s.a !== id);
      db.mensajes = db.mensajes.filter(m => m.de !== id && m.a !== id);
      db.pedidos = db.pedidos.filter(p => p.uid !== id);
      db.sesion = null; guardar();
    },

    // ---------- Perfiles y red ----------
    async perfil(id) { return publico(usuario(id)); },
    async perfiles(buscar = "") {
      const q = buscar.trim().toLowerCase();
      return db.usuarios.filter(u => u.id !== db.sesion && !bloqueado(u.id))
        .filter(u => !q || [u.nombre, u.empresa, u.cargo, u.ciudad, u.tipo].join(" ").toLowerCase().includes(q))
        .sort((a, b) => (b.oficial ? 1 : 0) - (a.oficial ? 1 : 0) || a.nombre.localeCompare(b.nombre)).map(publico);
    },
    async relacion(id) { const s = seguimiento(db.sesion, id); return s ? s.estado : "no"; },   // "ok" | "pendiente" | "no"
    async seguir(id) {
      const otro = usuario(id); if (!otro || seguimiento(db.sesion, id)) return;
      const estado = otro.privado ? "pendiente" : "ok";
      db.seguimientos.push({ de: db.sesion, a: id, estado, fecha: ahora() });
      guardar(); avisar(); return estado;
    },
    async dejarDeSeguir(id) { db.seguimientos = db.seguimientos.filter(s => !(s.de === db.sesion && s.a === id)); guardar(); avisar(); },
    async solicitudes() {
      return db.seguimientos.filter(s => s.a === db.sesion && s.estado === "pendiente").map(s => ({ ...s, perfil: publico(usuario(s.de)) })).filter(s => s.perfil);
    },
    async aceptar(id) { const s = seguimiento(id, db.sesion); if (s) s.estado = "ok"; guardar(); avisar(); },
    async rechazar(id) { db.seguimientos = db.seguimientos.filter(s => !(s.de === id && s.a === db.sesion)); guardar(); avisar(); },
    async cuentas(id) {
      return {
        seguidores: db.seguimientos.filter(s => s.a === id && s.estado === "ok").length,
        siguiendo: db.seguimientos.filter(s => s.de === id && s.estado === "ok").length,
        publicaciones: db.publicaciones.filter(p => p.autor === id && !p.repostDe).length
      };
    },
    async puedeVer(id) {
      const u = usuario(id); return !!u && (!u.privado || id === db.sesion || (seguimiento(db.sesion, id) || {}).estado === "ok");
    },
    async bloquear(id) { if (!bloqueado(id)) db.bloqueos.push({ de: db.sesion, a: id, fecha: ahora() }); await this.dejarDeSeguir(id); guardar(); avisar(); },
    async denunciar(pubId, motivo) { db.denuncias.push({ id: nuevoId("d_"), de: db.sesion, publicacion: pubId, motivo, fecha: ahora() }); guardar(); },
    async moderarPublicacion(id) { db.publicaciones = db.publicaciones.filter(x => x.id !== id && x.repostDe !== id); db.denuncias = db.denuncias.filter(d => d.publicacion !== id); guardar(); avisar(); },
    async denuncias() {
      return db.denuncias.map((d, i) => { d.id = d.id || "d_" + i; const p = db.publicaciones.find(x => x.id === d.publicacion) || null;
        return { ...d, perfil: publico(usuario(d.de)), pub: p, autorPub: p ? publico(usuario(p.autor)) : null }; });
    },
    async descartarDenuncia(id) { db.denuncias = db.denuncias.filter(d => d.id !== id); guardar(); avisar(); },
    async correoVerificado() { return true; },
    async comprobarCorreo() { return true; },
    async reenviarCorreo() {},
    async socios() { return db.usuarios.map(publico); },
    async facturacionDe(uid) { const u = usuario(uid); return (u && u.facturacion) || null; },
    async socioReal(uid) { return this.socio(uid); },
    async cifras() {
      const hace = d => new Date(Date.now() - d * 864e5).toISOString(), us = db.usuarios.filter(u => !u.oficial), ps = db.publicaciones.filter(p => !p.repostDe);
      const hs = db.historias.filter(h => h.caduca > ahora());
      return { socios: us.length, nuevos7: us.filter(u => u.creado >= hace(7)).length, nuevos30: us.filter(u => u.creado >= hace(30)).length,
        fotos: ps.length, verificadas: ps.filter(p => p.verificacion === "verificada").length, pendientes: ps.filter(p => p.verificacion === "pendiente").length,
        historias: hs.length, vistas: hs.reduce((s, h) => s + (h.vistas || []).length, 0) };
    },
    async empresaPorCif(cif) { const e = db.empresas[cif]; return e ? { cif, ...e.datos } : null; },
    async _empresa(cif, uid) { const e = db.empresas[cif]; return e ? { empresa: { cif, ...e.datos }, fiscal: e.fiscal, miembro: e.miembros[uid] || null } : null; },
    async miEmpresa() {
      const f = await this.facturacion(); if (!f || f.tipo !== "EMPRESA" || !f.cif) return f ? { fact: f, empresa: null } : null;
      const x = await this._empresa(f.cif, db.sesion); return x ? { ...x, fact: f, soyTitular: x.empresa.titular === db.sesion } : { fact: f, empresa: null };
    },
    async empresaDe(cif, uid) { return this._empresa(cif, uid); },
    async crearEmpresa(e, movil) {
      if (db.empresas[e.cif]) throw new Error("Esa empresa ya está dada de alta en el club. Vuelve atrás y pide unirte.");
      const u = yo();
      db.empresas[e.cif] = { datos: { nombre: e.nombre, nombre_comercial: e.nombre_comercial || "", localidad: e.localidad, titular: u.id, titularNombre: u.nombre, creada: ahora(), verificada: false },
        fiscal: { direccion: e.direccion, cp: e.cp, localidad: e.localidad, provincia: e.provincia, pais: "España", email_fe: e.email_fe || "" }, miembros: { [u.id]: { estado: "ok", nombre: u.nombre, fecha: ahora() } } };
      u.facturacion = { tipo: "EMPRESA", cif: e.cif, movil, mayorEdad: true, email: u.email }; guardar(); avisar();
    },
    async guardarEmpresa(cif, e) { const x = db.empresas[cif]; if (!x) return; Object.assign(x.datos, { nombre: e.nombre, nombre_comercial: e.nombre_comercial || "", localidad: e.localidad }); Object.assign(x.fiscal, e); guardar(); },
    async unirseEmpresa(cif, movil) { const u = yo(), x = db.empresas[cif]; if (!x) return; x.miembros[u.id] = { estado: "pendiente", nombre: u.nombre, fecha: ahora() }; u.facturacion = { tipo: "EMPRESA", cif, movil, mayorEdad: true, email: u.email }; guardar(); avisar(); },
    async empresasPorVerificar() {
      return Object.entries(db.empresas).filter(([, x]) => !x.datos.verificada).map(([cif, x]) => { const t = usuario(x.datos.titular) || {};
        return { cif, ...x.datos, fiscal: x.fiscal, titularCorreo: t.email || "", titularMovil: (t.facturacion || {}).movil || "", titularPerfil: publico(t) }; });
    },
    async verificarEmpresa(cif, ok) { const x = db.empresas[cif]; if (!x) return; if (ok) x.datos.verificada = true; else delete db.empresas[cif]; guardar(); avisar(); },
    async miembrosEmpresa(cif) { const x = db.empresas[cif]; return x ? Object.entries(x.miembros).map(([uid, m]) => ({ uid, ...m })) : []; },
    async resolverMiembro(cif, uid, ok) { const x = db.empresas[cif]; if (x && x.miembros[uid]) { x.miembros[uid].estado = ok ? "ok" : "rechazado"; guardar(); avisar(); } },
    async salirEmpresa(cif) { const u = yo(), x = db.empresas[cif]; if (x) delete x.miembros[u.id]; u.facturacion = null; guardar(); },
    async solicitudesMiEmpresa() { const f = await this.facturacion(); const x = f && f.cif && db.empresas[f.cif]; if (!x || x.datos.titular !== db.sesion) return null; return { empresa: { cif: f.cif, ...x.datos }, n: Object.values(x.miembros).filter(m => m.estado === "pendiente").length }; },
    async unionesPendientes() { const out = []; Object.entries(db.empresas).forEach(([cif, x]) => Object.entries(x.miembros).forEach(([uid, m]) => { if (m.estado === "pendiente") out.push({ cif, empresa: x.datos.nombre, titularNombre: x.datos.titularNombre, uid, ...m }); })); return out; },
    async facturacion() { const u = yo(); return (u && u.facturacion) || null; },
    async guardarFacturacion(f) { const u = yo(); if (u) { u.facturacion = { ...f, email: u.email }; guardar(); } },

    // ---------- Publicaciones ----------
    async publicaciones({ autor = null, filtro = "todos" } = {}) {
      const sigo = new Set(db.seguimientos.filter(s => s.de === db.sesion && s.estado === "ok").map(s => s.a));
      const visibles = [];
      for (const p of db.publicaciones) {
        if (bloqueado(p.autor)) continue;
        if (autor && p.autor !== autor) continue;
        if (filtro === "siguiendo" && !sigo.has(p.autor) && p.autor !== db.sesion) continue;
        if (!(await this.puedeVer(p.autor))) continue;
        if (p.repostDe) {
          const o = db.publicaciones.find(x => x.id === p.repostDe);
          if (!o || bloqueado(o.autor) || !(await this.puedeVer(o.autor))) continue;
          visibles.push({ ...p, perfil: publico(usuario(p.autor)), original: this._enriquecer(o) });
        } else visibles.push(this._enriquecer(p));
      }
      return visibles.sort((a, b) => b.fecha.localeCompare(a.fecha));
    },
    _enriquecer(p) {
      return { ...p, perfil: publico(usuario(p.autor)), meGustaYo: p.meGusta.includes(db.sesion),
        nComentarios: p.comentarios.length, nCompartida: db.publicaciones.filter(x => x.repostDe === p.id).length,
        compartidaPorMi: db.publicaciones.some(x => x.repostDe === p.id && x.autor === db.sesion) };
    },
    async publicacion(id) {
      const p = db.publicaciones.find(x => x.id === id && !x.repostDe);
      if (!p || bloqueado(p.autor) || !(await this.puedeVer(p.autor))) return null;
      return this._enriquecer(p);
    },
    async compartir(id, texto) {
      const o = db.publicaciones.find(x => x.id === id && !x.repostDe);
      if (!o) throw new Error("Esa foto ya no está disponible.");
      if (o.autor === db.sesion) throw new Error("Esta foto ya está en tu perfil.");
      if ((usuario(o.autor) || {}).privado) throw new Error("Su perfil es privado: sus fotos no se pueden compartir.");
      if (db.publicaciones.some(x => x.repostDe === id && x.autor === db.sesion)) throw new Error("Ya la has compartido.");
      db.publicaciones.push({ id: nuevoId("p_"), autor: db.sesion, repostDe: id, texto: (texto || "").trim(), fecha: ahora(), meGusta: [], comentarios: [] });
      guardar(); avisar();
    },
    async comentarios(id) {
      const p = db.publicaciones.find(x => x.id === id); if (!p) return [];
      return p.comentarios.filter(c => !bloqueado(c.autor) && usuario(c.autor)).map(c => ({ ...c, perfil: publico(usuario(c.autor)) }));
    },
    async comentar(id, texto) {
      texto = String(texto || "").trim(); if (!texto) return;
      const p = db.publicaciones.find(x => x.id === id); if (!p) throw new Error("Esa foto ya no está disponible.");
      p.comentarios.push({ id: nuevoId("c_"), autor: db.sesion, texto, fecha: ahora() }); guardar(); avisar();
    },
    async borrarComentario(id, cid) {
      const p = db.publicaciones.find(x => x.id === id); if (!p) return;
      p.comentarios = p.comentarios.filter(c => !(c.id === cid && (c.autor === db.sesion || p.autor === db.sesion || (yo() || {}).oficial))); guardar(); avisar();
    },
    async publicar({ foto, texto, evento, etiqueta, pedidoId }) {
      if (!foto) throw new Error("Elige una foto.");
      const p = { id: nuevoId("p_"), autor: db.sesion, foto, texto: (texto || "").trim(), evento: evento || "", fecha: ahora(), meGusta: [], comentarios: [],
        etiquetaDonaCol: !!etiqueta, verificacion: etiqueta ? "pendiente" : "sin", pedidoId: pedidoId || null };
      db.publicaciones.push(p); guardar(); avisar();
      return p;
    },
    async borrarPublicacion(id) {
      const p = db.publicaciones.find(x => x.id === id && x.autor === db.sesion); if (!p) return;
      db.publicaciones = db.publicaciones.filter(x => x.id !== id && x.repostDe !== id); guardar(); avisar();
    },
    async meGusta(id) {
      const p = db.publicaciones.find(x => x.id === id); if (!p) return;
      p.meGusta = p.meGusta.includes(db.sesion) ? p.meGusta.filter(x => x !== db.sesion) : [...p.meGusta, db.sesion];
      guardar(); return p.meGusta.includes(db.sesion);
    },

    // ---------- Pedidos ----------
    async pedidos() { return db.pedidos.filter(p => p.uid === db.sesion).sort((a, b) => b.fecha.localeCompare(a.fecha)); },
    async crearPedido(p) { const x = { ...p, id: nuevoId("o_"), uid: db.sesion, fecha: ahora(), estado: "Solicitado" }; db.pedidos.push(x); guardar(); avisar(); return x; },

    // ---------- Mensajes ----------
    async conversaciones() {
      const mios = db.mensajes.filter(m => m.de === db.sesion || m.a === db.sesion);
      const porOtro = {};
      mios.forEach(m => { const o = m.de === db.sesion ? m.a : m.de; (porOtro[o] = porOtro[o] || []).push(m); });
      return Object.entries(porOtro).filter(([o]) => usuario(o) && !bloqueado(o)).map(([o, ms]) => {
        ms.sort((a, b) => a.fecha.localeCompare(b.fecha));
        return { perfil: publico(usuario(o)), ultimo: ms[ms.length - 1], sinLeer: ms.filter(m => m.a === db.sesion && !m.leido).length };
      }).sort((a, b) => b.ultimo.fecha.localeCompare(a.ultimo.fecha));
    },
    async mensajes(otro) {
      const ms = db.mensajes.filter(m => (m.de === db.sesion && m.a === otro) || (m.de === otro && m.a === db.sesion)).sort((a, b) => a.fecha.localeCompare(b.fecha));
      let cambio = false; ms.forEach(m => { if (m.a === db.sesion && !m.leido) { m.leido = true; cambio = true; } });
      if (cambio) guardar();
      return ms;
    },
    async enviarMensaje(otro, texto) {
      texto = String(texto || "").trim(); if (!texto) return;
      db.mensajes.push({ id: nuevoId("m_"), de: db.sesion, a: otro, texto, fecha: ahora(), leido: false }); guardar(); avisar();
      const o = usuario(otro);
      if (o && o.oficial && !db.mensajes.some(m => m.de === otro && m.a === db.sesion && m.auto && Date.now() - new Date(m.fecha) < 3600e3)) setTimeout(() => {
        db.mensajes.push({ id: nuevoId("m_"), de: otro, a: db.sesion, auto: true, texto: "Gracias por escribirnos. Te respondemos en horario de oficina, de lunes a viernes de 8:00 a 16:00. (Respuesta automática)", fecha: ahora(), leido: false });
        guardar(); avisar();
      }, 1500);
    },
    async sinLeer() { return db.mensajes.filter(m => m.a === db.sesion && !m.leido && !bloqueado(m.de)).length; },

    // ---------- Puntos ----------
    // Puntos y pedidos de los últimos 12 meses (lo que decide el nivel)
    async socio(id = db.sesion) {
      const fotos = db.publicaciones.filter(p => p.autor === id).map(p => ({ ...p, nCompartida: db.publicaciones.filter(x => x.repostDe === p.id && x.autor !== id).length }));
      return calcularPuntos(db.pedidos.filter(p => p.uid === id), fotos, db.seguimientos.filter(s => s.a === id && s.estado === "ok").length, db.resenas.find(r => r.uid === id));
    },
    _desde() { const d = new Date(); d.setMonth(d.getMonth() - (window.CLUB.puntos.caducanMeses || 12)); return d.toISOString(); },
    async puntos(id = db.sesion) { return (await this.socio(id)).puntos; },

    // ---------- Panel de Doña Col (en la demostración lo puede abrir cualquiera, para probar el flujo) ----------
    async puedeGestionar() { return true; },
    async panel() {
      const pedidos = await Promise.all(db.pedidos.filter(p => p.estado === "Solicitado").sort((a, b) => a.fecha.localeCompare(b.fecha))
        .map(async p => ({ ...p, perfil: publico(usuario(p.uid)), socio: await this.socio(p.uid) })));
      const fotos = db.publicaciones.filter(p => p.verificacion === "pendiente").sort((a, b) => a.fecha.localeCompare(b.fecha))
        .map(p => ({ ...p, perfil: publico(usuario(p.autor)), pedido: p.pedidoId ? db.pedidos.find(x => x.id === p.pedidoId) || null : null }));
      const resenas = db.resenas.filter(r => r.estado === "pendiente").map(r => ({ ...r, perfil: publico(usuario(r.uid)) })).filter(r => r.perfil);
      return { pedidos: pedidos.filter(p => p.perfil), fotos: fotos.filter(p => p.perfil), resenas };
    },
    async verificarResena(uid, ok) { const r = db.resenas.find(x => x.uid === uid); if (r) { r.estado = ok ? "verificada" : "rechazada"; r.verificadaEn = ahora(); guardar(); avisar(); } },

    // ---------- Opinión en Google ----------
    async miResena() { return db.resenas.find(r => r.uid === db.sesion) || null; },
    async avisarResena(nombreGoogle) {
      nombreGoogle = String(nombreGoogle || "").trim(); if (nombreGoogle.length < 2) throw new Error("Escribe el nombre con el que aparece tu opinión en Google.");
      const r = db.resenas.find(x => x.uid === db.sesion);
      if (r && r.estado !== "rechazada") throw new Error("Ya nos habías avisado de tu opinión.");
      if (r) Object.assign(r, { nombreGoogle, estado: "pendiente", fecha: ahora() });
      else db.resenas.push({ uid: db.sesion, nombreGoogle, estado: "pendiente", fecha: ahora() });
      guardar(); avisar();
    },

    // ---------- Historias (en la demostración se publican como la cuenta oficial) ----------
    async historias() {
      const t = ahora();
      return db.historias.filter(h => h.caduca > t).sort((a, b) => a.fecha.localeCompare(b.fecha)).map(h => ({ ...h, perfil: publico(usuario(h.autor)) }));
    },
    async publicarHistoria({ foto, texto, menu }) {
      if (!foto) throw new Error("Elige una foto.");
      const f = new Date(), c = new Date(f.getTime() + (window.CLUB.historias.horas || 12) * 3600e3);
      db.historias.push({ id: nuevoId("h_"), autor: "u_donacol", foto, texto: String(texto || "").trim().slice(0, 160), menu: menu || "", fecha: f.toISOString(), caduca: c.toISOString(), vistas: [] });
      db.historias = db.historias.filter(h => h.caduca > ahora());   // las caducadas no ocupan sitio en el móvil
      guardar(); avisar();
    },
    async verHistoria(id) { const h = db.historias.find(x => x.id === id); if (h && !h.vistas.includes(db.sesion)) { h.vistas.push(db.sesion); guardar(); } },
    async vistasHistoria(id) { const h = db.historias.find(x => x.id === id); return h ? h.vistas.length : 0; },
    async borrarHistoria(id) { db.historias = db.historias.filter(x => x.id !== id); guardar(); avisar(); },
    async confirmarPedido(id, estado) { const p = db.pedidos.find(x => x.id === id); if (p) { p.estado = estado; p.confirmadoEn = ahora(); guardar(); avisar(); } },
    async verificarFoto(id, ok) { const p = db.publicaciones.find(x => x.id === id); if (p && p.etiquetaDonaCol) { p.verificacion = ok ? "verificada" : "rechazada"; p.verificadaEn = ahora(); guardar(); avisar(); } },

    async _puntosAntiguos(id = db.sesion) {
      const P = window.CLUB.puntos, desde = this._desde();
      const euros = db.pedidos.filter(p => p.uid === id && p.fecha >= desde).reduce((s, p) => s + (p.base || 0), 0);
      const fotos = db.publicaciones.filter(p => p.autor === id && !p.repostDe && p.fecha >= desde).length;
      const compartidas = db.publicaciones.filter(p => p.repostDe && p.fecha >= desde && p.autor !== id && (db.publicaciones.find(o => o.id === p.repostDe) || {}).autor === id).length;
      const seguidores = db.seguimientos.filter(s => s.a === id && s.estado === "ok").length;
      return Math.floor(euros * P.porEuro) + fotos * P.porFoto + seguidores * P.porSeguidor + compartidas * (P.porCompartida || 0);
    },

    // Solo demostración: vuelve a dejarlo todo como al principio
    async reiniciarDemo() { db = semilla(); guardar(); }
  };
  window.Almacen = Almacen;
})();
