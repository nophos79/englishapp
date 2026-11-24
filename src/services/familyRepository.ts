import type {
  AttemptRecord,
  CourseId,
  CustomExam,
  ExamStatus,
  SkillFocus,
  StudentMistake,
  StudentProfile,
} from '../domain/types';
import {
  enqueueSyncItem,
  listSyncOutbox,
  readFamilySnapshot,
  removeSyncItem,
  writeFamilySnapshot,
  type FamilyCacheSnapshot,
} from './localDb';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export interface CreateExamInput {
  studentId: string;
  title: string;
  courseId: CourseId;
  unitIds: string[];
  skillFocus: SkillFocus;
  exerciseIds: string[];
}

const LOCAL_FAMILY_ID = 'local-family';

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function hashPinLocal(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback for minimal test environments without SubtleCrypto
  let hash = 0;
  const text = `${salt}:${pin}`;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}

function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

async function getCurrentFamilyId(): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) return data.user.id;
  }
  const snap = await readFamilySnapshot();
  return snap?.familyId ?? LOCAL_FAMILY_ID;
}

async function ensureSnapshot(): Promise<FamilyCacheSnapshot> {
  const existing = await readFamilySnapshot();
  const familyId = await getCurrentFamilyId();
  if (existing && existing.familyId === familyId) {
    return existing;
  }
  const fresh: FamilyCacheSnapshot = {
    key: 'snapshot',
    familyId,
    students: [],
    unitAccess: {},
    exams: [],
    attempts: [],
    mistakes: [],
    updatedAt: new Date().toISOString(),
  };
  await writeFamilySnapshot(fresh);
  return fresh;
}

export const familyRepository = {
  async refreshFromRemote(): Promise<FamilyCacheSnapshot> {
    const snap = await ensureSnapshot();
    if (!isSupabaseConfigured || !supabase || !isOnline()) {
      return snap;
    }

    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) return snap;
    const familyId = userRes.user.id;

    // Push pending offline items first so remote reflects latest attempts
    await this.flushSyncOutbox();

    const [studentsRes, accessRes, examsRes, attemptsRes, mistakesRes] = await Promise.all([
      supabase.from('student_profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('student_unit_access').select('*'),
      supabase.from('custom_exams').select('*').order('created_at', { ascending: false }),
      supabase.from('attempt_records').select('*').order('finished_at', { ascending: false }),
      supabase.from('student_mistakes').select('*'),
    ]);

    const students: StudentProfile[] = (studentsRes.data ?? []).map((row) => ({
      id: row.id,
      familyId: row.family_id,
      nickname: row.nickname,
      avatarId: row.avatar_id,
      courseId: row.course_id as CourseId,
      createdAt: row.created_at,
    }));

    const unitAccess: Record<string, Record<string, boolean>> = {};
    for (const row of accessRes.data ?? []) {
      if (!unitAccess[row.student_id]) unitAccess[row.student_id] = {};
      unitAccess[row.student_id][row.unit_id] = Boolean(row.enabled);
    }

    const exams: CustomExam[] = (examsRes.data ?? []).map((row) => ({
      id: row.id,
      familyId: row.family_id,
      studentId: row.student_id,
      title: row.title,
      courseId: row.course_id as CourseId,
      unitIds: row.unit_ids ?? [],
      skillFocus: row.skill_focus as SkillFocus,
      exerciseIds: row.exercise_ids ?? [],
      status: row.status as ExamStatus,
      createdAt: row.created_at,
    }));

    const attempts: AttemptRecord[] = (attemptsRes.data ?? []).map((row) => ({
      id: row.id,
      familyId: row.family_id,
      studentId: row.student_id,
      mode: row.mode,
      unitId: row.unit_id,
      examId: row.exam_id,
      status: row.status,
      totalQuestions: row.total_questions,
      correctCount: row.correct_count,
      scorePercent: row.score_percent,
      stars: row.stars,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      durationSeconds: row.duration_seconds,
      answersDetail: row.answers_detail ?? [],
    }));

    const mistakes: StudentMistake[] = (mistakesRes.data ?? []).map((row) => ({
      studentId: row.student_id,
      exerciseId: row.exercise_id,
      familyId: row.family_id,
      unitId: row.unit_id,
      missCount: row.miss_count,
      resolved: Boolean(row.resolved),
      lastMissedAt: row.last_missed_at,
      resolvedAt: row.resolved_at,
    }));

    const nextSnap: FamilyCacheSnapshot = {
      key: 'snapshot',
      familyId,
      offlinePinHash: snap.offlinePinHash,
      students,
      unitAccess,
      exams,
      attempts,
      mistakes,
      updatedAt: new Date().toISOString(),
    };
    await writeFamilySnapshot(nextSnap);
    return nextSnap;
  },

  async hasParentPin(): Promise<boolean> {
    if (isSupabaseConfigured && supabase && isOnline()) {
      const { data, error } = await supabase.rpc('has_parent_pin');
      if (!error && typeof data === 'boolean') return data;
    }
    const snap = await ensureSnapshot();
    return Boolean(snap.offlinePinHash);
  },

  async setParentPin(pin: string): Promise<void> {
    if (!/^[0-9]{4,6}$/.test(pin)) {
      throw new Error('El PIN debe tener entre 4 y 6 dígitos numéricos.');
    }
    const snap = await ensureSnapshot();
    if (isSupabaseConfigured && supabase && isOnline()) {
      const { error } = await supabase.rpc('set_parent_pin', { p_pin: pin });
      if (error) throw new Error(error.message);
    }
    snap.offlinePinHash = await hashPinLocal(pin, snap.familyId);
    snap.updatedAt = new Date().toISOString();
    await writeFamilySnapshot(snap);
  },

  async verifyParentPin(pin: string): Promise<boolean> {
    const snap = await ensureSnapshot();
    if (isSupabaseConfigured && supabase && isOnline()) {
      const { data, error } = await supabase.rpc('verify_parent_pin', { p_pin: pin });
      if (!error && typeof data === 'boolean') {
        if (data) {
          snap.offlinePinHash = await hashPinLocal(pin, snap.familyId);
          await writeFamilySnapshot(snap);
        }
        return data;
      }
    }
    if (!snap.offlinePinHash) return false;
    const candidate = await hashPinLocal(pin, snap.familyId);
    return candidate === snap.offlinePinHash;
  },

  async listStudents(): Promise<StudentProfile[]> {
    const snap = await ensureSnapshot();
    return snap.students;
  },

  async createStudent(input: {
    nickname: string;
    avatarId: string;
    courseId: CourseId;
  }): Promise<StudentProfile> {
    const trimmed = input.nickname.trim();
    if (trimmed.length < 1 || trimmed.length > 30) {
      throw new Error('El apodo debe tener entre 1 y 30 caracteres.');
    }
    const snap = await ensureSnapshot();
    const id = generateUuid();
    const createdAt = new Date().toISOString();
    const student: StudentProfile = {
      id,
      familyId: snap.familyId,
      nickname: trimmed,
      avatarId: input.avatarId || 'owl',
      courseId: input.courseId,
      createdAt,
    };

    if (isSupabaseConfigured && supabase && isOnline()) {
      const { data, error } = await supabase
        .from('student_profiles')
        .insert({
          id: student.id,
          family_id: student.familyId,
          nickname: student.nickname,
          avatar_id: student.avatarId,
          course_id: student.courseId,
        })
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      student.id = data.id;
      student.createdAt = data.created_at;
    }

    snap.students = [...snap.students, student];
    snap.unitAccess[student.id] = snap.unitAccess[student.id] ?? {};
    snap.updatedAt = new Date().toISOString();
    await writeFamilySnapshot(snap);
    return student;
  },

  async updateStudentCourse(studentId: string, courseId: CourseId): Promise<void> {
    const snap = await ensureSnapshot();
    if (isSupabaseConfigured && supabase && isOnline()) {
      const { error } = await supabase
        .from('student_profiles')
        .update({ course_id: courseId })
        .eq('id', studentId);
      if (error) throw new Error(error.message);
    }
    snap.students = snap.students.map((s) => (s.id === studentId ? { ...s, courseId } : s));
    snap.updatedAt = new Date().toISOString();
    await writeFamilySnapshot(snap);
  },

  async getUnitAccess(studentId: string): Promise<Record<string, boolean>> {
    const snap = await ensureSnapshot();
    return snap.unitAccess[studentId] ?? {};
  },

  async setUnitAccess(studentId: string, updates: Record<string, boolean>): Promise<void> {
    const snap = await ensureSnapshot();
    const rows = Object.entries(updates).map(([unitId, enabled]) => ({
      student_id: studentId,
      unit_id: unitId,
      family_id: snap.familyId,
      enabled,
      updated_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured && supabase && isOnline() && rows.length > 0) {
      const { error } = await supabase.from('student_unit_access').upsert(rows);
      if (error) throw new Error(error.message);
    }

    snap.unitAccess[studentId] = {
      ...(snap.unitAccess[studentId] ?? {}),
      ...updates,
    };
    snap.updatedAt = new Date().toISOString();
    await writeFamilySnapshot(snap);
  },

  async listExams(studentId: string): Promise<CustomExam[]> {
    const snap = await ensureSnapshot();
    return snap.exams.filter((e) => e.studentId === studentId);
  },

  async createExam(input: CreateExamInput): Promise<CustomExam> {
    if (input.unitIds.length === 0 || input.exerciseIds.length === 0) {
      throw new Error('Selecciona al menos una unidad con ejercicios disponibles.');
    }
    const snap = await ensureSnapshot();
    const exam: CustomExam = {
      id: generateUuid(),
      familyId: snap.familyId,
      studentId: input.studentId,
      title: input.title.trim() || 'Examen de repaso',
      courseId: input.courseId,
      unitIds: input.unitIds,
      skillFocus: input.skillFocus,
      exerciseIds: input.exerciseIds,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase && isOnline()) {
      const { data, error } = await supabase
        .from('custom_exams')
        .insert({
          id: exam.id,
          family_id: exam.familyId,
          student_id: exam.studentId,
          title: exam.title,
          course_id: exam.courseId,
          unit_ids: exam.unitIds,
          skill_focus: exam.skillFocus,
          exercise_ids: exam.exerciseIds,
          status: exam.status,
        })
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      exam.id = data.id;
      exam.createdAt = data.created_at;
    }

    snap.exams = [exam, ...snap.exams];
    snap.updatedAt = new Date().toISOString();
    await writeFamilySnapshot(snap);
    return exam;
  },

  async transitionExamStatus(
    examId: string,
    nextStatus: 'in_progress' | 'completed' | 'abandoned',
  ): Promise<void> {
    const snap = await ensureSnapshot();
    snap.exams = snap.exams.map((e) => (e.id === examId ? { ...e, status: nextStatus } : e));
    snap.updatedAt = new Date().toISOString();
    await writeFamilySnapshot(snap);

    if (isSupabaseConfigured && supabase) {
      if (isOnline()) {
        const { error } = await supabase
          .from('custom_exams')
          .update({ status: nextStatus })
          .eq('id', examId);
        if (!error) return;
      }
      await enqueueSyncItem({
        id: `exam-${examId}-${nextStatus}`,
        type: 'transition_exam',
        payload: { examId, nextStatus },
        createdAt: new Date().toISOString(),
      });
    }
  },

  async recordAttempt(attempt: AttemptRecord): Promise<void> {
    const snap = await ensureSnapshot();
    const record: AttemptRecord = {
      ...attempt,
      familyId: snap.familyId,
    };

    // Idempotent local append (never duplicate same attempt id)
    if (!snap.attempts.some((a) => a.id === record.id)) {
      snap.attempts = [record, ...snap.attempts];
      snap.updatedAt = new Date().toISOString();
      await writeFamilySnapshot(snap);
    }

    if (isSupabaseConfigured && supabase) {
      if (isOnline()) {
        const { error } = await supabase.from('attempt_records').upsert(
          {
            id: record.id,
            family_id: record.familyId,
            student_id: record.studentId,
            mode: record.mode,
            unit_id: record.unitId ?? null,
            exam_id: record.examId ?? null,
            status: record.status,
            total_questions: record.totalQuestions,
            correct_count: record.correctCount,
            score_percent: record.scorePercent,
            stars: record.stars,
            started_at: record.startedAt,
            finished_at: record.finishedAt,
            duration_seconds: record.durationSeconds,
            answers_detail: record.answersDetail,
          },
          { onConflict: 'id', ignoreDuplicates: true },
        );
        if (!error) return;
      }
      await enqueueSyncItem({
        id: `attempt-${record.id}`,
        type: 'record_attempt',
        payload: record,
        createdAt: new Date().toISOString(),
      });
    }
  },

  async listAttempts(studentId: string): Promise<AttemptRecord[]> {
    const snap = await ensureSnapshot();
    return snap.attempts
      .filter((a) => a.studentId === studentId)
      .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
  },

  async listPendingMistakes(studentId: string): Promise<StudentMistake[]> {
    const snap = await ensureSnapshot();
    return snap.mistakes.filter((m) => m.studentId === studentId && !m.resolved);
  },

  async recordMistakes(
    studentId: string,
    items: { exerciseId: string; unitId: string }[],
  ): Promise<void> {
    if (items.length === 0) return;
    const snap = await ensureSnapshot();
    const now = new Date().toISOString();

    for (const item of items) {
      const existing = snap.mistakes.find(
        (m) => m.studentId === studentId && m.exerciseId === item.exerciseId,
      );
      const updated: StudentMistake = existing
        ? {
            ...existing,
            missCount: existing.missCount + 1,
            resolved: false,
            lastMissedAt: now,
            resolvedAt: null,
          }
        : {
            studentId,
            exerciseId: item.exerciseId,
            familyId: snap.familyId,
            unitId: item.unitId,
            missCount: 1,
            resolved: false,
            lastMissedAt: now,
            resolvedAt: null,
          };

      snap.mistakes = [
        ...snap.mistakes.filter(
          (m) => !(m.studentId === studentId && m.exerciseId === item.exerciseId),
        ),
        updated,
      ];

      if (isSupabaseConfigured && supabase) {
        if (isOnline()) {
          const { error } = await supabase.from('student_mistakes').upsert({
            student_id: updated.studentId,
            exercise_id: updated.exerciseId,
            family_id: updated.familyId,
            unit_id: updated.unitId,
            miss_count: updated.missCount,
            resolved: false,
            last_missed_at: updated.lastMissedAt,
            resolved_at: null,
          });
          if (!error) continue;
        }
        await enqueueSyncItem({
          id: `mistake-${studentId}-${item.exerciseId}`,
          type: 'upsert_mistake',
          payload: updated,
          createdAt: now,
        });
      }
    }

    snap.updatedAt = now;
    await writeFamilySnapshot(snap);
  },

  async resolveMistake(studentId: string, exerciseId: string): Promise<void> {
    const snap = await ensureSnapshot();
    const now = new Date().toISOString();
    snap.mistakes = snap.mistakes.map((m) =>
      m.studentId === studentId && m.exerciseId === exerciseId
        ? { ...m, resolved: true, resolvedAt: now }
        : m,
    );
    snap.updatedAt = now;
    await writeFamilySnapshot(snap);

    if (isSupabaseConfigured && supabase) {
      if (isOnline()) {
        const { error } = await supabase
          .from('student_mistakes')
          .update({ resolved: true, resolved_at: now })
          .eq('student_id', studentId)
          .eq('exercise_id', exerciseId);
        if (!error) return;
      }
      await enqueueSyncItem({
        id: `resolve-${studentId}-${exerciseId}`,
        type: 'resolve_mistake',
        payload: { studentId, exerciseId, resolvedAt: now },
        createdAt: now,
      });
    }
  },

  async resetStudentProgress(studentId: string, pin: string): Promise<void> {
    const valid = await this.verifyParentPin(pin);
    if (!valid) throw new Error('PIN parental incorrecto.');

    if (isSupabaseConfigured && supabase && isOnline()) {
      const { error } = await supabase.rpc('parent_reset_student_progress', {
        p_student_id: studentId,
        p_pin: pin,
      });
      if (error) throw new Error(error.message);
    }

    const snap = await ensureSnapshot();
    snap.attempts = snap.attempts.filter((a) => a.studentId !== studentId);
    snap.mistakes = snap.mistakes.filter((m) => m.studentId !== studentId);
    snap.exams = snap.exams.filter((e) => e.studentId !== studentId);
    snap.updatedAt = new Date().toISOString();
    await writeFamilySnapshot(snap);
  },

  async deleteStudent(studentId: string, pin: string): Promise<void> {
    const valid = await this.verifyParentPin(pin);
    if (!valid) throw new Error('PIN parental incorrecto.');

    if (isSupabaseConfigured && supabase && isOnline()) {
      const { error } = await supabase.rpc('parent_delete_student', {
        p_student_id: studentId,
        p_pin: pin,
      });
      if (error) throw new Error(error.message);
    }

    const snap = await ensureSnapshot();
    snap.students = snap.students.filter((s) => s.id !== studentId);
    delete snap.unitAccess[studentId];
    snap.attempts = snap.attempts.filter((a) => a.studentId !== studentId);
    snap.mistakes = snap.mistakes.filter((m) => m.studentId !== studentId);
    snap.exams = snap.exams.filter((e) => e.studentId !== studentId);
    snap.updatedAt = new Date().toISOString();
    await writeFamilySnapshot(snap);
  },

  async flushSyncOutbox(): Promise<{ synced: number; pending: number }> {
    const items = await listSyncOutbox();
    if (!isSupabaseConfigured || !supabase || !isOnline() || items.length === 0) {
      return { synced: 0, pending: items.length };
    }

    let synced = 0;
    for (const item of items) {
      let ok = false;
      if (item.type === 'record_attempt') {
        const record = item.payload as AttemptRecord;
        const { error } = await supabase.from('attempt_records').upsert(
          {
            id: record.id,
            family_id: record.familyId,
            student_id: record.studentId,
            mode: record.mode,
            unit_id: record.unitId ?? null,
            exam_id: record.examId ?? null,
            status: record.status,
            total_questions: record.totalQuestions,
            correct_count: record.correctCount,
            score_percent: record.scorePercent,
            stars: record.stars,
            started_at: record.startedAt,
            finished_at: record.finishedAt,
            duration_seconds: record.durationSeconds,
            answers_detail: record.answersDetail,
          },
          { onConflict: 'id', ignoreDuplicates: true },
        );
        ok = !error;
      } else if (item.type === 'transition_exam') {
        const { examId, nextStatus } = item.payload as {
          examId: string;
          nextStatus: ExamStatus;
        };
        const { error } = await supabase
          .from('custom_exams')
          .update({ status: nextStatus })
          .eq('id', examId);
        ok = !error;
      } else if (item.type === 'upsert_mistake') {
        const m = item.payload as StudentMistake;
        const { error } = await supabase.from('student_mistakes').upsert({
          student_id: m.studentId,
          exercise_id: m.exerciseId,
          family_id: m.familyId,
          unit_id: m.unitId,
          miss_count: m.missCount,
          resolved: m.resolved,
          last_missed_at: m.lastMissedAt,
          resolved_at: m.resolvedAt ?? null,
        });
        ok = !error;
      } else if (item.type === 'resolve_mistake') {
        const { studentId, exerciseId, resolvedAt } = item.payload as {
          studentId: string;
          exerciseId: string;
          resolvedAt: string;
        };
        const { error } = await supabase
          .from('student_mistakes')
          .update({ resolved: true, resolved_at: resolvedAt })
          .eq('student_id', studentId)
          .eq('exercise_id', exerciseId);
        ok = !error;
      }

      if (ok) {
        await removeSyncItem(item.id);
        synced++;
      }
    }

    const remaining = await listSyncOutbox();
    return { synced, pending: remaining.length };
  },

  async getPendingSyncCount(): Promise<number> {
    const items = await listSyncOutbox();
    return items.length;
  },
};

export { generateUuid };
