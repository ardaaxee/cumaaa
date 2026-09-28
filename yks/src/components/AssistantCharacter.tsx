import { useId } from 'react';
import { useSelector } from '../store/store';
import { useTeacherPhoto } from './TeacherAvatar';

export type AssistantMood = 'idle' | 'talking' | 'thinking' | 'happy' | 'listening';

/** Varsayılan yüz (public/assistant-face.webp) üzerindeki yüz noktaları, SVG birimiyle. */
const HEAD = { x: 50, y: 8, w: 100, h: 129.4 };
const JAW_Y = 114.2;
const MOUTH = { cx: 86, cy: 115.6, rx: 14, ry: 4.2 };
const EYES = [
  { cx: 68.4, cy: 75.3 },
  { cx: 105.1, cy: 72.3 },
];
const SKIN = '#b98a7d';
const SKIN_DARK = '#a4796c';
const SHIRT = '#3b3d44';
const SHIRT_LIGHT = '#4a4d55';
const SLEEVE = '#50535c';
const HAND = '#c99583';

/**
 * Konuşan asistan karakteri: gerçek yüz fotoğrafı + çizgi film gövde.
 * Konuşurken çene açılıp kapanır ve baş sallanır, ara ara göz kırpar,
 * mutluyken el sallar, düşünürken elini çenesine götürür.
 * Kullanıcı ayarlardan farklı bir fotoğraf yüklerse yüz yuvarlak kırpılır ve
 * çene/göz animasyonu yerine yalnızca baş hareketi uygulanır.
 */
export function AssistantCharacter({ mood = 'idle', size = 200 }: { mood?: AssistantMood; size?: number }) {
  const custom = useTeacherPhoto();
  const focusY = useSelector((s) => s.settings.teacherPhotoFocusY);
  const name = useSelector((s) => s.settings.teacherName);
  const uid = useId().replace(/:/g, '');
  const src = custom ?? 'assistant-face.webp';
  const isDefault = !custom;

  return (
    <svg
      className={`asst asst-${mood}`}
      viewBox="0 0 200 250"
      width={size}
      height={(size * 250) / 200}
      role="img"
      aria-label={`${name} karakteri`}
    >
      <defs>
        <clipPath id={`top-${uid}`}>
          <rect x="0" y="0" width="200" height={JAW_Y} />
        </clipPath>
        <clipPath id={`jaw-${uid}`}>
          <rect x="0" y={JAW_Y} width="200" height="60" />
        </clipPath>
        <clipPath id={`round-${uid}`}>
          <ellipse cx="100" cy="72" rx="46" ry="58" />
        </clipPath>
      </defs>

      {/* gölge */}
      <ellipse cx="100" cy="246" rx="62" ry="4" fill="rgba(60,40,30,.14)" />

      <g className="asst-body">
        {/* boyun */}
        <path d="M84 122 q12 6 26 0 v22 q-13 9 -26 0 z" fill={SKIN} />
        <path d="M84 132 q12 6 26 0" stroke={SKIN_DARK} strokeWidth="2" fill="none" opacity=".6" />
        {/* gövde (tişört) */}
        <path d="M38 250 C36 190 44 158 76 146 Q100 156 124 146 C156 158 164 190 162 250 Z" fill={SHIRT} />
        <path d="M80 146 Q100 160 120 146" stroke={SHIRT_LIGHT} strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* tişört baskısı: küçük kalp ve kitap */}
        <g opacity=".85">
          <rect x="84" y="190" width="32" height="22" rx="3" fill="none" stroke="#c9c2b8" strokeWidth="2" />
          <path d="M100 190 v22" stroke="#c9c2b8" strokeWidth="2" />
          <path d="M100 182 c-3 -5 -10 -2 -6 3 l6 5 l6 -5 c4 -5 -3 -8 -6 -3 z" fill="#e78fa8" />
        </g>

        {/* sol kol (izleyicinin solu) */}
        <g className="asst-arm-l">
          <path d="M52 168 Q34 196 44 226" stroke={SLEEVE} strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="45" cy="229" r="9" fill={HAND} />
        </g>
        {/* düşünme kolu: el çeneye */}
        <g className="asst-arm-think">
          <path d="M52 168 Q40 200 70 196 Q86 180 84 150" stroke={SLEEVE} strokeWidth="17" strokeLinecap="round" fill="none" />
          <circle cx="84" cy="144" r="9" fill={HAND} />
        </g>
        {/* sağ kol: el sallama / anlatma */}
        <g className="asst-arm-r">
          <path d="M148 168 Q166 196 156 226" stroke={SLEEVE} strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="155" cy="229" r="9" fill={HAND} />
        </g>
        <g className="asst-arm-wave">
          <path d="M148 166 Q172 150 172 118" stroke={SLEEVE} strokeWidth="18" strokeLinecap="round" fill="none" />
          <g className="asst-hand-wave">
            <circle cx="172" cy="108" r="10" fill={HAND} />
            <path d="M166 100 v-8 M171 99 v-10 M176 100 v-8" stroke={HAND} strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>
      </g>

      <g className="asst-head">
        {isDefault ? (
          <>
            {/* çene açıldığında görünen iç kısım: ten + ağız */}
            <image href={src} x={HEAD.x} y={HEAD.y + 2.4} width={HEAD.w} height={HEAD.h} preserveAspectRatio="xMidYMid slice" />
            <ellipse cx={MOUTH.cx} cy={MOUTH.cy} rx={MOUTH.rx} ry={MOUTH.ry} fill="#5b2730" />
            <ellipse cx={MOUTH.cx} cy={MOUTH.cy - 1.6} rx={MOUTH.rx - 4} ry="1.3" fill="#f3ece6" opacity=".9" />
            <image href={src} x={HEAD.x} y={HEAD.y} width={HEAD.w} height={HEAD.h} clipPath={`url(#top-${uid})`} preserveAspectRatio="xMidYMid slice" />
            <g className="asst-jaw">
              <image href={src} x={HEAD.x} y={HEAD.y} width={HEAD.w} height={HEAD.h} clipPath={`url(#jaw-${uid})`} preserveAspectRatio="xMidYMid slice" />
            </g>
            {/* göz kapakları (kırpma) */}
            <g className="asst-lids" fill={SKIN_DARK}>
              {EYES.map((e) => (
                <ellipse key={e.cx} cx={e.cx} cy={e.cy} rx="7.2" ry="3.8" />
              ))}
            </g>
          </>
        ) : (
          <>
            <ellipse cx="100" cy="72" rx="48" ry="60" fill="var(--surface-2)" />
            <image
              href={src}
              x="54"
              y="14"
              width="92"
              height="116"
              clipPath={`url(#round-${uid})`}
              preserveAspectRatio={`xMidYMid slice`}
              style={{ objectPosition: `50% ${focusY}%` }}
            />
          </>
        )}
        {/* yanaklarda hafif pembelik */}
        <ellipse cx="62" cy="96" rx="7" ry="4" fill="#f29bb0" opacity=".22" />
        <ellipse cx="116" cy="94" rx="7" ry="4" fill="#f29bb0" opacity=".22" />
      </g>

      {/* düşünme baloncukları */}
      <g className="asst-think-dots" fill="var(--lavender)">
        <circle cx="150" cy="40" r="3" />
        <circle cx="160" cy="28" r="4.5" />
        <circle cx="174" cy="14" r="6" />
      </g>
      {/* dinleme dalgaları */}
      <g className="asst-listen" stroke="var(--brand)" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M156 62 q8 10 0 20" />
        <path d="M164 56 q13 16 0 32" />
      </g>
    </svg>
  );
}
