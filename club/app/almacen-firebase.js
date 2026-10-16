// ALMACÉN REAL: Firebase (Authentication + Firestore). Mismas funciones que almacen-local.js.
// Se activa al poner la configuración del proyecto en club-datos.js (CLUB.firebase.config).
// Fotos: si hay Cloudinary configurado se suben allí; si no, van comprimidas dentro de Firestore.
(() => {
  const C = window.CLUB;
  // Solo para pruebas en este ordenador: ?emulador=1 usa los emuladores locales de Firebase
  const pruebaLocal = /[?&]emulador=1/.test(location.search) && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const cfg = pruebaLocal ? { apiKey: "demo", authDomain: "demo-club.firebaseapp.com", projectId: "demo-club" } : (C.firebase && C.firebase.config);
  if (!cfg || !window.firebase) return;
  firebase.initializeApp(cfg);
  const auth = firebase.auth(); auth.languageCode = "es";
  const db = firebase.firestore();
  if (pruebaLocal || (C.firebase && C.firebase.emulador)) {
    auth.useEmulator("http://127.0.0.1:9099", { disableWarnings: true });
    db.useEmulator("127.0.0.1", 8080);
  }
  const FV = firebase.firestore.FieldValue;
  const ahora = () => new Date().toISOString();
  let avisoT; const avisar = () => { clearTimeout(avisoT); avisoT = setTimeout(() => window.dispatchEvent(new Event("club:cambio")), 250); };

  // ---------- Estado de la sesión (se mantiene al día con escuchas en tiempo real) ----------
  let yo = null, perfilYo = null;
  const cacheU = new Map();          // perfiles ya leídos
  let sigo = new Map();              // a quién sigo -> "ok" | "pendiente"
  let meSiguen = [];                 // quién me sigue o me lo pide
  let mensajes = [];                 // todos mis mensajes
  let bloqueados = new Set();
  let misCompartidas = new Set();    // ids de fotos que he compartido
  let cacheSocio = null;
  const escuchas = [];

  function escuchar(ref, alCambiar) {
    let primera = true;
    escuchas.push(ref.onSnapshot(q => { alCambiar(q); if (!primera) avisar(); primera = false; }, e => console.warn("Firebase:", e.code || e.message)));
  }
  async function arrancar() {
    escuchar(db.doc(`usuarios/${yo}`), d => { perfilYo = d.exists ? { id: yo, ...d.data() } : null; if (perfilYo) cacheU.set(yo, perfilYo); });
    escuchar(db.collection("seguimientos").where("de", "==", yo), q => { sigo = new Map(q.docs.map(d => [d.data().a, d.data().estado])); });
    escuchar(db.collection("seguimientos").where("a", "==", yo), q => { meSiguen = q.docs.map(d => d.data()); });
    escuchar(db.collection("mensajes").where("participantes", "array-contains", yo), q => { mensajes = q.docs.map(d => ({ id: d.id, ...d.data() })); });
    escuchar(db.collection(`usuarios/${yo}/bloqueos`), q => { bloqueados = new Set(q.docs.map(d => d.id)); });
    try { const q = await db.collection("publicaciones").where("autor", "==", yo).get(); misCompartidas = new Set(q.docs.map(d => d.data().repostDe).filter(Boolean)); } catch (e) {}
  }
  const listo = new Promise(res => {
    let primera = true;
    auth.onAuthStateChanged(async u => {
      escuchas.splice(0).forEach(f => f());
      yo = u ? u.uid : null; perfilYo = null; cacheU.clear(); sigo = new Map(); meSiguen = []; mensajes = []; bloqueados = new Set(); misCompartidas = new Set(); cacheSocio = null;
      if (u) await arrancar();
      if (primera) { primera = false; res(); } else avisar();
    });
  });

  // ---------- Ayudas ----------
  async function usuario(id) {
    if (cacheU.has(id)) return cacheU.get(id);
    try { const d = await db.doc(`usuarios/${id}`).get(); const u = d.exists ? { id, ...d.data() } : null; cacheU.set(id, u); return u; }
    catch (e) { return null; }
  }
  // Consulta ordenada por fecha; si falta el índice compuesto, la ordena en el móvil (y avisa en la consola)
  async function consulta(q, limite) {
    try { return (await q.orderBy("fecha", "desc").limit(limite).get()).docs; }
    catch (e) {
      if (e.code !== "failed-precondition") throw e;
      console.warn("Falta un índice de Firestore (créalo con el enlace del error):", e.message);
      return (await q.limit(limite * 3).get()).docs.sort((a, b) => String(b.data().fecha).localeCompare(String(a.data().fecha))).slice(0, limite);
    }
  }
  const errores = {
    "auth/email-already-in-use": "Ya hay una cuenta con ese correo. Entra con tu contraseña.",
    "auth/invalid-email": "Revisa el correo electrónico.",
    "auth/weak-password": "La contraseña es demasiado débil. Usa al menos 8 caracteres.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/wrong-password": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "Correo o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Espera unos minutos y vuelve a probar.",
    "auth/network-request-failed": "No hay conexión. Revisa internet y vuelve a probar.",
    "auth/requires-recent-login": "Por seguridad, cierra sesión, vuelve a entrar y repite la operación.",
    "permission-denied": "No tienes permiso para hacer eso.",
    "unavailable": "No hay conexión. Revisa internet y vuelve a probar."
  };
  const traducir = e => new Error(errores[e && e.code] || (e && e.message) || "Algo ha fallado.");

  // Fotos: a Cloudinary si está configurado; si no, la foto (ya comprimida en el móvil) se guarda tal cual
  async function subirImagen(dato, carpeta) {
    if (!dato || !String(dato).startsWith("data:")) return dato || "";
    const cl = C.cloudinary || {};
    if (!cl.cloud || !cl.preset) return dato;
    const fd = new FormData();
    fd.append("file", dato); fd.append("upload_preset", cl.preset); fd.append("folder", `${cl.carpeta || "club"}/${carpeta}/${yo}`);
    const r = await fetch(`https://api.cloudinary.com/v1_1/${cl.cloud}/image/upload`, { method: "POST", body: fd });
    const j = await r.json();
    if (!j.secure_url) throw new Error("No se ha podido subir la foto. Inténtalo de nuevo.");
    return j.secure_url;
  }

  const fotoCache = new Map();
  async function fotoPorId(id) {
    if (fotoCache.has(id)) return fotoCache.get(id);
    try { const d = await db.doc(`publicaciones/${id}`).get(); const v = d.exists ? { id, ...d.data() } : null; fotoCache.set(id, v); return v; }
    catch (e) { fotoCache.set(id, null); return null; }
  }
  async function enriquecer(p) {
    return { ...p, perfil: await usuario(p.autor), meGusta: p.meGusta || [], meGustaYo: (p.meGusta || []).includes(yo),
      nComentarios: p.nComentarios || 0, nCompartida: p.nCompartida || 0, compartidaPorMi: misCompartidas.has(p.id) };
  }

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

  const Almacen = {
    demo: false,

    // ---------- Cuenta ----------
    async sesion() {
      await listo; if (!yo) return null;
      if (!perfilYo) { const u = await usuario(yo); perfilYo = u; }
      return perfilYo ? { ...perfilYo, email: auth.currentUser && auth.currentUser.email } : null;
    },
    async registrar(d) {
      const email = String(d.email || "").trim().toLowerCase();
      if (String(d.clave || "").length < 8) throw new Error("La contraseña necesita al menos 8 caracteres.");
      let cred;
      try { cred = await auth.createUserWithEmailAndPassword(email, d.clave); } catch (e) { throw traducir(e); }
      const uid = cred.user.uid;
      try {
        await db.runTransaction(async t => {
          const ref = db.doc("contadores/socios"), c = await t.get(ref);
          const n = c.exists ? c.data().n + 1 : 1001;
          t.set(ref, { n });
          t.set(db.doc(`usuarios/${uid}`), {
            nombre: d.nombre.trim(), tipo: d.tipo, empresa: (d.empresa || "").trim(), cargo: (d.cargo || "").trim(), ciudad: d.ciudad || "",
            bio: "", privado: !!d.privado, foto: "", portada: "", creado: ahora(), socio: n, puntos: 0, pedidos12: 0
          });
          // Datos de facturación: aparte y privados (solo los ven el socio y Doña Col)
          if (d.facturacion) t.set(db.doc(`usuarios/${uid}/privado/facturacion`), { ...d.facturacion, email, actualizado: ahora() });
        });
      } catch (e) {
        await cred.user.delete().catch(() => {});
        throw new Error("No se ha podido crear tu perfil. Inténtalo de nuevo.");
      }
      cacheU.delete(uid); perfilYo = null;
      return this.sesion();
    },
    async entrar(email, clave) {
      try { await auth.signInWithEmailAndPassword(String(email).trim().toLowerCase(), clave); } catch (e) { throw traducir(e); }
      return this.sesion();
    },
    async salir() { await auth.signOut(); },
    async recuperarClave(email) {
      email = String(email || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Escribe arriba tu correo y vuelve a pulsar «¿Has olvidado tu contraseña?».");
      try { await auth.sendPasswordResetEmail(email); }
      catch (e) { if (e.code !== "auth/user-not-found") throw traducir(e); }   // por privacidad, no se dice si el correo existe
    },
    async actualizarPerfil(c) {
      const antes = perfilYo || await usuario(yo);
      const campos = {};
      ["nombre", "tipo", "empresa", "cargo", "ciudad", "bio", "privado"].forEach(k => { if (k in c) campos[k] = c[k]; });
      if ("foto" in c) campos.foto = await subirImagen(c.foto, "perfil");
      if ("portada" in c) campos.portada = await subirImagen(c.portada, "portada");
      try { await db.doc(`usuarios/${yo}`).update(campos); } catch (e) { throw traducir(e); }
      // Si cambia la privacidad, se marca en sus fotos; al hacerse público, se aceptan las solicitudes pendientes
      if ("privado" in campos && campos.privado !== !!antes.privado) {
        const lote = db.batch();
        (await db.collection("publicaciones").where("autor", "==", yo).get()).docs.forEach(d => lote.update(d.ref, { autorPrivado: campos.privado }));
        if (!campos.privado) meSiguen.filter(s => s.estado === "pendiente").forEach(s => lote.update(db.doc(`seguimientos/${s.de}_${yo}`), { estado: "ok" }));
        await lote.commit();
      }
      perfilYo = { ...antes, ...campos }; cacheU.set(yo, perfilYo); avisar();
      return perfilYo;
    },
    // ---------- Datos de facturación (mismos campos que la ficha de cliente de la app central) ----------
    async facturacion() { try { const d = await db.doc(`usuarios/${yo}/privado/facturacion`).get(); return d.exists ? d.data() : null; } catch (e) { return null; } },
    async guardarFacturacion(f) {
      try { await db.doc(`usuarios/${yo}/privado/facturacion`).set({ ...f, email: (auth.currentUser && auth.currentUser.email) || "", actualizado: ahora() }); }
      catch (e) { throw traducir(e); }
    },
    async borrarCuenta() {
      const lote = db.batch();
      lote.delete(db.doc(`usuarios/${yo}/privado/facturacion`));
      mensajes.filter(m => m.de === yo).forEach(m => lote.delete(db.doc(`mensajes/${m.id}`)));
      (await db.collection("publicaciones").where("autor", "==", yo).get()).docs.forEach(d => lote.delete(d.ref));
      [...sigo.keys()].forEach(a => lote.delete(db.doc(`seguimientos/${yo}_${a}`)));
      meSiguen.forEach(s => lote.delete(db.doc(`seguimientos/${s.de}_${yo}`)));
      lote.delete(db.doc(`usuarios/${yo}`));
      await lote.commit();
      try { await auth.currentUser.delete(); } catch (e) { throw traducir(e); }
    },

    // ---------- Perfiles y red ----------
    async perfil(id) { return usuario(id); },
    async perfiles(buscar = "") {
      const q = buscar.trim().toLowerCase();
      const docs = (await db.collection("usuarios").orderBy("nombre").limit(300).get()).docs;
      return docs.map(d => { const u = { id: d.id, ...d.data() }; cacheU.set(d.id, u); return u; })
        .filter(u => u.id !== yo && !bloqueados.has(u.id))
        .filter(u => !q || [u.nombre, u.empresa, u.cargo, u.ciudad, u.tipo].join(" ").toLowerCase().includes(q))
        .sort((a, b) => (b.oficial ? 1 : 0) - (a.oficial ? 1 : 0) || a.nombre.localeCompare(b.nombre));
    },
    async relacion(id) { return sigo.get(id) || "no"; },
    async seguir(id) {
      const otro = await usuario(id); if (!otro || sigo.has(id)) return sigo.get(id);
      const estado = otro.privado ? "pendiente" : "ok";
      try { await db.doc(`seguimientos/${yo}_${id}`).set({ de: yo, a: id, estado, fecha: ahora() }); } catch (e) { throw traducir(e); }
      sigo.set(id, estado); return estado;
    },
    async dejarDeSeguir(id) { await db.doc(`seguimientos/${yo}_${id}`).delete(); sigo.delete(id); avisar(); },
    async solicitudes() {
      const p = meSiguen.filter(s => s.estado === "pendiente");
      return (await Promise.all(p.map(async s => ({ ...s, perfil: await usuario(s.de) })))).filter(s => s.perfil && !bloqueados.has(s.de));
    },
    async aceptar(id) { await db.doc(`seguimientos/${id}_${yo}`).update({ estado: "ok" }); },
    async rechazar(id) { await db.doc(`seguimientos/${id}_${yo}`).delete(); },
    async cuentas(id) {
      if (id === yo) {
        const mias = (await db.collection("publicaciones").where("autor", "==", yo).get()).docs.filter(d => !d.data().repostDe).length;
        return { seguidores: meSiguen.filter(s => s.estado === "ok").length, siguiendo: [...sigo.values()].filter(e => e === "ok").length, publicaciones: mias };
      }
      const [s1, s2] = await Promise.all([
        db.collection("seguimientos").where("a", "==", id).where("estado", "==", "ok").get(),
        db.collection("seguimientos").where("de", "==", id).where("estado", "==", "ok").get()]);
      let fotos = 0;
      if (await this.puedeVer(id)) { try { fotos = (await db.collection("publicaciones").where("autor", "==", id).get()).docs.filter(d => !d.data().repostDe).length; } catch (e) {} }
      return { seguidores: s1.size, siguiendo: s2.size, publicaciones: fotos };
    },
    async puedeVer(id) { if (id === yo) return true; const u = await usuario(id); return !!u && (!u.privado || sigo.get(id) === "ok"); },
    async bloquear(id) { await db.doc(`usuarios/${yo}/bloqueos/${id}`).set({ fecha: ahora() }); bloqueados.add(id); if (sigo.has(id)) await this.dejarDeSeguir(id); },
    async denunciar(pubId, motivo) { await db.collection("denuncias").add({ de: yo, publicacion: pubId, motivo, fecha: ahora() }); },

    // ---------- Publicaciones ----------
    async publicaciones({ autor = null, filtro = "todos" } = {}) {
      let docs = [];
      if (autor) {
        if (!(await this.puedeVer(autor))) return [];
        docs = await consulta(db.collection("publicaciones").where("autor", "==", autor), 60);
      } else {
        docs = await consulta(db.collection("publicaciones").where("autorPrivado", "==", false), 60);
        // + las de los perfiles privados que sigo, y las mías si mi perfil es privado
        const privados = [];
        for (const [a, e] of sigo) if (e === "ok") { const u = await usuario(a); if (u && u.privado) privados.push(a); }
        if (perfilYo && perfilYo.privado) privados.push(yo);
        for (const a of privados) docs = docs.concat(await consulta(db.collection("publicaciones").where("autor", "==", a), 20));
      }
      const vistos = new Set(), salida = [];
      for (const d of docs) {
        if (vistos.has(d.id)) continue; vistos.add(d.id);
        const p = { id: d.id, ...d.data() };
        if (bloqueados.has(p.autor)) continue;
        if (filtro === "siguiendo" && p.autor !== yo && sigo.get(p.autor) !== "ok") continue;
        if (p.repostDe) {
          const o = await fotoPorId(p.repostDe);
          if (!o || bloqueados.has(o.autor)) continue;
          salida.push({ ...p, perfil: await usuario(p.autor), original: await enriquecer(o) });
        } else salida.push(await enriquecer(p));
      }
      return salida.sort((a, b) => b.fecha.localeCompare(a.fecha));
    },
    async publicacion(id) { fotoCache.delete(id); const p = await fotoPorId(id); return p && !p.repostDe ? enriquecer(p) : null; },
    async publicar({ foto, texto, evento, etiqueta, pedidoId }) {
      if (!foto) throw new Error("Elige una foto.");
      const url = await subirImagen(foto, "fotos");
      try {
        const r = await db.collection("publicaciones").add({ autor: yo, autorPrivado: !!(perfilYo && perfilYo.privado), foto: url, texto: (texto || "").trim(),
          evento: evento || "", fecha: ahora(), meGusta: [], nComentarios: 0, nCompartida: 0, repostDe: null,
          etiquetaDonaCol: !!etiqueta, verificacion: etiqueta ? "pendiente" : "sin", pedidoId: pedidoId || null });
        cacheSocio = null; avisar(); return { id: r.id };
      } catch (e) { throw traducir(e); }
    },
    // ---------- Moderación (solo la cuenta oficial; lo garantizan las reglas) ----------
    async moderarPublicacion(id) {
      const lote = db.batch(); lote.delete(db.doc(`publicaciones/${id}`));
      try { (await db.collection("denuncias").where("publicacion", "==", id).get()).docs.forEach(d => lote.delete(d.ref)); } catch (e) {}
      try { await lote.commit(); } catch (e) { throw traducir(e); }
      fotoCache.delete(id); avisar();
    },
    async denuncias() {
      try {
        const q = await db.collection("denuncias").limit(100).get();
        const ds = await Promise.all(q.docs.map(async d => { const x = { id: d.id, ...d.data() }; const p = x.publicacion ? await fotoPorId(x.publicacion) : null;
          return { ...x, perfil: await usuario(x.de), pub: p, autorPub: p ? await usuario(p.autor) : null }; }));
        return ds.sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
      } catch (e) { return []; }
    },
    async descartarDenuncia(id) { try { await db.doc(`denuncias/${id}`).delete(); } catch (e) { throw traducir(e); } avisar(); },

    async borrarPublicacion(id) {
      const p = await fotoPorId(id); if (!p || p.autor !== yo) return;
      const lote = db.batch(); lote.delete(db.doc(`publicaciones/${id}`));
      if (p.repostDe) { lote.update(db.doc(`publicaciones/${p.repostDe}`), { nCompartida: FV.increment(-1) }); misCompartidas.delete(p.repostDe); }
      await lote.commit(); fotoCache.delete(id); cacheSocio = null; avisar();
    },
    async meGusta(id) {
      const d = await db.doc(`publicaciones/${id}`).get(); if (!d.exists) return false;
      const ya = (d.data().meGusta || []).includes(yo);
      await d.ref.update({ meGusta: ya ? FV.arrayRemove(yo) : FV.arrayUnion(yo) });
      fotoCache.delete(id); return !ya;
    },
    async compartir(id, texto) {
      const o = await fotoPorId(id);
      if (!o) throw new Error("Esa foto ya no está disponible.");
      if (o.autor === yo) throw new Error("Esta foto ya está en tu perfil.");
      if (o.autorPrivado) throw new Error("Su perfil es privado: sus fotos no se pueden compartir.");
      if (misCompartidas.has(id)) throw new Error("Ya la has compartido.");
      const lote = db.batch();
      lote.set(db.collection("publicaciones").doc(), { autor: yo, autorPrivado: !!(perfilYo && perfilYo.privado), foto: "", texto: (texto || "").trim(), evento: "",
        fecha: ahora(), meGusta: [], nComentarios: 0, nCompartida: 0, repostDe: id, etiquetaDonaCol: false, verificacion: "sin", pedidoId: null });
      lote.update(db.doc(`publicaciones/${id}`), { nCompartida: FV.increment(1) });
      try { await lote.commit(); } catch (e) { throw traducir(e); }
      misCompartidas.add(id); fotoCache.delete(id); avisar();
    },
    async comentarios(id) {
      const q = await db.collection(`publicaciones/${id}/comentarios`).orderBy("fecha").get();
      const cs = q.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => !bloqueados.has(c.autor));
      return (await Promise.all(cs.map(async c => ({ ...c, perfil: await usuario(c.autor) })))).filter(c => c.perfil);
    },
    async comentar(id, texto) {
      texto = String(texto || "").trim(); if (!texto) return;
      const lote = db.batch();
      lote.set(db.collection(`publicaciones/${id}/comentarios`).doc(), { autor: yo, texto, fecha: ahora() });
      lote.update(db.doc(`publicaciones/${id}`), { nComentarios: FV.increment(1) });
      try { await lote.commit(); } catch (e) { throw traducir(e); }
      fotoCache.delete(id); avisar();
    },
    async borrarComentario(id, cid) {
      const lote = db.batch();
      lote.delete(db.doc(`publicaciones/${id}/comentarios/${cid}`));
      lote.update(db.doc(`publicaciones/${id}`), { nComentarios: FV.increment(-1) });
      await lote.commit(); fotoCache.delete(id); avisar();
    },

    // ---------- Pedidos ----------
    async pedidos() { return (await consulta(db.collection("pedidos").where("uid", "==", yo), 100)).map(d => ({ id: d.id, ...d.data() })); },
    async crearPedido(p) {
      const x = { ...p, uid: yo, fecha: ahora(), estado: "Solicitado" };
      try { const r = await db.collection("pedidos").add(x); cacheSocio = null; return { ...x, id: r.id }; } catch (e) { throw traducir(e); }
    },

    // ---------- Mensajes (llegan en tiempo real) ----------
    async conversaciones() {
      const porOtro = {};
      mensajes.forEach(m => { const o = m.de === yo ? m.a : m.de; (porOtro[o] = porOtro[o] || []).push(m); });
      const lista = [];
      for (const [o, ms] of Object.entries(porOtro)) {
        if (bloqueados.has(o)) continue;
        const perfil = await usuario(o); if (!perfil) continue;
        ms.sort((a, b) => a.fecha.localeCompare(b.fecha));
        lista.push({ perfil, ultimo: ms[ms.length - 1], sinLeer: ms.filter(m => m.a === yo && !m.leido).length });
      }
      return lista.sort((a, b) => b.ultimo.fecha.localeCompare(a.ultimo.fecha));
    },
    async mensajes(otro) {
      const ms = mensajes.filter(m => (m.de === yo && m.a === otro) || (m.de === otro && m.a === yo)).sort((a, b) => a.fecha.localeCompare(b.fecha));
      const sinLeer = ms.filter(m => m.a === yo && !m.leido);
      if (sinLeer.length) { const lote = db.batch(); sinLeer.forEach(m => lote.update(db.doc(`mensajes/${m.id}`), { leido: true })); lote.commit().catch(() => {}); }
      return ms;
    },
    async enviarMensaje(otro, texto) {
      texto = String(texto || "").trim(); if (!texto) return;
      const m = { de: yo, a: otro, participantes: [yo, otro], texto, fecha: ahora(), leido: false };
      try { const r = await db.collection("mensajes").add(m); if (!mensajes.some(x => x.id === r.id)) mensajes.push({ id: r.id, ...m }); } catch (e) { throw traducir(e); }
    },
    async sinLeer() { return mensajes.filter(m => m.a === yo && !m.leido && !bloqueados.has(m.de)).length; },

    // ---------- Puntos y nivel (últimos 12 meses) ----------
    async socio(id = yo) {
      if (id !== yo) { const u = await usuario(id); return { puntos: (u && u.puntos) || 0, pedidos: (u && u.pedidos12) || 0 }; }
      if (cacheSocio && Date.now() - cacheSocio.t < 30000) return cacheSocio.v;
      const [peds, mias, res] = await Promise.all([this.pedidos(), db.collection("publicaciones").where("autor", "==", yo).get(), this.miResena()]);
      const v = calcularPuntos(peds, mias.docs.map(x => x.data()), meSiguen.filter(s => s.estado === "ok").length, res);
      cacheSocio = { t: Date.now(), v };
      // Se copia en el perfil para que los demás vean tu nivel (es informativo; el descuento lo confirma Doña Col)
      if (perfilYo && (perfilYo.puntos !== v.puntos || perfilYo.pedidos12 !== v.pedidos)) db.doc(`usuarios/${yo}`).update({ puntos: v.puntos, pedidos12: v.pedidos }).catch(() => {});
      return v;
    },
    async puntos(id = yo) { return (await this.socio(id)).puntos; },

    // ---------- Panel de Doña Col (solo la cuenta oficial; lo garantizan las reglas de seguridad) ----------
    async puedeGestionar() { await listo; return !!(perfilYo && perfilYo.oficial); },
    // Nivel REAL de un cliente, calculado con sus datos (la oficina puede leerlos)
    async _socioDe(uid) {
      const [peds, fotos, segs, res] = await Promise.all([
        db.collection("pedidos").where("uid", "==", uid).get(),
        db.collection("publicaciones").where("autor", "==", uid).get(),
        db.collection("seguimientos").where("a", "==", uid).where("estado", "==", "ok").get(),
        db.doc(`resenas/${uid}`).get().catch(() => null)]);
      return calcularPuntos(peds.docs.map(d => d.data()), fotos.docs.map(d => d.data()), segs.size, res && res.exists ? res.data() : null);
    },
    async panel() {
      const [qp, qf, qr] = await Promise.all([
        db.collection("pedidos").where("estado", "==", "Solicitado").limit(100).get(),
        db.collection("publicaciones").where("verificacion", "==", "pendiente").limit(100).get(),
        db.collection("resenas").where("estado", "==", "pendiente").limit(100).get()]);
      const pedidos = await Promise.all(qp.docs.map(async d => { const p = { id: d.id, ...d.data() }; return { ...p, perfil: await usuario(p.uid), socio: await this._socioDe(p.uid) }; }));
      const fotos = await Promise.all(qf.docs.map(async d => {
        const p = { id: d.id, ...d.data() };
        let pedido = null; if (p.pedidoId) { try { const x = await db.doc(`pedidos/${p.pedidoId}`).get(); pedido = x.exists ? x.data() : null; } catch (e) {} }
        return { ...p, perfil: await usuario(p.autor), pedido };
      }));
      const orden = (a, b) => a.fecha.localeCompare(b.fecha);
      const resenas = (await Promise.all(qr.docs.map(async d => ({ ...d.data(), uid: d.id, perfil: await usuario(d.id) })))).filter(r => r.perfil).sort(orden);
      return { pedidos: pedidos.filter(p => p.perfil).sort(orden), fotos: fotos.filter(p => p.perfil).sort(orden), resenas };
    },
    async confirmarPedido(id, estado) { try { await db.doc(`pedidos/${id}`).update({ estado, confirmadoEn: ahora() }); } catch (e) { throw traducir(e); } avisar(); },
    async verificarResena(uid, ok) { try { await db.doc(`resenas/${uid}`).update({ estado: ok ? "verificada" : "rechazada", verificadaEn: ahora() }); } catch (e) { throw traducir(e); } avisar(); },

    // ---------- Opinión en Google (un documento por cliente: resenas/{uid}) ----------
    async miResena() { try { const d = await db.doc(`resenas/${yo}`).get(); return d.exists ? d.data() : null; } catch (e) { return null; } },
    async avisarResena(nombreGoogle) {
      nombreGoogle = String(nombreGoogle || "").trim(); if (nombreGoogle.length < 2) throw new Error("Escribe el nombre con el que aparece tu opinión en Google.");
      const r = await this.miResena();
      if (r && r.estado !== "rechazada") throw new Error("Ya nos habías avisado de tu opinión.");
      try {
        if (r) await db.doc(`resenas/${yo}`).update({ nombreGoogle, estado: "pendiente", fecha: ahora() });
        else await db.doc(`resenas/${yo}`).set({ uid: yo, nombreGoogle, estado: "pendiente", fecha: ahora() });
      } catch (e) { throw traducir(e); }
      cacheSocio = null; avisar();
    },

    // ---------- Historias (solo las publica la cuenta oficial; caducan solas) ----------
    async historias() {
      try {
        const q = await db.collection("historias").where("caduca", ">", ahora()).orderBy("caduca").limit(30).get();
        const hs = q.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.fecha.localeCompare(b.fecha));
        return Promise.all(hs.map(async h => ({ ...h, perfil: await usuario(h.autor) })));
      } catch (e) { console.warn(e); return []; }
    },
    async publicarHistoria({ foto, texto, menu }) {
      if (!foto) throw new Error("Elige una foto.");
      const url = await subirImagen(foto, "historias");
      const f = new Date(), c = new Date(f.getTime() + (C.historias.horas || 12) * 3600e3);
      try { await db.collection("historias").add({ autor: yo, foto: url, texto: String(texto || "").trim().slice(0, 160), menu: menu || "", fecha: f.toISOString(), caduca: c.toISOString() }); }
      catch (e) { throw traducir(e); }
      avisar();
    },
    async verHistoria(id) { if (yo) db.doc(`historias/${id}/vistas/${yo}`).set({ fecha: ahora() }).catch(() => {}); },
    async vistasHistoria(id) { try { return (await db.collection(`historias/${id}/vistas`).get()).size; } catch (e) { return 0; } },
    async borrarHistoria(id) { try { await db.doc(`historias/${id}`).delete(); } catch (e) { throw traducir(e); } avisar(); },

    async verificarFoto(id, ok) { try { await db.doc(`publicaciones/${id}`).update({ verificacion: ok ? "verificada" : "rechazada", verificadaEn: ahora() }); } catch (e) { throw traducir(e); } fotoCache.delete(id); avisar(); }
  };
  window.AlmacenFirebase = Almacen;
})();
