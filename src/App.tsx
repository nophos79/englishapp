import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { FamilyAuthPage } from './features/auth/FamilyAuthPage';
import { OnboardingWizard } from './features/auth/OnboardingWizard';
import { ParentPinGate } from './features/auth/ParentPinGate';
import { ReferenceBanksPage } from './features/banks/ReferenceBanksPage';
import { ParentDashboardPage } from './features/parent/ParentDashboardPage';
import { ExamRunnerPage } from './features/practice/ExamRunnerPage';
import { PracticeSessionPage } from './features/practice/PracticeSessionPage';
import { ProfileSelectorPage } from './features/profiles/ProfileSelectorPage';
import { StudentRoadmapPage } from './features/student/StudentRoadmapPage';

function AppRoutes() {
  const { loading, user, localMode, hasPin, students, parentUnlocked } = useApp();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-base font-bold text-slate-600">
        Cargando EnglishApp...
      </div>
    );
  }

  // If Supabase is configured and parent hasn't signed in yet
  if (!localMode && !user) {
    return <FamilyAuthPage />;
  }

  // First-time family setup: create parental PIN + first student profile
  if (!hasPin || students.length === 0) {
    return <OnboardingWizard />;
  }

  return (
    <Routes>
      <Route path="/" element={<ProfileSelectorPage />} />
      <Route path="/parent-pin" element={<ParentPinGate />} />
      <Route
        path="/parent"
        element={parentUnlocked ? <ParentDashboardPage /> : <Navigate to="/parent-pin" replace />}
      />
      <Route path="/student" element={<StudentRoadmapPage />} />
      <Route path="/practice/:unitId" element={<PracticeSessionPage />} />
      <Route path="/exam/:examId" element={<ExamRunnerPage />} />
      <Route path="/banks" element={<ReferenceBanksPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
}
