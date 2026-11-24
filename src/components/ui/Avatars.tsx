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
  bgClass: string;
  previewClass: string;
}

export const STUDENT_THEMES: readonly StudentThemeOption[] = [
  {
    id: 'sky',
    label: 'Cielo Clásico',
    emoji: '☀️',
    minBadges: 0,
    bgClass: 'from-sky-50 via-white to-emerald-50/40',
    previewClass: 'from-sky-300 to-emerald-300',
  },
  {
    id: 'london',
    label: 'Aventura en Londres',
    emoji: '🚌',
    minBadges: 2,
    bgClass: 'from-rose-50 via-white to-sky-100/60',
    previewClass: 'from-rose-400 to-sky-400',
  },
  {
    id: 'jungle',
    label: 'Selva Exploradora',
    emoji: '🌴',
    minBadges: 4,
    bgClass: 'from-emerald-100/70 via-lime-50/40 to-teal-50',
    previewClass: 'from-emerald-400 to-lime-400',
  },
  {
    id: 'galaxy',
    label: 'Galaxia Estelar',
    emoji: '🌌',
    minBadges: 6,
    bgClass: 'from-indigo-100/70 via-violet-50/50 to-fuchsia-50/50',
    previewClass: 'from-indigo-500 to-fuchsia-400',
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
