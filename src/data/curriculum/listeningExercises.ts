import type { ExerciseItem } from '../../domain/types';
import { dictate, listenChoice } from './helpers';

/**
 * Listening comprehension (listening_choice) and short dictation (listening_dictation)
 * distributed across 3º, 4º, 5º, and 6º de Primaria (both vocabulary and grammar).
 */
export const LISTENING_EXERCISES: ExerciseItem[] = [
  // ===================== 3º DE PRIMARIA =====================
  listenChoice('3p-st-lc1', '3p', '3p-starter', 'vocabulary', 'Escucha el audio y elige qué número y tiempo dice:', 'Forty-five. Today it is sunny and warm.', ['45 · Soleado y cálido', '54 · Lluvioso y frío', '45 · Nublado y ventoso', '15 · Nevando'], '45 · Soleado y cálido', 'Dice "Forty-five" (45) y "Today it is sunny and warm" (soleado y cálido).'),
  dictate('3p-st-ld1', '3p', '3p-starter', 'vocabulary', 'Escucha el día de la semana y escríbelo en inglés:', 'Wednesday', ['Wednesday'], '"Wednesday" es miércoles (recuerda la "d" muda: Wed-nes-day).'),

  listenChoice('3p-sa1-lc1', '3p', '3p-sa1-animals', 'vocabulary', 'Escucha y elige de qué animal habla:', 'Look! It is a tall giraffe, it is not a monkey.', ['Una jirafa alta', 'Un mono pequeño', 'Dos elefantes grandes', 'Un león rápido'], 'Una jirafa alta', 'Dice: "It is a tall giraffe, it is not a monkey."'),
  dictate('3p-sa1-ld1', '3p', '3p-sa1-animals', 'grammar', 'Escucha la frase corta y escríbela en inglés:', 'They are big', ['They are big', "They're big"], 'Dice "They are big" (Son grandes).'),

  listenChoice('3p-sa2-lc1', '3p', '3p-sa2-bedroom', 'grammar', 'Escucha y elige dónde está la mochila:', 'My school bag is under the desk, next to the chair.', ['Debajo del escritorio, al lado de la silla', 'Encima de la cama', 'Dentro del armario', 'Detrás de la puerta'], 'Debajo del escritorio, al lado de la silla', '"Under the desk, next to the chair" = debajo del escritorio, al lado de la silla.'),
  dictate('3p-sa2-ld1', '3p', '3p-sa2-bedroom', 'vocabulary', 'Escucha el objeto del dormitorio y escríbelo:', 'wardrobe', ['wardrobe'], '"Wardrobe" significa armario ropero.'),

  listenChoice('3p-f1-lc1', '3p', '3p-fest-t1', 'vocabulary', 'Escucha y elige qué hay en el salón:', 'There is a big Christmas tree with a yellow star.', ['Un árbol de Navidad con una estrella amarilla', 'Una calabaza naranja de Halloween', 'Un muñeco de nieve en el jardín', 'Tres fantasmas blancos'], 'Un árbol de Navidad con una estrella amarilla', '"A big Christmas tree with a yellow star".'),

  listenChoice('3p-sa3-lc1', '3p', '3p-sa3-dressing-up', 'grammar', 'Escucha y elige qué lleva puesto el chico:', 'He is wearing blue jeans and a green jumper.', ['Vaqueros azules y un jersey verde', 'Pantalón corto y camiseta roja', 'Falda azul y abrigo negro', 'Chándal gris y gorra'], 'Vaqueros azules y un jersey verde', '"Blue jeans and a green jumper" = vaqueros azules y jersey verde.'),
  dictate('3p-sa3-ld1', '3p', '3p-sa3-dressing-up', 'vocabulary', 'Escucha la prenda de invierno y escríbela:', 'scarf', ['scarf'], '"Scarf" significa bufanda.'),

  listenChoice('3p-sa4-lc1', '3p', '3p-sa4-fun', 'grammar', 'Escucha qué hace Marta el fin de semana:', 'At the weekend, I visit my grandparents and play games.', ['Visita a sus abuelos y juega', 'Va al colegio y estudia matemáticas', 'Duerme todo el lunes', 'Va de compras el martes'], 'Visita a sus abuelos y juega', '"I visit my grandparents and play games".'),
  dictate('3p-sa4-ld1', '3p', '3p-sa4-fun', 'grammar', 'Escucha la pregunta corta y escríbela:', 'Do you swim?', ['Do you swim'], '"Do you swim?" pregunta si nadas.'),

  listenChoice('3p-sa5-lc1', '3p', '3p-sa5-food', 'grammar', 'Escucha y elige qué quiere tomar para comer:', "She wants some chicken and salad, she doesn't want any soup.", ['Quiere pollo y ensalada, nada de sopa', 'Quiere sopa caliente y pan', 'No quiere pollo ni ensalada', 'Quiere helado de fresa'], 'Quiere pollo y ensalada, nada de sopa', '"She wants some chicken and salad, she doesn\'t want any soup."'),
  dictate('3p-sa5-ld1', '3p', '3p-sa5-food', 'vocabulary', 'Escucha la fruta y escríbela en inglés:', 'strawberry', ['strawberry'], '"Strawberry" significa fresa.'),

  listenChoice('3p-sa6-lc1', '3p', '3p-sa6-entertainers', 'grammar', 'Escucha qué sabe y qué NO sabe hacer:', "He can ride a bike very well, but he can't juggle.", ['Sabe montar en bici, pero no hacer malabares', 'Sabe hacer malabares, pero no montar en bici', 'Sabe cantar y bailar muy bien', 'No sabe nadar ni correr'], 'Sabe montar en bici, pero no hacer malabares', '"He can ride a bike very well, but he can\'t juggle."'),
  dictate('3p-sa6-ld1', '3p', '3p-sa6-entertainers', 'grammar', 'Escucha la frase de habilidad y escríbela:', 'She can dance', ['She can dance'], '"She can dance" (Ella sabe bailar).'),

  // ===================== 4º DE PRIMARIA =====================
  listenChoice('4p-st-lc1', '4p', '4p-starter', 'vocabulary', 'Escucha y elige la fecha de cumpleaños y edad:', 'I am nine years old and my birthday is in October.', ['9 años · Cumpleaños en octubre', '10 años · Cumpleaños en agosto', '8 años · Cumpleaños en abril', '11 años · Cumpleaños en diciembre'], '9 años · Cumpleaños en octubre', '"Nine years old" (9 años) e "in October" (en octubre).'),

  listenChoice('4p-sa1-lc1', '4p', '4p-sa1-community', 'vocabulary', 'Escucha las indicaciones para llegar a la biblioteca:', 'Go straight on, then turn left opposite the supermarket.', ['Sigue recto y gira a la izquierda enfrente del supermercado', 'Gira a la derecha detrás del hospital', 'Cruza el puente al lado del cine', 'Baja las escaleras del museo'], 'Sigue recto y gira a la izquierda enfrente del supermercado', '"Go straight on, then turn left opposite the supermarket."'),
  dictate('4p-sa1-ld1', '4p', '4p-sa1-community', 'vocabulary', 'Escucha el lugar de la ciudad y escríbelo:', 'library', ['library'], '"Library" es biblioteca.'),

  listenChoice('4p-sa2-lc1', '4p', '4p-sa2-my-day', 'vocabulary', 'Escucha y elige a qué hora desayuna:', 'I usually have breakfast at quarter past eight.', ['A las 8:15', 'A las 7:45', 'A las 8:30', 'A las 8:00'], 'A las 8:15', '"Quarter past eight" son las ocho y cuarto (8:15).'),
  dictate('4p-sa2-ld1', '4p', '4p-sa2-my-day', 'grammar', 'Escucha la hora y escríbela en inglés:', 'half past seven', ['half past seven'], '"Half past seven" = las siete y media.'),

  listenChoice('4p-sa3-lc1', '4p', '4p-sa3-cooking', 'grammar', 'Escucha qué ingredientes hay en la nevera:', "There are six eggs and some butter, but there isn't any flour.", ['Hay 6 huevos y mantequilla, pero no hay harina', 'Hay mucha harina y leche, pero no hay huevos', 'No hay mantequilla ni queso', 'Hay tres tomates y cebollas'], 'Hay 6 huevos y mantequilla, pero no hay harina', '"Six eggs and some butter, but there isn\'t any flour."'),
  dictate('4p-sa3-ld1', '4p', '4p-sa3-cooking', 'grammar', 'Escucha la pregunta y escríbela en inglés:', 'Are there any eggs?', ['Are there any eggs'], '"Are there any eggs?" pregunta si hay huevos.'),

  listenChoice('4p-sa4-lc1', '4p', '4p-sa4-we-can', 'grammar', 'Escucha qué están haciendo ahora mismo:', 'Look! The children are painting a big picture and they are very excited.', ['Están pintando un cuadro grande y están muy emocionados', 'Están durmiendo porque están cansados', 'Están corriendo bajo la lluvia', 'Están leyendo en silencio'], 'Están pintando un cuadro grande y están muy emocionados', '"Are painting a big picture and they are very excited."'),
  dictate('4p-sa4-ld1', '4p', '4p-sa4-we-can', 'grammar', 'Escucha la frase en Present Continuous y escríbela:', 'They are running', ['They are running', "They're running"], '"They are running" (recuerda doblar la "n" en running).'),

  listenChoice('4p-sa5-lc1', '4p', '4p-sa5-our-things', 'vocabulary', 'Escucha la conversación en la tienda y elige el precio:', 'How much is this watch? It is twenty-five euros.', ['El reloj cuesta 25 euros', 'El paraguas cuesta 15 euros', 'La mochila cuesta 52 euros', 'Las gafas cuestan 20 euros'], 'El reloj cuesta 25 euros', '"Watch" = reloj de pulsera; "twenty-five euros" = 25 euros.'),
  dictate('4p-sa5-ld1', '4p', '4p-sa5-our-things', 'vocabulary', 'Escucha el objeto personal y escríbelo:', 'headphones', ['headphones'], '"Headphones" significa auriculares.'),

  listenChoice('4p-sa6-lc1', '4p', '4p-sa6-entertainers', 'grammar', 'Escucha sobre gustos y elige la opción verdadera:', "Lucas loves cycling and table tennis, but he doesn't like scary films.", ['Le encanta el ciclismo y el ping-pong, pero no las pelis de miedo', 'Odia montar en bici y prefiere las pelis de miedo', 'Solo le gusta jugar al ajedrez', 'No le gusta ningún deporte'], 'Le encanta el ciclismo y el ping-pong, pero no las pelis de miedo', '"Loves cycling and table tennis, but he doesn\'t like scary films."'),

  // ===================== 5º DE PRIMARIA =====================
  listenChoice('5p-st-lc1', '5p', '5p-starter', 'vocabulary', 'Escucha y elige en qué puesto quedó en la carrera:', 'Sarah ran very fast and finished in third place!', ['En 3º lugar', 'En 1º lugar', 'En 13º lugar', 'En 5º lugar'], 'En 3º lugar', '"Third place" significa tercer lugar (3º).'),

  listenChoice('5p-sa1-lc1', '5p', '5p-sa1-school', 'grammar', 'Escucha y distingue rutina vs ahora mismo:', 'We usually have Science in the morning, but right now we are doing Art.', ['Normalmente tienen Ciencias, pero ahora están haciendo Plástica', 'Siempre tienen Plástica y nunca Ciencias', 'Ahora están en Educación Física en el patio', 'Ayer tuvieron examen de Historia'], 'Normalmente tienen Ciencias, pero ahora están haciendo Plástica', 'Contrasta Present Simple ("usually have Science") con Present Continuous ("right now we are doing Art").'),
  dictate('5p-sa1-ld1', '5p', '5p-sa1-school', 'vocabulary', 'Escucha la asignatura y escríbela en inglés:', 'Geography', ['geography'], '"Geography" significa Geografía.'),

  listenChoice('5p-sa2-lc1', '5p', '5p-sa2-in-nature', 'grammar', 'Escucha la comparación de lugares naturales:', 'Mount Everest is the highest mountain in the world, and it is colder than the desert.', ['El Everest es la montaña más alta y es más frío que el desierto', 'El desierto es más frío que el Everest', 'El Everest es un río muy largo', 'El valle es más alto que la montaña'], 'El Everest es la montaña más alta y es más frío que el desierto', '"The highest mountain" (superlativo) y "colder than" (comparativo).'),
  dictate('5p-sa2-ld1', '5p', '5p-sa2-in-nature', 'grammar', 'Escucha y escribe el comparativo y superlativo que oyes:', 'bigger than', ['bigger than'], '"Bigger than" = más grande que (con doble "g").'),

  listenChoice('5p-sa3-lc1', '5p', '5p-sa3-carnival', 'grammar', 'Escucha cómo fue el carnaval ayer:', 'Yesterday there were colourful costumes and a big music band, and nobody was bored.', ['Había disfraces coloridos y una gran banda, y nadie estuvo aburrido', 'No había gente porque llovía mucho', 'Hoy hay un desfile silencioso', 'Estaban todos muy tristes y nerviosos'], 'Había disfraces coloridos y una gran banda, y nadie estuvo aburrido', 'Usa pasado de TO BE: "there were" y "nobody was bored".'),
  dictate('5p-sa3-ld1', '5p', '5p-sa3-carnival', 'vocabulary', 'Escucha el adjetivo de personalidad y escríbelo:', 'cheerful', ['cheerful'], '"Cheerful" significa alegre.'),

  listenChoice('5p-sa4-lc1', '5p', '5p-sa4-my-weekend', 'irregular_verbs', 'Escucha qué hizo el sábado pasado:', "Last Saturday I went to the cinema, saw an adventure film and ate popcorn.", ['Fue al cine, vio una peli de aventuras y comió palomitas', 'Fue a la piscina y nadó dos horas', 'Se quedó en casa estudiando', 'Compró una bici nueva en el centro comercial'], 'Fue al cine, vio una peli de aventuras y comió palomitas', 'Tres pasados irregulares seguidos: went (ir), saw (ver), ate (comer).'),
  dictate('5p-sa4-ld1', '5p', '5p-sa4-my-weekend', 'irregular_verbs', 'Escucha la frase en pasado simple y escríbela:', 'We bought tickets', ['We bought tickets'], '"Bought" es el pasado irregular de "buy" (comprar).'),

  listenChoice('5p-sa5-lc1', '5p', '5p-sa5-wild-animals', 'grammar', 'Escucha la comparación sobre animales salvajes:', 'Sharks are good hunters, but killer whales are even better swimmers.', ['Los tiburones son buenos cazadores, pero las orcas son aún mejores nadadoras', 'Los tiburones son peores cazadores que los canguros', 'Las ballenas corren más rápido que los guepardos', 'Los pulpos son los animales más grandes'], 'Los tiburones son buenos cazadores, pero las orcas son aún mejores nadadoras', 'Usa "good" y su comparativo irregular "better".'),
  dictate('5p-sa5-ld1', '5p', '5p-sa5-wild-animals', 'vocabulary', 'Escucha el animal salvaje y escríbelo en inglés:', 'cheetah', ['cheetah'], '"Cheetah" significa guepardo.'),

  listenChoice('5p-sa6-lc1', '5p', '5p-sa6-adventures', 'grammar', 'Escucha los planes de aventura para mañana:', 'Tomorrow morning we are going to wear helmets and go kayaking on the river.', ['Mañana por la mañana van a llevar cascos y hacer kayak en el río', 'Ayer hicieron escalada en la montaña', 'No van a llevar mochila ni linterna', 'Van a viajar en avión a Londres'], 'Mañana por la mañana van a llevar cascos y hacer kayak en el río', 'Usa futuro con "are going to wear... and go kayaking".'),
  dictate('5p-sa6-ld1', '5p', '5p-sa6-adventures', 'grammar', 'Escucha el plan de futuro y escríbelo:', 'I am going to camp', ['I am going to camp', "I'm going to camp"], '"I am going to camp" (Voy a acampar).'),

  // ===================== 6º DE PRIMARIA =====================
  listenChoice('6p-st-lc1', '6p', '6p-starter', 'vocabulary', 'Escucha la descripción de la nueva compañera:', 'Our new classmate has got curly hair and freckles, and she is very hard-working.', ['Tiene el pelo rizado y pecas, y es muy trabajadora', 'Tiene el pelo liso, gafas y es perezosa', 'Es muy tímida y nunca habla en clase', 'Tiene barba y bigote'], 'Tiene el pelo rizado y pecas, y es muy trabajadora', '"Curly hair" (pelo rizado), "freckles" (pecas) y "hard-working" (trabajadora).'),

  listenChoice('6p-sa1-lc1', '6p', '6p-sa1-professions', 'vocabulary', 'Escucha y adivina de qué profesión habla:', 'She works at an animal hospital and helps sick dogs, cats and horses.', ['Veterinaria (vet)', 'Arquitecta (architect)', 'Piloto (pilot)', 'Bombera (firefighter)'], 'Veterinaria (vet)', 'Cuida perros, gatos y caballos enfermos → "vet".'),
  dictate('6p-sa1-ld1', '6p', '6p-sa1-professions', 'vocabulary', 'Escucha la profesión y escríbela en inglés:', 'firefighter', ['firefighter'], '"Firefighter" significa bombero/a.'),

  listenChoice('6p-sa2-lc1', '6p', '6p-sa2-past-time', 'grammar', 'Escucha y elige cuándo ocurrió el viaje:', 'Two weeks ago, we flew to Dublin and visited an old castle.', ['Hace dos semanas volaron a Dublín y visitaron un castillo antiguo', 'Dentro de dos semanas volarán a Dublín', 'Todos los veranos visitan un museo moderno', 'Ayer no pudieron coger el avión'], 'Hace dos semanas volaron a Dublín y visitaron un castillo antiguo', '"Two weeks ago" (hace dos semanas) + "flew" y "visited".'),
  dictate('6p-sa2-ld1', '6p', '6p-sa2-past-time', 'irregular_verbs', 'Escucha la frase en pasado y escríbela:', 'She wrote a letter', ['She wrote a letter'], '"Wrote" es el pasado irregular de "write".'),

  listenChoice('6p-sa3-lc1', '6p', '6p-sa3-comparatives', 'grammar', 'Escucha la comparación entre medios de transporte:', 'Travelling by train is more comfortable and less expensive than flying.', ['El tren es más cómodo y menos caro que volar', 'El avión es más barato y más lento que el tren', 'El autobús es el transporte más caro', 'Ir a pie es más peligroso que conducir'], 'El tren es más cómodo y menos caro que volar', '"More comfortable" (más cómodo) y "less expensive" (menos caro).'),
  dictate('6p-sa3-ld1', '6p', '6p-sa3-comparatives', 'grammar', 'Escucha el superlativo y escríbelo:', 'the most popular', ['the most popular'], '"The most popular" = el/la más popular.'),

  listenChoice('6p-sa4-lc1', '6p', '6p-sa4-health', 'grammar', 'Escucha el consejo médico:', "You have a terrible headache. You should rest in bed and you shouldn't look at screens.", ['Le duele la cabeza: debería descansar y no mirar pantallas', 'Tiene hambre: debería comer muchos caramelos', 'Está sano: debería correr diez kilómetros ahora', 'Tiene tos: debería tomar helado frío'], 'Le duele la cabeza: debería descansar y no mirar pantallas', '"Headache" + consejo con "should rest" y "shouldn\'t look at screens".'),
  dictate('6p-sa4-ld1', '6p', '6p-sa4-health', 'vocabulary', 'Escucha la palabra de salud y escríbela:', 'healthy', ['healthy'], '"Healthy" significa sano / saludable.'),

  listenChoice('6p-sa5-lc1', '6p', '6p-sa5-environment', 'grammar', 'Escucha la norma para cuidar el planeta:', "We must recycle paper and glass, and we mustn't pollute our oceans.", ['Debemos reciclar papel y vidrio, y no debemos contaminar los océanos', 'Podemos tirar plástico al mar', 'No hace falta ahorrar agua en casa', 'Debemos talar más árboles en el bosque'], 'Debemos reciclar papel y vidrio, y no debemos contaminar los océanos', 'Obligación con "must recycle" y prohibición con "mustn\'t pollute".'),
  dictate('6p-sa5-ld1', '6p', '6p-sa5-environment', 'vocabulary', 'Escucha el término medioambiental y escríbelo:', 'rainforest', ['rainforest'], '"Rainforest" significa selva tropical.'),

  listenChoice('6p-sa6-lc1', '6p', '6p-sa6-culture', 'vocabulary', 'Escucha este dato cultural y elige la respuesta correcta:', 'In Scotland, people play the bagpipes at traditional festivals.', ['En Escocia tocan la gaita en festivales tradicionales', 'En Australia celebran San Patricio en agosto', 'En Canadá solo se habla español', 'En Gales el transporte típico es la góndola'], 'En Escocia tocan la gaita en festivales tradicionales', '"Scotland" (Escocia) y "bagpipes" (gaita).'),
];
