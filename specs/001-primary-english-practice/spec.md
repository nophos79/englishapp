# Feature Specification: Plataforma de Práctica y Evaluación de Inglés para Primaria (Perfiles Padre y Alumno)

**Feature Branch**: `001-primary-english-practice`

**Created**: 2026-11-22

**Updated**: 2026-11-22

**Status**: Draft

**Input**: User description: "Aplicación web/PWA educativa para practicar todos los conceptos de inglés por curso (3º, 4º, 5º y 6º de Primaria) tal como describen los documentos en Docs/ y en el mismo orden en que se plantea el curso escolar. Incluye perfil Padre protegido por PIN (con soporte para uno o varios perfiles de Alumno en el mismo dispositivo y control parental de unidades activas), perfil Alumno con medidas anti-trampas para que no pueda ver soluciones por adelantado ni alterar resultados, y generador de exámenes a medida de ciertas unidades con historial completo de intentos para el Padre."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Perfil Padre (cuenta familiar y PIN), gestión de alumnos y control del ritmo escolar (Priority: P1)

Un padre o madre crea o inicia sesión en su cuenta familiar (única cuenta con credenciales; los hijos no tienen cuenta ni email) y configura su PIN parental para proteger la zona de Padres en dispositivos compartidos. Da de alta uno o varios perfiles de Alumno (por ejemplo, un hijo en 3º de Primaria y otra hija en 5º de Primaria, usando solo apodo, avatar y curso). Desde el Perfil Padre —ya sea en su propio móvil, ordenador o en la tablet familiar— puede activar o bloquear las Situaciones de Aprendizaje (SA) siguiendo el orden exacto del curso escolar y consultar el historial real y sincronizado de cada alumno.

**Why this priority**: Es la base organizativa y de gobernanza que separa claramente las funciones de control/evaluación del adulto de la experiencia de estudio del menor, permitiendo gestionar todo desde el dispositivo del Padre con respaldo sincronizado e inmutable.

**Independent Test**: Se puede probar iniciando sesión con la cuenta familiar en dos dispositivos (o dos sesiones), configurando el PIN parental, creando dos perfiles de alumno en cursos distintos, activando únicamente hasta la SA 2 del Primer Trimestre para uno de ellos, entrando en su perfil de Alumno en el otro dispositivo y comprobando que solo puede practicar las unidades habilitadas en el orden escolar y que no puede acceder al Perfil Padre sin introducir el PIN correcto.

**Acceptance Scenarios**:

1. **Given** la aplicación se abre por primera vez sin sesión familiar, **When** el adulto se registra o inicia sesión en la cuenta familiar y completa el asistente inicial, **Then** establece un PIN parental y crea al menos un perfil de Alumno con apodo, avatar y curso (3º, 4º, 5º o 6º de Primaria).
2. **Given** existe una sesión familiar activa en un dispositivo compartido, **When** alguien intenta acceder a la zona de Padres desde la pantalla de selección o desde un perfil de Alumno, **Then** el sistema exige el PIN parental y bloquea el acceso si el PIN es incorrecto.
3. **Given** el Padre está en la gestión curricular de un Alumno (incluso desde su propio móvil u ordenador), **When** marca qué unidades (Starter, SA 1 a SA 6 y Festivities de cada trimestre) están activas o bloqueadas, **Then** el itinerario del Alumno en cualquiera de los dispositivos vinculados refleja ese estado manteniendo siempre el orden oficial del curso escolar.
4. **Given** existen varios perfiles de Alumno en la cuenta familiar, **When** se cambia de un alumno a otro, **Then** cada alumno mantiene completamente aislados su curso, sus unidades activas, su progreso, sus errores pendientes y sus exámenes.

---

### User Story 2 - Practicar el itinerario del curso escolar en orden exacto sin posibilidad de hacer trampas (Priority: P1)

Un estudiante entra en su perfil de Alumno, ve el recorrido de su curso en el mismo orden en que se imparte durante el año escolar (First Term: Starter, SA 1, SA 2, Halloween/Christmas → Second Term: SA 3, SA 4, St. Patrick/Easter → Third Term: SA 5, SA 6, Summer) y practica todos los conceptos de vocabulario y gramática de las unidades activas sin poder consultar respuestas por adelantado ni modificar respuestas ya corregidas para inflar su puntuación.

**Why this priority**: Es el núcleo pedagógico de la aplicación (MVP). Garantiza que el alumno practique exactamente lo que toca en su curso y en orden, con retroalimentación honesta y útil.

**Independent Test**: Se puede probar entrando en un perfil de Alumno (por ejemplo, 5º de Primaria), iniciando una sesión de práctica en `SA 1: School`, verificando que no existe botón de "ver solución" antes de responder, respondiendo preguntas (aciertos y fallos), comprobando que las respuestas enviadas quedan bloqueadas, y repitiendo la sesión para confirmar que el orden de preguntas y opciones se aleatoriza y que ambos intentos quedan registrados en el historial del Padre.

**Acceptance Scenarios**:

1. **Given** el Alumno entra en su perfil, **When** visualiza su curso, **Then** ve los tres trimestres y sus Situaciones de Aprendizaje en el orden cronológico exacto del curso escolar, distinguiendo claramente las unidades activas de las bloqueadas por el Padre y mostrando el tema de vocabulario y gramática de cada una.
2. **Given** el Alumno inicia una sesión de práctica en una SA activa, **When** se le presenta un ejercicio de vocabulario o gramática, **Then** no puede ver la solución ni pistas que revelen la respuesta antes de enviar su propia contestación.
3. **Given** el Alumno envía su respuesta en modo práctica, **When** el sistema la evalúa, **Then** queda bloqueada (no editable en esa sesión), muestra refuerzo positivo si acierta o la respuesta correcta con explicación breve en español si falla, y registra el resultado real del intento.
4. **Given** el Alumno repite una misma SA, **When** inicia una nueva sesión, **Then** el orden de las preguntas y de las opciones de respuesta se aleatoriza para evitar la memorización mecánica de posiciones.

---

### User Story 3 - Generar y realizar exámenes a medida de unidades seleccionadas (Priority: P2)

El Padre entra en su zona protegida por PIN para preparar un examen de repaso antes de una prueba del colegio: selecciona el alumno, elige una o varias unidades específicas (por ejemplo, `SA 1 + SA 2` del 1er Trimestre o `SA 3 + SA 4 + Verbos Irregulares`), define el tipo de contenidos (vocabulario, gramática o mixto) y el número de preguntas. El examen queda asignado al Alumno, quien lo realiza en condiciones reales de examen (sin soluciones ni pistas durante la prueba). Al entregarlo, el Alumno ve su nota y la revisión de fallos, pero el intento queda bloqueado e inmutable en el historial del Padre (incluyendo fecha, hora, nota, respuestas y abandonos).

**Why this priority**: Responde directamente a una necesidad clave planteada para evaluar conocimientos antes de exámenes escolares con total fiabilidad para las familias.

**Independent Test**: Se puede probar creando desde el Perfil Padre un examen de 10 preguntas combinando `SA 1` y `SA 2`, cambiando al Perfil Alumno para realizarlo, comprobando que durante el examen no se muestra corrección ni se permite consultar bancos de ayuda, entregando el examen para verificar que el Alumno ve su nota y fallos con el intento ya cerrado, y entrando de nuevo al Perfil Padre para revisar el detalle completo del intento (y probar también un abandono a mitad de examen para confirmar que queda registrado).

**Acceptance Scenarios**:

1. **Given** el Padre accede al Generador de Exámenes, **When** selecciona un alumno, una o varias unidades/bancos de su curso, el enfoque (vocabulario, gramática o mixto) y la cantidad de preguntas, **Then** el sistema genera un examen único con preguntas aleatorizadas de esas unidades y lo asigna como pendiente al Alumno.
2. **Given** el Alumno tiene un examen pendiente y lo inicia, **When** responde a las preguntas, **Then** el sistema oculta soluciones, explicaciones y acceso a bancos de consulta (diccionario/expresiones/verbos) hasta que el examen sea entregado.
3. **Given** el Alumno termina el examen y pulsa "Entregar examen", **When** confirma la entrega, **Then** el sistema califica el examen, muestra al Alumno su nota final y la revisión detallada de aciertos y fallos, y bloquea ese intento de forma permanente.
4. **Given** el Alumno abandona o cierra un examen iniciado sin entregarlo, **When** el Padre consulta el historial de exámenes, **Then** el intento aparece registrado como "Incompleto / Abandonado" junto con la fecha, hora y preguntas contestadas hasta ese momento.
5. **Given** el Padre revisa un examen completado en su panel, **When** abre el detalle del intento, **Then** visualiza la fecha, hora, duración, nota, desglose pregunta a pregunta (qué respondió el alumno vs. respuesta correcta) y qué unidades necesitan refuerzo.

---

### User Story 4 - Banco de Verbos Irregulares, Expresiones Útiles y Vocabulario Bilingüe (Priority: P2)

El estudiante dispone de acceso a los bancos transversales de su ciclo —Verbos Irregulares (infinitivo, pasado simple, participio y español), Expresiones Útiles (*Expression Bank*) y Vocabulario Bilingüe (*Wordlist*)— para estudiar y entrenarse, estando estos recursos bloqueados automáticamente mientras hay un examen en curso para impedir copias.

**Why this priority**: Los documentos de `Docs/` incluyen estos tres bancos como pilares del aprendizaje en 2º y 3º Ciclo; integrarlos con modo consulta y modo práctica (y bloquearlos en exámenes) aporta gran valor educativo sin comprometer la integridad.

**Independent Test**: Se puede probar abriendo el Banco de Verbos Irregulares y el de Expresiones Útiles en modo estudio para buscar en inglés o español y completar una práctica rápida, y verificando que durante un examen activo el alumno no puede abrir dichos bancos.

**Acceptance Scenarios**:

1. **Given** el Alumno está en modo estudio (fuera de un examen activo), **When** abre el Banco de Verbos Irregulares, Expresiones Útiles o Vocabulario Bilingüe y busca un término en inglés o español, **Then** obtiene los resultados filtrados al instante con su traducción y formas verbales correspondientes.
2. **Given** el Alumno inicia una práctica rápida de Verbos Irregulares o Expresiones, **When** responde cada ítem, **Then** se aplican las mismas reglas anti-trampas del modo práctica (sin ver la solución antes de contestar, respuesta bloqueada tras evaluar y orden aleatorio).
3. **Given** el Alumno está realizando un examen activo, **When** intenta navegar a los bancos de consulta, **Then** el acceso a consulta permanece deshabilitado hasta que entregue o abandone el examen.

---

### User Story 5 - Seguimiento de progreso y repaso inteligente de errores (Priority: P3)

Cada Alumno ve de forma motivadora su avance en el itinerario del curso (unidades practicadas, estrellas y racha) y dispone de un modo "Repasar mis errores" que agrupa automáticamente los ítems fallados tanto en práctica como en exámenes para reforzarlos hasta dominarlos, sin poder borrar manualmente su historial de fallos.

**Why this priority**: Convierte los fallos detectados en sesiones de práctica y exámenes en un plan de refuerzo automático, cerrando el ciclo de aprendizaje.

**Independent Test**: Se puede probar fallando varios ítems en una SA y en un examen, comprobando que el Alumno no puede borrar dichos fallos, iniciando "Repasar mis errores" para practicarlos y verificando que solo desaparecen de la cola al responderlos correctamente.

**Acceptance Scenarios**:

1. **Given** el Alumno ha fallado ítems en prácticas o exámenes anteriores, **When** accede a "Repasar mis errores", **Then** el sistema genera una sesión con esos ítems pendientes en orden aleatorio.
2. **Given** el Alumno acierta un ítem en "Repasar mis errores", **When** finaliza la sesión, **Then** el ítem se marca como superado (dejando de figurar como pendiente), mientras que el historial original de sesiones y exámenes para el Padre permanece intacto.
3. **Given** el Alumno no tiene errores pendientes, **When** abre "Repasar mis errores", **Then** el sistema le felicita y le sugiere continuar con la siguiente SA activa o practicar verbos irregulares.

---

### User Story 6 - Funcionamiento sin conexión (offline), sincronización automática y pronunciación en inglés (Priority: P4)

El estudiante puede estudiar, realizar exámenes ya asignados y escuchar la pronunciación en inglés de palabras, expresiones y ejemplos en una tablet o móvil incluso sin conexión a internet. Todos los intentos realizados sin conexión se guardan de forma segura en el dispositivo y se sincronizan automáticamente con la cuenta familiar en cuanto vuelve la conexión, apareciendo en el panel del Padre.

**Why this priority**: Asegura que la app sea utilizable en cualquier entorno doméstico o viaje con conectividad irregular, combina lo mejor del modo offline con el control remoto familiar y refuerza la comprensión oral y pronunciación.

**Independent Test**: Se puede probar desconectando internet tras sincronizar un examen asignado, completando una sesión de práctica y el examen sin red, pulsando el botón de audio en vocabulario y expresiones, reconectando internet y verificando que los intentos aparecen automáticamente en el Perfil Padre en otro dispositivo.

**Acceptance Scenarios**:

1. **Given** la aplicación ya se ha sincronizado al menos una vez en el dispositivo, **When** se desconecta internet, **Then** el Alumno puede seguir practicando sus unidades activas, realizando exámenes ya descargados y guardando sus resultados sin errores.
2. **Given** el Alumno ha completado sesiones o exámenes mientras estaba sin conexión, **When** el dispositivo recupera conexión a internet, **Then** el sistema sincroniza automáticamente los intentos pendientes con la cuenta familiar sin duplicarlos ni perder datos.
3. **Given** el Alumno visualiza vocabulario, expresiones o verbos en modo estudio o revisión, **When** pulsa escuchar pronunciación, **Then** escucha la pronunciación en inglés (o recibe un aviso claro si el dispositivo no dispone de voz).

---

### Edge Cases

- **Intento de eludir un examen recargando o cerrando la pestaña**: Si el Alumno recarga la página o cierra la app con un examen en curso, al volver a entrar el examen sigue activo en el punto donde estaba (o si lo abandona explícitamente, queda registrado como "Abandonado" en el historial del Padre); nunca permite reiniciar el mismo intento para borrar respuestas falladas.
- **Intento de volver atrás en una pregunta ya corregida**: En modo práctica, una vez pulsado "Comprobar", el alumno no puede modificar la opción ni retroceder para cambiar una respuesta ya evaluada y sumar puntos falsos.
- **Acceso a unidades bloqueadas**: Si una SA está bloqueada por el Padre, el Alumno la ve en el itinerario del curso con un candado y su título (para conocer la secuencia del año escolar), pero no puede abrir sus ejercicios ni ver sus contenidos internos.
- **Variaciones menores de escritura**: En ejercicios de escribir texto (huecos o verbos irregulares), el sistema ignora espacios sobrantes y mayúsculas/minúsculas y acepta variantes válidas definidas (por ejemplo, `isn't` / `is not`, `learnt` / `learned`), pero no regala el acierto ante errores ortográficos reales.
- **PIN parental olvidado**: Existe un flujo documentado de recuperación o restablecimiento de PIN (por ejemplo, pregunta de seguridad configurada al crear el PIN o restablecimiento completo protegido), evitando que un niño pueda saltarse el PIN con un simple clic.
- **Examen sin suficientes preguntas en las unidades elegidas**: Si el Padre solicita más preguntas de las disponibles en la combinación de unidades seleccionada, el sistema avisa claramente del máximo disponible y ajusta el límite sin producir errores.
- **Intento de borrar el historial limpiando el navegador**: Aunque se borren los datos del navegador en la tablet o se cambie de dispositivo, al volver a abrir la cuenta familiar todo el historial de intentos y exámenes se recupera intacto desde el respaldo remoto sincronizado.
- **Reinicio de progreso**: Solo el Padre (tras autenticar su PIN y confirmar explícitamente) puede reiniciar el progreso de un alumno o eliminar un perfil; el Alumno nunca tiene acceso a estas acciones.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST ofrecer una **cuenta familiar** administrada por el Padre y dos roles claramente separados en cada dispositivo vinculado: **Perfil Padre** (protegido por PIN parental) y **Perfil Alumno** (con soporte para uno o varios alumnos independientes identificados solo por apodo, avatar y curso, sin email ni datos personales del menor).
- **FR-002**: El sistema MUST exigir el PIN parental para acceder a todas las funciones administrativas: crear/editar perfiles de alumno, activar/bloquear unidades, generar exámenes, consultar el historial completo de intentos, previsualizar solucionarios y reiniciar datos.
- **FR-003**: El sistema MUST organizar el currículo completo de 3º, 4º, 5º y 6º de Educación Primaria en el orden cronológico exacto del curso escolar documentado en `Docs/` (First Term → Second Term → Third Term, con Starter, SA 1 a SA 6 y Festivities: Halloween/Christmas, St. Patrick/Easter y Summer), cubriendo todos los bloques de vocabulario y gramática de cada unidad.
- **FR-004**: El sistema MUST permitir al Padre asignar un curso principal por defecto a cada Alumno y activar o bloquear unidades individuales (o un curso completo para repaso, o "hasta esta unidad") en cualquiera de los 4 cursos (3º, 4º, 5º y 6º), permitiendo al Alumno navegar entre cursos para repasar cursos anteriores manteniendo siempre visible el orden escolar del itinerario.
- **FR-005**: El sistema MUST ofrecer en el Perfil Alumno sesiones de práctica interactiva por SA con ejercicios variados de vocabulario y gramática (al menos: opción múltiple, completar huecos y emparejar).
- **FR-006**: El sistema MUST impedir que el Alumno vea soluciones o claves de respuesta por adelantado: en modo práctica, la corrección y explicación breve en español solo aparecen tras enviar la respuesta, bloqueando esa respuesta para que no pueda editarse; en modo examen, no se muestra ninguna corrección hasta entregar el examen completo.
- **FR-007**: El sistema MUST aleatorizar el orden de las preguntas y de las opciones de respuesta en cada nueva sesión de práctica o examen generado para evitar que el alumno memorice posiciones.
- **FR-008**: El sistema MUST proporcionar al Padre un **Generador de Exámenes** que permita seleccionar un alumno, elegir una o varias unidades/bancos de su curso, escoger el enfoque (vocabulario, gramática o mixto) y definir el número de preguntas, asignando el examen resultante al Alumno.
- **FR-009**: Durante un examen activo en el Perfil Alumno, el sistema MUST bloquear el acceso a los bancos de consulta (vocabulario, expresiones y verbos) y impedir reiniciar el intento; al entregar el examen, MUST mostrar al Alumno su nota final y revisión de fallos y marcar el intento como cerrado e inmutable.
- **FR-010**: El sistema MUST registrar un historial completo e inmutable de todas las sesiones de práctica y todos los intentos de examen (fecha, hora, duración, unidades evaluadas, puntuación, desglose pregunta a pregunta y estado: completado o abandonado) sincronizado con la cuenta familiar remota, consultable desde cualquier dispositivo del Padre y no borrable ni alterable por el Alumno (ni siquiera borrando datos del navegador).
- **FR-011**: El sistema MUST incluir los bancos transversales bilingües (Verbos Irregulares con infinitivo/pasado/participio/español, Expresiones Útiles y Vocabulario Bilingüe) con búsqueda instantánea en inglés y español y modo práctica sujeto a las mismas reglas anti-trampas.
- **FR-012**: El sistema MUST registrar automáticamente los ítems fallados por cada Alumno y ofrecer un modo "Repasar mis errores" que refuerce dichos ítems hasta que sean acertados, sin alterar el historial histórico de resultados visto por el Padre.
- **FR-013**: El sistema MUST ofrecer reproducción de pronunciación en inglés en tarjetas de vocabulario, expresiones y verbos (con degradación elegante si el dispositivo no soporta voz) y deshabilitar la ayuda si compromete un ejercicio de escritura en examen.
- **FR-014**: El sistema MUST sincronizar automáticamente perfiles, configuración de unidades, exámenes asignados, cola de errores e historial entre los dispositivos de la cuenta familiar, y MUST seguir funcionando sin conexión a internet (offline) tras la primera carga encolando los nuevos intentos para sincronizarlos al recuperar conectividad.
- **FR-015**: La interfaz MUST ser responsive desde móvil (360 px) hasta tablet y escritorio, con controles táctiles amplios (mínimo 44×44 px), alto contraste, textos claros en español para instrucciones y cero anuncios o rastreo de terceros.

### Key Entities

- **Configuración Parental (ParentalConfig)**: Contiene la credencial protegida del PIN parental, pregunta/mecanismo de recuperación y preferencias generales de la familia en el dispositivo.
- **Perfil de Alumno (StudentProfile)**: Identifica a un alumno local mediante apodo, avatar, curso asignado (3º, 4º, 5º o 6º de Primaria) y su configuración de unidades habilitadas/bloqueadas.
- **Curso y Trimestre (Course / Term)**: Estructura oficial de 2º Ciclo (3º–4º) y 3º Ciclo (5º–6º) dividida en First, Second y Third Term con orden secuencial estricto.
- **Situación de Aprendizaje (LearningUnit / SA)**: Unidad curricular ordenada dentro de un curso y trimestre (Starter, SA 1..6, Festivities) con sus objetivos de vocabulario, gramática y banco de ejercicios.
- **Ejercicio (ExerciseItem)**: Ítem interactivo vinculado a una SA o banco transversal; define tipo (opción múltiple, completar hueco, emparejar), enunciado, respuestas válidas aceptadas y explicación pedagógica en español.
- **Entrada Bilingüe (ReferenceEntry)**: Elemento de estudio y práctica del Vocabulario Bilingüe, Banco de Expresiones o Tabla de Verbos Irregulares.
- **Examen Personalizado (CustomExam)**: Examen generado por el Padre para un alumno concreto a partir de una selección de unidades/bancos, enfoque de habilidades, número de preguntas y estado (pendiente, en curso, completado, abandonado).
- **Registro de Intento (AttemptRecord)**: Registro inmutable de una sesión de práctica o un examen con fecha/hora de inicio y fin, estado (completado/abandonado), calificación y detalle de cada respuesta dada por el alumno.
- **Cola de Errores (MistakeQueue)**: Conjunto de ítems fallados por un alumno pendientes de repaso dirigido hasta lograr su dominio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un padre/madre puede configurar el PIN parental, crear un perfil de Alumno y habilitar las unidades correspondientes a su trimestre actual en menos de 2 minutos.
- **SC-002**: El 100% de las Situaciones de Aprendizaje del currículo de 3º, 4º y 5º de Primaria (y bloques clave de 6º) aparecen en el orden escolar exacto documentado en `Docs/`, respetando en el 100% de los casos los bloqueos configurados por el Padre.
- **SC-003**: El 0% de las pantallas de práctica o examen del Perfil Alumno muestran soluciones antes de enviar la respuesta o permiten editar una respuesta ya evaluada; el 100% de los intentos (incluidos abandonos de examen) quedan reflejados en el historial del Padre.
- **SC-004**: Un padre/madre puede generar y asignar un examen personalizado combinando 2 o más unidades en menos de 45 segundos, y consultar el desglose completo de respuestas del alumno inmediatamente tras la entrega.
- **SC-005**: El 100% de los flujos principales (práctica, realización de exámenes asignados, consulta de bancos en modo estudio y panel de Padres) funcionan completamente sin conexión tras la primera carga sin pérdida de datos al reabrir la aplicación.
- **SC-006**: Las búsquedas en los bancos bilingües y la evaluación de cada pregunta responden en menos de 1 segundo, y al menos el 90% de las interacciones se completan sin desplazamientos horizontales ni solapamientos en pantallas desde 360 px hasta escritorio.

## Assumptions

- **Sincronización familiar y almacenamiento ligero**: Solo el Padre dispone de credenciales de acceso a la cuenta familiar para sincronizar perfiles, exámenes asignados e historial inmutable entre dispositivos (móvil/PC del Padre y tablet del Alumno). Los contenidos curriculares estáticos y la síntesis de pronunciación residen en la propia aplicación para garantizar carga rápida, uso sin conexión y un consumo mínimo de almacenamiento remoto.
- **Seguridad del PIN en dispositivos compartidos**: El PIN parental protege la zona administrativa frente al acceso del menor (8–12 años) en dispositivos compartidos con sesión familiar iniciada, mientras que la inmutabilidad del historial está garantizada por el respaldo remoto.
- **Idioma**: Interfaz, avisos, panel de Padres y explicaciones pedagógicas en español; contenidos de aprendizaje, enunciados de práctica y pronunciación en inglés.
- **Cobertura inicial de ejercicios**: Todas las SA de 3º, 4º, 5º y 6º estarán representadas en orden escolar con un banco inicial sólido de ejercicios originales (vocabulario y gramática) suficiente para practicar y generar exámenes variados por unidad, ampliable incrementalmente.
- **Propiedad intelectual**: Los documentos de `Docs/` sirven como guía curricular oficial y referencia de temario; todos los ejercicios y frases de la app se redactarán como material educativo original.
