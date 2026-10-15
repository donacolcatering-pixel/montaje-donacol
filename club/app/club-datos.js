// CONFIGURACIÓN DEL CLUB DOÑA COL. Es lo único que se toca para otro negocio.
// La carta, las sedes y el IVA salen de negocio.js (la misma ficha que la web de Doña Col).
window.CLUB = {
  nombre: "Club Doña Col",
  marca: "Doña Col",
  prefijoSocio: "DC",

  // Descuento por pedir desde la app. Sube con el nivel de socio.
  // Cada nivel pide PUNTOS y un mínimo de PEDIDOS en los últimos 12 meses: un único pedido grande
  // no te hace subir de golpe; hay que repetir (el negocio va por volumen y por rotación).
  // Orientativo: 300 puntos ≈ 3.000 € al año · 1.500 ≈ 15.000 € · 5.000 ≈ 50.000 €.
  niveles: [
    { id: "comensal",   nombre: "Comensal",       desde: 0,    pedidos: 0,  descuento: 5,  ventajas: ["5 % de descuento en pedidos desde la app", "Historial y «repetir pedido» con un toque"] },
    { id: "anfitrion",  nombre: "Anfitrión",      desde: 300,  pedidos: 2,  descuento: 7,  ventajas: ["7 % de descuento", "Prioridad en fechas de alta demanda"] },
    { id: "gran",       nombre: "Gran Anfitrión", desde: 1500, pedidos: 5,  descuento: 10, ventajas: ["10 % de descuento", "Degustación de carta nueva para tu equipo"] },
    { id: "embajador",  nombre: "Embajador",      desde: 5000, pedidos: 12, descuento: 12, ventajas: ["12 % de descuento", "Gestor personal en Madrid o Zaragoza", "Invitación a los eventos de Doña Col"] }
  ],

  // Cómo se ganan puntos. porEuro: 0.1 = 1 punto por cada 10 € de pedido (sin IVA, ya con el descuento).
  // Todo cuenta solo durante «caducanMeses»: para mantener el nivel hay que seguir pidiendo.
  puntos: { porEuro: 0.1, porFoto: 5, porSeguidor: 1, porCompartida: 2, caducanMeses: 12 },

  // Pago con tarjeta. Pega aquí un «Payment Link» de Stripe cuando esté montado
  // (más adelante: Stripe Checkout con importe exacto, que necesita un pequeño servidor).
  stripe: { enlacePago: "" },

  tiposPerfil: ["Empresa", "Agencia", "Particular"],
  tiposEvento: ["Catering Box®", "Coffee break", "Cóctel", "Comunión", "Congreso", "Evento de empresa", "Otro"],

  textoPrivacidad: "Doña Col trata tus datos (nombre, empresa, cargo, correo, fotos y mensajes) para gestionar tu cuenta del club, tus pedidos y la red de contactos. Las fotos que publicas las ven los demás socios; si marcas tu perfil como privado, solo las ven quienes aceptes. Puedes borrar tu cuenta y tus datos desde Perfil > Editar perfil. Responsable: Doña Col Catering. Texto provisional: pendiente de revisión por la asesoría.",

  // FIREBASE (usuarios reales). Pega aquí el bloque «firebaseConfig» de tu proyecto, por ejemplo:
  //   config: { apiKey: "...", authDomain: "donacol-club.firebaseapp.com", projectId: "donacol-club", storageBucket: "...", messagingSenderId: "...", appId: "..." }
  // Mientras esté en null, la app funciona en modo demostración (todo guardado en el móvil).
  firebase: { config: null },

  // CLOUDINARY (opcional, recomendado cuando haya muchas fotos): nombre de la cuenta y un «upload preset» sin firmar.
  // Vacío = las fotos se guardan comprimidas dentro de Firestore (suficiente para empezar).
  cloudinary: { cloud: "", preset: "", carpeta: "club-donacol" },

  // Versión de la app. En la APK, si la de la web es más nueva, sale un aviso con el botón de descarga.
  version: { nombre: "1.2", codigo: 4, comprobar: "https://donacolcatering-pixel.github.io/montaje-donacol/club/version.json" },

  // true = versión de demostración: los datos se guardan solo en este móvil.
  demo: true
};
