import { useId } from 'react';
import { useSelector } from '../store/store';

export type AssistantMood = 'idle' | 'talking' | 'thinking' | 'happy' | 'listening';

const EYES = [
  { cx: 99, cy: 98 },
  { cx: 146, cy: 97 },
];

const INK = '#2b2430';
const SHIRT = '#3d4049';
const SHIRT_SHADE = '#33363e';
const SHIRT_LIGHT = '#50545e';
const SKIN = '#f1c6a8';
const SKIN_SHADE = '#d9a27f';
const HAIR = '#2a1f1c';
const HAIR_LIGHT = '#4a3a33';
const DESK = '#e9cda6';
const DESK_EDGE = '#d4b183';

/**
 * Konuşan asistan: kullanıcıya benzeyen çizgi film karakter (koyu kısa saç, alna düşen perçem,
 * kalın kaşlar, kahverengi gözler, alındaki küçük ben, gri tişört), masada ders çalışırken.
 * - idle: nefes alır, göz kırpar, kalemle deftere yazar
 * - talking: ağzı açılıp kapanır, kaşları oynar, baş sallanır, eliyle anlatır
 * - thinking: eli çenesinde, başı yana eğik, düşünce baloncukları
 * - happy: el sallar, hafif zıplar
 * - listening: başı eğik, ses dalgaları
 */
export function AssistantCharacter({ mood = 'idle', size = 200 }: { mood?: AssistantMood; size?: number }) {
  const name = useSelector((s) => s.settings.teacherName);
  const uid = useId().replace(/:/g, '');

  return (
    <svg className={`asst asst-${mood}`} viewBox="0 0 240 300" width={size} height={(size * 300) / 240} role="img" aria-label={`${name} karakteri`}>
      <defs>
        <linearGradient id={`desk-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={DESK} />
          <stop offset="1" stopColor={DESK_EDGE} />
        </linearGradient>
      </defs>

      {/* ---- baş (çizgi film portre) ---- */}
      <g className="asst-head">
        {/* boyun */}
        <path d="M104 146 h36 v42 h-36 z" fill={SKIN} stroke={INK} strokeWidth="2.5" />
        <path d="M104 160 q18 9 36 0" stroke={SKIN_SHADE} strokeWidth="4" fill="none" opacity=".6" />
        {/* kulaklar */}
        <ellipse cx="66" cy="102" rx="9" ry="14" fill={SKIN} stroke={INK} strokeWidth="2.5" />
        <ellipse cx="178" cy="100" rx="9" ry="14" fill={SKIN} stroke={INK} strokeWidth="2.5" />
        <path d="M66 94 q-4 8 1 16 M178 92 q4 8 -1 16" stroke={SKIN_SHADE} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {/* yüz */}
        <path
          d="M122 38 C159 38 175 64 175 100 C175 131 158 160 122 166 C86 160 69 131 69 100 C69 64 85 38 122 38 Z"
          fill={SKIN}
          stroke={INK}
          strokeWidth="2.5"
        />
        {/* çene gölgesi */}
        <path d="M86 140 Q122 170 158 140" stroke={SKIN_SHADE} strokeWidth="5" fill="none" opacity=".35" strokeLinecap="round" />
        {/* saç: kısa, üstte hacimli ve dağınık, yana taranmış sivri perçem */}
        <path
          d="M63 106 C52 58 78 18 124 16 C170 16 194 52 182 106 C180 92 177 82 171 74 C165 64 157 60 150 61 L154 72 C146 63 138 59 130 61 L134 73 C126 63 116 59 106 63 L112 73 C102 66 92 66 84 71 L90 77 C80 78 72 88 66 98 Z"
          fill={HAIR}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M90 36 Q108 26 130 28 M138 30 Q158 34 170 50 M100 50 Q118 42 140 46" stroke={HAIR_LIGHT} strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* favoriler */}
        <path d="M70 96 q2 10 4 16 M174 94 q-2 10 -4 16" stroke={HAIR} strokeWidth="5" strokeLinecap="round" />
        {/* kaşlar: kalın ve koyu */}
        <g className="asst-brows" stroke={HAIR} strokeWidth="5.5" strokeLinecap="round" fill="none">
          <path d="M85 85 Q99 76 114 82" />
          <path d="M131 81 Q146 74 161 82" />
        </g>
        {/* alındaki küçük ben */}
        <circle cx="119" cy="76" r="1.6" fill="#7a5040" />
        {/* gözler */}
        <g className="asst-eyes">
          {EYES.map((e) => (
            <g key={e.cx}>
              <ellipse cx={e.cx} cy={e.cy} rx="10" ry="7.2" fill="#fff" stroke={INK} strokeWidth="2" />
              <g className="asst-iris">
                <circle cx={e.cx + 1} cy={e.cy + 0.6} r="5.4" fill="#5b3a26" />
                <circle cx={e.cx + 1} cy={e.cy + 0.6} r="2.6" fill="#1b1311" />
                <circle cx={e.cx + 2.8} cy={e.cy - 1.4} r="1.6" fill="#fff" />
              </g>
              {/* hafif düşük göz kapağı çizgisi (rahat bakış) */}
              <path d={`M${e.cx - 10} ${e.cy - 2} Q${e.cx} ${e.cy - 9} ${e.cx + 10} ${e.cy - 2}`} stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
            </g>
          ))}
          <g className="asst-lids" fill={SKIN}>
            {EYES.map((e) => (
              <ellipse key={e.cx} cx={e.cx} cy={e.cy} rx="11" ry="8" />
            ))}
          </g>
        </g>
        {/* burun */}
        <path d="M121 96 Q117 114 118 119 Q122 124 129 120" stroke={SKIN_SHADE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        {/* yanaklar */}
        <ellipse cx="88" cy="120" rx="8" ry="4.5" fill="#f19aa9" opacity=".35" />
        <ellipse cx="156" cy="119" rx="8" ry="4.5" fill="#f19aa9" opacity=".35" />
        {/* ağız: kapalı hafif gülümseme / konuşurken açılan ağız */}
        <path className="asst-mouth-closed" d="M109 136 Q123 143 137 134" stroke="#7d3b3b" strokeWidth="3" fill="none" strokeLinecap="round" />
        <g className="asst-mouth-open">
          <ellipse cx="123" cy="138" rx="9.5" ry="6" fill="#6b2632" stroke={INK} strokeWidth="2" />
          <ellipse cx="123" cy="141.5" rx="5.5" ry="2.4" fill="#e9798c" />
          <path d="M115 135.5 h16" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      </g>

      {/* ---- gövde ---- */}
      <g className="asst-body">
        <path
          d="M46 300 C44 232 58 192 100 178 Q126 192 154 178 C196 192 208 232 206 300 Z"
          fill={SHIRT}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M60 300 C60 250 66 214 84 196" stroke={SHIRT_SHADE} strokeWidth="10" fill="none" strokeLinecap="round" opacity=".7" />
        <path d="M101 179 Q127 198 153 179" stroke={SHIRT_LIGHT} strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* tişört baskısı: kalp */}
        <path d="M126 222 c-5 -8 -17 -3 -10 5 l10 9 l10 -9 c7 -8 -5 -13 -10 -5 z" fill="#f09bb3" stroke={INK} strokeWidth="1.5" />
      </g>

      {/* ---- masa + defter ---- */}
      <g className="asst-desk">
        <rect x="6" y="246" width="228" height="58" rx="12" fill={`url(#desk-${uid})`} stroke={INK} strokeWidth="2.5" />
        <path d="M16 256 H224" stroke="#f6e3c7" strokeWidth="3" strokeLinecap="round" />
        {/* açık defter */}
        <path d="M70 250 L118 244 L118 262 L66 266 Z" fill="#fffdf8" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M118 244 L170 250 L174 266 L118 262 Z" fill="#fffdf8" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M78 254 L110 250 M78 259 L106 256 M126 251 L160 255 M126 256 L152 259" stroke="#b9a7d6" strokeWidth="1.6" strokeLinecap="round" />
        {/* kalemlik */}
        <rect x="194" y="222" width="22" height="28" rx="5" fill="#a58bd8" stroke={INK} strokeWidth="2" />
        <path d="M200 222 l-4 -16 M206 222 l2 -18 M212 222 l6 -13" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="196" cy="205" r="2.6" fill="#f3a24a" />
        <circle cx="208" cy="203" r="2.6" fill="#6fb3e0" />
        <circle cx="218" cy="208" r="2.6" fill="#f09bb3" />
      </g>

      {/* ---- sol kol (izleyicinin solu): masada / çenede ---- */}
      <g className="asst-arm-l">
        <path d="M62 204 Q46 232 70 250" stroke={INK} strokeWidth="21" strokeLinecap="round" fill="none" />
        <path d="M62 204 Q46 232 70 250" stroke={SHIRT} strokeWidth="16" strokeLinecap="round" fill="none" />
        <ellipse cx="80" cy="251" rx="11" ry="8" fill={SKIN} stroke={INK} strokeWidth="2" />
      </g>
      <g className="asst-arm-think">
        <path d="M62 204 Q52 236 76 226" stroke={INK} strokeWidth="21" strokeLinecap="round" fill="none" />
        <path d="M62 204 Q52 236 76 226" stroke={SHIRT} strokeWidth="16" strokeLinecap="round" fill="none" />
        <path d="M76 226 Q96 206 104 172" stroke={INK} strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M76 226 Q96 206 104 172" stroke={SKIN} strokeWidth="10.5" strokeLinecap="round" fill="none" />
        <ellipse cx="106" cy="166" rx="10" ry="8.5" fill={SKIN} stroke={INK} strokeWidth="2" />
        <path d="M100 160 q6 -4 12 0" stroke={SKIN_SHADE} strokeWidth="1.6" fill="none" />
      </g>

      {/* ---- sağ kol: yazar / anlatır ---- */}
      <g className="asst-arm-r">
        <path d="M190 204 Q208 232 176 250" stroke={INK} strokeWidth="21" strokeLinecap="round" fill="none" />
        <path d="M190 204 Q208 232 176 250" stroke={SHIRT} strokeWidth="16" strokeLinecap="round" fill="none" />
        <g className="asst-pencil-hand">
          <path d="M150 236 L168 256" stroke="#f3a24a" strokeWidth="5" strokeLinecap="round" />
          <path d="M150 236 l-3 -4" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="166" cy="251" rx="11" ry="8" fill={SKIN} stroke={INK} strokeWidth="2" />
        </g>
      </g>
      <g className="asst-arm-talk">
        <path d="M190 204 Q214 222 204 238" stroke={INK} strokeWidth="21" strokeLinecap="round" fill="none" />
        <path d="M190 204 Q214 222 204 238" stroke={SHIRT} strokeWidth="16" strokeLinecap="round" fill="none" />
        <g className="asst-forearm">
          <path d="M204 238 Q214 214 206 196" stroke={INK} strokeWidth="15" strokeLinecap="round" fill="none" />
          <path d="M204 238 Q214 214 206 196" stroke={SKIN} strokeWidth="10.5" strokeLinecap="round" fill="none" />
          <ellipse cx="204" cy="190" rx="10" ry="9" fill={SKIN} stroke={INK} strokeWidth="2" />
          <path d="M198 183 l-2 -7 M204 181 v-8 M210 183 l2 -7" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
      <g className="asst-arm-wave">
        <path d="M190 202 Q214 196 218 170" stroke={INK} strokeWidth="21" strokeLinecap="round" fill="none" />
        <path d="M190 202 Q214 196 218 170" stroke={SHIRT} strokeWidth="16" strokeLinecap="round" fill="none" />
        <g className="asst-hand-wave">
          <path d="M218 170 L220 140" stroke={INK} strokeWidth="15" strokeLinecap="round" />
          <path d="M218 170 L220 140" stroke={SKIN} strokeWidth="10.5" strokeLinecap="round" />
          <ellipse cx="220" cy="132" rx="11" ry="10" fill={SKIN} stroke={INK} strokeWidth="2" />
          <path d="M212 125 l-3 -8 M218 122 v-9 M224 122 l1 -9 M230 127 l4 -7" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </g>

      {/* düşünce baloncukları */}
      <g className="asst-think-dots" fill="#fff" stroke={INK} strokeWidth="2">
        <circle cx="176" cy="46" r="4" />
        <circle cx="190" cy="30" r="6" />
        <circle cx="208" cy="14" r="9" />
      </g>
      {/* dinleme dalgaları */}
      <g className="asst-listen" stroke="var(--brand)" strokeWidth="3.5" fill="none" strokeLinecap="round">
        <path d="M186 70 q9 12 0 24" />
        <path d="M196 62 q15 20 0 40" />
      </g>
      {/* mutlu: küçük kalpler */}
      <g className="asst-hearts" fill="#f09bb3" stroke={INK} strokeWidth="1.4">
        <path d="M38 60 c-3 -5 -11 -2 -7 3 l7 6 l7 -6 c4 -5 -4 -8 -7 -3 z" />
        <path d="M24 100 c-2 -4 -8 -1 -5 2 l5 4 l5 -4 c3 -3 -3 -6 -5 -2 z" />
      </g>
    </svg>
  );
}
