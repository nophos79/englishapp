import type { ExerciseItem } from '../../domain/types';
import { builder, odd, order, tf } from './helpers';

/**
 * Varied interactive exercises (sentence_order, word_builder, odd_one_out, true_false)
 * distributed across 3º, 4º, 5º, and 6º de Primaria to enrich every Learning Unit.
 */
export const VARIED_EXERCISES: ExerciseItem[] = [
  // ===================== 3º DE PRIMARIA =====================
  odd('3p-st-odd1', '3p', '3p-starter', 'vocabulary', '¿Cuál de estas palabras NO es una estación del año?', ['spring', 'summer', 'winter', 'Wednesday'], 'Wednesday', '"Wednesday" es un día de la semana (miércoles), no una estación.'),
  order('3p-st-ord1', '3p', '3p-starter', 'grammar', 'Ordena las palabras para preguntar cómo se llama alguien:', ['What', 'is', 'your', 'name?'], 'La pregunta correcta es "What is your name?".'),

  odd('3p-sa1-odd1', '3p', '3p-sa1-animals', 'vocabulary', '¿Qué animal NO encaja? (Pista: 3 son salvajes y 1 es de granja)', ['lion', 'giraffe', 'tiger', 'sheep'], 'sheep', '"Sheep" (oveja) es un animal de granja, no salvaje.'),
  order('3p-sa1-ord1', '3p', '3p-sa1-animals', 'grammar', 'Ordena las palabras para hacer una pregunta sobre un elefante:', ['Is', 'it', 'a', 'big', 'elephant?'], 'En pregunta con TO BE ponemos "Is" al principio: "Is it a big elephant?".'),
  tf('3p-sa1-tf1', '3p', '3p-sa1-animals', 'grammar', 'They is tall giraffes.', false, 'Es incorrecta: con "They" debemos usar "are" ("They are tall giraffes.").'),

  builder('3p-sa2-wb1', '3p', '3p-sa2-bedroom', 'vocabulary', 'Forma palabras compuestas de la casa:', [
    { left: 'bed', right: 'room' },
    { left: 'book', right: 'case' },
    { left: 'arm', right: 'chair' },
  ], 'bed + room = bedroom, book + case = bookcase, arm + chair = armchair.'),
  order('3p-sa2-ord1', '3p', '3p-sa2-bedroom', 'grammar', 'Ordena la frase sobre dónde está el gato:', ['The', 'cat', 'is', 'under', 'the', 'bed.'], '"The cat is under the bed." (El gato está debajo de la cama).'),
  tf('3p-sa2-tf1', '3p', '3p-sa2-bedroom', 'grammar', 'These are my books.', true, 'Correcta: "These are" se usa para objetos en plural cercanos.'),

  odd('3p-sa3-odd1', '3p', '3p-sa3-dressing-up', 'vocabulary', '¿Qué prenda NO se lleva en invierno cuando hace frío?', ['coat', 'scarf', 'gloves', 'sandals'], 'sandals', '"Sandals" (sandalias) son calzado de verano.'),
  order('3p-sa3-ord1', '3p', '3p-sa3-dressing-up', 'grammar', 'Ordena las palabras para decir qué lleva puesta ella:', ['She', 'is', 'wearing', 'a', 'red', 'coat.'], '"She is wearing a red coat." (Present Continuous: is + wearing).'),
  tf('3p-sa3-tf1', '3p', '3p-sa3-dressing-up', 'grammar', 'He wearing a blue hat.', false, 'Tiene un fallo: falta el verbo "is" ("He is wearing a blue hat.").'),

  order('3p-sa4-ord1', '3p', '3p-sa4-fun', 'grammar', 'Ordena la pregunta sobre el fin de semana:', ['Do', 'you', 'play', 'football', 'on', 'Saturday?'], '"Do you play football on Saturday?" (Do + sujeto + verbo).'),
  odd('3p-sa4-odd1', '3p', '3p-sa4-fun', 'vocabulary', '¿Cuál NO es una parte del día?', ['morning', 'afternoon', 'evening', 'Monday'], 'Monday', '"Monday" es un día de la semana, no una parte del día.'),
  tf('3p-sa4-tf1', '3p', '3p-sa4-fun', 'grammar', "I don't go swimming on Monday.", true, 'Correcta: con "I" negamos en Present Simple con "don\'t".'),

  builder('3p-sa5-wb1', '3p', '3p-sa5-food', 'vocabulary', 'Forma palabras compuestas de comida:', [
    { left: 'water', right: 'melon' },
    { left: 'straw', right: 'berry' },
    { left: 'pine', right: 'apple' },
  ], 'water + melon = watermelon, straw + berry = strawberry, pine + apple = pineapple.'),
  odd('3p-sa5-odd1', '3p', '3p-sa5-food', 'vocabulary', '¿Cuál de estas palabras NO es un sabor?', ['sweet', 'salty', 'sour', 'pasta'], 'pasta', '"Pasta" es un alimento, no un adjetivo de sabor.'),
  tf('3p-sa5-tf1', '3p', '3p-sa5-food', 'grammar', "He doesn't want some rice.", false, 'Tiene un fallo: en frases negativas debemos usar "any" ("doesn\'t want any rice").'),

  order('3p-sa6-ord1', '3p', '3p-sa6-entertainers', 'grammar', 'Ordena la pregunta sobre habilidad:', ['Can', 'she', 'play', 'the', 'guitar?'], '"Can she play the guitar?" (Can + sujeto + verbo base).'),
  tf('3p-sa6-tf1', '3p', '3p-sa6-entertainers', 'grammar', 'He can swim very well.', true, 'Correcta: "can" nunca lleva -s ni "to" detrás.'),
  builder('3p-f3-wb1', '3p', '3p-fest-t3', 'vocabulary', 'Forma palabras compuestas de verano:', [
    { left: 'sun', right: 'glasses' },
    { left: 'swim', right: 'suit' },
    { left: 'ice', right: 'cream' },
  ], 'sun + glasses = sunglasses, swim + suit = swimsuit, ice + cream = ice cream.'),

  // ===================== 4º DE PRIMARIA =====================
  odd('4p-st-odd1', '4p', '4p-starter', 'vocabulary', '¿Qué palabra NO es un tiempo atmosférico?', ['sunny', 'windy', 'cloudy', 'April'], 'April', '"April" es un mes del año.'),
  order('4p-st-ord1', '4p', '4p-starter', 'grammar', 'Ordena la pregunta sobre cumpleaños:', ['When', 'is', 'your', 'birthday?'], '"When is your birthday?" pregunta cuándo es tu cumpleaños.'),

  odd('4p-sa1-odd1', '4p', '4p-sa1-community', 'vocabulary', '¿Qué palabra NO es un lugar de la ciudad?', ['library', 'museum', 'hospital', 'always'], 'always', '"Always" es un adverbio de frecuencia, no un lugar.'),
  order('4p-sa1-ord1', '4p', '4p-sa1-community', 'grammar', 'Ordena la frase colocando bien el adverbio de frecuencia:', ['She', 'always', 'goes', 'to', 'the', 'park.'], 'El adverbio ("always") va antes del verbo principal: "She always goes to the park.".'),
  tf('4p-sa1-tf1', '4p', '4p-sa1-community', 'grammar', 'Tom always play football on Friday.', false, 'Tiene un fallo: con "Tom" (he) falta la -s ("Tom always plays football...").'),

  builder('4p-sa2-wb1', '4p', '4p-sa2-my-day', 'vocabulary', 'Forma palabras compuestas del día a día:', [
    { left: 'break', right: 'fast' },
    { left: 'home', right: 'work' },
    { left: 'week', right: 'end' },
  ], 'break + fast = breakfast, home + work = homework, week + end = weekend.'),
  order('4p-sa2-ord1', '4p', '4p-sa2-my-day', 'grammar', 'Ordena la pregunta sobre rutinas:', ['What', 'time', 'does', 'she', 'wake', 'up?'], '"What time does she wake up?" (does + sujeto + verbo base).'),
  tf('4p-sa2-tf1', '4p', '4p-sa2-my-day', 'grammar', 'I go to school at half past eight.', true, 'Correcta: delante de las horas usamos "at".'),

  odd('4p-sa3-odd1', '4p', '4p-sa3-cooking', 'vocabulary', '¿Cuál de estos alimentos NO es una verdura?', ['onion', 'carrot', 'lettuce', 'cheese'], 'cheese', '"Cheese" (queso) es un lácteo, no una verdura.'),
  order('4p-sa3-ord1', '4p', '4p-sa3-cooking', 'grammar', 'Ordena la pregunta sobre comida en la cocina:', ['Are', 'there', 'any', 'eggs?'], '"Are there any eggs?" para preguntar en plural.'),
  tf('4p-sa3-tf1', '4p', '4p-sa3-cooking', 'grammar', 'There is three tomatoes on the table.', false, 'Tiene un fallo: "three tomatoes" es plural, debemos usar "There are".'),

  odd('4p-sa4-odd1', '4p', '4p-sa4-we-can', 'vocabulary', '¿Cuál de estas palabras NO es una emoción?', ['happy', 'tired', 'angry', 'kitchen'], 'kitchen', '"Kitchen" es una habitación de la casa.'),
  order('4p-sa4-ord1', '4p', '4p-sa4-we-can', 'grammar', 'Ordena la frase en Present Continuous:', ['They', 'are', 'running', 'in', 'the', 'park.'], '"They are running in the park." (are + verbo-ing).'),
  tf('4p-sa4-tf1', '4p', '4p-sa4-we-can', 'grammar', 'Look! She is reading a book right now.', true, 'Correcta: "right now" usa Present Continuous ("is reading").'),

  builder('4p-sa5-wb1', '4p', '4p-sa5-our-things', 'vocabulary', 'Forma palabras compuestas de objetos:', [
    { left: 'back', right: 'pack' },
    { left: 'head', right: 'phones' },
    { left: 'note', right: 'book' },
  ], 'back + pack = backpack, head + phones = headphones, note + book = notebook.'),
  order('4p-sa5-ord1', '4p', '4p-sa5-our-things', 'grammar', 'Ordena la pregunta de posesión:', ['Whose', 'umbrella', 'is', 'this?'], '"Whose umbrella is this?" (¿De quién es este paraguas?).'),
  tf('4p-sa5-tf1', '4p', '4p-sa5-our-things', 'grammar', 'How much are these trainers?', true, 'Correcta: "trainers" es plural → "How much are...".'),

  order('4p-sa6-ord1', '4p', '4p-sa6-entertainers', 'grammar', 'Ordena la frase sobre gustos:', ['He', "doesn't", 'like', 'horror', 'films.'], '"He doesn\'t like horror films." (doesn\'t + verbo sin -s).'),
  tf('4p-sa6-tf1', '4p', '4p-sa6-entertainers', 'grammar', 'Does she likes playing tennis?', false, 'Tiene un fallo: con "Does" el verbo va sin -s ("Does she like...?").'),

  // ===================== 5º DE PRIMARIA =====================
  odd('5p-st-odd1', '5p', '5p-starter', 'vocabulary', '¿Cuál NO es un número ordinal?', ['first', 'second', 'third', 'four'], 'four', '"Four" es cardinal (4); su ordinal sería "fourth" (4º).'),
  order('5p-st-ord1', '5p', '5p-starter', 'grammar', 'Ordena la pregunta sobre frecuencia:', ['How', 'often', 'do', 'you', 'read?'], '"How often do you read?" pregunta con qué frecuencia lees.'),

  builder('5p-sa1-wb1', '5p', '5p-sa1-school', 'vocabulary', 'Forma palabras compuestas del colegio:', [
    { left: 'class', right: 'room' },
    { left: 'play', right: 'ground' },
    { left: 'white', right: 'board' },
  ], 'class + room = classroom, play + ground = playground, white + board = whiteboard.'),
  order('5p-sa1-ord1', '5p', '5p-sa1-school', 'grammar', 'Ordena la frase diferenciando Present Continuous:', ['He', 'is', 'writing', 'right', 'now.'], '"He is writing right now." (acción que ocurre ahora mismo).'),
  tf('5p-sa1-tf1', '5p', '5p-sa1-school', 'grammar', 'She is studying Maths every day.', false, 'Tiene un fallo: "every day" es una rutina → Present Simple ("She studies Maths every day.").'),

  builder('5p-sa2-wb1', '5p', '5p-sa2-in-nature', 'grammar', 'Forma comparativos y superlativos regulares:', [
    { left: 'tall', right: 'er' },
    { left: 'long', right: 'est' },
    { left: 'bigg', right: 'er' },
  ], 'tall + er = taller, long + est = longest, bigg + er = bigger.'),
  odd('5p-sa2-odd1', '5p', '5p-sa2-in-nature', 'vocabulary', '¿Cuál NO es un lugar natural?', ['mountain', 'valley', 'forest', 'supermarket'], 'supermarket', '"Supermarket" es una tienda de la ciudad, no un lugar natural.'),
  order('5p-sa2-ord1', '5p', '5p-sa2-in-nature', 'grammar', 'Ordena la frase comparativa:', ['That', 'mountain', 'is', 'higher', 'than', 'this', 'hill.'], '"That mountain is higher than this hill." (-er + than).'),
  tf('5p-sa2-tf1', '5p', '5p-sa2-in-nature', 'grammar', 'The Nile is the most longest river.', false, 'Tiene un fallo: no mezclamos "most" con "-est" → "the longest river".'),

  odd('5p-sa3-odd1', '5p', '5p-sa3-carnival', 'vocabulary', '¿Cuál NO es un adjetivo de personalidad?', ['cheerful', 'shy', 'brave', 'parade'], 'parade', '"Parade" (desfile) es un sustantivo, no un adjetivo de personalidad.'),
  order('5p-sa3-ord1', '5p', '5p-sa3-carnival', 'grammar', 'Ordena la frase en pasado con There were:', ['There', 'were', 'many', 'people', 'yesterday.'], '"There were many people yesterday." (plural en pasado).'),
  tf('5p-sa3-tf1', '5p', '5p-sa3-carnival', 'grammar', 'Were you at the carnival? Yes, I was.', true, 'Correcta: con "I" respondemos "Yes, I was.".'),

  odd('5p-sa4-odd1', '5p', '5p-sa4-my-weekend', 'irregular_verbs', '¿Cuál de estos pasados es REGULAR (los otros 3 son irregulares)?', ['went', 'saw', 'ate', 'played'], 'played', '"Played" es regular (-ed); went, saw y ate son verbos irregulares.'),
  order('5p-sa4-ord1', '5p', '5p-sa4-my-weekend', 'grammar', 'Ordena la pregunta en Past Simple:', ['Did', 'you', 'go', 'to', 'the', 'cinema?'], '"Did you go to the cinema?" (Did + sujeto + verbo base).'),
  tf('5p-sa4-tf1', '5p', '5p-sa4-my-weekend', 'grammar', "I didn't saw my friends yesterday.", false, 'Tiene un fallo: detrás de "didn\'t" el verbo va en infinitivo ("I didn\'t see...").'),

  odd('5p-sa5-odd1', '5p', '5p-sa5-wild-animals', 'vocabulary', '¿Qué animal NO vive en el mar?', ['whale', 'shark', 'octopus', 'cheetah'], 'cheetah', '"Cheetah" (guepardo) es un animal terrestre de la sabana.'),
  order('5p-sa5-ord1', '5p', '5p-sa5-wild-animals', 'grammar', 'Ordena la frase con superlativo irregular:', ['The', 'cheetah', 'is', 'the', 'best', 'runner.'], '"The cheetah is the best runner." (good → better → the best).'),
  tf('5p-sa5-tf1', '5p', '5p-sa5-wild-animals', 'grammar', 'Dolphins are gooder swimmers than bears.', false, 'Tiene un fallo: el comparativo de "good" es irregular → "better".'),

  builder('5p-sa6-wb1', '5p', '5p-sa6-adventures', 'vocabulary', 'Forma palabras compuestas de aventura y deporte:', [
    { left: 'ruck', right: 'sack' },
    { left: 'water', right: 'proof' },
    { left: 'skate', right: 'board' },
  ], 'ruck + sack = rucksack, water + proof = waterproof, skate + board = skateboard.'),
  order('5p-sa6-ord1', '5p', '5p-sa6-adventures', 'grammar', 'Ordena la frase en futuro con going to:', ['We', 'are', 'going', 'to', 'climb', 'a', 'mountain.'], '"We are going to climb a mountain." (are + going to + verbo).'),
  tf('5p-sa6-tf1', '5p', '5p-sa6-adventures', 'grammar', 'She is going to travel by canoe tomorrow.', true, 'Correcta: "She is going to + verbo base".'),

  // ===================== 6º DE PRIMARIA =====================
  odd('6p-st-odd1', '6p', '6p-starter', 'vocabulary', '¿Qué palabra describe un rasgo físico y NO de carácter?', ['confident', 'hard-working', 'talkative', 'freckles'], 'freckles', '"Freckles" (pecas) es un rasgo físico.'),
  tf('6p-st-tf1', '6p', '6p-starter', 'grammar', 'I am very exciting about the trip!', false, 'Tiene un fallo: para cómo te sientes tú usamos "-ed" ("I am very excited!").'),

  builder('6p-sa1-wb1', '6p', '6p-sa1-professions', 'vocabulary', 'Forma nombres de profesiones y oficios:', [
    { left: 'fire', right: 'fighter' },
    { left: 'foot', right: 'baller' },
    { left: 'baby', right: 'sitter' },
  ], 'fire + fighter = firefighter, foot + baller = footballer, baby + sitter = babysitter.'),
  order('6p-sa1-ord1', '6p', '6p-sa1-professions', 'grammar', 'Ordena la frase sobre planes de futuro:', ['I', 'am', 'going', 'to', 'be', 'an', 'engineer.'], '"I am going to be an engineer.".'),
  tf('6p-sa1-tf1', '6p', '6p-sa1-professions', 'grammar', 'A pilot fly aeroplanes around the world.', false, 'Tiene un fallo: en 3ª persona singular "fly" cambia a "flies".'),

  odd('6p-sa2-odd1', '6p', '6p-sa2-past-time', 'vocabulary', '¿Qué expresión temporal NO se refiere al pasado?', ['yesterday', 'last week', 'two days ago', 'tomorrow'], 'tomorrow', '"Tomorrow" (mañana) se refiere al futuro.'),
  order('6p-sa2-ord1', '6p', '6p-sa2-past-time', 'grammar', 'Ordena la pregunta en Past Simple:', ['Where', 'did', 'you', 'go', 'last', 'summer?'], '"Where did you go last summer?" (Wh- + did + sujeto + verbo base).'),
  tf('6p-sa2-tf1', '6p', '6p-sa2-past-time', 'grammar', "They didn't understand the question.", true, 'Correcta: "didn\'t" + verbo en infinitivo ("understand").'),

  order('6p-sa3-ord1', '6p', '6p-sa3-comparatives', 'grammar', 'Ordena la frase con superlativo largo:', ['This', 'is', 'the', 'most', 'expensive', 'watch.'], '"This is the most expensive watch." (the most + adjetivo largo).'),
  tf('6p-sa3-tf1', '6p', '6p-sa3-comparatives', 'grammar', "Today's weather is worse than yesterday's.", true, 'Correcta: "worse" es el comparativo irregular de "bad".'),

  builder('6p-sa4-wb1', '6p', '6p-sa4-health', 'vocabulary', 'Forma palabras compuestas de salud:', [
    { left: 'head', right: 'ache' },
    { left: 'tooth', right: 'ache' },
    { left: 'stomach', right: 'ache' },
  ], 'head + ache = headache, tooth + ache = toothache, stomach + ache = stomachache.'),
  order('6p-sa4-ord1', '6p', '6p-sa4-health', 'grammar', 'Ordena el consejo con should:', ['You', 'should', 'drink', 'lots', 'of', 'water.'], '"You should drink lots of water." (should + verbo base).'),
  tf('6p-sa4-tf1', '6p', '6p-sa4-health', 'grammar', 'You should to sleep eight hours.', false, 'Tiene un fallo: después de "should" nunca ponemos "to" ("You should sleep...").'),

  builder('6p-sa5-wb1', '6p', '6p-sa5-environment', 'vocabulary', 'Forma palabras compuestas de naturaleza y tecnología verde:', [
    { left: 'rain', right: 'forest' },
    { left: 'sun', right: 'light' },
    { left: 'wind', right: 'mill' },
  ], 'rain + forest = rainforest, sun + light = sunlight, wind + mill = windmill.'),
  order('6p-sa5-ord1', '6p', '6p-sa5-environment', 'grammar', 'Ordena la norma ecológica con mustn\'t:', ['We', "mustn't", 'throw', 'rubbish', 'in', 'the', 'sea.'], '"We mustn\'t throw rubbish in the sea.".'),
  tf('6p-sa5-tf1', '6p', '6p-sa5-environment', 'grammar', 'We must protect our rivers and forests.', true, 'Correcta: "must" + verbo base sin "to".'),

  odd('6p-sa6-odd1', '6p', '6p-sa6-culture', 'vocabulary', '¿Qué ciudad NO está en un país de habla inglesa?', ['London', 'New York', 'Sydney', 'Rome'], 'Rome', '"Rome" (Roma) es la capital de Italia.'),
  order('6p-sa6-ord1', '6p', '6p-sa6-culture', 'grammar', 'Ordena la frase sobre viaje en pasado:', ['Last', 'year', 'my', 'aunt', 'flew', 'to', 'London.'], '"Last year my aunt flew to London." (fly → flew).'),
  builder('6p-f3-wb1', '6p', '6p-fest-t3', 'vocabulary', 'Forma palabras compuestas de fin de etapa:', [
    { left: 'class', right: 'mate' },
    { left: 'time', right: 'table' },
    { left: 'pass', right: 'port' },
  ], 'class + mate = classmate, time + table = timetable, pass + port = passport.'),
];
