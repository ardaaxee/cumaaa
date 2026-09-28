import { useId } from 'react';
import { useSelector } from '../store/store';

export type AssistantMood = 'idle' | 'talking' | 'thinking' | 'happy' | 'listening';

const EYES = [
  { cx: 101, cy: 104 },
  { cx: 143, cy: 103 },
];

const INK = '#2b2430';
const SHIRT = '#3d4049';
const SHIRT_SHADE = '#33363e';
const SHIRT_LIGHT = '#50545e';
const SKIN = '#efc6ae';
const SKIN_SHADE = '#d39c7d';
const HAIR = '#231a17';
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
        <path d="M106 150 h32 v38 h-32 z" fill={SKIN} stroke={INK} strokeWidth="2.5" />
        <path d="M106 162 q16 8 32 0" stroke={SKIN_SHADE} strokeWidth="4" fill="none" opacity=".55" />
        {/* kulaklar: hafif dışa açık */}
        <path d="M76 96 C62 88 58 110 66 120 C70 126 76 124 78 120 Z" fill={SKIN} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M168 94 C184 86 188 110 179 120 C175 126 169 124 167 120 Z" fill={SKIN} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M70 100 q-3 8 2 14 M176 98 q3 8 -2 14" stroke={SKIN_SHADE} strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* yüz: uzunca oval, ince çene */}
        <path
          d="M122 38 C156 38 172 62 172 98 C172 128 162 152 144 164 C136 170 108 170 100 164 C82 152 72 128 72 98 C72 62 88 38 122 38 Z"
          fill={SKIN}
          stroke={INK}
          strokeWidth="2.5"
        />
        <path d="M90 142 Q104 164 122 168 Q142 166 156 142" stroke={SKIN_SHADE} strokeWidth="5" fill="none" opacity=".3" strokeLinecap="round" />
        {/* saç: koyu, kısa, üstte hacimli; alna düşen dağınık perçem */}
        <path
          d="M68 110 C58 70 70 30 104 20 C112 14 124 15 131 18 C142 13 158 18 166 28 C180 42 186 66 178 110 C176 96 172 86 166 80 L168 93 L158 76 L155 89 L146 71 L141 86 L132 69 L125 84 L118 69 L109 84 L104 71 L95 87 L90 74 L82 91 C76 95 72 101 68 110 Z"
          fill={HAIR}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* saç dokusu */}
        <g stroke={HAIR_LIGHT} strokeWidth="2.6" fill="none" strokeLinecap="round">
          <path d="M88 40 q8 -8 18 -8" />
          <path d="M116 30 q10 -6 20 -2" />
          <path d="M146 32 q10 4 16 14" />
          <path d="M98 56 q10 -6 20 -4" />
          <path d="M128 50 q10 -2 18 4" />
          <path d="M84 70 q4 -6 10 -8" />
          <path d="M156 60 q6 4 8 12" />
        </g>
        {/* yanlar kısa */}
        <path d="M74 92 q0 12 4 20 M170 90 q0 12 -4 20" stroke={HAIR} strokeWidth="5" strokeLinecap="round" />
        {/* kaşlar: kalın, düz, gözlere yakın */}
        <g className="asst-brows" fill={HAIR} stroke={INK} strokeWidth="1.2" strokeLinejoin="round">
          <path d="M88 88 Q100 82 115 86 L114 91 Q101 88 89 93 Z" />
          <path d="M129 86 Q143 81 157 86 L157 91 Q144 87 130 91 Z" />
        </g>
        {/* alındaki küçük ben (sol kaşın iç ucunun üstü) */}
        <circle cx="116" cy="78" r="1.8" fill="#6e4636" />
        {/* gözler: badem, yarı kapalı rahat bakış */}
        <g className="asst-eyes">
          {EYES.map((e) => (
            <g key={e.cx}>
              <path d={`M${e.cx - 11} ${e.cy} Q${e.cx} ${e.cy - 8.5} ${e.cx + 11} ${e.cy} Q${e.cx} ${e.cy + 6.5} ${e.cx - 11} ${e.cy} Z`} fill="#fff" stroke={INK} strokeWidth="1.6" />
              <g className="asst-iris">
                <circle cx={e.cx} cy={e.cy - 0.5} r="5.4" fill="#4a2e1f" />
                <circle cx={e.cx} cy={e.cy - 0.5} r="2.6" fill="#140e0c" />
                <circle cx={e.cx + 2} cy={e.cy - 2.2} r="1.4" fill="#fff" />
              </g>
              {/* ağır üst kapak */}
                            <path d={`M${e.cx - 12} ${e.cy} Q${e.cx} ${e.cy - 9} ${e.cx + 12} ${e.cy - 1}`} stroke={INK} strokeWidth="2.8" fill="none" strokeLinecap="round" />
              <path d={`M${e.cx - 9} ${e.cy - 10} Q${e.cx} ${e.cy - 14} ${e.cx + 9} ${e.cy - 10}`} stroke={SKIN_SHADE} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity=".7" />
              <path d={`M${e.cx - 7} ${e.cy + 6} q7 3 14 0`} stroke={SKIN_SHADE} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity=".8" />
            </g>
          ))}
          <g className="asst-lids" fill={SKIN_SHADE}>
            {EYES.map((e) => (
              <ellipse key={e.cx} cx={e.cx} cy={e.cy - 1} rx="11.5" ry="7" />
            ))}
          </g>
        </g>
        {/* burun: uzun, düz, yuvarlak uç */}
        <path d="M120 98 Q118 112 114 121 Q110 127 115 130 Q121 133 127 130 Q132 128 130 123" stroke={SKIN_SHADE} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M112 128 q3 3 6 1 M126 130 q3 1 6 -2" stroke="#a86e57" strokeWidth="1.9" fill="none" strokeLinecap="round" />
        {/* hafif kızarıklık */}
        <ellipse cx="94" cy="124" rx="7" ry="3.5" fill="#e98f8f" opacity=".22" />
        <ellipse cx="152" cy="123" rx="7" ry="3.5" fill="#e98f8f" opacity=".22" />
        {/* ağız: ince dudak, bir yanı hafif yukarı (yan gülüş) */}
        <g className="asst-mouth-closed">
          <path d="M108 144 Q116 141 122 143 Q128 141 137 142 Q128 152 122 151 Q114 151 108 144 Z" fill="#d4908a" />
          <path d="M108 144 Q121 147 137 141.5" stroke="#8a4a42" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </g>
        <g className="asst-mouth-open">
          <path d="M111 143 Q122 141 134 142 Q132 153 122 154 Q112 152 111 143 Z" fill="#6b2632" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="122" cy="150" rx="5.5" ry="2.2" fill="#e9798c" />
          <path d="M114 144 h16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
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
