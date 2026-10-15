// ALMACÉN DE DEMOSTRACIÓN: todo se guarda en ESTE móvil (localStorage).
// Tiene exactamente las mismas funciones que tendrá almacen-firebase.js; para pasar a la versión
// real con usuarios de verdad basta con cargar ese archivo en lugar de este.
// Los perfiles «de ejemplo» son inventados y responden solos a los mensajes para poder probar.
(() => {
  const K = "club_doncol_demo_v2";   // v2: perfiles con foto de portada
  const ahora = () => new Date().toISOString();
  const nuevoId = p => p + Math.random().toString(36).slice(2, 10);
  const avisar = () => window.dispatchEvent(new Event("club:cambio"));

  async function huella(t) {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("club:" + t));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  }

  function semilla() {
    const hace = h => new Date(Date.now() - h * 3600e3).toISOString();
    const u = (id, nombre, tipo, empresa, cargo, ciudad, bio, extra = {}) =>
      ({ id, email: id + "@ejemplo.invalid", nombre, tipo, empresa, cargo, ciudad, bio, privado: false, foto: "", portada: "", creado: hace(900), socio: 0, ejemplo: true, ...extra });
    return {
      version: 1, sesion: null, contador: 1040,
      usuarios: [
        u("u_donacol", "Doña Col Catering", "Empresa", "Doña Col", "Cuenta oficial", "Madrid y Zaragoza",
          "Catering para empresas, cócteles, comuniones y congresos. Aquí publicamos los montajes de cada semana.", { oficial: true, foto: "media/logo-marron.png", portada: "media/campana.jpg", socio: 1 }),
        u("u_lumen", "Lumen Eventos", "Agencia", "Lumen Eventos", "Agencia de eventos corporativos", "Madrid",
          "Organizamos presentaciones, convenciones y fiestas de empresa. Trabajamos con Doña Col desde 2024.", { socio: 1002, portada: "media/congresos.jpg" }),
        u("u_marta", "Marta Ruiz", "Empresa", "Nexo Consultores", "Office manager", "Madrid",
          "Desayunos de equipo los viernes y alguna que otra formación con coffee break.", { socio: 1011, portada: "media/coffee.jpg" }),
        u("u_avante", "Grupo Avante", "Empresa", "Grupo Avante", "Recursos humanos", "Zaragoza",
          "Jornadas de bienvenida y eventos internos para 200 personas.", { socio: 1019, privado: true, portada: "media/empresas.jpg" }),
        u("u_carlos", "Carlos Gil", "Agencia", "Brisa Producciones", "Productor de eventos", "Zaragoza",
          "Producción técnica y catering para congresos en Aragón.", { socio: 1024, portada: "media/elegante.jpg" })
      ],
      seguimientos: [
        { de: "u_lumen", a: "u_donacol", estado: "ok", fecha: hace(500) },
        { de: "u_marta", a: "u_donacol", estado: "ok", fecha: hace(400) },
        { de: "u_carlos", a: "u_donacol", estado: "ok", fecha: hace(300) },
        { de: "u_marta", a: "u_lumen", estado: "ok", fecha: hace(200) },
        { de: "u_carlos", a: "u_lumen", estado: "ok", fecha: hace(150) }
      ],
      publicaciones: [
        { id: "p1", autor: "u_donacol", foto: "media/elegante.jpg", texto: "Montaje elegante para la presentación de producto de esta semana en Madrid.", evento: "Cóctel", fecha: hace(5), meGusta: ["u_marta", "u_lumen"] },
        { id: "p2", autor: "u_lumen", foto: "media/congresos.jpg", texto: "Convención anual con 400 asistentes. El coffee break voló en diez minutos.", evento: "Congreso", fecha: hace(26), meGusta: ["u_donacol", "u_carlos"] },
        { id: "p3", autor: "u_marta", foto: "media/cateringbox.jpg", texto: "Viernes de Catering Box en la oficina. El equipo pide repetir.", evento: "Catering Box®", fecha: hace(50), meGusta: ["u_donacol"] },
        { id: "p4", autor: "u_carlos", foto: "media/campana.jpg", texto: "Cóctel de clausura del congreso en Zaragoza.", evento: "Cóctel", fecha: hace(80), meGusta: [] },
        { id: "p5", autor: "u_donacol", foto: "media/comuniones.jpg", texto: "Temporada de comuniones: buffet con montaje elegante incluido.", evento: "Comunión", fecha: hace(120), meGusta: ["u_marta"] },
        { id: "p6", autor: "u_avante", foto: "media/empresas.jpg", texto: "Jornada de bienvenida para las nuevas incorporaciones.", evento: "Evento de empresa", fecha: hace(140), meGusta: [] }
      ],
      pedidos: [], mensajes: [], bloqueos: [], denuncias: []
    };
  }

  let db;
  try { db = JSON.parse(localStorage.getItem(K)) || semilla(); } catch (e) { db = semilla(); }
  function guardar() {
    try { localStorage.setItem(K, JSON.stringify(db)); }
    catch (e) { throw new Error("El móvil no tiene más espacio para la demostración. Borra alguna foto."); }
  }
  const yo = () => db.usuarios.find(x => x.id === db.sesion) || null;
  const usuario = id => db.usuarios.find(x => x.id === id) || null;
  const publico = x => x && (({ clave, ...resto }) => resto)(x);
  const bloqueado = id => db.bloqueos.some(b => b.de === db.sesion && b.a === id);
  const seguimiento = (de, a) => db.seguimientos.find(s => s.de === de && s.a === a);

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
        cargo: (d.cargo || "").trim(), ciudad: d.ciudad || "", bio: "", privado: !!d.privado, foto: "", portada: "", creado: ahora(), socio: ++db.contador
      };
      db.usuarios.push(nuevo); db.sesion = nuevo.id;
      // Para que la demostración tenga vida: la cuenta oficial te da la bienvenida y una agencia te pide seguirte
      db.mensajes.push({ id: nuevoId("m_"), de: "u_donacol", a: nuevo.id, texto: `¡Bienvenido al club, ${nuevo.nombre.split(" ")[0]}! Desde la app tienes un 5 % de descuento en cada pedido. Si necesitas algo, escríbenos por aquí.`, fecha: ahora(), leido: false });
      db.seguimientos.push({ de: "u_lumen", a: nuevo.id, estado: nuevo.privado ? "pendiente" : "ok", fecha: ahora() });
      if (!nuevo.privado) db.seguimientos.push({ de: "u_carlos", a: nuevo.id, estado: "pendiente", fecha: ahora() });
      guardar(); return publico(nuevo);
    },
    async entrar(email, clave) {
      const x = db.usuarios.find(u => u.email === String(email).trim().toLowerCase() && !u.ejemplo);
      if (!x || x.clave !== await huella(clave)) throw new Error("Correo o contraseña incorrectos.");
      db.sesion = x.id; guardar(); return publico(x);
    },
    async salir() { db.sesion = null; guardar(); },
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
      // Los perfiles de ejemplo privados aceptan solos a los pocos segundos
      if (otro.ejemplo && otro.privado) setTimeout(() => { const s = seguimiento(db.sesion, id); if (s) { s.estado = "ok"; guardar(); avisar(); } }, 4000);
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
        publicaciones: db.publicaciones.filter(p => p.autor === id).length
      };
    },
    async puedeVer(id) {
      const u = usuario(id); return !!u && (!u.privado || id === db.sesion || (seguimiento(db.sesion, id) || {}).estado === "ok");
    },
    async bloquear(id) { if (!bloqueado(id)) db.bloqueos.push({ de: db.sesion, a: id, fecha: ahora() }); await this.dejarDeSeguir(id); guardar(); avisar(); },
    async denunciar(pubId, motivo) { db.denuncias.push({ de: db.sesion, publicacion: pubId, motivo, fecha: ahora() }); guardar(); },

    // ---------- Publicaciones ----------
    async publicaciones({ autor = null, filtro = "todos" } = {}) {
      const sigo = new Set(db.seguimientos.filter(s => s.de === db.sesion && s.estado === "ok").map(s => s.a));
      const visibles = [];
      for (const p of db.publicaciones) {
        if (bloqueado(p.autor)) continue;
        if (autor && p.autor !== autor) continue;
        if (filtro === "siguiendo" && !sigo.has(p.autor) && p.autor !== db.sesion) continue;
        if (!(await this.puedeVer(p.autor))) continue;
        visibles.push({ ...p, perfil: publico(usuario(p.autor)), meGustaYo: p.meGusta.includes(db.sesion) });
      }
      return visibles.sort((a, b) => b.fecha.localeCompare(a.fecha));
    },
    async publicar({ foto, texto, evento }) {
      if (!foto) throw new Error("Elige una foto.");
      const p = { id: nuevoId("p_"), autor: db.sesion, foto, texto: (texto || "").trim(), evento: evento || "", fecha: ahora(), meGusta: [] };
      db.publicaciones.push(p); guardar(); avisar(); return p;
    },
    async borrarPublicacion(id) { db.publicaciones = db.publicaciones.filter(p => !(p.id === id && p.autor === db.sesion)); guardar(); avisar(); },
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
      if (o && o.ejemplo) setTimeout(() => {
        const respuestas = o.oficial
          ? ["¡Gracias por escribirnos! Te respondemos en horario de oficina, de lunes a viernes de 8:00 a 16:00.", "Recibido. Si es para un pedido, puedes hacerlo desde «Pedir» con tu descuento de socio."]
          : ["¡Hola! Encantados de conectar por aquí.", "Gracias por el mensaje. ¿Te paso el contacto de nuestro equipo de eventos?", "Genial, hablamos esta semana."];
        db.mensajes.push({ id: nuevoId("m_"), de: otro, a: db.sesion, texto: respuestas[Math.floor(Math.random() * respuestas.length)] + " (perfil de ejemplo)", fecha: ahora(), leido: false });
        guardar(); avisar();
      }, 2500);
    },
    async sinLeer() { return db.mensajes.filter(m => m.a === db.sesion && !m.leido && !bloqueado(m.de)).length; },

    // ---------- Puntos ----------
    async puntos(id = db.sesion) {
      const P = window.CLUB.puntos;
      const euros = db.pedidos.filter(p => p.uid === id).reduce((s, p) => s + (p.base || 0), 0);
      const fotos = db.publicaciones.filter(p => p.autor === id).length;
      const seguidores = db.seguimientos.filter(s => s.a === id && s.estado === "ok").length;
      return Math.round(euros * P.porEuro + fotos * P.porFoto + seguidores * P.porSeguidor);
    },

    // Solo demostración: vuelve a dejarlo todo como al principio
    async reiniciarDemo() { db = semilla(); guardar(); }
  };
  window.Almacen = Almacen;
})();
