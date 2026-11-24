export interface AvatarItem {
  id: string;
  label: string;
  emoji: string;
  bg: string;
  minXp: number;
}

export const AVATARS: readonly AvatarItem[] = [
  { id: 'owl', label: 'Búho', emoji: '🦉', bg: 'bg-indigo-100 text-indigo-800', minXp: 0 },
  { id: 'fox', label: 'Zorro', emoji: '🦊', bg: 'bg-orange-100 text-orange-800', minXp: 0 },
  { id: 'panda', label: 'Panda', emoji: '🐼', bg: 'bg-emerald-100 text-emerald-800', minXp: 0 },
  { id: 'lion', label: 'León', emoji: '🦁', bg: 'bg-amber-100 text-amber-800', minXp: 0 },
  { id: 'dolphin', label: 'Delfín', emoji: '🐬', bg: 'bg-sky-100 text-sky-800', minXp: 0 },
  { id: 'unicorn', label: 'Unicornio', emoji: '🦄', bg: 'bg-pink-100 text-pink-800', minXp: 0 },
];

export const UNLOCKABLE_AVATARS: readonly AvatarItem[] = [
  { id: 'corgi', label: 'Corgi Británico', emoji: '🐶', bg: 'bg-sky-100 text-sky-800', minXp: 50 },
  { id: 'explorer', label: 'Explorador', emoji: '🧭', bg: 'bg-teal-100 text-teal-800', minXp: 150 },
  { id: 'royal_guard', label: 'Guardia Real', emoji: '💂', bg: 'bg-rose-100 text-rose-800', minXp: 350 },
  { id: 'astronaut', label: 'Astronauta', emoji: '🚀', bg: 'bg-violet-100 text-violet-800', minXp: 650 },
  { id: 'dragon', label: 'Dragón Galés', emoji: '🐉', bg: 'bg-emerald-100 text-emerald-800', minXp: 1000 },
  { id: 'crown_king', label: 'Corona Real', emoji: '👑', bg: 'bg-amber-100 text-amber-900', minXp: 1500 },
];

export const ALL_AVATARS: readonly AvatarItem[] = [...AVATARS, ...UNLOCKABLE_AVATARS];

export function getAvatar(avatarId: string): AvatarItem {
  return ALL_AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];
}

export type StudentThemeId = 'sky' | 'london' | 'jungle' | 'galaxy';

export interface StudentThemeOption {
  id: StudentThemeId;
  label: string;
  emoji: string;
  minBadges: number;
  isDark: boolean;
  tagline: string;
  bgClass: string;
  previewClass: string;
  headerClass: string;
  headerTitleClass: string;
  headerSubtitleClass: string;
  sectionHeadingClass: string;
  sectionLabelClass: string;
  cardAccentBorder: string;
  progressBarClass: string;
}

export const STUDENT_THEMES: readonly StudentThemeOption[] = [
  {
    id: 'sky',
    label: 'Cielo Clásico',
    emoji: '☀️',
    minBadges: 0,
    isDark: false,
    tagline: '¡Día soleado para aprender inglés!',
    bgClass: 'from-sky-100 via-sky-50 to-emerald-50',
    previewClass: 'from-sky-400 to-emerald-400',
    headerClass: 'border-sky-200 bg-white/95 text-slate-900',
    headerTitleClass: 'text-slate-900',
    headerSubtitleClass: 'text-emerald-700',
    sectionHeadingClass: 'text-slate-900',
    sectionLabelClass: 'text-slate-600',
    cardAccentBorder: 'border-sky-200',
    progressBarClass: 'from-emerald-400 to-green-500',
  },
  {
    id: 'london',
    label: 'Aventura en Londres',
    emoji: '🚌',
    minBadges: 2,
    isDark: false,
    tagline: 'Welcome to London · Big Ben & Red Bus!',
    bgClass: 'from-sky-100 via-rose-50/70 to-blue-100/80',
    previewClass: 'from-blue-700 via-indigo-600 to-rose-500',
    headerClass: 'border-rose-400/70 bg-gradient-to-r from-blue-900 via-blue-800 to-rose-700 text-white',
    headerTitleClass: 'text-white',
    headerSubtitleClass: 'text-sky-100',
    sectionHeadingClass: 'text-slate-900',
    sectionLabelClass: 'text-blue-900',
    cardAccentBorder: 'border-rose-300',
    progressBarClass: 'from-rose-500 via-amber-400 to-blue-600',
  },
  {
    id: 'jungle',
    label: 'Selva Exploradora',
    emoji: '🌴',
    minBadges: 4,
    isDark: false,
    tagline: 'Into the Jungle · Exploración tropical',
    bgClass: 'from-emerald-100 via-lime-50 to-teal-100/80',
    previewClass: 'from-emerald-600 to-lime-500',
    headerClass: 'border-lime-400/70 bg-gradient-to-r from-emerald-800 via-teal-700 to-lime-600 text-white',
    headerTitleClass: 'text-white',
    headerSubtitleClass: 'text-lime-100',
    sectionHeadingClass: 'text-slate-900',
    sectionLabelClass: 'text-emerald-900',
    cardAccentBorder: 'border-emerald-300',
    progressBarClass: 'from-lime-400 via-emerald-500 to-teal-500',
  },
  {
    id: 'galaxy',
    label: 'Galaxia Estelar',
    emoji: '🌌',
    minBadges: 6,
    isDark: true,
    tagline: 'Space Mission · Ready for liftoff!',
    bgClass: 'from-slate-950 via-indigo-950 to-violet-950',
    previewClass: 'from-indigo-700 via-violet-600 to-fuchsia-500',
    headerClass: 'border-violet-500/40 bg-gradient-to-r from-slate-950 via-indigo-900 to-fuchsia-900 text-white',
    headerTitleClass: 'text-white',
    headerSubtitleClass: 'text-cyan-200',
    sectionHeadingClass: 'text-white',
    sectionLabelClass: 'text-indigo-200',
    cardAccentBorder: 'border-violet-400',
    progressBarClass: 'from-cyan-400 via-violet-400 to-fuchsia-500',
  },
];

export function getStudentTheme(themeId: string | null | undefined): StudentThemeOption {
  return STUDENT_THEMES.find((t) => t.id === themeId) ?? STUDENT_THEMES[0];
}

function themeStorageKey(studentId: string): string {
  return `englishapp_theme_${studentId}`;
}

export function getStoredStudentThemeId(studentId: string): StudentThemeId {
  try {
    const raw = localStorage.getItem(themeStorageKey(studentId));
    return getStudentTheme(raw).id;
  } catch {
    return 'sky';
  }
}

export function setStoredStudentThemeId(studentId: string, themeId: StudentThemeId): void {
  try {
    localStorage.setItem(themeStorageKey(studentId), themeId);
  } catch {
    // Ignore storage restrictions
  }
}
