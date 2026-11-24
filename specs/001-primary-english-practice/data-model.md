# Data Model: EnglishApp (`001-primary-english-practice`)

**Date**: 2026-11-22

El modelo de datos se divide en dos capas claramente separadas para maximizar la velocidad offline, minimizar el uso de cuota en Supabase (< 5 MB/año) y blindar la integridad anti-trampas:

1. **Catálogo Curricular Estático** (empaquetado en la PWA, validado con Zod).
2. **Estado Familiar y de Evaluación** (persistido en Supabase PostgreSQL con RLS + caché offline e IndexedDB Outbox).

---

## 1. Catálogo Curricular Estático (PWA Bundle)

### `Course`
| Campo | Tipo | Reglas / Descripción |
| :--- | :--- | :--- |
| `id` | `'3p' \| '4p' \| '5p' \| '6p'` | Identificador único del curso |
| `cycle` | `2 \| 3` | `2` (3º–4º Primaria), `3` (5º–6º Primaria) |
| `label` | `string` | Ej.: `"3º de Primaria"`, `"5º de Primaria"` |
| `terms` | `Term[]` | Exactamente 3 trimestres ordenados (`1`, `2`, `3`) |

### `Term`
| Campo | Tipo | Reglas / Descripción |
| :--- | :--- | :--- |
| `id` | `string` | Ej.: `"5p-t1"`, `"5p-t2"`, `"5p-t3"` |
| `number` | `1 \| 2 \| 3` | Orden cronológico estricto (`First`, `Second`, `Third Term`) |
| `label` | `string` | `"First Term"`, `"Second Term"`, `"Third Term"` |
| `units` | `LearningUnit[]` | Unidades ordenadas estrictamente por `schoolOrder` |

### `LearningUnit` (Situación de Aprendizaje / SA)
| Campo | Tipo | Reglas / Descripción |
| :--- | :--- | :--- |
| `id` | `string` | Slug estable: ej. `"3p-starter"`, `"3p-sa1-animals"`, `"5p-sa4-my-weekend"`, `"5p-fest-halloween-christmas"` |
| `courseId` | `'3p' \| '4p' \| '5p' \| '6p'` | Referencia al curso |
| `termNumber` | `1 \| 2 \| 3` | Trimestre al que pertenece |
| `schoolOrder` | `number` | Entero secuencial `1..10` dentro del curso (garantiza el orden exacto del curso escolar) |
| `code` | `string` | `"STARTER"`, `"SA 1"`..`"SA 6"`, `"FESTIVITIES"` |
| `title` | `string` | Ej.: `"LET'S BEGIN!"`, `"ANIMALS"`, `"MY WEEKEND"` |
| `vocabularySummary` | `string[]` | Resumen de campos léxicos de la SA |
| `grammarSummary` | `string[]` | Resumen de estructuras gramaticales de la SA |

### `ExerciseItem`
| Campo | Tipo | Reglas / Descripción |
| :--- | :--- | :--- |
| `id` | `string` | ID estable único (ej. `"5p-sa4-gram-01"`) |
| `courseId` | `'3p' \| '4p' \| '5p' \| '6p'` | Curso objetivo |
| `unitId` | `string` | Referencia a `LearningUnit.id` o banco (`"bank-irregular-verbs"`, `"bank-expressions"`) |
| `skill` | `'vocabulary' \| 'grammar' \| 'expressions' \| 'irregular_verbs'` | Área evaluada |
| `type` | `'multiple_choice' \| 'fill_blank' \| 'matching'` | Tipo de interacción |
| `promptEs` | `string` | Enunciado/consigna clara en español |
| `promptEn` | `string?` | Frase o estímulo en inglés (opcional) |
| `options` | `string[]?` | Obligatorio para `multiple_choice` (mínimo 3 opciones; se aleatorizan en runtime) |
| `pairs` | `{ left: string; right: string }[]?` | Obligatorio para `matching` (3–5 parejas; columna derecha aleatorizada en runtime) |
| `acceptedAnswers` | `string[]` | Respuestas válidas (para `fill_blank` incluye variantes aceptadas como `["isn't", "is not"]`; para `multiple_choice` el texto exacto correcto) |
| `explanationEs` | `string` | Explicación pedagógica breve en español (oculta hasta enviar respuesta) |
| `allowAudioInExam` | `boolean` | `false` si escuchar el audio revelaría la respuesta escrita en un examen |

### `ReferenceEntry` (Bancos Transversales)
- **`IrregularVerbEntry`**: `{ id, infinitive, pastSimple, pastParticiple, spanish, minCycle: 2 | 3 }`
- **`ExpressionEntry`**: `{ id, english, spanish, category, minCycle: 2 | 3 }`
- **`WordlistEntry`**: `{ id, english, spanish, category, minCycle: 2 | 3, unitIds?: string[] }`

---

## 2. Modelo Relacional en Supabase PostgreSQL

Todas las tablas pertenecen a una cuenta familiar identificada por `family_id = auth.uid()` (el usuario autenticado del Padre).

### `family_settings`
| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| `family_id` | `uuid` | `PK`, `REFERENCES auth.users(id) ON DELETE CASCADE` |
| `pin_hash` | `text` | `NOT NULL` (bcrypt vía `pgcrypto`, nunca devuelto al cliente en claro) |
| `pin_updated_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` |

### `student_profiles`
| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| `id` | `uuid` | `PK DEFAULT gen_random_uuid()` |
| `family_id` | `uuid` | `NOT NULL REFERENCES family_settings(family_id) ON DELETE CASCADE` |
| `nickname` | `text` | `NOT NULL` (1–30 caracteres; sin apellidos ni email) |
| `avatar_id` | `text` | `NOT NULL` (identificador de avatar ilustrado local) |
| `course_id` | `text` | `NOT NULL CHECK (course_id IN ('3p','4p','5p','6p'))` |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` |

### `student_unit_access`
Control parental de qué unidades del orden escolar están activas para cada alumno.
| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| `student_id` | `uuid` | `PK (compuesta)`, `REFERENCES student_profiles(id) ON DELETE CASCADE` |
| `unit_id` | `text` | `PK (compuesta)` (slug de `LearningUnit.id`) |
| `family_id` | `uuid` | `NOT NULL` (desnormalizado para RLS rápido) |
| `enabled` | `boolean` | `NOT NULL DEFAULT false` |
| `updated_at` | `timestamptz` | `NOT NULL DEFAULT now()` |

### `custom_exams`
Exámenes generados por el Padre a partir de una o varias unidades/bancos.
| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| `id` | `uuid` | `PK DEFAULT gen_random_uuid()` |
| `family_id` | `uuid` | `NOT NULL` |
| `student_id` | `uuid` | `NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE` |
| `title` | `text` | `NOT NULL` (ej. `"Repaso 1er Trimestre (SA 1 + SA 2)"`) |
| `course_id` | `text` | `NOT NULL CHECK (course_id IN ('3p','4p','5p','6p'))` |
| `unit_ids` | `text[]` | `NOT NULL` (mínimo 1 unidad o banco) |
| `skill_focus` | `text` | `NOT NULL CHECK (skill_focus IN ('vocabulary','grammar','mixed'))` |
| `exercise_ids` | `text[]` | `NOT NULL` (lista congelada y aleatorizada de `ExerciseItem.id` al crear el examen) |
| `status` | `text` | `NOT NULL CHECK (status IN ('pending','in_progress','completed','abandoned')) DEFAULT 'pending'` |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT now()` |

### `attempt_records` *(Inmutable / Append-Only para flujos de alumno)*
Registra **cada** sesión de práctica y **cada** intento de examen (incluidos abandonos).
| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| `id` | `uuid` | `PK` (`client_attempt_id` generado en cliente para idempotencia offline) |
| `family_id` | `uuid` | `NOT NULL` |
| `student_id` | `uuid` | `NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE` |
| `mode` | `text` | `NOT NULL CHECK (mode IN ('practice','exam','mistake_review','bank_practice'))` |
| `unit_id` | `text` | Nullable (presente en `practice`) |
| `exam_id` | `uuid` | Nullable (`REFERENCES custom_exams(id) ON DELETE SET NULL`, presente en `exam`) |
| `status` | `text` | `NOT NULL CHECK (status IN ('completed','abandoned'))` |
| `total_questions` | `integer` | `NOT NULL CHECK (total_questions > 0)` |
| `correct_count` | `integer` | `NOT NULL CHECK (correct_count >= 0 AND correct_count <= total_questions)` |
| `score_percent` | `integer` | `NOT NULL CHECK (score_percent BETWEEN 0 AND 100)` |
| `stars` | `integer` | `NOT NULL CHECK (stars BETWEEN 0 AND 3)` |
| `started_at` | `timestamptz` | `NOT NULL` |
| `finished_at` | `timestamptz` | `NOT NULL` |
| `duration_seconds` | `integer` | `NOT NULL CHECK (duration_seconds >= 0)` |
| `answers_detail` | `jsonb` | `NOT NULL` — Array de `{ exerciseId, unitId, submittedAnswer, expectedAnswers, isCorrect }` |

### `student_mistakes`
Cola de errores pendientes de repaso por alumno (el alumno solo puede marcar un ítem como superado al acertarlo en `mistake_review`; nunca borrar el historial de `attempt_records`).
| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| `student_id` | `uuid` | `PK (compuesta)`, `REFERENCES student_profiles(id) ON DELETE CASCADE` |
| `exercise_id` | `text` | `PK (compuesta)` |
| `family_id` | `uuid` | `NOT NULL` |
| `unit_id` | `text` | `NOT NULL` |
| `miss_count` | `integer` | `NOT NULL DEFAULT 1` |
| `resolved` | `boolean` | `NOT NULL DEFAULT false` |
| `last_missed_at` | `timestamptz` | `NOT NULL DEFAULT now()` |
| `resolved_at` | `timestamptz` | Nullable |

---

## 3. Transiciones de Estado y Reglas Anti-Trampas

### Ciclo de vida de un `CustomExam`
```text
pending ──(Alumno inicia examen)──► in_progress
   in_progress ──(Alumno pulsa "Entregar examen")──► completed  [INMUTABLE]
   in_progress ──(Alumno abandona explícitamente)──► abandoned  [INMUTABLE]
```
- **Regla anti-recarga**: mientras `status === 'in_progress'`, el progreso parcial (`active_exam_session` en IndexedDB) guarda el índice de pregunta actual y las respuestas ya marcadas; recargar el navegador restaura el examen en el mismo estado sin permitir reiniciar desde cero.
- **Regla anti-copia**: mientras exista una `active_exam_session` en curso, la navegación a los bancos de consulta (`Irregular Verbs`, `Expression Bank`, `Wordlist`) queda bloqueada en el router de la app.
- **Regla de inmutabilidad**: una vez que un `attempt_record` se inserta con `status = 'completed'` o `'abandoned'`, las políticas RLS bloquean cualquier `UPDATE` o `DELETE` desde el cliente. Solo una llamada RPC autenticada con el PIN del Padre (por ejemplo, `parent_reset_student_progress`) puede limpiar datos de un alumno.

---

## 4. Caché Offline e IndexedDB (`englishapp_local_v1`)

| Object Store | Propósito |
| :--- | :--- |
| `family_cache` | Snapshot local de `student_profiles`, `student_unit_access`, `custom_exams`, `student_mistakes` y hash PBKDF2 del PIN para validación offline de lectura |
| `active_session` | Estado en curso de una práctica o examen activo (protege contra recargas accidentales o intencionadas) |
| `sync_outbox` | Cola FIFO de mutaciones pendientes (`INSERT attempt_record`, `UPDATE custom_exam status`, `UPSERT student_mistakes`) con `idempotencyKey` para sincronizar automáticamente al recuperar red |
