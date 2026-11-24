export const AVATARS = [
  { id: 'owl', label: 'Búho', emoji: '🦉', bg: 'bg-indigo-100 text-indigo-800' },
  { id: 'fox', label: 'Zorro', emoji: '🦊', bg: 'bg-orange-100 text-orange-800' },
  { id: 'panda', label: 'Panda', emoji: '🐼', bg: 'bg-emerald-100 text-emerald-800' },
  { id: 'lion', label: 'León', emoji: '🦁', bg: 'bg-amber-100 text-amber-800' },
  { id: 'dolphin', label: 'Delfín', emoji: '🐬', bg: 'bg-sky-100 text-sky-800' },
  { id: 'unicorn', label: 'Unicornio', emoji: '🦄', bg: 'bg-pink-100 text-pink-800' },
] as const;

export function getAvatar(avatarId: string) {
  return AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];
}
