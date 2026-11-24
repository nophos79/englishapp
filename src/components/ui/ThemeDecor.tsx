import { getStudentTheme, type StudentThemeId } from './Avatars';

export function ThemeBackdrop({ themeId }: { themeId: StudentThemeId }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {themeId === 'sky' && (
        <>
          <div className="absolute -top-12 right-8 h-48 w-48 rounded-full bg-amber-300/35 blur-2xl" />
          <svg
            viewBox="0 0 220 90"
            className="absolute top-20 -left-8 w-52 opacity-60 sm:w-72"
            fill="#ffffff"
          >
            <circle cx="55" cy="52" r="26" />
            <circle cx="95" cy="38" r="34" />
            <circle cx="142" cy="50" r="28" />
            <rect x="45" y="50" width="108" height="28" rx="14" />
          </svg>
          <svg
            viewBox="0 0 220 90"
            className="absolute bottom-10 -right-8 w-56 opacity-50 sm:w-80"
            fill="#ffffff"
          >
            <circle cx="60" cy="52" r="24" />
            <circle cx="100" cy="40" r="32" />
            <circle cx="145" cy="52" r="24" />
            <rect x="48" y="50" width="110" height="26" rx="13" />
          </svg>
        </>
      )}

      {themeId === 'london' && (
        <>
          <div className="absolute -top-16 -right-12 h-64 w-64 rounded-full bg-rose-300/25 blur-3xl" />
          <div className="absolute top-1/3 -left-16 h-64 w-64 rounded-full bg-blue-300/25 blur-3xl" />
          <svg
            viewBox="0 0 1200 180"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 h-32 w-full opacity-[0.11] sm:h-44"
          >
            {/* Big Ben */}
            <rect x="110" y="55" width="36" height="125" fill="#1e3a8a" />
            <polygon points="128,12 106,55 150,55" fill="#1e3a8a" />
            <circle cx="128" cy="78" r="10" fill="#fef08a" />
            {/* London Eye */}
            <circle cx="340" cy="105" r="56" fill="none" stroke="#be123c" strokeWidth="8" />
            <circle cx="340" cy="105" r="12" fill="#be123c" />
            <line x1="315" y1="175" x2="340" y2="105" stroke="#1e3a8a" strokeWidth="7" />
            <line x1="365" y1="175" x2="340" y2="105" stroke="#1e3a8a" strokeWidth="7" />
            {/* Tower Bridge */}
            <rect x="830" y="45" width="32" height="135" fill="#1e3a8a" />
            <polygon points="846,18 828,45 864,45" fill="#be123c" />
            <rect x="970" y="45" width="32" height="135" fill="#1e3a8a" />
            <polygon points="986,18 968,45 1004,45" fill="#be123c" />
            <rect x="862" y="75" width="108" height="12" fill="#1e3a8a" />
            <rect x="780" y="135" width="270" height="14" fill="#be123c" />
            {/* Skyline base */}
            <rect x="0" y="155" width="1200" height="25" fill="#1e3a8a" />
          </svg>
        </>
      )}

      {themeId === 'jungle' && (
        <>
          <div className="absolute -top-10 right-10 h-52 w-52 rounded-full bg-lime-300/35 blur-2xl" />
          {/* Top-left palm fronds */}
          <svg
            viewBox="0 0 220 220"
            className="absolute top-12 -left-10 w-44 opacity-25 sm:w-64"
          >
            <path d="M10 10 Q110 25 180 95 Q110 75 10 10Z" fill="#15803d" />
            <path d="M10 10 Q60 100 120 185 Q45 130 10 10Z" fill="#16a34a" />
            <path d="M10 10 Q145 5 210 42 Q125 50 10 10Z" fill="#65a30d" />
          </svg>
          {/* Bottom-right tropical leaves */}
          <svg
            viewBox="0 0 220 220"
            className="absolute -bottom-8 -right-8 w-48 opacity-25 sm:w-72"
          >
            <path d="M210 210 Q100 190 30 120 Q110 140 210 210Z" fill="#0f766e" />
            <path d="M210 210 Q160 110 95 30 Q175 85 210 210Z" fill="#15803d" />
            <path d="M210 210 Q75 210 15 170 Q105 160 210 210Z" fill="#65a30d" />
          </svg>
          <div className="absolute top-1/3 right-12 h-4 w-4 rounded-full bg-lime-400/50" />
          <div className="absolute bottom-1/4 left-12 h-3 w-3 rounded-full bg-emerald-400/50" />
        </>
      )}

      {themeId === 'galaxy' && (
        <>
          <div className="absolute -top-20 -right-12 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />
          <div className="absolute bottom-0 -left-16 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
          {/* Starfield + Saturn + Crescent Moon */}
          <svg
            viewBox="0 0 1000 700"
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full opacity-75"
          >
            <circle cx="80" cy="110" r="2" fill="#ffffff" />
            <circle cx="190" cy="70" r="1.5" fill="#bae6fd" />
            <circle cx="290" cy="180" r="2.2" fill="#fef08a" />
            <circle cx="430" cy="95" r="1.5" fill="#ffffff" />
            <circle cx="560" cy="150" r="2" fill="#f5d0fe" />
            <circle cx="710" cy="80" r="1.8" fill="#ffffff" />
            <circle cx="890" cy="210" r="2.5" fill="#fef08a" />
            <circle cx="140" cy="360" r="1.8" fill="#bae6fd" />
            <circle cx="65" cy="520" r="2.2" fill="#ffffff" />
            <circle cx="870" cy="490" r="2" fill="#f5d0fe" />
            <circle cx="940" cy="610" r="2.5" fill="#fef08a" />
            <circle cx="480" cy="610" r="1.6" fill="#bae6fd" />
            {/* Ringed Saturn top-right */}
            <g transform="translate(860 120) rotate(-18)" opacity="0.45">
              <ellipse cx="0" cy="0" rx="56" ry="15" fill="none" stroke="#c084fc" strokeWidth="6" />
              <circle cx="0" cy="0" r="28" fill="#fbbf24" />
              <path d="M-56 0 A56 15 0 0 0 56 0" fill="none" stroke="#e879f9" strokeWidth="5" />
            </g>
            {/* Crescent moon bottom-left */}
            <g transform="translate(90 590)" opacity="0.35">
              <path
                d="M15 -26 A28 28 0 1 0 38 14 A22 22 0 1 1 15 -26Z"
                fill="#fde047"
              />
            </g>
          </svg>
        </>
      )}
    </div>
  );
}

interface ThemeSceneBannerProps {
  themeId: StudentThemeId;
  nickname?: string;
  compact?: boolean;
  previewOnly?: boolean;
}

export function ThemeSceneBanner({
  themeId,
  nickname,
  compact = false,
  previewOnly = false,
}: ThemeSceneBannerProps) {
  const theme = getStudentTheme(themeId);
  const heightClass = previewOnly ? 'h-20' : compact ? 'h-20 sm:h-24' : 'h-24 sm:h-28';

  const bannerBg =
    themeId === 'sky'
      ? 'from-sky-500 via-sky-400 to-emerald-400'
      : themeId === 'london'
        ? 'from-blue-950 via-blue-800 to-rose-600'
        : themeId === 'jungle'
          ? 'from-emerald-900 via-emerald-700 to-lime-500'
          : 'from-slate-950 via-indigo-900 to-fuchsia-800';

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-r ${bannerBg} ${heightClass} shadow-xs`}
    >
      {/* Illustrated SVG scenery on right half / panoramic backdrop */}
      <svg
        aria-hidden="true"
        viewBox="0 0 640 120"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {themeId === 'sky' && (
          <>
            {/* Rainbow */}
            <path d="M350 115 A105 82 0 0 1 560 115" fill="none" stroke="#fda4af" strokeWidth="7" opacity="0.7" />
            <path d="M357 115 A98 75 0 0 1 553 115" fill="none" stroke="#fde047" strokeWidth="7" opacity="0.75" />
            <path d="M364 115 A91 68 0 0 1 546 115" fill="none" stroke="#6ee7b7" strokeWidth="7" opacity="0.75" />
            {/* Smiling Sun */}
            <circle cx="560" cy="36" r="22" fill="#fde047" />
            <circle cx="560" cy="36" r="28" fill="#fef08a" opacity="0.35" />
            {/* Fluffy Clouds */}
            <g fill="#ffffff" opacity="0.92">
              <circle cx="405" cy="38" r="14" />
              <circle cx="425" cy="32" r="18" />
              <circle cx="445" cy="40" r="13" />
              <rect x="398" y="38" width="56" height="16" rx="8" />
            </g>
            {/* Rolling Hills */}
            <path d="M0 120 Q220 75 440 105 T640 85 L640 120 Z" fill="#22c55e" opacity="0.55" />
            <path d="M260 120 Q430 82 640 102 L640 120 Z" fill="#16a34a" opacity="0.7" />
          </>
        )}

        {themeId === 'london' && (
          <>
            {/* Twinkling skyline stars */}
            <circle cx="380" cy="22" r="2" fill="#fef08a" opacity="0.8" />
            <circle cx="430" cy="16" r="1.5" fill="#ffffff" opacity="0.7" />
            <circle cx="520" cy="24" r="2" fill="#fef08a" opacity="0.8" />
            <circle cx="590" cy="18" r="1.8" fill="#ffffff" opacity="0.7" />
            {/* London Eye */}
            <circle cx="395" cy="68" r="30" fill="none" stroke="#fda4af" strokeWidth="3.5" opacity="0.85" />
            <circle cx="395" cy="68" r="5" fill="#fda4af" />
            <line x1="382" y1="106" x2="395" y2="68" stroke="#cbd5e1" strokeWidth="3" />
            <line x1="408" y1="106" x2="395" y2="68" stroke="#cbd5e1" strokeWidth="3" />
            {/* Big Ben */}
            <rect x="462" y="28" width="24" height="78" fill="#1e293b" />
            <polygon points="474,6 458,28 490,28" fill="#0f172a" />
            <circle cx="474" cy="44" r="7" fill="#fef08a" />
            <line x1="474" y1="44" x2="474" y2="39" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="474" y1="44" x2="478" y2="44" stroke="#0f172a" strokeWidth="1.5" />
            {/* Tower Bridge */}
            <rect x="526" y="38" width="16" height="68" fill="#334155" />
            <polygon points="534,20 524,38 544,38" fill="#e11d48" />
            <rect x="582" y="38" width="16" height="68" fill="#334155" />
            <polygon points="590,20 580,38 600,38" fill="#e11d48" />
            <rect x="542" y="54" width="40" height="6" fill="#64748b" />
            {/* Road */}
            <rect x="0" y="102" width="640" height="18" fill="#0f172a" opacity="0.65" />
            {/* Red Double-Decker Bus */}
            <g transform="translate(495, 58)">
              <rect x="0" y="0" width="70" height="40" rx="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="6" y="6" width="16" height="11" rx="2" fill="#bae6fd" />
              <rect x="26" y="6" width="16" height="11" rx="2" fill="#bae6fd" />
              <rect x="46" y="6" width="16" height="11" rx="2" fill="#bae6fd" />
              <rect x="6" y="21" width="16" height="11" rx="2" fill="#bae6fd" />
              <rect x="26" y="21" width="16" height="11" rx="2" fill="#bae6fd" />
              <rect x="46" y="21" width="16" height="11" rx="2" fill="#fef08a" />
              <circle cx="16" cy="40" r="7" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
              <circle cx="54" cy="40" r="7" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
            </g>
          </>
        )}

        {themeId === 'jungle' && (
          <>
            {/* Tropical sun */}
            <circle cx="545" cy="34" r="22" fill="#fde047" opacity="0.9" />
            <circle cx="545" cy="34" r="32" fill="#fef08a" opacity="0.25" />
            {/* Distant jungle hills */}
            <path d="M280 120 Q390 60 510 95 T640 75 L640 120 Z" fill="#065f46" opacity="0.55" />
            {/* Vine */}
            <path d="M360 0 Q410 42 465 14 Q505 45 555 0" fill="none" stroke="#a3e635" strokeWidth="3.5" />
            {/* Palm tree right */}
            <path d="M582 120 Q575 72 560 45" fill="none" stroke="#78350f" strokeWidth="9" strokeLinecap="round" />
            <path d="M560 45 Q520 30 500 50 Q532 48 560 45Z" fill="#4ade80" />
            <path d="M560 45 Q595 25 625 46 Q590 48 560 45Z" fill="#22c55e" />
            <path d="M560 45 Q528 12 548 5 Q560 25 560 45Z" fill="#84cc16" />
            <path d="M560 45 Q600 55 615 80 Q580 65 560 45Z" fill="#16a34a" />
            {/* Colorful Parrot silhouette */}
            <g transform="translate(450, 32)">
              <ellipse cx="14" cy="24" rx="10" ry="16" fill="#ef4444" />
              <circle cx="14" cy="12" r="8" fill="#ef4444" />
              <polygon points="21,10 29,14 21,17" fill="#facc15" />
              <path d="M6 22 Q2 32 10 40 L16 34 Z" fill="#38bdf8" />
              <circle cx="17" cy="11" r="1.8" fill="#0f172a" />
            </g>
            {/* Lush foreground leaves */}
            <circle cx="380" cy="118" r="24" fill="#15803d" opacity="0.85" />
            <circle cx="420" cy="122" r="28" fill="#16a34a" opacity="0.9" />
            <circle cx="620" cy="116" r="26" fill="#15803d" opacity="0.9" />
          </>
        )}

        {themeId === 'galaxy' && (
          <>
            {/* Twinkling Stars */}
            <circle cx="360" cy="24" r="2" fill="#ffffff" />
            <circle cx="410" cy="70" r="1.5" fill="#bae6fd" />
            <circle cx="475" cy="18" r="2.2" fill="#fef08a" />
            <circle cx="520" cy="95" r="1.8" fill="#ffffff" />
            <circle cx="605" cy="28" r="2.2" fill="#f5d0fe" />
            <circle cx="330" cy="90" r="1.8" fill="#fef08a" />
            {/* Shooting Star */}
            <line x1="390" y1="36" x2="440" y2="18" stroke="#67e8f9" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            {/* Crescent Moon */}
            <path d="M398 52 A16 16 0 1 0 414 78 A12 12 0 1 1 398 52Z" fill="#fde047" />
            {/* Ringed Saturn */}
            <g transform="translate(565, 58) rotate(-18)">
              <ellipse cx="0" cy="0" rx="40" ry="11" fill="none" stroke="#e879f9" strokeWidth="5" opacity="0.8" />
              <circle cx="0" cy="0" r="20" fill="#fbbf24" />
              <path d="M-40 0 A40 11 0 0 0 40 0" fill="none" stroke="#c084fc" strokeWidth="4.5" />
            </g>
            {/* Space Rocket */}
            <g transform="translate(475, 54) rotate(32)">
              <path d="M0 -24 Q12 -6 10 16 L-10 16 Q-12 -6 0 -24Z" fill="#f8fafc" />
              <path d="M0 -24 Q8 -12 8 -6 L-8 -6 Q-8 -12 0 -24Z" fill="#ef4444" />
              <circle cx="0" cy="2" r="4.5" fill="#38bdf8" />
              <polygon points="-10,6 -17,17 -9,16" fill="#ef4444" />
              <polygon points="10,6 17,17 9,16" fill="#ef4444" />
              <polygon points="-6,16 0,30 6,16" fill="#fbbf24" />
            </g>
          </>
        )}
      </svg>

      {/* Dark scrim behind text so labels stay WCAG AA readable */}
      {!previewOnly && (
        <div className="relative z-10 flex h-full items-center bg-gradient-to-r from-slate-950/65 via-slate-950/35 to-transparent px-4 sm:px-5">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-black text-white backdrop-blur-xs">
              {theme.emoji} {theme.label}
            </span>
            <p className="mt-1 truncate text-sm font-black text-white sm:text-base">
              {nickname ? `¡Hola, ${nickname}! · ${theme.tagline}` : theme.tagline}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
