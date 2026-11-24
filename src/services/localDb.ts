import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  ActiveExamSession,
  AttemptRecord,
  CustomExam,
  FamilyRewardGoal,
  StudentMistake,
  StudentProfile,
} from '../domain/types';

export interface SyncOutboxItem {
  id: string;
  type: 'record_attempt' | 'transition_exam' | 'upsert_mistake' | 'resolve_mistake';
  payload: unknown;
  createdAt: string;
}

export interface FamilyCacheSnapshot {
  key: 'snapshot';
  familyId: string;
  offlinePinHash?: string;
  students: StudentProfile[];
  unitAccess: Record<string, Record<string, boolean>>; // studentId -> unitId -> enabled
  exams: CustomExam[];
  attempts: AttemptRecord[];
  mistakes: StudentMistake[];
  rewards?: FamilyRewardGoal[];
  updatedAt: string;
}

interface EnglishAppDB extends DBSchema {
  family_cache: {
    key: string;
    value: FamilyCacheSnapshot;
  };
  active_session: {
    key: string;
    value: ActiveExamSession;
  };
  sync_outbox: {
    key: string;
    value: SyncOutboxItem;
  };
}

let dbPromise: Promise<IDBPDatabase<EnglishAppDB>> | null = null;

export function getLocalDb(): Promise<IDBPDatabase<EnglishAppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<EnglishAppDB>('englishapp_local_v1', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('family_cache')) {
          db.createObjectStore('family_cache', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('active_session')) {
          db.createObjectStore('active_session', { keyPath: 'examId' });
        }
        if (!db.objectStoreNames.contains('sync_outbox')) {
          db.createObjectStore('sync_outbox', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function resetLocalDbHandleForTests(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}

export async function readFamilySnapshot(): Promise<FamilyCacheSnapshot | undefined> {
  const db = await getLocalDb();
  return db.get('family_cache', 'snapshot');
}

export async function writeFamilySnapshot(snapshot: FamilyCacheSnapshot): Promise<void> {
  const db = await getLocalDb();
  await db.put('family_cache', snapshot);
}

export async function clearFamilySnapshot(): Promise<void> {
  const db = await getLocalDb();
  await db.delete('family_cache', 'snapshot');
}

export async function saveActiveExamSession(session: ActiveExamSession): Promise<void> {
  const db = await getLocalDb();
  await db.put('active_session', session);
}

export async function getActiveExamSession(examId: string): Promise<ActiveExamSession | undefined> {
  const db = await getLocalDb();
  return db.get('active_session', examId);
}

export async function listActiveExamSessions(): Promise<ActiveExamSession[]> {
  const db = await getLocalDb();
  return db.getAll('active_session');
}

export async function deleteActiveExamSession(examId: string): Promise<void> {
  const db = await getLocalDb();
  await db.delete('active_session', examId);
}

export async function enqueueSyncItem(item: SyncOutboxItem): Promise<void> {
  const db = await getLocalDb();
  await db.put('sync_outbox', item);
}

export async function listSyncOutbox(): Promise<SyncOutboxItem[]> {
  const db = await getLocalDb();
  const items = await db.getAll('sync_outbox');
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function removeSyncItem(id: string): Promise<void> {
  const db = await getLocalDb();
  await db.delete('sync_outbox', id);
}
