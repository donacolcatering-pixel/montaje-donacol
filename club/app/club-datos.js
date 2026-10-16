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
  // Los pedidos solo suman cuando Doña Col los confirma, y las fotos cuando Doña Col las verifica (desde su panel).
  // Seguidores: con tope al año, para que no se suba de nivel con cuentas falsas.
  puntos: { porEuro: 0.1, porFoto: 5, porSeguidor: 1, topeSeguidores: 50, porCompartida: 2, porResena: 0, caducanMeses: 12 },
  // Opinión en Google: a 0 porque Google prohíbe dar incentivos por reseñas (decisión del 16/10/2026). Con 0, la app solo
  // invita a opinar, sin puntos. Si se pone un número, vuelve el flujo de puntos con comprobación en el Panel.
  // Mejor el enlace directo «escribir reseña» de la ficha (Google Business > Pedir reseñas); mientras, abre la ficha.
  enlaceResena: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Doña Col Catering, Paseo de la Castellana 40, Madrid"),
  // Historias: solo las publica Doña Col y desaparecen a las X horas
  historias: { horas: 12, segundos: 6 },
  // La carta es la de la app central: la exporta herramientas/exportar_carta.py y la app la descarga al abrirse.
  // Si no hay conexión, usa la última descargada y, si no, la que va dentro de la app (www/carta.json).
  carta: { url: "https://donacolcatering-pixel.github.io/montaje-donacol/club/app/carta.json" },
  estadosConPuntos: ["Confirmado", "Entregado"],

  // Pago con tarjeta. Pega aquí un «Payment Link» de Stripe cuando esté montado
  // (más adelante: Stripe Checkout con importe exacto, que necesita un pequeño servidor).
  stripe: { enlacePago: "" },

  tiposPerfil: ["Empresa", "Agencia", "Particular"],
  tiposEvento: ["Catering Box®", "Coffee break", "Cóctel", "Comunión", "Congreso", "Evento de empresa", "Otro"],

  textoPrivacidad: "Doña Col trata tus datos (nombre, empresa, cargo, correo, fotos y mensajes) para gestionar tu cuenta del club, tus pedidos y la red de contactos. Las fotos que publicas las ven los demás socios; si marcas tu perfil como privado, solo las ven quienes aceptes. Puedes borrar tu cuenta y tus datos desde Perfil > Editar perfil. Responsable: Doña Col Catering. Texto provisional: pendiente de revisión por la asesoría.",

  // FIREBASE (usuarios reales). Pega aquí el bloque «firebaseConfig» de tu proyecto, por ejemplo:
  //   config: { apiKey: "...", authDomain: "donacol-club.firebaseapp.com", projectId: "donacol-club", storageBucket: "...", messagingSenderId: "...", appId: "..." }
  // Mientras esté en null, la app funciona en modo demostración (todo guardado en el móvil).
  firebase: { config: {
    apiKey: "AIzaSyCTwj6bA91QFYu4nRuirTtvMiNGWVo_DZo",
    authDomain: "donacol-club.firebaseapp.com",
    projectId: "donacol-club",
    storageBucket: "donacol-club.firebasestorage.app",
    messagingSenderId: "90597848820",
    appId: "1:90597848820:web:ef4c30e4cd6eb5d65810a1"
  } },

  // CLOUDINARY (opcional, recomendado cuando haya muchas fotos): nombre de la cuenta y un «upload preset» sin firmar.
  // Vacío = las fotos se guardan comprimidas dentro de Firestore (suficiente para empezar).
  cloudinary: { cloud: "drfjs9u7p", preset: "club_donacol2", carpeta: "club-donacol" },

  // Versión de la app. En la APK, si la de la web es más nueva, sale un aviso con el botón de descarga.
  version: { nombre: "1.7", codigo: 9, comprobar: "https://donacolcatering-pixel.github.io/montaje-donacol/club/version.json" },

  // true = versión de demostración: los datos se guardan solo en este móvil.
  demo: false
};
