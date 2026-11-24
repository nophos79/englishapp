import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { StudentProfile } from '../domain/types';
import { familyRepository } from '../services/familyRepository';
import { listActiveExamSessions } from '../services/localDb';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

interface AppContextValue {
  loading: boolean;
  user: User | null;
  localMode: boolean;
  hasPin: boolean;
  students: StudentProfile[];
  activeStudent: StudentProfile | null;
  parentUnlocked: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  activeExamId: string | null;
  selectStudent: (student: StudentProfile | null) => void;
  unlockParent: () => void;
  lockParent: () => void;
  refreshAll: () => Promise<void>;
  signOutFamily: () => Promise<void>;
  setActiveExamId: (examId: string | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [hasPin, setHasPin] = useState(false);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [activeStudent, setActiveStudent] = useState<StudentProfile | null>(null);
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  const localMode = !isSupabaseConfigured;

  const refreshAll = useCallback(async () => {
    try {
      await familyRepository.refreshFromRemote();
      const [pinExists, studentList, pending, activeExams] = await Promise.all([
        familyRepository.hasParentPin(),
        familyRepository.listStudents(),
        familyRepository.getPendingSyncCount(),
        listActiveExamSessions(),
      ]);
      setHasPin(pinExists);
      setStudents(studentList);
      setPendingSyncCount(pending);
      setActiveExamId(activeExams[0]?.examId ?? null);
      setActiveStudent((prev) =>
        prev ? studentList.find((s) => s.id === prev.id) ?? null : null,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setUser(data.session?.user ?? null);
        }
        if (data.session?.user) {
          await refreshAll();
        } else if (mounted) {
          setLoading(false);
        }
      } else {
        await refreshAll();
      }
    }

    void boot();

    let unsubscribe: (() => void) | undefined;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          void refreshAll();
        } else {
          setStudents([]);
          setActiveStudent(null);
          setParentUnlocked(false);
          setHasPin(false);
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    }

    const handleOnline = () => {
      setIsOnline(true);
      void familyRepository.flushSyncOutbox().then(() => refreshAll());
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mounted = false;
      unsubscribe?.();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshAll]);

  const signOutFamily = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setParentUnlocked(false);
    setActiveStudent(null);
  };

  const selectStudent = useCallback((student: StudentProfile | null) => {
    setActiveStudent(student);
    setParentUnlocked(false);
  }, []);

  const unlockParent = useCallback(() => setParentUnlocked(true), []);
  const lockParent = useCallback(() => setParentUnlocked(false), []);

  return (
    <AppContext.Provider
      value={{
        loading,
        user,
        localMode,
        hasPin,
        students,
        activeStudent,
        parentUnlocked,
        isOnline,
        pendingSyncCount,
        activeExamId,
        selectStudent,
        unlockParent,
        lockParent,
        refreshAll,
        signOutFamily,
        setActiveExamId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
