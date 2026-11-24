# Implementation Plan: Plataforma de Práctica y Evaluación de Inglés para Primaria (Perfiles Padre y Alumno)

**Branch**: `001-primary-english-practice` | **Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-primary-english-practice/spec.md`

## Summary

Construir **EnglishApp** como una **Progressive Web App (PWA) offline-first** en React + TypeScript + Vite + Tailwind CSS, respaldada por **Supabase** (Auth para la cuenta familiar del Padre, PostgreSQL con Row-Level Security append-only e RPCs verificadas por PIN) y una caché local en IndexedDB con cola de sincronización (Outbox). Todo el catálogo curricular de 3º, 4º, 5º y 6º de Primaria —en el orden cronológico exacto del curso escolar (`First`, `Second`, `Third Term`, `Starter`, `SA 1..6` y `Festivities`)— junto con los bancos bilingües de verbos irregulares, expresiones útiles y vocabulario, se empaquetan estáticamente en la PWA (validados con Zod) para ofrecer 0 MB de carga curricular en Supabase, respuesta instantánea y funcionamiento completo sin conexión.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) + React 19 + Node.js 20+ (entorno de build/test)

**Primary Dependencies**: Vite 6, `vite-plugin-pwa` (Workbox), Tailwind CSS 4, `react-router-dom`, `@supabase/supabase-js`, `idb` (IndexedDB wrapper), `zod` (validación de esquemas curriculares), `lucide-react` (iconografía limpia)

**Storage**: Supabase PostgreSQL (plan gratuito 500 MB, Auth + RLS + `pgcrypto` RPC) para perfiles, control de unidades, exámenes, historial inmutable y cola de errores + IndexedDB (`idb`) para caché local, sesiones en curso y cola de sincronización offline; currículo estático en JSON/TS empaquetado en la PWA (0 MB remotos)

**Testing**: Vitest + `@testing-library/react` (unitarios e integración de dominio, evaluación, anti-trampas, generador de exámenes, cola offline y validación Zod del currículo) + Playwright (E2E multirrol y offline)

**Target Platform**: Navegadores modernos de escritorio, tablet (iOS Safari / Android Chrome / Chromebook) y móvil desde `360px` de ancho, instalable como PWA HTTPS

**Project Type**: Single-project Web Application / PWA + SQL schema/RLS migrations (`supabase/`)

**Performance Goals**: Carga inicial interactiva < 2 s en tablet de gama media; evaluación de respuestas y búsqueda bilingüe < 100 ms en local (< 1 s percibido); 60 fps en transiciones

**Constraints**: Offline-capable (PWA precache + IndexedDB outbox), WCAG 2.1 AA, objetivos táctiles ≥ 44×44 px, cero anuncios/tracking, cero PII de menores, consumo remoto < 5 MB/año, integridad anti-trampas verificada por servidor (append-only `attempt_records` + RPC con PIN)

**Scale/Scope**: Uso familiar (1 cuenta de Padre, 1–5 perfiles de Alumno por familia), 4 cursos (3º–6º), ~36–40 unidades curriculares ordenadas, ~350+ ejercicios iniciales originales, ~45 verbos irregulares, ~90 expresiones útiles, vocabulario bilingüe A–Z, ~12 vistas principales (Selector de perfil, Zona Alumno, Práctica, Examen, Bancos, Repaso de errores, Login/PIN Padre, Panel Padre, Control de Unidades, Generador de Exámenes, Historial detallado)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado Pre-Diseño | Estado Post-Diseño | Evidencia en el Diseño |
| :--- | :---: | :---: | :--- |
| **I. Curriculum-First Alignment** | PASS | PASS | `src/data/curriculum/` sigue el orden `schoolOrder` exacto (`Starter`, `SA 1..6`, `Festivities` por trimestre) de 3º a 6º, validado con Zod y sin redistribuir PDFs de `Docs/`. `student_unit_access` permite al Padre controlar el ritmo real de clase. |
| **II. Child-Safe, Accessible & Distraction-Free UX** | PASS | PASS | Solo el Padre usa Supabase Auth; `student_profiles` solo guarda apodo, avatar y curso (cero PII de menores). Diseño Tailwind con botones ≥ 44×44 px, alto contraste WCAG AA, cero anuncios/tracking. |
| **III. Offline-First & Multi-Device PWA** | PASS | PASS | `vite-plugin-pwa` precachea app + currículo; `idb` guarda caché y `sync_outbox` idempotente; Supabase sincroniza móvil/PC del Padre con tablet del Alumno. |
| **IV. Pedagogical Feedback & Active Practice** | PASS | PASS | `AnswerEvaluator` da corrección y explicación en español solo tras enviar en práctica, oculta soluciones hasta entregar en examen, gestiona `student_mistakes` y ofrece Web Speech API (`en-GB`). |
| **V. Spec-Driven & Test-Verified Delivery** | PASS | PASS | Plan y contratos trazados a `spec.md`; toda la lógica pura (`src/domain/`) y validación curricular Zod cubiertas por Vitest; sin servidor custom innecesario. |
| **VI. Assessment Integrity & Parental Governance** | PASS | PASS | `family_settings.pin_hash` (bcrypt vía `pgcrypto`), verificación por RPC, `attempt_records` append-only sin políticas `UPDATE`/`DELETE` en RLS, bloqueo de bancos en examen activo y persistencia de sesión ante recargas. |

*Resultado del Gate*: **APROBADO sin violaciones** (pre y post-diseño).

## Project Structure

### Documentation (this feature)

```text
specs/001-primary-english-practice/
├── plan.md              # Este documento (/speckit-plan)
├── research.md          # Decisiones técnicas y alternativas evaluadas (Fase 0)
├── data-model.md        # Modelo curricular estático, relacional Supabase e IndexedDB (Fase 1)
├── quickstart.md        # Guía ejecutable de configuración y validación E2E (Fase 1)
├── contracts/
│   ├── supabase-schema.sql      # Esquema PostgreSQL, RLS append-only y RPCs con PIN
│   └── repository-contracts.md  # Interfaces TypeScript de dominio y repositorio
├── checklists/
│   └── requirements.md          # Checklist de calidad de la especificación
└── tasks.md             # Lista de tareas ejecutable (generada por /speckit-tasks)
```

### Source Code (repository root)

```text
supabase/
└── migrations/
    └── 001_initial_schema.sql   # Copia ejecutable de contracts/supabase-schema.sql

src/
├── main.tsx                     # Arranque React + registro Service Worker PWA
├── App.tsx                      # Router principal con guardas de PIN y bloqueo en examen activo
├── domain/                      # Lógica pura (100% testeable sin red ni DOM)
│   ├── curriculum.schema.ts     # Esquemas Zod para cursos, SA, ejercicios y bancos
│   ├── answerEvaluator.ts       # Normalización, evaluación de ejercicios y cálculo de estrellas
│   ├── randomizer.ts            # Fisher-Yates determinista (preguntas, opciones, parejas)
│   ├── examGenerator.ts         # Generación equilibrada de exámenes por unidades y enfoque
│   ├── sessionMachine.ts        # Máquina de estados anti-trampas (práctica y examen)
│   └── types.ts                 # Tipos compartidos de dominio y evaluación
├── data/                        # Catálogo curricular estático (0 MB en Supabase)
│   ├── curriculum/
│   │   ├── index.ts             # Exportación unificada y selectores por curso/orden escolar
│   │   ├── course-3p.ts         # 3º Primaria (First/Second/Third Term: Starter, SA1..6, Festivities)
│   │   ├── course-4p.ts         # 4º Primaria (First/Second/Third Term: Starter, SA1..6, Festivities)
│   │   ├── course-5p.ts         # 5º Primaria (First/Second/Third Term: Starter, SA1..6, Festivities)
│   │   └── course-6p.ts         # 6º Primaria (bloques 3º Ciclo: descripciones, pasado, comparativos, etc.)
│   └── banks/
│       ├── irregularVerbs.ts    # ~45 verbos irregulares (infinitivo, pasado, participio, español)
│       ├── expressions.ts       # ~90 expresiones útiles bilingües
│       └── wordlist.ts          # Vocabulario bilingüe categorizado
├── services/                    # Adaptadores de infraestructura desacoplados
│   ├── supabaseClient.ts        # Cliente Supabase configurado por variables VITE_*
│   ├── localDb.ts               # IndexedDB (family_cache, active_session, sync_outbox)
│   ├── familyRepository.ts      # Implementación offline-first + sincronización Supabase
│   └── speechService.ts         # Web Speech API (en-GB/en-US) con degradación elegante
├── features/                    # Módulos de interfaz por rol/flujo
│   ├── auth/                    # Login/Registro cuenta familiar del Padre + setup/gate PIN
│   ├── profiles/                # Selector de perfiles (Alumnos + botón Zona Padres con PIN)
│   ├── student/                 # Itinerario ordenado del curso, tarjetas de SA, repaso de errores
│   ├── practice/                # Motor de práctica y examen (MC, FillBlank, Matching, resumen)
│   ├── banks/                   # Consulta y práctica de Verbos Irregulares, Expresiones y Wordlist
│   └── parent/                  # Panel Padre: alumnos, control de SA, generador de exámenes, historial
└── components/                  # Componentes UI accesibles compartidos (botones 44px, modales, badges)

tests/
├── unit/                        # Tests de dominio (evaluator, examGenerator, sessionMachine, curriculum Zod)
├── integration/                 # Tests de familyRepository con IndexedDB/outbox y mock de Supabase
└── e2e/                         # Flujos Playwright (Padre PIN, bloqueo SA, anti-trampas, examen, offline)
```

**Structure Decision**: Se elige un proyecto único (`src/` + `tests/` + `supabase/migrations/`) porque la PWA se despliega como sitio estático y utiliza Supabase como backend gestionado sin necesidad de mantener un servidor API independiente (cumpliendo el principio YAGNI). La separación estricta entre `src/domain/`, `src/data/`, `src/services/` y `src/features/` garantiza testabilidad completa e independencia del proveedor de almacenamiento.

## Complexity Tracking

> No se registran violaciones de la Constitución; todos los gates pasan sin excepciones.
