# Tasks: Plataforma de Práctica y Evaluación de Inglés para Primaria (Perfiles Padre y Alumno)

**Input**: Design documents from `/specs/001-primary-english-practice/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/supabase-schema.sql](./contracts/supabase-schema.sql), [contracts/repository-contracts.md](./contracts/repository-contracts.md)

**Tests**: Incluidos por mandato del Principio V de [constitution.md](../../.specify/memory/constitution.md) (lógica de dominio, evaluación, anti-trampas, generador de exámenes, cola offline y validación Zod del currículo).

**Organization**: Tareas agrupadas por Historia de Usuario (`US1`–`US6`) para entrega incremental y verificación independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencia de tareas incompletas).
- **[Story]**: Historia de usuario a la que pertenece (`[US1]`..`[US6]`).
- Cada tarea incluye rutas exactas de archivo y cita los campos con restricciones en `data-model.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del proyecto Vite + React + TypeScript + Tailwind + PWA + Vitest/Playwright y migración SQL base.

- [X] T001 Initialize Vite + React 19 + TypeScript 5 project and scripts in `package.json`, `tsconfig.json`, and `vite.config.ts`
- [X] T002 [P] Configure Tailwind CSS 4, base accessible typography, WCAG AA color tokens, and 44x44px touch utilities in `src/index.css`
- [X] T003 [P] Configure `vite-plugin-pwa` manifest, app icons, and Workbox precache strategy in `vite.config.ts` and `public/manifest.webmanifest`
- [X] T004 [P] Configure Vitest + `@testing-library/react` + `fake-indexeddb` in `vitest.config.ts` and Playwright in `playwright.config.ts`
- [X] T005 [P] Copy and track the canonical SQL/RLS migration from `specs/001-primary-english-practice/contracts/supabase-schema.sql` into `supabase/migrations/001_initial_schema.sql` and document `.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dominio puro, validación curricular Zod, adaptadores de Supabase/IndexedDB y componentes UI accesibles que bloquean todas las historias de usuario.

**⚠️ CRITICAL**: Completar esta fase antes de iniciar las fases de Historias de Usuario.

- [X] T006 Define shared TypeScript domain types in `src/domain/types.ts` aligned with `data-model.md` (`Course`, `Term`, `LearningUnit`, `ExerciseItem`, `ReferenceEntry`, `StudentProfile`, `CustomExam`, `AttemptRecord`, `StudentMistake`)
- [X] T007 Implement Zod validation schemas in `src/domain/curriculum.schema.ts` enforcing canonical constraints from `data-model.md` (`Course.id`, `Course.cycle`, `Course.terms`, `Term.number`, `LearningUnit.courseId`, `LearningUnit.termNumber`, `LearningUnit.schoolOrder`, `ExerciseItem.courseId`, `ExerciseItem.skill`, `ExerciseItem.type`, `ExerciseItem.options`, `ExerciseItem.pairs`, `ExerciseItem.acceptedAnswers`, `ExerciseItem.allowAudioInExam`)
- [X] T008 [P] Implement Fisher-Yates deterministic randomizer in `src/domain/randomizer.ts` with unit tests in `tests/unit/randomizer.test.ts`
- [X] T009 [P] Implement `AnswerEvaluator` (`normalizeText`, `evaluate`, `calculateStars`) in `src/domain/answerEvaluator.ts` per `contracts/repository-contracts.md` and `data-model.md` (`attempt_records.score_percent`, `attempt_records.stars`), with unit tests in `tests/unit/answerEvaluator.test.ts`
- [X] T010 [P] Create Supabase client wrapper reading `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `src/services/supabaseClient.ts`
- [X] T011 [P] Implement IndexedDB offline storage (`family_cache`, `active_session`, `sync_outbox`) in `src/services/localDb.ts` per `data-model.md`
- [X] T012 Implement `FamilyRepository` offline-first adapter (Supabase + IndexedDB fallback + idempotent outbox) in `src/services/familyRepository.ts` per `contracts/repository-contracts.md` enforcing `data-model.md` constraints (`family_settings.pin_hash`, `student_profiles.nickname`, `student_profiles.avatar_id`, `student_profiles.course_id`, `student_unit_access.unit_id`, `student_unit_access.enabled`, `attempt_records.id`, `attempt_records.mode`, `attempt_records.status`, `attempt_records.total_questions`, `attempt_records.correct_count`, `attempt_records.duration_seconds`, `attempt_records.answers_detail`)
- [X] T013 [P] Create shared accessible UI primitives (44x44px touch buttons, PIN keypad, confirmation modal, status badges, offline sync indicator) in `src/components/ui/`
- [X] T014 Setup application shell, React Router routes, and global family/profile context in `src/App.tsx` and `src/main.tsx`

**Checkpoint**: Base técnica, contratos y adaptadores listos; se pueden implementar las historias de usuario en orden de prioridad.

---

## Phase 3: User Story 1 - Perfil Padre (cuenta familiar y PIN), gestión de alumnos y control del ritmo escolar (Priority: P1) 🎯 MVP

**Goal**: Permitir que el Padre inicie sesión en su cuenta familiar, configure su PIN parental, cree uno o varios perfiles de Alumno (sin PII del menor), controle qué SA están activas en el orden del curso escolar y acceda al panel de administración protegido por PIN.

**Independent Test**: Iniciar sesión familiar, configurar PIN, crear 2 perfiles de alumno (3º y 5º), habilitar solo hasta SA 2 en 5º, verificar que el acceso a Zona Padres rechaza un PIN incorrecto y que cada alumno ve únicamente su curso y sus unidades activas aisladas.

### Tests for User Story 1

- [X] T015 [P] [US1] Write unit/integration tests for PIN gate cooldown (5 failed attempts), student creation constraints (`student_profiles.nickname`, `student_profiles.course_id`), and unit access toggles (`student_unit_access.enabled`) in `tests/integration/parentGovernance.test.ts`

### Implementation for User Story 1

- [X] T016 [P] [US1] Implement Parent family login/register screen and initial onboarding wizard (create PIN + first student) in `src/features/auth/FamilyAuthPage.tsx` and `src/features/auth/OnboardingWizard.tsx`
- [X] T017 [P] [US1] Implement PIN Gate modal/guard with server RPC verification (`verify_parent_pin`), local offline hash verification, 5-attempt cooldown, and password-based PIN recovery in `src/features/auth/ParentPinGate.tsx`
- [X] T018 [US1] Implement Profile Selector screen displaying all family `student_profiles` (avatar, nickname, course) and the PIN-protected Parent Zone button in `src/features/profiles/ProfileSelectorPage.tsx`
- [X] T019 [US1] Implement Parent Dashboard & Student Management (create/edit student nickname, avatar, course; PIN-confirmed progress reset and delete via RPC) in `src/features/parent/ParentDashboardPage.tsx` and `src/features/parent/StudentManager.tsx`
- [X] T020 [US1] Implement Parental Unit Pacing controller (list all units of a student's course in exact `LearningUnit.schoolOrder`, toggle individual units or "enable up to this SA" per `student_unit_access.enabled`) in `src/features/parent/UnitAccessControl.tsx`

**Checkpoint**: US1 completamente funcional y verificable de forma independiente.

---

## Phase 4: User Story 2 - Practicar el itinerario del curso escolar en orden exacto sin posibilidad de hacer trampas (Priority: P1) 🎯 MVP

**Goal**: Dotar al Perfil Alumno del itinerario completo de 3º, 4º, 5º y 6º de Primaria en el orden escolar exacto de `Docs/` y del motor de práctica interactiva anti-trampas (sin ver soluciones antes de contestar, respuesta bloqueada tras comprobar, explicación en español en fallos, aleatorización en reintentos e historial guardado).

**Independent Test**: Entrar como Alumno de 5º, ver First/Second/Third Term en orden con SA bloqueadas con candado, completar una sesión de `SA 1: School` con opción múltiple, completar huecos y emparejar, verificar que no se puede editar una respuesta ya evaluada y que repetir la SA aleatoriza preguntas/opciones registrando ambos intentos.

### Tests for User Story 2

- [X] T021 [P] [US2] Write curriculum schema validation tests verifying 100% of courses (`3p`–`6p`), strict `LearningUnit.schoolOrder`, and valid `ExerciseItem` definitions in `tests/unit/curriculumCatalog.test.ts`
- [X] T022 [P] [US2] Write anti-cheat state machine tests (no solution leak before submit, response lock after submit, randomized retries, abandon confirmation) in `tests/unit/sessionMachine.test.ts`

### Implementation for User Story 2

- [X] T023 [P] [US2] Author original curriculum data and exercises (min. 8–10 varied items per SA) for 3º de Primaria in `src/data/curriculum/course-3p.ts` following `Docs/CONTENIDOS 2º Y 3º CICLO.pdf`
- [X] T024 [P] [US2] Author original curriculum data and exercises (min. 8–10 varied items per SA) for 4º de Primaria in `src/data/curriculum/course-4p.ts` following `Docs/CONTENIDOS 2º Y 3º CICLO.pdf`
- [X] T025 [P] [US2] Author original curriculum data and exercises (min. 8–10 varied items per SA) for 5º de Primaria in `src/data/curriculum/course-5p.ts` following `Docs/CONTENIDOS 2º Y 3º CICLO.pdf`
- [X] T026 [P] [US2] Author original curriculum data and exercises for 6º de Primaria (3º Ciclo blocks) in `src/data/curriculum/course-6p.ts` and unify selectors in `src/data/curriculum/index.ts`
- [X] T027 [US2] Implement pure anti-cheat `SessionMachine` (practice & exam state transitions, locked answers, score/stars calculation) in `src/domain/sessionMachine.ts`
- [X] T028 [US2] Implement Student Course Roadmap screen grouped by `Term.number` and ordered by `LearningUnit.schoolOrder`, showing locked/unlocked badges, vocabulary/grammar summary, and best stars in `src/features/student/StudentRoadmapPage.tsx`
- [X] T029 [US2] Implement interactive Practice Runner supporting `multiple_choice`, `fill_blank`, and `matching` (`ExerciseItem.type`), locked post-submit feedback in Spanish, exit confirmation, and end-of-session summary saving immutable `attempt_records` in `src/features/practice/PracticeSessionPage.tsx` and `src/features/practice/ExerciseRenderer.tsx`

**Checkpoint**: MVP completo (US1 + US2): el Padre configura alumnos/unidades y el Alumno practica su curso en orden sin trampas.

---

## Phase 5: User Story 3 - Generar y realizar exámenes a medida de unidades seleccionadas (Priority: P2)

**Goal**: Permitir al Padre generar exámenes aleatorizados seleccionando una o varias unidades/bancos, que el Alumno los realice en modo examen real (sin soluciones ni bancos de consulta, persistente ante recargas) y que al entregar vea su nota y revisión mientras el intento queda bloqueado e inmutable en el historial del Padre (incluidos abandonos).

**Independent Test**: Crear desde Zona Padres un examen de 10 preguntas de `SA 1 + SA 2`, iniciarlo como Alumno, comprobar que los bancos están bloqueados y recargar no reinicia el examen, entregarlo para ver nota/fallos cerrados y comprobar en Zona Padres el desglose pregunta a pregunta (más un segundo examen abandonado registrado como `abandoned`).

### Tests for User Story 3

- [X] T030 [P] [US3] Write unit tests for `ExamGenerator` (unit filtering, balanced distribution, `custom_exams.skill_focus`, max-available adjustment) in `tests/unit/examGenerator.test.ts`
- [X] T031 [P] [US3] Write integration tests for exam lifecycle (`pending` → `in_progress` → `completed` / `abandoned`), reload resumption from `active_session`, and immutable `attempt_records` in `tests/integration/examFlow.test.ts`

### Implementation for User Story 3

- [X] T032 [US3] Implement `ExamGenerator` domain service in `src/domain/examGenerator.ts` per `contracts/repository-contracts.md` and `data-model.md` (`custom_exams.course_id`, `custom_exams.unit_ids`, `custom_exams.skill_focus`, `custom_exams.exercise_ids`)
- [X] T033 [US3] Implement Parent Exam Generator UI (select student, multi-select units/banks, skill focus, question count with automatic max-available warning, assign exam) in `src/features/parent/ExamGeneratorPage.tsx` enforcing `custom_exams.title` and `custom_exams.status`
- [X] T034 [US3] Implement Student Exam Runner (pending exams list, active exam lock blocking reference banks, no mid-exam solutions, `active_session` IndexedDB persistence across reloads, explicit abandon logging as `abandoned`, final locked score & mistake review) in `src/features/practice/ExamRunnerPage.tsx` and router guard in `src/App.tsx`
- [X] T035 [US3] Implement Parent Attempt & Exam History Dashboard (chronological immutable log of all `attempt_records` with timestamps, duration, completed/abandoned status, per-question breakdown, and weak-unit highlights) in `src/features/parent/AttemptHistoryPage.tsx`

**Checkpoint**: Generación, ejecución anti-trampas y auditoría parental de exámenes 100% operativas.

---

## Phase 6: User Story 4 - Banco de Verbos Irregulares, Expresiones Útiles y Vocabulario Bilingüe (Priority: P2)

**Goal**: Ofrecer consulta con búsqueda bilingüe instantánea y práctica anti-trampas de los 3 bancos transversales de `Docs/USEFUL EXPRESSIONS AND VERBS.pdf`, bloqueando el acceso a consulta durante exámenes activos.

**Independent Test**: Buscar verbos/expresiones/palabras en inglés y español en modo estudio, completar una práctica rápida de verbos irregulares y verificar que durante un examen activo el acceso a estos bancos está bloqueado.

### Tests for User Story 4

- [X] T036 [P] [US4] Write unit tests for bilingual bank schemas and instant English/Spanish search filtering in `tests/unit/referenceBanks.test.ts`

### Implementation for User Story 4

- [X] T037 [P] [US4] Author structured bilingual datasets in `src/data/banks/irregularVerbs.ts`, `src/data/banks/expressions.ts`, and `src/data/banks/wordlist.ts` validated by `src/domain/curriculum.schema.ts`
- [X] T038 [US4] Implement Reference Banks screen (tabs for Irregular Verbs, Useful Expressions, Wordlist; instant EN/ES search with empty-state reset button; quick anti-cheat practice mode saving `bank_practice` attempts) in `src/features/banks/ReferenceBanksPage.tsx`

**Checkpoint**: Bancos transversales consultables, practicables y protegidos durante exámenes.

---

## Phase 7: User Story 5 - Seguimiento de progreso y repaso inteligente de errores (Priority: P3)

**Goal**: Reunir automáticamente los ítems fallados en prácticas y exámenes en una cola persistente no borrable por el alumno, permitiendo sesiones de "Repasar mis errores" que marcan ítems como superados sin alterar el historial de `attempt_records`.

**Independent Test**: Fallar 3 ítems en práctica/examen, comprobar que aparecen en "Repasar mis errores", acertarlos para verificar que pasan a `resolved = true` y confirmar en Zona Padres que el historial original sigue intacto.

### Tests for User Story 5

- [X] T039 [P] [US5] Write integration tests for `student_mistakes` lifecycle (`student_mistakes.miss_count`, `student_mistakes.resolved`) verifying original `attempt_records` remain immutable in `tests/integration/mistakeReview.test.ts`

### Implementation for User Story 5

- [X] T040 [US5] Wire automatic mistake recording into `PracticeSessionPage.tsx` and `ExamRunnerPage.tsx` on wrong answers
- [X] T041 [US5] Implement Student Mistake Review flow (pending count badge, randomized review session, automatic resolution on correct answer, empty-state celebration) and student progress summary (stars/streak) in `src/features/student/MistakeReviewPage.tsx`

**Checkpoint**: Ciclo completo de refuerzo dirigido sobre fallos reales operativo.

---

## Phase 8: User Story 6 - Funcionamiento sin conexión (offline), sincronización automática y pronunciación en inglés (Priority: P4)

**Goal**: Garantizar estudio y exámenes asignados 100% offline con sincronización automática al volver la red (sin duplicados) y soporte de pronunciación en inglés (`en-GB`/`en-US`) con degradación elegante.

**Independent Test**: Desconectar red tras cargar la app, completar una práctica y un examen asignado, escuchar pronunciación en vocabulario/expresiones, reconectar red y comprobar sincronización automática en el panel del Padre sin duplicados.

### Tests for User Story 6

- [X] T042 [P] [US6] Write integration tests for `sync_outbox` offline queueing, idempotent retry on `online` event, and zero duplicate attempts in `tests/integration/offlineSync.test.ts`
- [X] T043 [P] [US6] Write unit tests for `SpeechService` voice selection (`en-GB` fallback `en-US`) and graceful fallback when `speechSynthesis` is unavailable in `tests/unit/speechService.test.ts`

### Implementation for User Story 6

- [X] T044 [P] [US6] Implement `SpeechService` wrapper in `src/services/speechService.ts` and reusable `<SpeakButton />` component in `src/components/ui/SpeakButton.tsx` (respecting `ExerciseItem.allowAudioInExam` during exams)
- [X] T045 [US6] Wire automatic `online`/visibilitychange sync listener, pending sync badge, and offline status banner into `src/App.tsx` and `src/services/familyRepository.ts`
- [X] T046 [US6] Integrate `<SpeakButton />` into `ReferenceBanksPage.tsx`, `ExerciseRenderer.tsx` (hidden when `allowAudioInExam === false` in exam mode), and post-answer feedback cards

**Checkpoint**: Experiencia offline-first + sincronización automática + pronunciación en inglés completas.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Endurecimiento E2E, accesibilidad móvil/tablet, verificación de rendimiento y validación final de `quickstart.md`.

- [ ] T047 [P] Implement Playwright E2E test suite covering US1–US6 (Parent PIN, unit locks, anti-cheat practice, custom exam delivery & abandon, offline sync) in `tests/e2e/englishapp.spec.ts`
- [X] T048 [P] Audit responsive layout (360px mobile to desktop), 44x44px touch targets, keyboard navigation, and WCAG 2.1 AA contrast across all views in `src/features/`
- [X] T049 Verify production PWA build (`npm run build`), bundle size, Workbox precache manifest, and run all validation scenarios in `specs/001-primary-english-practice/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** → bloquea Phase 2.
- **Phase 2 (Foundational)** → bloquea todas las Historias de Usuario (`US1`–`US6`).
- **Phase 3 (`US1` - P1)** y **Phase 4 (`US2` - P1)** → conforman el **MVP mínimo funcional**. `US2` se integra con los perfiles/bloqueos de `US1`.
- **Phase 5 (`US3` - P2)** → depende del motor de `US2` y del panel de `US1`.
- **Phase 6 (`US4` - P2)** → puede ejecutarse en paralelo con `US3` (una vez completada Phase 2), integrando el bloqueo durante examen con `US3`.
- **Phase 7 (`US5` - P3)** → se conecta al registro de fallos de `US2`/`US3`.
- **Phase 8 (`US6` - P4)** → extiende `familyRepository` (Phase 2) y la UI de `US2`/`US4`.
- **Phase 9 (Polish)** → depende de todas las historias deseadas.

### Parallel Opportunities

- En **Phase 1**: `T002`, `T003`, `T004`, `T005` en paralelo tras `T001`.
- En **Phase 2**: `T008`, `T009`, `T010`, `T011`, `T013` en paralelo tras `T006`/`T007`.
- En **Phase 4 (`US2`)**: la autoría curricular de los 4 cursos (`T023`, `T024`, `T025`, `T026`) puede ejecutarse en paralelo junto con los tests `T021` y `T022`.
- En **Phase 6 (`US4`)** y **Phase 8 (`US6`)**: datos de bancos (`T037`) y servicio de voz (`T044`) son independientes y paralelizables.

---

## Implementation Strategy

### MVP First (Phases 1 → 4: US1 + US2)

1. Completar Setup + Foundational (`T001`–`T014`).
2. Completar **US1** (`T015`–`T020`): cuenta familiar, PIN, perfiles de alumno y control parental de unidades.
3. Completar **US2** (`T021`–`T029`): catálogo 3º–6º en orden escolar exacto + práctica anti-trampas.
4. **Validar MVP**: ya es usable en casa desde el primer día.

### Incremental Delivery

5. Añadir **US3** (`T030`–`T035`): Generador de exámenes a medida + historial inmutable de intentos/abandonos.
6. Añadir **US4** (`T036`–`T038`): Bancos bilingües (Verbos Irregulares, Expresiones, Wordlist).
7. Añadir **US5** (`T039`–`T041`): Repaso inteligente de errores.
8. Añadir **US6** (`T042`–`T046`) + **Polish** (`T047`–`T049`): Offline sync completo, pronunciación `en-GB` y E2E Playwright.
