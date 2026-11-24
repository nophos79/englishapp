# Phase 0 Research: EnglishApp (PWA + Supabase + Offline-First)

**Feature**: `001-primary-english-practice`
**Date**: 2026-11-22

---

## 1. Frontend Stack & PWA Runtime

- **Decision**: **React 19 + TypeScript 5 + Vite + Tailwind CSS + `vite-plugin-pwa` (Workbox)**.
- **Rationale**:
  - TypeScript estricto garantiza integridad en las estructuras curriculares, lógica anti-trampas y contratos con Supabase.
  - Vite ofrece tiempos de build instantáneos y bundles muy ligeros (< 2 s de carga inicial en tablets modestas, cumpliendo el presupuesto de rendimiento de la Constitución).
  - `vite-plugin-pwa` (estrategia `generateSW` con Workbox) precachea automáticamente todo el shell de la app y los archivos JSON estáticos del currículo (3º–6º, verbos, expresiones, vocabulario), garantizando funcionamiento 100% offline tras la primera visita e instalación en tablet/móvil.
  - Tailwind CSS facilita el diseño responsive desde `360px` a escritorio, objetivos táctiles `min-h-11 min-w-11` (44×44 px) y alto contraste WCAG 2.1 AA sin sobrecarga de librerías UI pesadas.
- **Alternatives considered**:
  - *Next.js / SSR*: innecesario al no requerir SEO ni servidor Node propio; complicaría el despliegue estático gratuito y el modo offline-first.
  - *Vanilla JS sin framework*: aumentaría la complejidad al gestionar estados de examen bloqueados, temporizadores, modales de PIN y paneles de Padre/Alumno.

## 2. Persistence, Multi-Device Sync & Anti-Cheat Immutability

- **Decision**: **Supabase (Auth + PostgreSQL + RLS + RPC) + Caché Offline en IndexedDB (`idb`) con cola de sincronización (Outbox Pattern)**.
- **Rationale**:
  - **Cuenta única de Padre**: solo el adulto se autentica con Supabase Auth (email/contraseña). Los hijos son registros internos en `student_profiles` (apodo, avatar, curso) sin email ni PII, cumpliendo el Principio II (GDPR-K / LOPDGDD).
  - **Consumo mínimo del plan gratuito (500 MB)**: el currículo y los bancos bilingües se sirven como JSON estáticos dentro de la PWA (0 MB en Supabase). Solo perfiles, bloqueos de SA, exámenes, intentos y cola de errores se guardan en PostgreSQL (~2–5 MB por curso escolar).
  - **Inmutabilidad real frente a trampas**:
    - Las tablas `attempt_records` y `exam_answers` se configuran con políticas RLS de **solo inserción (`INSERT`) y lectura (`SELECT`)** para la sesión cliente; no se permite `UPDATE` ni `DELETE` directo sobre intentos ya cerrados desde el cliente.
    - Las acciones destructivas o administrativas del Padre (reiniciar progreso de un alumno, eliminar perfil, cambiar PIN) se ejecutan mediante **funciones PostgreSQL (`SECURITY DEFINER` RPC)** que validan en el servidor el hash del PIN parental antes de ejecutar la operación.
  - **Resiliencia offline (Outbox)**:
    - Cada dispositivo mantiene una réplica local en IndexedDB de los perfiles, unidades habilitadas, exámenes asignados, cola de errores y sesiones en curso.
    - Si el alumno termina una práctica o un examen sin conexión (o si Supabase estuviera pausado temporalmente), el intento se guarda en una cola local (`sync_outbox`) con un `client_attempt_id` (UUID idempotente) y se envía automáticamente al recuperar red (`online` event + reintento al abrir la app).
    - El estado de un **examen en curso** se persiste localmente pregunta a pregunta: si el alumno recarga o cierra la pestaña, al volver reanuda exactamente donde estaba o registra el abandono explícito.
- **Alternatives considered**:
  - *Solo LocalStorage/IndexedDB*: descartado por el usuario al no permitir uso multidispositivo (móvil del Padre + tablet del Alumno) ni evitar que limpiar datos del navegador borre el historial.
  - *OneDrive App Folder*: requiere registro OAuth en Microsoft Entra y gestión manual de conflictos en un archivo JSON único; inferior en fiabilidad e inmutabilidad frente a PostgreSQL + RLS.

## 3. Parental PIN Security & Recovery

- **Decision**: **PIN de 4–6 dígitos hasheado con PBKDF2 / `pgcrypto` (`crypt` + `gen_salt('bf')`) en servidor**, nunca almacenado en texto plano, con **recuperación mediante reautenticación de la contraseña de la cuenta de Padre (Supabase Auth)**.
- **Rationale**:
  - Al verificar el PIN mediante una función RPC en Supabase (con comprobación local offline basada en hash PBKDF2 cacheado solo para desbloquear la vista de lectura offline si no hay red), el PIN nunca viaja ni se guarda en claro.
  - Si el Padre olvida el PIN, puede restablecerlo introduciendo la **contraseña de su cuenta de Supabase Auth** (que el niño no conoce), evitando preguntas de seguridad débiles o bloqueos permanentes.
  - Tras 5 intentos fallidos consecutivos de PIN, se aplica un retardo progresivo (cooldown de 30 s) para desalentar pruebas por fuerza bruta.
- **Alternatives considered**:
  - *PIN guardado en claro en LocalStorage*: trivial de leer o borrar; rechazado por el Principio VI.
  - *PIN solo numérico sin recuperación*: riesgo de bloquear al adulto si lo olvida.

## 4. Curriculum Data Modeling & Validation

- **Decision**: **Catálogo curricular estático en TypeScript/JSON validado en build y test con `Zod`**, estructurado exactamente según `Docs/`:
  - **Cursos**: `3p` (3º), `4p` (4º), `5p` (5º), `6p` (6º), agrupados en `cycle: 2 | 3`.
  - **Orden escolar estricto (`orderIndex`)**: `First Term` (`Starter`, `SA 1`, `SA 2`, `Festivities: Halloween & Christmas`) → `Second Term` (`SA 3`, `SA 4`, `Festivities: St. Patrick & Easter`) → `Third Term` (`SA 5`, `SA 6`, `Festivities: Summer`).
  - **Bancos transversales**: `irregular-verbs.json` (~45 verbos del PDF), `expressions.json` (~90 expresiones bilingües) y `wordlist.json` (vocabulario bilingüe categorizado por ciclo/SA).
  - **Ejercicios originales por SA**: mínimo 8–10 ejercicios variados por SA (opción múltiple, rellenar hueco y emparejar), todos con explicación pedagógica en español y variantes aceptadas (`isn't`/`is not`, `learnt`/`learned`).
- **Rationale**:
  - Validar el catálogo con `Zod` en la suite de tests garantiza cero referencias rotas, cero respuestas vacías y cumplimiento estricto de los Principios I y V.
- **Alternatives considered**:
  - *Guardar ejercicios en tablas de Supabase*: consumiría espacio/lecturas innecesarias y requeriría descargar el currículo en red antes de poder estudiar offline.

## 5. Pronunciation Support (Text-to-Speech)

- **Decision**: **Web Speech API (`window.speechSynthesis`) seleccionando voz `en-GB` (preferente para currículo escolar en España) con fallback a `en-US` / cualquier voz `en-*`**, encapsulada en un servicio con degradación elegante si el dispositivo no soporta voz.
- **Rationale**:
  - 0 € de coste, 0 MB de almacenamiento remoto, funciona offline en la mayoría de tablets iOS/Android/ChromeOS/Windows y cumple el Principio IV.
  - En ejercicios de escritura/dictado durante un **examen**, el botón de pronunciación se oculta automáticamente si pudiera revelar la respuesta.
- **Alternatives considered**:
  - *Audios MP3 pregrabados en Supabase Storage*: ocuparía decenas de megas, complicaría el mantenimiento y requeriría precacheo pesado.

## 6. Testing Strategy & Hosting

- **Decision**:
  - **Unit & Integration Tests**: **Vitest** + **@testing-library/react** (lógica de evaluación de respuestas, normalización de texto/contracciones, aleatorización Fisher-Yates, máquina de estados anti-trampas, generador de exámenes, cola de errores, cola de sync offline y validación Zod del currículo).
  - **E2E Tests**: **Playwright** (flujos críticos: setup Padre + PIN, bloqueo/desbloqueo de SA, práctica anti-trampas, creación y entrega/abandono de examen, modo offline).
  - **Despliegue gratuito**: **Vercel / Cloudflare Pages / Netlify** (hosting estático HTTPS gratuito, obligatorio para instalar PWA y Service Worker).
- **Rationale**: Cobertura rápida y determinista de toda la lógica pedagógica y de integridad antes de desplegar.
