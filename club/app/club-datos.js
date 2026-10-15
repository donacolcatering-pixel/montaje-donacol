// CONFIGURACIÓN DEL CLUB DOÑA COL. Es lo único que se toca para otro negocio.
// La carta, las sedes y el IVA salen de negocio.js (la misma ficha que la web de Doña Col).
window.CLUB = {
  nombre: "Club Doña Col",
  marca: "Doña Col",
  prefijoSocio: "DC",

  // Descuento por pedir desde la app. Sube con el nivel de socio.
  niveles: [
    { id: "comensal",   nombre: "Comensal",       desde: 0,    descuento: 5,  ventajas: ["5 % de descuento en pedidos desde la app", "Historial y «repetir pedido» con un toque"] },
    { id: "anfitrion",  nombre: "Anfitrión",      desde: 300,  descuento: 7,  ventajas: ["7 % de descuento", "Prioridad en fechas de alta demanda"] },
    { id: "gran",       nombre: "Gran Anfitrión", desde: 1000, descuento: 10, ventajas: ["10 % de descuento", "Degustación de carta nueva para tu equipo"] },
    { id: "embajador",  nombre: "Embajador",      desde: 3000, descuento: 12, ventajas: ["12 % de descuento", "Gestor personal en Madrid o Zaragoza", "Invitación a los eventos de Doña Col"] }
  ],

  // Cómo se ganan puntos
  puntos: { porEuro: 1, porFoto: 25, porSeguidor: 5 },

  // Pago con tarjeta. Pega aquí un «Payment Link» de Stripe cuando esté montado
  // (más adelante: Stripe Checkout con importe exacto, que necesita un pequeño servidor).
  stripe: { enlacePago: "" },

  tiposPerfil: ["Empresa", "Agencia", "Particular"],
  tiposEvento: ["Catering Box®", "Coffee break", "Cóctel", "Comunión", "Congreso", "Evento de empresa", "Otro"],

  textoPrivacidad: "Doña Col trata tus datos (nombre, empresa, cargo, correo, fotos y mensajes) para gestionar tu cuenta del club, tus pedidos y la red de contactos. Las fotos que publicas las ven los demás socios; si marcas tu perfil como privado, solo las ven quienes aceptes. Puedes borrar tu cuenta y tus datos desde Perfil > Editar perfil. Responsable: Doña Col Catering. Texto provisional: pendiente de revisión por la asesoría.",

  // true = versión de demostración: los datos se guardan solo en este móvil.
  demo: true
};
