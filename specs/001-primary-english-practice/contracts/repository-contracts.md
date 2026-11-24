# Internal Domain & Repository Contracts (`001-primary-english-practice`)

Estos contratos TypeScript desacoplan la interfaz PWA y la lógica pedagógica del backend concreto (Supabase) y del almacenamiento offline (IndexedDB), permitiendo testear el dominio al 100% de forma unitaria sin red.

## 1. `AnswerEvaluator` (Pure Domain Service)

```ts
export interface EvaluationResult {
  isCorrect: boolean;
  normalizedSubmitted: string;
  expectedAnswers: string[];
  explanationEs: string;
}

export interface AnswerEvaluator {
  normalizeText(input: string): string;
  evaluate(item: ExerciseItem, submitted: string | Record<string, string>): EvaluationResult;
  calculateStars(correctCount: number, totalQuestions: number): 0 | 1 | 2 | 3;
}
```

- **Reglas garantizadas**:
  - `normalizeText` aplica `trim()`, colapsa espacios múltiples, pasa a minúsculas y normaliza apóstrofes tipográficos (`’` → `'`).
  - En `fill_blank`, acepta cualquier variante listada en `item.acceptedAnswers`.
  - En `matching`, exige que todas las parejas coincidan exactamente.
  - Estrellas: `>= 90%` → `3`, `>= 70%` → `2`, `>= 50%` → `1`, `< 50%` → `0`.

## 2. `ExamGenerator` (Pure Domain Service)

```ts
export interface ExamGenerationInput {
  courseId: CourseId;
  unitIds: string[];
  skillFocus: 'vocabulary' | 'grammar' | 'mixed';
  questionCount: number;
  rng?: () => number; // Inyectable para tests deterministas
}

export interface ExamGenerationResult {
  exerciseIds: string[];
  availableCount: number;
  adjusted: boolean; // true si questionCount superó el máximo disponible
}

export interface ExamGenerator {
  generate(input: ExamGenerationInput): ExamGenerationResult;
}
```

- **Reglas garantizadas**:
  - Filtra ejercicios estrictamente por `courseId`, `unitIds` y `skillFocus`.
  - Aleatoriza con Fisher-Yates sin duplicados.
  - Equilibra la distribución entre las unidades seleccionadas cuando hay varias SA elegidas.

## 3. `FamilyRepository` (Offline-First + Supabase Sync)

```ts
export interface FamilyRepository {
  // Parental Auth & PIN
  hasParentPin(): Promise<boolean>;
  setParentPin(pin: string): Promise<void>;
  verifyParentPin(pin: string): Promise<boolean>;

  // Students & School-Year Unit Pacing
  listStudents(): Promise<StudentProfile[]>;
  createStudent(input: { nickname: string; avatarId: string; courseId: CourseId }): Promise<StudentProfile>;
  updateStudentCourse(studentId: string, courseId: CourseId): Promise<void>;
  getUnitAccess(studentId: string): Promise<Record<string, boolean>>;
  setUnitAccess(studentId: string, updates: Record<string, boolean>): Promise<void>;

  // Exams
  listExams(studentId: string): Promise<CustomExam[]>;
  createExam(input: CreateExamInput): Promise<CustomExam>;
  transitionExamStatus(examId: string, nextStatus: 'in_progress' | 'completed' | 'abandoned'): Promise<void>;

  // Immutable Attempts & Mistakes (offline-queued if offline)
  recordAttempt(attempt: AttemptRecord): Promise<void>;
  listAttempts(studentId: string): Promise<AttemptRecord[]>;
  listPendingMistakes(studentId: string): Promise<StudentMistake[]>;
  recordMistakes(studentId: string, items: { exerciseId: string; unitId: string }[]): Promise<void>;
  resolveMistake(studentId: string, exerciseId: string): Promise<void>;

  // PIN-protected destructive parent operations
  resetStudentProgress(studentId: string, pin: string): Promise<void>;
  deleteStudent(studentId: string, pin: string): Promise<void>;

  // Offline Sync Outbox
  flushSyncOutbox(): Promise<{ synced: number; pending: number }>;
  getPendingSyncCount(): Promise<number>;
}
```

## 4. `SpeechService` (Pronunciation with Graceful Fallback)

```ts
export interface SpeechService {
  isSupported(): boolean;
  speakEnglish(text: string): void;
  stop(): void;
}
```
