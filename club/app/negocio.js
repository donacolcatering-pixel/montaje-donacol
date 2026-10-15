// DOÑA COL CATERING — plantilla «Mesa» v2 (vídeo primero)
// Menús y precios sacados de donacol.es (octubre 2026). Fotos y vídeos en media/ (los vídeos salen de su canal de YouTube).
window.NEGOCIO = {
  nombre: "Doña Col",
  lema: "Catering en Madrid y Zaragoza",
  ciudad: "Madrid · Zaragoza",
  logo: "media/logo.png",                         // logo claro para fondos oscuros (si falta, se escribe el nombre)
  colores: { acento: "#61422A", acento2: "#907A69" },   // café y taupe: los colores de su marca
  iva: 10,
  alergenos: "media/alergenos.pdf",

  // Portada: vídeo a pantalla completa. «videoMovil» es una versión más ligera para teléfonos.
  hero: {
    video: "media/video/portada.mp4",
    videoMovil: "media/video/portada-movil.mp4",
    poster: "media/video/portada.jpg",
    enfoque: "center",
    frase: "Catering para empresas, cócteles, comuniones y congresos. Cocinado en Zaragoza y en Madrid."
  },

  // Todas sus plataformas en un sitio (lo primero tras la portada, como un Linktree pero con foto y vídeo).
  // Tipos: instagram · youtube · tiktok · linkedin · facebook · whatsapp · google (reseñas) · newsletter · web · tienda · blog · pdf · enlace
  // «tam»: "grande" (2×2), "ancho" (2×1) o nada (1×1). «clip» = vídeo mudo de fondo; «foto» = imagen de fondo. Sin url no sale.
  plataformasTitulo: "Todo Doña Col, en un sitio",
  plataformas: [
    { tipo: "instagram", url: "https://www.instagram.com/cateringdonacol/", usuario: "@cateringdonacol", texto: "Montajes, reels y novedades cada semana", clip: "media/video/cap-eventos.mp4", foto: "media/video/cap-eventos.jpg", tam: "grande" },
    { tipo: "youtube", url: "https://www.youtube.com/@DonaColCatering", texto: "7 vídeos: montajes, Catering Box® y eventos", clip: "media/video/v-MyxAbXq8z3g.mp4", foto: "media/video/v-MyxAbXq8z3g.jpg", tam: "ancho" },
    { tipo: "whatsapp", url: "https://wa.me/34678348968?text=" + encodeURIComponent("Hola Doña Col, me gustaría pedir información."), texto: "Lunes a viernes, de 8:00 a 16:00" },
    { tipo: "google", url: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Doña Col Catering, Paseo de la Castellana 40, Madrid"), texto: "Léelas o deja la tuya", nota: "", total: "" },   // nota: "4,8", total: "120 reseñas" cuando las tengas
    { tipo: "tienda", url: "https://donacol.es/tienda/", texto: "Catering Box® y desayunos a domicilio", foto: "media/cateringbox.jpg" },
    { tipo: "newsletter", email: "info@donacol.es", texto: "Novedades de carta y promociones, un correo al mes", tam: "ancho" },
    { tipo: "linkedin", url: "", texto: "Eventos de empresa y novedades" },   // pega la URL de la página de LinkedIn para que salga
    { tipo: "facebook", url: "https://www.facebook.com/donacolcatering/", texto: "Fotos de cada evento" },
    { tipo: "web", url: "https://donacol.es", texto: "donacol.es", foto: "media/campana.jpg" },
    { tipo: "blog", url: "https://donacol.es/blog-noticias-dona-col-catering-madrid-zaragoza/", texto: "Ideas para tu evento", tam: "ancho" },
    { tipo: "pdf", url: "media/alergenos.pdf", titulo: "Alérgenos", texto: "Carta de alérgenos en PDF" }
  ],

  // Apertura editorial: una frase grande, un párrafo y dos fotos que se solapan
  apertura: {
    titulo: "Cocina de Zaragoza. En Madrid desde 2024.",
    texto: "Tablas de ibéricos y quesos, croquetas de cocido, cóctel con camareros o un Catering Box® que llega a la oficina listo para abrir. Cocinamos, lo llevamos y, si quieres, lo servimos.",
    sello: "Proveedor oficial de la Cámara de Comercio",
    fotoAlta: "media/empresas.jpg",
    fotoBaja: "media/elegante.jpg"
  },
  cifras: [
    { valor: "2", etiqueta: "cocinas: Madrid y Zaragoza" },
    { valor: "9,90 €", etiqueta: "por persona, el menú más sencillo" },
    { valor: "12", etiqueta: "medios han hablado de nosotros" }
  ],

  // Capítulos: cada uno lleva su vídeo; al hacer scroll el vídeo cambia con el texto
  ocasionesTitulo: "Para qué nos llaman",
  ocasiones: [
    { titulo: "Oficinas y reuniones", texto: "El Catering Box® llega listo para abrir en la sala. Sin montaje, sin camareros y sin platos que recoger.", video: "media/video/cap-box.mp4", poster: "media/video/cap-box.jpg", categoria: "Catering Box®" },
    { titulo: "Eventos y cócteles", texto: "Montaje sport o elegante, con camareros y barra. Presentaciones, inauguraciones y fiestas de empresa.", video: "media/video/cap-eventos.mp4", poster: "media/video/cap-eventos.jpg", categoria: "Cócteles" },
    { titulo: "Comuniones", texto: "Buffet con montaje elegante: loza, cubertería, mantelería y un menú para los niños.", video: "media/video/cap-comuniones.mp4", poster: "media/video/cap-comuniones.jpg", categoria: "Comuniones" },
    { titulo: "Congresos y jornadas", texto: "Coffee breaks y cócteles para cientos de personas, como en la Cámara de Comercio de Zaragoza.", video: "media/video/cap-congresos.mp4", poster: "media/video/cap-congresos.jpg", categoria: "Coffee break" }
  ],

  cartaTitulo: "La carta",
  cartaTexto: "Precios por persona. Elige un menú y te calculamos el presupuesto al momento.",
  carta: [
    {
      categoria: "Catering Box®",
      descripcion: "Catering automontable con menaje desechable incluido. Pedido mínimo: 10 personas.",
      menus: [
        { nombre: "Lunch 1", precio: 13.90, minimo: 10, foto: "media/box-lunch.jpg", platos: ["Surtido de quesos con galletitas rellenas de queso de cabra, nueces, pasas y pan soplado", "Bocatín de lechuga, huevo duro, tomate, atún y salsa ligera", "Bocatín de jamón ibérico con tomate y AOVE", "Bocatín de tortilla de patata", "Empanada de bonito", "Empanada de york y queso", "Croqueta de cocido", "Croqueta de jamón", "Bolita de queso azul"] },
        { nombre: "Lunch 2", precio: 13.90, minimo: 10, platos: ["Montadito de jamón ibérico con tomate natural batido y AOVE", "Taquitos de tortilla de patata", "Empanada de york y queso", "Mini hamburguesa con cebolla caramelizada, mostaza de Dijon y canónigos", "Bocatín vegetal", "Croqueta de cocido", "Croqueta de jamón", "Bolita de queso azul", "Cola de langostino crujiente", "Cremosa de boletus a la trufa"] },
        { nombre: "Lunch 3", precio: 15.90, minimo: 10, platos: ["Surtido de quesos con galletitas rellenas de queso de cabra, nueces, pasas y pan soplado", "Mini hamburguesa con cebolla caramelizada, mostaza de Dijon y canónigos", "Bocatín de tortilla de patata", "Empanada de york y queso", "Empanada de bonito", "Croquetas de cocido y de jamón", "Bolita de ajoarriero", "Bolita de queso azul", "Cola de langostino crujiente", "Cremosa de boletus a la trufa"] },
        { nombre: "Lunch 4", precio: 16.90, minimo: 10, platos: ["Surtido de quesos con galletitas rellenas de queso de cabra, nueces, pasas y pan soplado", "Ibéricos D.O. Guijuelo: chorizo, salchichón y caña de lomo, con selección de panes", "Montadito de jamón ibérico con tomate natural batido y AOVE", "Taquitos de tortilla de patata", "Empanada de bonito", "Croquetas de cocido y de jamón", "Bolita de ajoarriero", "Bolita de queso azul", "Cola de langostino crujiente", "Cremosa de boletus a la trufa"] }
      ]
    },
    {
      categoria: "Coffee break",
      descripcion: "Con zumo de naranja natural, café y leche Bag in Box. Pedido mínimo: 10 personas.",
      menus: [
        { nombre: "Coffee Break 1", precio: 9.90, minimo: 10, foto: "media/coffee.jpg", platos: ["Bizcocho de limón", "Zumo de naranja natural", "Café y leche Bag in Box", "Azúcar moreno, vasos, servilletas y paletinas"] },
        { nombre: "Coffee Break 2", precio: 10.90, minimo: 10, platos: ["Brochetas de fruta de temporada", "Bizcocho de limón", "Zumo de naranja natural", "Café y leche Bag in Box", "Azúcar moreno, vasos, servilletas y paletinas"] },
        { nombre: "Coffee Break 5", precio: 11.90, minimo: 10, platos: ["Brochetas de fruta de temporada", "Brownie", "Bocatín de tortilla de patata", "Zumo de naranja natural", "Café y leche Bag in Box", "Azúcar moreno, vasos, servilletas y paletinas"] },
        { nombre: "Coffee Break 8", precio: 13.90, minimo: 10, platos: ["Brochetas de fruta de temporada", "Bizcocho de limón", "Bocatín de jamón ibérico con tomate y AOVE", "Bocatín de tortilla de patata", "Zumo de naranja natural", "Café y leche Bag in Box", "Azúcar moreno, vasos, servilletas y paletinas"] }
      ]
    },
    {
      categoria: "Cócteles",
      descripcion: "Cócteles con montaje sport o elegante. Mínimo 50 personas en Madrid y 25 en Zaragoza (cóctel 1: 50 en ambas).",
      menus: [
        { nombre: "Cóctel 1", precio: 12.50, minimo: 50, foto: "media/elegante.jpg", platos: ["Copa de cava o de vino tinto Altanza Reserva D.O. Ca. Rioja", "Agua mineral", "A elegir: petits fours y brochetas de fruta, o montadito de jamón ibérico y surtido de quesos", "Montaje elegante"] },
        { nombre: "Cóctel 2", variantes: [{ nombre: "Sport", precio: 19.90 }, { nombre: "Elegante", precio: 21.90 }], minimo: { Madrid: 50, Zaragoza: 25 }, platos: ["Surtido de quesos con galletitas rellenas", "Ibéricos D.O. Guijuelo (chorizo, salchichón y lomo)", "Montadito de jamón ibérico con tomate natural y AOVE", "Langostino crujiente", "Croqueta de jamón", "Cremosa de boletus a la trufa", "Dulces: brocheta de plátano con chocolate y leche frita con canela", "Bebidas: vino tinto y blanco Altanza, cervezas, refrescos y agua"] },
        { nombre: "Cóctel 3", variantes: [{ nombre: "Sport", precio: 19.90 }, { nombre: "Elegante", precio: 21.90 }], minimo: { Madrid: 50, Zaragoza: 25 }, platos: ["Jamón de bellota D.O. Guijuelo cortado a cuchillo", "Canapé de queso Agour de oveja con mermelada de higos", "Canapé de stracciatella de burrata, anchoa de Santoña y almendra", "Canapé de tartar de salchichón ibérico con huevas de trucha", "Canapé de sobrasada ibérica, queso brie y miel de azahar", "Croqueta de jamón", "Cremosa de gulas y gambas", "Cremosa de boletus a la trufa", "Petits fours de crema pastelera con fruta de temporada", "Bebidas: vino tinto y blanco Altanza, cervezas, refrescos y agua"] }
      ]
    },
    {
      categoria: "Comuniones",
      descripcion: "Buffet con montaje elegante incluido (loza, cubertería, mobiliario y mantelería). Mínimo 30 personas.",
      menus: [
        { nombre: "Entrantes 1", precio: 18.00, minimo: 30, foto: "media/comuniones.jpg", platos: ["Jamón de bellota D.O. Guijuelo cortado a cuchillo con tostaditas de mini chapata", "Surtido de quesos con galletitas rellenas de queso de cabra, nueces, pasas y pan soplado", "Surtido de fritos: croquetas de jamón y cocido, cremosas de boletus y queso azul, bolita de ajoarriero y cola de langostino"] },
        { nombre: "Entrantes 2", precio: 25.00, minimo: 30, platos: ["Jamón de bellota D.O. Guijuelo cortado a cuchillo", "Ibéricos D.O. Guijuelo con pan soplado", "Surtido de quesos con galletitas rellenas", "Envoltini de papada ibérica", "Empanada de bonito", "Empanada de queso de cabra con tomate confitado", "Brocheta de mozzarella con tomatito asado y pesto", "Surtido de fritos"] },
        { nombre: "Menú infantil 1", precio: 19.90, minimo: 30, platos: ["Penne rigatoni con salsa de tomate", "Pechuga Villaroy con patatas fritas", "Brioche de cacao con topping de Oreo"] },
        { nombre: "Menú infantil 2", precio: 17.90, minimo: 30, platos: ["Pizza de york y queso", "Mini perrito caliente", "Mini hamburguesa", "Nuggets de pollo", "Croquetas de jamón", "Patatas fritas", "Brioche de cacao con topping de Oreo"] }
      ]
    }
  ],

  presupuesto: {
    titulo: "Tu presupuesto, ahora",
    texto: "Elige ciudad, menú y número de personas. Te damos una estimación y nos la envías con un toque.",
    extras: [
      { nombre: "Camarero (30 min)", detalle: "80 € por camarero · +20 € cada media hora extra", precio: 80, tipo: "fijo" },
      { nombre: "Pan de masa madre con tomate y AOVE", detalle: "+2,50 €/persona", precio: 2.50, tipo: "persona" }
    ],
    nota: "Precio orientativo sin transporte. Te confirmamos el presupuesto final según fecha, lugar y servicio."
  },

  pasosTitulo: "Así de fácil",
  pasos: [
    { titulo: "Elige tu menú", texto: "Catering Box®, coffee break, cóctel o comunión: mira la carta y calcula tu presupuesto." },
    { titulo: "Envíanoslo", texto: "Con un toque nos llega por WhatsApp o email y te confirmamos disponibilidad y precio final." },
    { titulo: "Lo llevamos", texto: "Te lo entregamos listo para servir o lo montamos nosotros, con camareros si lo necesitas." }
  ],

  // Vídeos del canal: «clip» es una previsualización muda que se reproduce en la página; al tocar se abre el vídeo entero
  videosTitulo: "En acción",
  videos: [
    { titulo: "Caterings con montaje", youtube: "jsq5BDByTo8", clip: "media/video/v-jsq5BDByTo8.mp4", poster: "media/video/v-jsq5BDByTo8.jpg" },
    { titulo: "Catering Box®, el primer catering automontable", youtube: "MyxAbXq8z3g", clip: "media/video/v-MyxAbXq8z3g.mp4", poster: "media/video/v-MyxAbXq8z3g.jpg" },
    { titulo: "Volkswagen Zaragoza", youtube: "29WRpgQyfQI", clip: "media/video/v-29WRpgQyfQI.mp4", poster: "media/video/v-29WRpgQyfQI.jpg" },
    { titulo: "En la Cámara de Comercio de Zaragoza", youtube: "W0NgqerKd-o", clip: "media/video/v-W0NgqerKd-o.mp4", poster: "media/video/v-W0NgqerKd-o.jpg" },
    { titulo: "Desayunos a domicilio", youtube: "wU5rkxw2KFc", clip: "media/video/v-wU5rkxw2KFc.mp4", poster: "media/video/v-wU5rkxw2KFc.jpg" },
    { titulo: "Bolsas picnic", youtube: "u3UHrELyg7g", clip: "media/video/v-u3UHrELyg7g.mp4", poster: "media/video/v-u3UHrELyg7g.jpg" },
    { titulo: "Mini Box", youtube: "qw47y3d_KfQ", clip: "media/video/v-qw47y3d_KfQ.mp4", poster: "media/video/v-qw47y3d_KfQ.jpg" }
  ],

  galeriaTitulo: "Nuestras mesas",
  galeria: [
    { src: "media/campana.jpg", pie: "Mesa de cóctel" },
    { src: "media/particulares.jpg", pie: "Celebraciones" },
    { src: "media/cateringbox.jpg", pie: "Catering Box®" },
    { src: "media/congresos.jpg", pie: "Congresos" },
    { src: "media/empresas.jpg", pie: "Montaje para empresas" },
    { src: "media/comuniones.jpg", pie: "Comuniones" }
  ],

  // Reseñas reales de Google (pendiente: pegar 3 opiniones de su ficha de Google)
  opiniones: [],

  clientesTitulo: "Confían en Doña Col",
  clientes: ["Telefónica", "Amazon", "Ferrovial", "Adidas", "Loewe", "Ford", "Bayer", "Decathlon", "LEGO", "MediaMarkt", "Acciona", "AstraZeneca", "Ibercaja", "Adecco", "SEUR", "Enagás", "la Universidad de Zaragoza", "el Gobierno de Aragón"],

  prensaTitulo: "En prensa",
  prensa: [
    { medio: "El Economista", titulo: "Doña Col da el salto a Madrid con su servicio de catering", url: "https://www.eleconomista.es/actualidad/noticias/12826325/05/24/dona-col-da-el-salto-a-madrid-con-su-servicio-de-catering.html" },
    { medio: "Diario ABC", titulo: "Doña Col se consolida en Madrid como proveedor de eventos", url: "https://www.diario-abc.com/nota/43365/el-catering-dona-col-se-consolida-en-madrid-como-p.html" },
    { medio: "Heraldo de Aragón", titulo: "La empresa zaragozana Doña Col Catering se establece en Madrid", url: "https://www.heraldo.es/noticias/gastronomia/2024/05/23/empresa-zaragozana-dona-col-catering-es-establece-madrid-1736151.html" },
    { medio: "Emprendedores", titulo: "Doña Col se consolida en Madrid como proveedor de grandes eventos", url: "https://revistaemprendedores.es/el-catering-dona-col-se-consolida-en-madrid-como-proveedor-de-grandes-eventos/" },
    { medio: "Restauración News", titulo: "Doña Col Catering aterriza en Madrid", url: "https://restauracionnews.com/2024/06/catering-dona-col-madrid/" }
  ],

  faqsTitulo: "Preguntas frecuentes",
  faqs: [
    { pregunta: "¿Cuál es el pedido mínimo?", respuesta: "Catering Box® y coffee break: 10 personas. Cócteles: 50 personas en Madrid y 25 en Zaragoza (el cóctel 1, 50 en ambas). Comuniones: 30 personas." },
    { pregunta: "¿Los precios llevan IVA?", respuesta: "No. Todos los precios son por persona y llevan un 10 % de IVA aparte. La calculadora ya te lo suma." },
    { pregunta: "¿Qué incluye el montaje?", respuesta: "El Catering Box® llega listo para servir con menaje desechable. Los cócteles y las comuniones se montan en nuestras mesas con mantelería; en comuniones el montaje elegante incluye platos de loza, cubertería y mobiliario." },
    { pregunta: "¿Podéis poner camareros?", respuesta: "Sí. La tarifa base es de 80 € por camarero (30 minutos) y 20 € por cada media hora extra." },
    { pregunta: "¿Tenéis opciones para alergias e intolerancias?", respuesta: "Sí. Puedes consultar los alérgenos de todos nuestros platos y contarnos cualquier necesidad al pedir presupuesto." },
    { pregunta: "¿Con cuánta antelación tengo que pedirlo?", respuesta: "Cuanto antes, mejor, sobre todo para eventos grandes y comuniones. Escríbenos con la fecha y te confirmamos disponibilidad." }
  ],

  sedesTitulo: "Dónde estamos",
  sedes: [
    { nombre: "Madrid", direccion: "Paseo de la Castellana, 40, 28046 Madrid", telefono: "919 379 872", whatsapp: "+34678348968", email: "infomadrid@donacol.es", horario: "Lunes a viernes, de 8:00 a 16:00" },
    { nombre: "Zaragoza", direccion: "Avda. Pablo Gargallo, 118, 50003 Zaragoza", telefono: "976 017 568", whatsapp: "+34608436040", email: "info@donacol.es", horario: "Lunes a viernes, de 8:00 a 16:00" }
  ],

  enlaces: [
    { titulo: "Web oficial", url: "https://donacol.es" },
    { titulo: "Tienda online", url: "https://donacol.es/tienda/" },
    { titulo: "Personaliza tu Catering Box®", url: "https://donacol.es/personaliza-tu-catering-box/" },
    { titulo: "Alérgenos", url: "media/alergenos.pdf" },
    { titulo: "Blog", url: "https://donacol.es/blog-noticias-dona-col-catering-madrid-zaragoza/" }
  ],
  redes: [
    { red: "instagram", url: "https://www.instagram.com/cateringdonacol/" },
    { red: "facebook", url: "https://www.facebook.com/donacolcatering/" },
    { red: "youtube", url: "https://www.youtube.com/@DonaColCatering" }
  ],

  creditos: { nombre: "LAPROTOCOL", texto: "Página creada por", web: "" }
};
