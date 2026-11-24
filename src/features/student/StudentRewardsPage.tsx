import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  Gift,
  Lock,
  Palette,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  ALL_AVATARS,
  getAvatar,
  getStoredStudentThemeId,
  getStudentTheme,
  setStoredStudentThemeId,
  STUDENT_THEMES,
  type StudentThemeId,
} from '../../components/ui/Avatars';
import { ThemeBackdrop, ThemeSceneBanner } from '../../components/ui/ThemeDecor';
import { useApp } from '../../context/AppContext';
import { getExerciseById } from '../../data/curriculum';
import { computeFamilyGoalProgress, computeStudentRewards } from '../../domain/rewardsEngine';
import type { AttemptRecord, FamilyRewardGoal } from '../../domain/types';
import { familyRepository } from '../../services/familyRepository';

type RewardsTab = 'passport' | 'customize' | 'family';

function isRewardsTab(v: string | null): v is RewardsTab {
  return v === 'passport' || v === 'customize' || v === 'family';
}

export function StudentRewardsPage() {
  const { activeStudent, refreshAll } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const paramTab = searchParams.get('tab');
  const [tab, setTab] = useState<RewardsTab>(() => (isRewardsTab(paramTab) ? paramTab : 'passport'));
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [familyRewards, setFamilyRewards] = useState<FamilyRewardGoal[]>([]);
  const [themeId, setThemeId] = useState<StudentThemeId>(() =>
    activeStudent ? getStoredStudentThemeId(activeStudent.id) : 'sky',
  );
  const [toast, setToast] = useState<string | null>(null);

  const activeStudentId = activeStudent?.id;

  useEffect(() => {
    if (!activeStudentId) {
      navigate('/');
      return;
    }

    setThemeId(getStoredStudentThemeId(activeStudentId));

    let cancelled = false;
    async function load() {
      await familyRepository.refreshFromRemote();
      const [attemptList, rewardList] = await Promise.all([
        familyRepository.listAttempts(activeStudentId!),
        familyRepository.listFamilyRewards(activeStudentId!),
      ]);
      if (!cancelled) {
        setAttempts(attemptList);
        setFamilyRewards(rewardList);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeStudentId, navigate]);

  const rewards = useMemo(
    () => computeStudentRewards(attempts, { lookupExercise: getExerciseById }),
    [attempts],
  );

  if (!activeStudent) return null;

  const avatar = getAvatar(activeStudent.avatarId);
  const activeTheme = getStudentTheme(themeId);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  };

  const handleSelectTab = (next: RewardsTab) => {
    setTab(next);
    setSearchParams({ tab: next }, { replace: true });
  };

  const handleEquipAvatar = async (avatarId: string, label: string) => {
    await familyRepository.updateStudentAvatar(activeStudent.id, avatarId);
    await refreshAll();
    showToast(`¡Avatar cambiado a ${label}!`);
  };

  const handleSelectTheme = (nextThemeId: StudentThemeId, label: string) => {
    setThemeId(nextThemeId);
    setStoredStudentThemeId(activeStudent.id, nextThemeId);
    showToast(`Tema "${label}" activado.`);
  };

  const activeOrClaimedGoal = familyRewards.find(
    (g) => g.status === 'active' || g.status === 'claimed',
  );
  const redeemedGoals = familyRewards.filter((g) => g.status === 'redeemed');
  const activeGoalProgress = activeOrClaimedGoal
    ? computeFamilyGoalProgress(activeOrClaimedGoal, rewards)
    : null;

  const handleClaimGoal = async (goalId: string) => {
    await familyRepository.claimFamilyReward(goalId);
    const updated = await familyRepository.listFamilyRewards(activeStudent.id);
    setFamilyRewards(updated);
    showToast('¡Premio reclamado! Enséñaselo a papá o mamá.');
  };

  return (
    <div className={`relative min-h-screen overflow-x-clip bg-gradient-to-b ${activeTheme.bgClass} pb-12`}>
      <ThemeBackdrop themeId={activeTheme.id} />
      <header className={`sticky top-0 z-20 border-b-2 backdrop-blur ${activeTheme.headerClass}`}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/student')}
              className="btn-duo btn-duo-white inline-flex items-center gap-1.5 px-3 text-sm text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-xs ${avatar.bg}`}
            >
              {avatar.emoji}
            </div>
            <div>
              <h1 className={`text-lg font-black sm:text-xl ${activeTheme.headerTitleClass}`}>
                Pasaporte de {activeStudent.nickname}
              </h1>
              <p className={`text-xs font-extrabold ${activeTheme.headerSubtitleClass}`}>
                {rewards.rank.emoji} Nv.{rewards.rank.level} · {rewards.rank.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
              ⚡ {rewards.totalXp} XP
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
              <Award className="h-3.5 w-3.5" /> {rewards.earnedBadgesCount}/{rewards.totalBadgesCount}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-6">
        {toast && (
          <div className="mb-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-900">
            {toast}
          </div>
        )}

        <div className="mb-6 grid grid-cols-3 gap-2">
          {[
            { id: 'passport', label: 'Pasaporte y Sellos', icon: Trophy },
            { id: 'customize', label: 'Avatares y Temas', icon: Palette },
            { id: 'family', label: 'Premio Familiar', icon: Gift },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id as RewardsTab)}
                className={`btn-duo flex items-center justify-center gap-1.5 px-2.5 py-2.5 text-xs sm:text-sm ${
                  active ? 'btn-duo-blue' : 'btn-duo-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PASAPORTE Y SELLOS */}
        {tab === 'passport' && (
          <div className="space-y-6">
            {/* Explorer Rank Card */}
            <section className={`rounded-3xl border-2 ${activeTheme.cardAccentBorder} bg-white p-5 shadow-sm`}>
              <div className="mb-4">
                <ThemeSceneBanner themeId={activeTheme.id} nickname={activeStudent.nickname} compact />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-3xl">
                    {rewards.rank.emoji}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-sky-600">
                      Rango actual · Nivel {rewards.rank.level}
                    </p>
                    <h2 className="text-xl font-black text-slate-900">{rewards.rank.title}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-amber-600">{rewards.totalXp} XP</p>
                  <p className="text-xs font-bold text-slate-500">
                    {rewards.totalEarnedStars} ★ acumuladas
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs font-extrabold text-slate-600">
                  <span>
                    {rewards.nextRank
                      ? `Próximo rango: ${rewards.nextRank.emoji} ${rewards.nextRank.title}`
                      : '¡Has alcanzado el rango máximo!'}
                  </span>
                  <span>
                    {rewards.nextRank
                      ? `Faltan ${rewards.nextRank.minXp - rewards.totalXp} XP`
                      : 'Nv. Máximo'}
                  </span>
                </div>
                <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-200 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                    style={{ width: `${rewards.rankProgressPercent}%` }}
                  />
                </div>
              </div>
            </section>

            {/* Weekly Friendly Goal */}
            <section className="rounded-3xl border-2 border-emerald-200 bg-white p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-slate-900">Meta semanal amable</h2>
                  <p className="text-xs font-semibold text-slate-600">
                    Practica {rewards.weeklyTargetDays} días esta semana · Nunca pierdes tu progreso si descansas un día
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                  {rewards.weeklyDaysPracticed} / {rewards.weeklyTargetDays} días
                </span>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-2">
                {rewards.weekDaysStatus.map((day) => (
                  <div
                    key={day.dateKey}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 py-2.5 ${
                      day.practiced
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                        : day.isToday
                          ? 'border-sky-300 bg-sky-50 text-sky-800'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-black">{day.label}</span>
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full">
                      {day.practiced ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-current opacity-30" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 10 Passport Stamps */}
            <section>
              <h2 className={`mb-3 text-lg font-black ${activeTheme.sectionHeadingClass}`}>
                Sellos de tu Pasaporte ({rewards.earnedBadgesCount}/{rewards.totalBadgesCount})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {rewards.badges.map((badge) => {
                  const pct = Math.min(
                    100,
                    Math.round((badge.progressCurrent / Math.max(1, badge.progressTarget)) * 100),
                  );
                  return (
                    <div
                      key={badge.id}
                      className={`rounded-3xl border-2 p-4 transition ${
                        badge.earned
                          ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white shadow-xs'
                          : 'border-slate-200 bg-white/80 opacity-85'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                            badge.earned ? 'bg-amber-100' : 'bg-slate-100 grayscale'
                          }`}
                        >
                          {badge.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-black text-slate-900">{badge.title}</h3>
                            {badge.earned ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-800">
                                <Check className="h-3 w-3" /> Conseguido
                              </span>
                            ) : (
                              <span className="text-[11px] font-extrabold text-slate-500">
                                {badge.progressCurrent}/{badge.progressTarget}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs font-semibold text-slate-600">
                            {badge.description}
                          </p>
                          {!badge.earned && (
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-sky-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: AVATARES Y TEMAS */}
        {tab === 'customize' && (
          <div className="space-y-6">
            <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="text-lg font-black text-slate-900">Elige tu Avatar de Explorador</h2>
              <p className="mt-0.5 text-xs font-semibold text-slate-600">
                Gana puntos XP practicando para desbloquear nuevos personajes (tienes {rewards.totalXp} XP).
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ALL_AVATARS.map((av) => {
                  const unlocked = rewards.totalXp >= av.minXp;
                  const isCurrent = activeStudent.avatarId === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      disabled={!unlocked || isCurrent}
                      onClick={() => void handleEquipAvatar(av.id, av.label)}
                      className={`btn-duo flex flex-col items-center justify-center p-3 text-center ${
                        isCurrent
                          ? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-900'
                          : unlocked
                            ? 'btn-duo-white hover:border-sky-400'
                            : 'border-2 border-slate-200 bg-slate-100 text-slate-400 opacity-75'
                      }`}
                    >
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${av.bg} ${
                          !unlocked ? 'grayscale' : ''
                        }`}
                      >
                        {av.emoji}
                      </span>
                      <span className="mt-1.5 text-xs font-black text-slate-900">{av.label}</span>
                      <span className="mt-0.5 text-[11px] font-extrabold">
                        {isCurrent ? (
                          <span className="text-emerald-700">En uso ✓</span>
                        ) : unlocked ? (
                          <span className="text-sky-700">Equipar</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <Lock className="h-3 w-3" /> {av.minXp} XP
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="text-lg font-black text-slate-900">Temas de Fondo</h2>
              <p className="mt-0.5 text-xs font-semibold text-slate-600">
                Consigue sellos en tu pasaporte para desbloquear nuevos colores para tus pantallas ({rewards.earnedBadgesCount} sellos).
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {STUDENT_THEMES.map((t) => {
                  const unlocked = rewards.earnedBadgesCount >= t.minBadges;
                  const isCurrent = themeId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => handleSelectTheme(t.id, t.label)}
                      className={`btn-duo flex flex-col gap-2.5 p-3 text-left ${
                        isCurrent
                          ? 'border-2 border-sky-500 bg-sky-50'
                          : unlocked
                            ? 'btn-duo-white hover:border-sky-300'
                            : 'border-2 border-slate-200 bg-slate-100 opacity-75'
                      }`}
                    >
                      <div className={!unlocked ? 'w-full grayscale-[45%]' : 'w-full'}>
                        <ThemeSceneBanner themeId={t.id} previewOnly />
                      </div>
                      <div className="flex w-full items-center justify-between gap-2 px-1">
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {t.emoji} {t.label}
                          </p>
                          <p className="text-xs font-bold text-slate-500">
                            {unlocked
                              ? isCurrent
                                ? 'Tema activo ✓'
                                : t.tagline
                              : `Requiere ${t.minBadges} sellos para desbloquear`}
                          </p>
                        </div>
                        {!unlocked && <Lock className="h-4 w-4 shrink-0 text-slate-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: PREMIO FAMILIAR */}
        {tab === 'family' && (
          <div className="space-y-6">
            {activeOrClaimedGoal && activeGoalProgress ? (
              <section className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-amber-700">
                  <Sparkles className="h-4 w-4" /> Tu meta familiar actual
                </div>
                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  🎁 {activeOrClaimedGoal.title}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Objetivo:{' '}
                  {activeOrClaimedGoal.metric === 'stars'
                    ? `conseguir ${activeOrClaimedGoal.targetValue} ★ nuevas`
                    : `completar ${activeOrClaimedGoal.targetValue} sesiones de práctica`}
                </p>

                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs font-black text-slate-700">
                    <span>Progreso</span>
                    <span>
                      {activeGoalProgress.current} / {activeGoalProgress.target}{' '}
                      {activeOrClaimedGoal.metric === 'stars' ? '★' : 'sesiones'} ({activeGoalProgress.percent} %)
                    </span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-amber-100 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all"
                      style={{ width: `${activeGoalProgress.percent}%` }}
                    />
                  </div>
                </div>

                {activeOrClaimedGoal.status === 'active' && activeGoalProgress.reached && (
                  <button
                    type="button"
                    onClick={() => void handleClaimGoal(activeOrClaimedGoal.id)}
                    className="btn-duo btn-duo-green mt-5 w-full py-3 text-base"
                  >
                    🎉 ¡Meta conseguida! Avisar a papá / mamá
                  </button>
                )}

                {activeOrClaimedGoal.status === 'claimed' && (
                  <div className="mt-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center text-sm font-extrabold text-emerald-900">
                    🎁 ¡Premio reclamado! Enséñale esta pantalla a papá o mamá para que lo marquen como entregado en la Zona Padres.
                  </div>
                )}
              </section>
            ) : (
              <section className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
                <Gift className="mx-auto mb-3 h-10 w-10 text-amber-500" />
                <h2 className="text-lg font-black text-slate-900">Aún no hay ningún premio familiar activo</h2>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Papá o mamá pueden acordar contigo un premio especial desde la pestaña <strong>Premios</strong> de la Zona Padres.
                </p>
              </section>
            )}

            {redeemedGoals.length > 0 && (
              <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-xs">
                <h3 className="text-base font-black text-slate-900">Premios ya conseguidos</h3>
                <div className="mt-3 space-y-2">
                  {redeemedGoals.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-sm"
                    >
                      <span className="font-extrabold text-slate-900">🎁 {g.title}</span>
                      <span className="text-xs font-bold text-emerald-800">
                        Canjeado el {new Date(g.redeemedAt ?? g.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
