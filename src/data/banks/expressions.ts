import type { ExpressionEntry } from '../../domain/types';

export const expressionsBank: ExpressionEntry[] = [
  // Saludos y despedidas
  { id: 'exp-01', english: 'Hi. / Hello.', spanish: 'Hola.', category: 'Saludos', minCycle: 2 },
  { id: 'exp-02', english: 'How are you?', spanish: '¿Cómo estás? / ¿Qué tal?', category: 'Saludos', minCycle: 2 },
  { id: 'exp-03', english: 'Nice to meet you.', spanish: 'Encantado/a de conocerte.', category: 'Saludos', minCycle: 2 },
  { id: 'exp-04', english: 'Bye.', spanish: 'Adiós.', category: 'Saludos', minCycle: 2 },
  { id: 'exp-05', english: 'See you soon.', spanish: 'Hasta pronto.', category: 'Saludos', minCycle: 2 },
  { id: 'exp-06', english: 'See you then.', spanish: 'Nos vemos allí.', category: 'Saludos', minCycle: 3 },
  { id: 'exp-07', english: 'Have a good time!', spanish: '¡Que lo pases / paséis bien!', category: 'Saludos', minCycle: 2 },
  { id: 'exp-08', english: 'Excuse me.', spanish: 'Disculpe. / Perdona.', category: 'Saludos', minCycle: 2 },
  { id: 'exp-09', english: 'No problem.', spanish: 'Ningún problema.', category: 'Saludos', minCycle: 2 },
  { id: 'exp-10', english: 'Yes, please.', spanish: 'Sí, gracias.', category: 'Saludos', minCycle: 2 },
  { id: 'exp-11', english: 'Yes, OK.', spanish: 'Sí, vale.', category: 'Saludos', minCycle: 2 },
  { id: 'exp-12', english: 'No, sorry.', spanish: 'No, lo siento.', category: 'Saludos', minCycle: 2 },

  // Información personal
  { id: 'exp-13', english: "What's your name?", spanish: '¿Cómo te llamas?', category: 'Información personal', minCycle: 2 },
  { id: 'exp-14', english: "My name's ...", spanish: 'Me llamo ...', category: 'Información personal', minCycle: 2 },
  { id: 'exp-15', english: 'How old are you?', spanish: '¿Cuántos años tienes?', category: 'Información personal', minCycle: 2 },
  { id: 'exp-16', english: "I'm ten years old.", spanish: 'Tengo diez años.', category: 'Información personal', minCycle: 2 },
  { id: 'exp-17', english: 'Where are you from?', spanish: '¿De dónde eres?', category: 'Información personal', minCycle: 2 },
  { id: 'exp-18', english: 'What nationality are you?', spanish: '¿De qué nacionalidad eres?', category: 'Información personal', minCycle: 3 },
  { id: 'exp-19', english: "When's your birthday?", spanish: '¿Cuándo es tu cumpleaños?', category: 'Información personal', minCycle: 2 },

  // Aula y estudio
  { id: 'exp-20', english: 'Be quiet, please.', spanish: 'Silencio, por favor.', category: 'Aula', minCycle: 2 },
  { id: 'exp-21', english: 'Listen to me.', spanish: 'Escúchame / Escuchadme.', category: 'Aula', minCycle: 2 },
  { id: 'exp-22', english: 'Find page ten.', spanish: 'Ve / Id a la página diez.', category: 'Aula', minCycle: 2 },
  { id: 'exp-23', english: "I don't understand.", spanish: 'No entiendo.', category: 'Aula', minCycle: 2 },
  { id: 'exp-24', english: 'How do you spell biscuit?', spanish: '¿Cómo se escribe galleta?', category: 'Aula', minCycle: 2 },
  { id: 'exp-25', english: 'Look in your dictionary.', spanish: 'Busca en el diccionario.', category: 'Aula', minCycle: 2 },

  // Hora y tiempo
  { id: 'exp-26', english: 'What time is it?', spanish: '¿Qué hora es?', category: 'Hora y tiempo', minCycle: 2 },
  { id: 'exp-27', english: "It's eight o'clock.", spanish: 'Son las ocho en punto.', category: 'Hora y tiempo', minCycle: 2 },
  { id: 'exp-28', english: "It's quarter past one.", spanish: 'Es la una y cuarto.', category: 'Hora y tiempo', minCycle: 2 },
  { id: 'exp-29', english: "It's half past seven.", spanish: 'Son las siete y media.', category: 'Hora y tiempo', minCycle: 2 },
  { id: 'exp-30', english: "It's quarter to three.", spanish: 'Son las tres menos cuarto.', category: 'Hora y tiempo', minCycle: 2 },
  { id: 'exp-31', english: "It's six thirty.", spanish: 'Son las seis y media.', category: 'Hora y tiempo', minCycle: 2 },
  { id: 'exp-32', english: 'What time is breakfast?', spanish: '¿A qué hora es el desayuno?', category: 'Hora y tiempo', minCycle: 2 },
  { id: 'exp-33', english: 'When is it?', spanish: '¿Cuándo es?', category: 'Hora y tiempo', minCycle: 2 },
  { id: 'exp-34', english: 'Which date and place?', spanish: '¿Qué fecha y lugar?', category: 'Hora y tiempo', minCycle: 3 },

  // Gustos y opiniones
  { id: 'exp-35', english: 'Do you like music?', spanish: '¿Te gusta la música?', category: 'Gustos y opiniones', minCycle: 2 },
  { id: 'exp-36', english: 'What do you like?', spanish: '¿Qué te gusta?', category: 'Gustos y opiniones', minCycle: 2 },
  { id: 'exp-37', english: 'What type of films do you like?', spanish: '¿Qué tipo de películas te gusta?', category: 'Gustos y opiniones', minCycle: 3 },
  { id: 'exp-38', english: 'My favourite film is ...', spanish: 'Mi película preferida es ...', category: 'Gustos y opiniones', minCycle: 2 },
  { id: 'exp-39', english: "What's your favourite instrument?", spanish: '¿Cuál es tu instrumento preferido?', category: 'Gustos y opiniones', minCycle: 2 },
  { id: 'exp-40', english: 'What do you think of this jacket?', spanish: '¿Qué te parece esta chaqueta?', category: 'Gustos y opiniones', minCycle: 3 },
  { id: 'exp-41', english: 'What about this one?', spanish: '¿Qué te parece este?', category: 'Gustos y opiniones', minCycle: 3 },
  { id: 'exp-42', english: 'What about a CD?', spanish: '¿Qué tal un CD?', category: 'Gustos y opiniones', minCycle: 3 },
  { id: 'exp-43', english: 'Look at this phone.', spanish: 'Mira este teléfono.', category: 'Gustos y opiniones', minCycle: 2 },
  { id: 'exp-44', english: 'Good idea!', spanish: '¡Buena idea!', category: 'Gustos y opiniones', minCycle: 2 },
  { id: 'exp-45', english: "That's a great idea.", spanish: '¡Qué buena idea!', category: 'Gustos y opiniones', minCycle: 2 },

  // Tiendas y comida
  { id: 'exp-46', english: 'Can I help you?', spanish: '¿Te puedo ayudar?', category: 'Tiendas y comida', minCycle: 2 },
  { id: 'exp-47', english: 'Anything else?', spanish: '¿Algo más?', category: 'Tiendas y comida', minCycle: 3 },
  { id: 'exp-48', english: 'Here you are.', spanish: 'Aquí tiene.', category: 'Tiendas y comida', minCycle: 2 },
  { id: 'exp-49', english: 'How much is it?', spanish: '¿Cuánto cuesta?', category: 'Tiendas y comida', minCycle: 2 },
  { id: 'exp-50', english: 'How much are they?', spanish: '¿Cuánto cuestan?', category: 'Tiendas y comida', minCycle: 2 },
  { id: 'exp-51', english: "That's five euros, please.", spanish: 'Son cinco euros, por favor.', category: 'Tiendas y comida', minCycle: 2 },
  { id: 'exp-52', english: 'What size is it?', spanish: '¿Qué talla es?', category: 'Tiendas y comida', minCycle: 3 },
  { id: 'exp-53', english: 'Can I have a sandwich, please?', spanish: '¿Me puede poner un bocadillo, por favor?', category: 'Tiendas y comida', minCycle: 2 },
  { id: 'exp-54', english: 'Can I have some cheese, please?', spanish: '¿Me pone algo de queso, por favor?', category: 'Tiendas y comida', minCycle: 2 },
  { id: 'exp-55', english: 'What would you like to eat?', spanish: '¿Qué quiere comer?', category: 'Tiendas y comida', minCycle: 3 },
  { id: 'exp-56', english: 'What would you like to drink?', spanish: '¿Qué quiere beber?', category: 'Tiendas y comida', minCycle: 3 },
  { id: 'exp-57', english: 'What would you like for dessert?', spanish: '¿Qué quiere de postre?', category: 'Tiendas y comida', minCycle: 3 },
  { id: 'exp-58', english: "Let's buy a present.", spanish: '¡Compremos un regalo!', category: 'Tiendas y comida', minCycle: 2 },
  { id: 'exp-59', english: "Let's go shopping.", spanish: 'Vámonos de compras.', category: 'Tiendas y comida', minCycle: 2 },

  // Viajes y direcciones
  { id: 'exp-60', english: "I'd like a ticket to London, please.", spanish: 'Quiero un billete a Londres, por favor.', category: 'Viajes y ciudad', minCycle: 3 },
  { id: 'exp-61', english: 'Where is the café, please?', spanish: '¿Dónde está la cafetería, por favor?', category: 'Viajes y ciudad', minCycle: 2 },
  { id: 'exp-62', english: "I'm looking for the bank.", spanish: 'Estoy buscando el banco.', category: 'Viajes y ciudad', minCycle: 3 },
  { id: 'exp-63', english: 'Is it far from here?', spanish: '¿Está lejos de aquí?', category: 'Viajes y ciudad', minCycle: 3 },
  { id: 'exp-64', english: "It's about ten minutes' walk.", spanish: 'Está a unos diez minutos a pie.', category: 'Viajes y ciudad', minCycle: 3 },

  // Teléfono y cartas
  { id: 'exp-65', english: 'Can I speak to Ana, please?', spanish: '¿Está Ana, por favor?', category: 'Teléfono y cartas', minCycle: 3 },
  { id: 'exp-66', english: "It's Mark. (on the phone)", spanish: 'Soy Mark. (por teléfono)', category: 'Teléfono y cartas', minCycle: 3 },
  { id: 'exp-67', english: "This is Laura. (on the phone)", spanish: 'Soy Laura. (por teléfono)', category: 'Teléfono y cartas', minCycle: 3 },
  { id: 'exp-68', english: "I'm phoning about ...", spanish: 'Llamo para preguntar sobre ...', category: 'Teléfono y cartas', minCycle: 3 },
  { id: 'exp-69', english: 'Dear ...', spanish: 'Querido/a ...', category: 'Teléfono y cartas', minCycle: 2 },
  { id: 'exp-70', english: 'Write soon.', spanish: 'Escríbeme pronto.', category: 'Teléfono y cartas', minCycle: 2 },
  { id: 'exp-71', english: 'Love, Mark.', spanish: 'Un abrazo / Besos, Mark.', category: 'Teléfono y cartas', minCycle: 2 },

  // Pasado y planes futuros
  { id: 'exp-72', english: 'How was your weekend?', spanish: '¿Qué tal tu fin de semana?', category: 'Pasado y planes', minCycle: 3 },
  { id: 'exp-73', english: 'What did you do last weekend?', spanish: '¿Qué hiciste el fin de semana pasado?', category: 'Pasado y planes', minCycle: 3 },
  { id: 'exp-74', english: 'What are you doing on Sunday?', spanish: '¿Qué haces el domingo?', category: 'Pasado y planes', minCycle: 3 },
  { id: 'exp-75', english: 'What are you going to do?', spanish: '¿Qué vas a hacer?', category: 'Pasado y planes', minCycle: 3 },
  { id: 'exp-76', english: 'Are you going to buy it?', spanish: '¿Vas a comprarlo?', category: 'Pasado y planes', minCycle: 3 },
  { id: 'exp-77', english: 'When are you going to go?', spanish: '¿Cuándo vais a ir?', category: 'Pasado y planes', minCycle: 3 },
  { id: 'exp-78', english: 'What time are you going?', spanish: '¿A qué hora vas?', category: 'Pasado y planes', minCycle: 3 },
  { id: 'exp-79', english: "We're going to the museum tomorrow.", spanish: 'Vamos al museo mañana.', category: 'Pasado y planes', minCycle: 3 },
  { id: 'exp-80', english: "We're going to go in the morning.", spanish: 'Vamos a ir por la mañana.', category: 'Pasado y planes', minCycle: 3 },

  // Invitaciones, permisos y ayuda
  { id: 'exp-81', english: 'Would you like to come to my party?', spanish: '¿Quieres venir a mi fiesta?', category: 'Invitaciones y ayuda', minCycle: 3 },
  { id: 'exp-82', english: "Yes, I'd love to.", spanish: 'Sí, me encantaría.', category: 'Invitaciones y ayuda', minCycle: 3 },
  { id: 'exp-83', english: "No, I'm sorry, I can't.", spanish: 'No, lo siento, no puedo.', category: 'Invitaciones y ayuda', minCycle: 2 },
  { id: 'exp-84', english: 'Can you come with me?', spanish: '¿Puedes venir conmigo?', category: 'Invitaciones y ayuda', minCycle: 2 },
  { id: 'exp-85', english: 'Can I go to the park on Saturday?', spanish: '¿Puedo ir al parque el sábado?', category: 'Invitaciones y ayuda', minCycle: 2 },
  { id: 'exp-86', english: 'Can you ski?', spanish: '¿Sabes esquiar?', category: 'Invitaciones y ayuda', minCycle: 2 },
  { id: 'exp-87', english: 'Can you help me with the housework?', spanish: '¿Me puedes ayudar con las tareas de casa?', category: 'Invitaciones y ayuda', minCycle: 3 },
  { id: 'exp-88', english: 'What shall I do?', spanish: '¿Qué hago?', category: 'Invitaciones y ayuda', minCycle: 3 },
  { id: 'exp-89', english: "What's the matter?", spanish: '¿Qué te pasa?', category: 'Invitaciones y ayuda', minCycle: 3 },
];
