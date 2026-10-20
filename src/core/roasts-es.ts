import type { RoastBanks } from './roasts';

// Banco de pullas en español neutro (tú). Mild = amigo con cariño, Medium = grupo de WhatsApp, Unhinged = grupo a las 3 am.
// Sin marcas, sin bromas sobre el cuerpo (BODY vacío). Marcadores: {amt} {units} {n} {work} {unit}

export const ES: RoastBanks = {
  BASE: {
    coffee: {
      mild: ['Un café. Normal, eres estudiante y es tu herramienta de supervivencia.', 'Un café, unos {units}. Con calma.', 'Café anotado. El barista ya sabe tu nombre, ¿es buena señal?'],
      medium: ['Otro café. Lo adictivo no es la cafeína, es el vasito.', '{amt} por agua caliente con granos. Valiente.', 'En casa tienes una cafetera. Solo digo.'],
      unhinged: ['{amt} por un café. Estás pagando la terraza de un tipo y tú compartes piso.', 'Agua de granos a {amt}. El café de máquina de la uni es gratis, derrochón.', 'Otro café. Tu personalidad es 40% leche de avena y 60% deuda.'],
    },
    matcha: {
      mild: ['¡Matcha! Muy verde, muy {amt}.', 'Matcha anotado. Ojalá estuviera rico.', 'Un matchita de capricho. La clave es "ita".'],
      medium: ['Matcha. Qué performativo.', '{amt} por sostener una bebida verde para la foto. Icónico, caro.', 'No te gusta el matcha, te gusta la idea de que te guste el matcha.'],
      unhinged: ['Matcha, {amt}. Sabe a césped y lo sabes.', 'Pagaste {amt} por agua de pasto para que los demás crean que estás en calma. No lo estás, estás en la ruina.', 'La era matcha te cuesta {units}. ¿Vale el césped?'],
    },
    bubbletea: {
      mild: ['¡Té de burbujas! Dulce y no precisamente barato.', 'Boba anotada. Las perlas probablemente valieron la pena.', 'Momento boba. Capricho reconocido.'],
      medium: ['{amt} por azúcar y tapioca. Valiente.', 'Otra boba. Masticando tus ahorros, perla a perla.', 'Poco hielo, 50% azúcar, 100% el dinero del alquiler.'],
      unhinged: ['Te estás comiendo tus ahorros por una pajita gorda. {amt}.', 'La boba es gelatina cara con pajita y tienes un problema.', 'Bolitas de tapioca por {amt}. Ni están tan buenas, solo no tienes control.'],
    },
    snacks: {
      mild: ['Un snack. Pequeño, pero se acumula.', 'Snack anotado. El hambre es real.', 'Snack chiquito, ticket chiquito. Vigílalos.'],
      medium: ['Nunca es solo un snack. Ya van {n} esta semana.', 'Los snacks son el asesino silencioso del presupuesto. Recuérdalo.', '{amt} en la estantería de la tienda. Nada ahí valía la pena.'],
      unhinged: ['{amt} por una bolsa de aire con seis papas fritas.', 'Te está robando la cartera una bolsa de papas.', 'Snacks. Sí, tu cartera se desangra por mil cortecitos, bien hecho.'],
    },
    fastfood: {
      mild: ['Comida rápida anotada. Seguro estaba buena.', 'Comida rápida. Le pasa hasta a los mejores.', 'Un momento de autoservicio. Quizá agua la próxima.'],
      medium: ['¿Comida rápida otra vez? Hay comida en casa, ¿sabes?', '{amt} en una comida que olvidarás el jueves.', 'El autoservicio agradece tu donativo.'],
      unhinged: ['{amt} en comida rápida. Sabes lo que cuesta un pollo asado en el súper, ¿no?', 'Comida rápida, porque cocinar al parecer es muy difícil. Hermoso.', 'La app de comida rápida tiene más de tu dinero que tu cuenta de ahorros.'],
    },
    delivery: {
      mild: ['Pedido a domicilio anotado. El envío fue la verdadera comida.', '¡Delivery! Cómodo, aunque caro.', 'Alguien te trajo la comida. Qué bien. Revisa las tarifas la próxima vez.'],
      medium: ['{amt} por comida que llegó fría con tarifa de servicio. Atrevido.', 'Tarifa de envío, de servicio, de pedido pequeño. Pagaste por no hacer nada.', 'Tu puerta ya es básicamente una máquina expendedora.'],
      unhinged: ['Le pagaste {amt} a un desconocido para que condujera 4 km porque no podías llegar al refri.', 'Envío, servicio, pedido pequeño, propina. Impuesto a la flojera, cobrado.', 'Pediste a domicilio algo a dos minutos caminando. Flojera de lujo.'],
    },
    dineout: {
      mild: ['Cena fuera anotada. Ojalá valiera la compañía.', 'Comer fuera. Qué bien, pero ojo con el presupuesto.', '¡Noche de restaurante! Disfrútala, mañana fideos instantáneos.'],
      medium: ['{amt} cenando fuera. Un pollo del súper cuesta mucho menos, solo digo.', 'Otra vez comiendo fuera. Tu cocina se siente abandonada.', 'Tu cocina está llorando en silencio.'],
      unhinged: ['{units} por un plato que no se puede fotografiar sin buena luz. La próxima, hierve pasta.', 'Dividieron la cuenta y aun así perdiste. Eso es talento.', 'Alta cocina con dinero de estudiante. Tu yo del futuro ya llora frente a unos fideos.'],
    },
    groceries: {
      mild: ['¡Súper! Cocinar en casa es el camino.', 'Mírate, adulto. Buena compra.', 'Compra anotada. Este es el tipo bueno de gasto.'],
      medium: ['Súper. Genial. Cocinar es más barato que las apps de comida, quién lo diría.', 'Una compra de verdad. Orgulloso de ti, en silencio.', 'Refri: lleno. Cartera: menos llena. Sigue siendo una victoria.'],
      unhinged: ['Súper. Por fin una compra que no me da ganas de llorar. Sigue así.', 'Una compra de adulto de verdad. Me emociono.', 'Compraste comida de verdad. Estrellita dorada.'],
    },
    drinks: {
      mild: ['Copas anotadas. Ojalá fuera una buena noche.', 'Unas copas. Con cuidado con la cuenta.', '¡Noche de copas! Recuerda tomar agua entre rondas.'],
      medium: ['{amt} en copas. Al menos la resaca es gratis.', '¿Pagaste una ronda? ¿Con tus ingresos?', 'Tomar antes en casa sale más barato, lo sabías.'],
      unhinged: ['{amt} para ponerte triste en un bar. Eso también se hace gratis en casa.', 'Pagaste una ronda. ¡UNA RONDA! Ponte serio.', 'Dos jarras y dijiste que era un martes normal. Tu cuenta lo recordará.'],
    },
    nightout: {
      mild: ['Salida nocturna anotada. Ojalá estuviera genial.', '¡Gran noche! Los recuerdos no tienen precio, el ticket sí.', 'Salida de noche. Te lo ganaste, quizá.'],
      medium: ['Entrada, copas, viaje a casa, kebab. El clásico {amt}.', 'Las salidas nocturnas son una forma cara de perder el celular.', 'El kebab de las 2 am fue {units} de arrepentimiento, probablemente.'],
      unhinged: ['{amt} para bailar mal a oscuras y perder la chamarra. ¿Valió la pena? Lo dudo.', 'Gastaste {units} para llorar en el asiento de atrás a las 3 am. Crecimiento.', 'Tu hígado y tu cartera están en una situación de rehenes.'],
    },
    rideshare: {
      mild: ['Viaje anotado. Cómodo, aunque caro.', 'Un viaje. A veces toca.', 'Los viajes se acumulan, vigílalos.'],
      medium: ['{amt} por un viaje que podías hacer en transporte público.', 'Tarifa dinámica: porque no puedes esperar 6 minutos.', 'Hay tranvía. Va para allá. Cuesta poco.'],
      unhinged: ['{amt} en un viaje. El transporte público estaba literalmente afuera.', 'Pagaste tarifa dinámica para no llegar 4 minutos tarde. Igual llegaste tarde.', '¿Un viaje? Tienes piernas. También tienes abono. Úsalos.'],
    },
    clothes: {
      mild: ['¡Ropa nueva! Ojalá le quede bien al presupuesto.', 'Ropa anotada. Ojalá fuera un buen hallazgo.', 'Una compra pequeña. Que no se vuelva hábito.'],
      medium: ['{amt} en ropa. Tienes clóset, ¿verdad?', 'El carrito estuvo una semana ahí y al final cediste. Clásico.', 'No necesitas otra sudadera negra. Ya tienes cuatro.'],
      unhinged: ['{amt} en una blusa que usarás una vez y luego será tu pijama.', '¡Nuevo outfit! Pagado con el dinero de comida de la próxima semana.', 'Compraste ropa que usarás dos veces. Se llama moda rápida y te está dejando en la ruina.'],
    },
    tech: {
      mild: ['Compra de tecnología anotada. Ojalá útil.', '¡Un gadget! Comprueba que de verdad lo necesitabas.', 'Compra tecnológica. No olvides la garantía.'],
      medium: ['{amt} en un gadget que usarás dos semanas. Picante.', '¿Audífonos con cable? Qué performativo.', 'Otro gadget para el cajón de gadgets muertos.'],
      unhinged: ['{units} en un gadget que estará en un cajón antes de octubre. Precioso.', 'Compraste audífonos con cable en 2026. Eso es una personalidad, y cara.', 'Tiene muchas funciones que nunca usarás. Igual que tu membresía del gimnasio.'],
    },
    beauty: {
      mild: ['Compra de belleza anotada. El autocuidado cuenta.', '¡Skincare! Ojalá funcione.', 'Tú brillas, tu cartera se ve cansada.'],
      medium: ['{amt} en skincare. Tu cara está bien, en serio.', 'Otro sérum. La rutina de doce pasos te sale carísima.', 'La del mostrador de belleza ya sabe tu nombre. Eso no es presumir.'],
      unhinged: ['{amt} en un sérum con sombrerito. Te está estafando un frasco.', 'Lo compraste porque un desconocido en internet dijo que sí. Estaba patrocinada.', 'Tu cara cuesta más que tu alquiler y se ve igual.'],
    },
    random: {
      mild: ['Compra aleatoria anotada. A veces pasa.', 'Un pequeño impulso. A todos nos pasa.', 'Compra al azar, anotada.', ],
      medium: ['¿Qué fue eso? Sé sincero, tú tampoco lo sabes.', '{amt} en algo que no recordarás haber comprado.', 'La energía de "lo voy a usar" es fuerte aquí.'],
      unhinged: ['{amt} en cosas al azar. Así es exactamente como te quedas sin dinero.', 'Compra impulsiva detectada. Amigo, ¿qué haces?', 'Lo compraste porque estaba ahí. Eso no es una razón, es un síntoma.'],
    },
    subscription: {
      mild: ['Suscripción anotada. Revisa cuáles usas de verdad.', 'Una suscripción. Que se gane su lugar.', 'Suscripción anotada. Cancela las que olvidaste.'],
      medium: ['Otra suscripción. ¿La has abierto este mes?', 'Pagas seis cosas y usas dos.', 'Las suscripciones son el asesino silencioso. Hora de auditar.'],
      unhinged: ['Pagas cada mes por cosas que olvidaste que tenías. Felicidades, eres casero de apps.', '{amt} al mes para ver un programa una vez. Impresionante compromiso con el desperdicio.', 'Cancela una hoy. En serio. Tarda 40 segundos.'],
    },
    uni: {
      mild: ['Gasto de la uni anotado. La educación es cara.', 'Cosas de la uni. Ojalá útiles.', 'Dinero de libros. La próxima vez busca uno de segunda mano.'],
      medium: ['{amt} por un libro que abrirás dos veces. Bienvenido a la uni.', 'Gastos de la uni, ugh. Al menos es un gasto de verdad.', '¿Revisaste la biblioteca? Seguro es gratis ahí.'],
      unhinged: ['{amt} en un libro que está en PDF gratis en internet. Ingéniatelas, eres estudiante.', 'La uni es una estafa y la estás pagando con el dinero de la comida.', 'El profe escribió ese libro y ahora es más rico. Tú, más pobre. Así funciona el sistema.'],
    },
    health: {
      mild: ['Gasto de salud anotado. Buena inversión.', 'Cuidándote. Qué bien.', 'Los gastos de salud son justos. Bien por cuidarte.'],
      medium: ['Lo de salud se vale. Está bien, no lo voy a criticar.', 'Vale, este es bueno. Sigue.', 'Gasto justo. Nada que ver aquí.'],
      unhinged: ['Este te lo dejo pasar. La salud no es presumir, es necesidad.', 'Vale. Ese está bien. No te acostumbres.', 'Gasto responsable. No sé qué hacer con él.'],
    },
    other: {
      mild: ['Anotado. Cada peso cuenta.', 'Anotado. Gasta con cabeza.', 'Otro para el libro.'],
      medium: ['{amt} se fueron. Ojalá valiera la pena.', 'Anotado. Lo voy a recordar.', 'Gastaste {amt}. ¿En qué? Quién sabe.'],
      unhinged: ['{amt}. Se fueron. Como tu dignidad y tus ahorros.', 'No sé qué fue eso, pero costó {units}. Guau.', 'Dinero fuera. El saldo de tu cuenta gime.'],
    },
  },
  OVER: {
    mild: ['El presupuesto de la semana se acabó. Tómatelo con calma estos días.', 'Te pasaste de la semana. Sin estrés, a comer en casa.', 'Presupuesto agotado. La próxima semana lo hacemos mejor.'],
    medium: ['La semana se acabó. Ahora gastas el dinero de la próxima.', 'Te pasaste. Oficialmente le debes dinero a tu yo del futuro.', 'Presupuesto: terminado. Excusas: cargando.'],
    unhinged: ['Semana reventada. Totalmente frito. Come las papas del fondo del sofá.', 'Ahora estás en la ruina. No es metáfora. No abras la app del banco.', 'Te pasaste. Amigo. {n} veces esta semana y ahora eres una obra de caridad.'],
  },
  BIG: {
    mild: ['Esta es grande: {units}. Que valga la pena.', '{units} de golpe. Ojalá lo hayas planeado.', 'Compra grande. Respira hondo.'],
    medium: ['{units} de un golpe. Sé sincero, ¿lo necesitabas?', '{amt} es {work} de tu vida. Perdidos.', 'Eso son {units}. Te habría alcanzado para comer un día entero.'],
    unhinged: ['{units}. De UNA SOLA VEZ. Ponte serio ahora mismo.', '{amt} son {work} de trabajo, perdidos en algo que olvidarás el viernes.', 'Pudiste comprar {units} de platos HSP de verdad. Elegiste esto. Interesante.'],
  },
  REPEAT: {
    mild: ['Ya van {n} esta semana. Quizá ve más despacio.', 'Ya van {n} esta semana. Parece un patrón.', '¿Otra vez? Noto un hábito.'],
    medium: ['{n} esta semana. Ya no es un capricho, es un estilo de vida.', '{n} en una semana. El patrón es fuerte.', 'Tienes un hábito y es caro.'],
    unhinged: ['{n} esta semana. Es un problema. Tienes un problema.', 'La número {n}, esta semana. No estoy enojado, estoy preocupado.', 'A este paso múdate ahí.'],
  },
  LATE: {
    mild: ['Compra nocturna. La próxima vez consúltalo con la almohada.', 'Es tarde. Las decisiones de ahora son decisiones de sueño.', 'Gasto nocturno anotado. Quizá espera a la mañana.'],
    medium: ['Compra nocturna. Tu yo de las 3 am tiene pésimo gusto.', 'Nada bueno se compra después de medianoche. Pregúntale a tu carrito.', 'Tu yo dormido gastó {amt}. Tu yo despierto está molesto.'],
    unhinged: ['¿{amt} a esta hora? A dormir, pequeño demonio.', 'Comprar a medianoche es como acabas con un dron y sin dinero para el alquiler.', 'Lo único abierto a las 2 am son las malas ideas y el autoservicio.'],
  },
  BNPL: {
    mild: ['Pagar después sigue siendo pagar. Hoy cuenta completo.'],
    medium: ['Pagar después es solo pagar peor. Hoy conté los {amt} completos.'],
    unhinged: ['¿Pagar después? Amigo, eso es un préstamo con un logo bonito. Contados {amt} completos.'],
  },
  BODY: {},
  WANT: {
    mild: ['Consúltalo con la almohada. Si mañana lo sigues queriendo, quizá esté bien.', 'Dale un día. El impulso suele pasar.', 'Que se enfríe. Siempre puedes comprarlo después.'],
    medium: ['Métetelo al refri. Enfriarse es gratis.', 'Lo quieres ahora. ¿Lo querrás el jueves?', 'El carrito puede esperar. El alquiler no.'],
    unhinged: ['Esta noche definitivamente no. Vuelve cuando regrese tu cerebro.', 'Lo quieres porque estás aburrido. Sal a caminar.', 'Impulso detectado. Metido en el congelador.'],
  },
};
