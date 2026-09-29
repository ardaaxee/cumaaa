import type { CSSProperties } from 'react';

export function RealisticPanda({
  size = 260,
  sleepy = false,
  sad = false,
  eating = false,
  drinking = false,
  bathing = false,
  playing = false,
}: {
  size?: number;
  sleepy?: boolean;
  sad?: boolean;
  eating?: boolean;
  drinking?: boolean;
  bathing?: boolean;
  playing?: boolean;
}) {
  const style = { '--real-panda-size': size + 'px' } as CSSProperties;

  return (
    <svg
      viewBox="0 0 220 270"
      width={size}
      height={Math.round(size * 1.22)}
      className={[
        'real-panda',
        sleepy ? 'is-sleepy' : '',
        sad ? 'is-sad' : '',
        eating ? 'is-eating' : '',
        drinking ? 'is-drinking' : '',
        bathing ? 'is-bathing' : '',
        playing ? 'is-playing' : '',
      ].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rp-white-fur" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset=".46" stopColor="#f4f0e8" />
          <stop offset="1" stopColor="#ded8cf" />
        </linearGradient>
        <linearGradient id="rp-black-fur" x1="0" y1="0" x2=".9" y2="1">
          <stop offset="0" stopColor="#262326" />
          <stop offset=".58" stopColor="#151416" />
          <stop offset="1" stopColor="#070708" />
        </linearGradient>
        <radialGradient id="rp-muzzle" cx=".45" cy=".36" r=".72">
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset=".7" stopColor="#ece7de" />
          <stop offset="1" stopColor="#d9d2c7" />
        </radialGradient>
        <radialGradient id="rp-eye" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#736858" />
          <stop offset=".38" stopColor="#423a32" />
          <stop offset="1" stopColor="#121113" />
        </radialGradient>
        <filter id="rp-soft-shadow" x="-40%" y="-40%" width="180%" height="190%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#2b2428" floodOpacity=".22" />
        </filter>
        <filter id="rp-fur-soften" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation=".18" />
        </filter>
      </defs>

      <ellipse className="rp-ground-shadow" cx="110" cy="252" rx="66" ry="13" fill="rgba(30,25,28,.20)" />

      <g className="rp-body" filter="url(#rp-soft-shadow)">
        <path
          d="M58 132 C46 150 43 185 55 215 C63 237 82 249 109 251 C137 250 157 239 164 217 C175 186 170 151 159 134 C148 117 72 116 58 132Z"
          fill="url(#rp-white-fur)"
          stroke="#d6d0c7"
          strokeWidth="2"
        />
        <path
          d="M63 137 C43 150 35 174 40 196 C43 210 53 218 65 215 C76 212 76 194 73 178 C71 165 73 151 80 139Z"
          fill="url(#rp-black-fur)"
        />
        <path
          d="M156 138 C176 150 184 174 179 196 C176 210 166 218 154 215 C143 212 143 194 146 178 C148 165 146 151 139 140Z"
          fill="url(#rp-black-fur)"
        />
        <path
          d="M72 219 C60 228 55 241 62 249 C68 257 86 258 95 250 C101 245 99 236 93 226Z"
          fill="url(#rp-black-fur)"
        />
        <path
          d="M147 219 C159 228 164 241 157 249 C151 257 133 258 124 250 C118 245 120 236 126 226Z"
          fill="url(#rp-black-fur)"
        />
        <ellipse cx="78" cy="248" rx="18" ry="8" fill="#0f0e10" />
        <ellipse cx="142" cy="248" rx="18" ry="8" fill="#0f0e10" />
      </g>

      <g className="rp-head">
        <g className="rp-ear rp-ear-left">
          <ellipse cx="66" cy="55" rx="24" ry="29" transform="rotate(-25 66 55)" fill="url(#rp-black-fur)" />
          <ellipse cx="67" cy="57" rx="12" ry="15" transform="rotate(-25 67 57)" fill="#252126" opacity=".74" />
        </g>
        <g className="rp-ear rp-ear-right">
          <ellipse cx="154" cy="55" rx="24" ry="29" transform="rotate(25 154 55)" fill="url(#rp-black-fur)" />
          <ellipse cx="153" cy="57" rx="12" ry="15" transform="rotate(25 153 57)" fill="#252126" opacity=".74" />
        </g>

        <path
          d="M52 78 C58 48 80 32 109 31 C139 31 163 48 168 79 C173 108 158 137 135 151 C121 160 96 160 82 152 C58 139 46 109 52 78Z"
          fill="url(#rp-white-fur)"
          stroke="#d7d1c8"
          strokeWidth="2.2"
          filter="url(#rp-fur-soften)"
        />

        <path
          className="rp-eye-patch left"
          d="M67 78 C70 62 84 57 95 65 C103 71 102 88 94 103 C87 115 74 113 67 102 C62 94 63 85 67 78Z"
          fill="url(#rp-black-fur)"
          transform="rotate(-11 82 86)"
        />
        <path
          className="rp-eye-patch right"
          d="M153 78 C150 62 136 57 125 65 C117 71 118 88 126 103 C133 115 146 113 153 102 C158 94 157 85 153 78Z"
          fill="url(#rp-black-fur)"
          transform="rotate(11 138 86)"
        />

        <g className="rp-eye left-eye">
          <ellipse cx="83" cy="84" rx="8.5" ry="10.5" fill="url(#rp-eye)" />
          <ellipse className="rp-pupil" cx="84" cy="86" rx="3.8" ry="5.2" fill="#030304" />
          <circle cx="80.5" cy="80" r="2.5" fill="#fff" opacity=".95" />
          <circle cx="85.5" cy="88" r="1.1" fill="#fff" opacity=".45" />
          <path className="rp-eye-lid" d="M75 84 Q83 77 91 84" stroke="#161416" strokeWidth="11" fill="none" strokeLinecap="round" opacity="0" />
        </g>
        <g className="rp-eye right-eye">
          <ellipse cx="137" cy="84" rx="8.5" ry="10.5" fill="url(#rp-eye)" />
          <ellipse className="rp-pupil" cx="136" cy="86" rx="3.8" ry="5.2" fill="#030304" />
          <circle cx="133.5" cy="80" r="2.5" fill="#fff" opacity=".95" />
          <circle cx="138.5" cy="88" r="1.1" fill="#fff" opacity=".45" />
          <path className="rp-eye-lid" d="M129 84 Q137 77 145 84" stroke="#161416" strokeWidth="11" fill="none" strokeLinecap="round" opacity="0" />
        </g>

        <g className="rp-muzzle">
          <ellipse cx="110" cy="112" rx="34" ry="25" fill="url(#rp-muzzle)" />
          <path d="M100 106 C102 98 118 98 120 106 C119 113 113 117 110 118 C106 117 101 113 100 106Z" fill="#1c191b" />
          <ellipse cx="106" cy="104" rx="4" ry="2" fill="#696064" opacity=".35" />
          <path className="rp-mouth" d="M110 117 C109 126 101 128 97 125 M110 117 C111 126 119 128 123 125" stroke="#332d31" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          <path className="rp-tongue" d="M103 126 Q110 137 117 126 Q111 131 103 126Z" fill="#d88091" opacity="0" />
        </g>

        {sad && (
          <>
            <path d="M70 70 Q82 64 92 71" stroke="#282429" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M128 71 Q138 64 150 70" stroke="#282429" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path className="rp-tear" d="M148 96 C154 105 153 112 148 115 C143 111 142 104 148 96Z" fill="#79bfe8" opacity=".85" />
          </>
        )}
      </g>

      <g className="rp-chest-fur" opacity=".52">
        <path d="M91 146 Q97 154 103 146 Q108 155 114 146 Q119 155 126 146" stroke="#cfc8be" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {(eating || drinking) && (
        <g className="rp-held-item">
          {eating ? (
            <>
              <rect x="150" y="135" width="8" height="70" rx="4" fill="#74ad59" transform="rotate(-16 154 170)" />
              <path d="M148 151 h13 M146 174 h13" stroke="#477a39" strokeWidth="2" transform="rotate(-16 154 170)" />
              <path d="M159 134 C177 124 184 130 182 137 C174 141 166 139 159 134Z" fill="#7fbb62" />
            </>
          ) : (
            <>
              <rect x="147" y="154" width="23" height="42" rx="7" fill="#b7def3" stroke="#5b9fc5" strokeWidth="2" />
              <rect x="153" y="146" width="11" height="10" rx="2" fill="#5b9fc5" />
              <path d="M151 175 H167" stroke="#79bddd" strokeWidth="8" />
            </>
          )}
        </g>
      )}

      {bathing && (
        <g className="rp-bath-bubbles">
          <circle cx="57" cy="205" r="14" fill="rgba(255,255,255,.78)" stroke="#a9d7dc" />
          <circle cx="82" cy="217" r="10" fill="rgba(255,255,255,.82)" stroke="#a9d7dc" />
          <circle cx="150" cy="208" r="13" fill="rgba(255,255,255,.8)" stroke="#a9d7dc" />
          <circle cx="168" cy="222" r="8" fill="rgba(255,255,255,.78)" stroke="#a9d7dc" />
        </g>
      )}
    </svg>
  );
}
