import Gummy, { shade, visibleColor } from './Gummy';
import { STATION } from '../../constants/stations';

/* Degradados compartidos por todas las máquinas (se montan una sola vez). */
export function MachineDefs() {
  const grads = [
    ['blue', '#a3b3ff', '#5568e2'], ['blueD', '#8396f6', '#3d4cbd'], ['purple', '#c9a6ff', '#7a4be0'],
    ['gold', '#fff2a6', '#f2a91e'], ['green', '#94f6a0', '#25b447'], ['red', '#ff9ca8', '#e0314b'],
    ['teal', '#98f1eb', '#25aab2'], ['pink', '#ffb6de', '#ec5aa6'], ['dark', '#3b3680', '#221d57'],
  ];
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {grads.map(([id, a, b]) => (
          <linearGradient key={id} id={`gl-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} />
          </linearGradient>
        ))}
        <linearGradient id="gl-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" /><stop offset=".45" stopColor="#c9cdea" /><stop offset="1" stopColor="#8e95bd" />
        </linearGradient>
        <linearGradient id="gl-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".85" />
          <stop offset=".5" stopColor="#e6ecff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity=".6" />
        </linearGradient>
        <linearGradient id="gl-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fffe9" stopOpacity="0" />
          <stop offset="1" stopColor="#8fffe9" stopOpacity=".8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ───────── piezas pequeñas ───────── */
const Lamp = ({ cx, cy, c, r: radius = 5, blink = false, delay = 0 }) => {
  const r = Number(radius);
  return (
    <g className={blink ? 'gl-blink' : ''} style={{ animationDelay: `${delay}s` }}>
      <circle cx={cx} cy={cy} r={r + 1.6} fill="#fff" opacity=".6" />
      <circle cx={cx} cy={cy} r={r} fill={c} />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.35} r={r * 0.32} fill="#fff" opacity=".9" />
    </g>
  );
};
const Bubble = ({ x, y, r = 3, d = 0 }) => (
  <circle className="gl-bubble" style={{ animationDelay: `${d}s` }} cx={x} cy={y} r={r} fill="#fff" opacity=".7" />
);
const trayHere = (tray, n) => tray.station === n;

/* ───────── 1. FORMULACIÓN: tolva + tanque + dosificador ───────── */
function Formulation({ tray, burst }) {
  const liquid = visibleColor(tray.base?.color);
  const lvl = tray.base ? 50 : 26;
  return (
    <g>
      <rect x="108" y="128" width="26" height="12" rx="6" fill="url(#gl-metal)" />
      {/* tanque de vidrio */}
      <rect x="126" y="86" width="50" height="68" rx="12" fill="#eef1ff" stroke="#fff" strokeWidth="2" />
      <clipPath id="gl-c1"><rect x="128" y="88" width="46" height="64" rx="10" /></clipPath>
      <g clipPath="url(#gl-c1)">
        <rect x="128" y="88" width="46" height="64"
          style={{ fill: liquid, transform: `translateY(${64 - lvl}px)`, transition: 'transform .6s, fill .5s' }} />
        <Bubble x="140" y="146" d="0" /><Bubble x="156" y="148" r="2.2" d=".9" /><Bubble x="148" y="144" r="2.6" d="1.6" />
      </g>
      <rect x="126" y="86" width="50" height="68" rx="12" fill="url(#gl-glass)" opacity=".7" />
      <rect x="122" y="78" width="58" height="14" rx="7" fill="url(#gl-gold)" stroke="#d98a0c" strokeWidth="2" />

      {/* tolva con polvo blanco */}
      <path d="M30 98H122L100 154H52Z" fill="url(#gl-blue)" stroke="#4455c9" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M40 104H60L66 148H58Z" fill="#fff" opacity=".28" />
      <ellipse cx="76" cy="98" rx="48" ry="10" fill="url(#gl-metal)" stroke="#8f96bd" strokeWidth="2" />
      <ellipse cx="76" cy="98" rx="41" ry="7" fill="#3b3680" />
      <path d="M40 98Q58 66 76 64Q96 68 112 98Q76 108 40 98Z" fill="#fff" />
      <path d="M52 90Q62 74 74 70" stroke="#dfe6ff" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="88" cy="82" r="2" fill="#dfe6ff" /><circle cx="68" cy="90" r="1.6" fill="#dfe6ff" />

      {/* cuerpo */}
      <rect x="26" y="150" width="148" height="86" rx="18" fill="url(#gl-blue)" stroke="#4455c9" strokeWidth="2.5" />
      <rect x="36" y="156" width="128" height="7" rx="3.5" fill="#fff" opacity=".35" />
      <path d="M26 212h148v6a18 18 0 01-18 18H44a18 18 0 01-18-18z" fill="url(#gl-blueD)" />
      <Lamp cx="46" cy="176" c="#ffc928" r="8" />
      <rect x="64" y="166" width="56" height="18" rx="7" fill="#2c3a8c" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" />
      <rect x="70" y="173" width="30" height="4" rx="2" fill="#7ef7c9" className="gl-blink" />
      <Lamp cx="142" cy="170" c="#ff5a6e" r="4.5" blink delay=".2" /><Lamp cx="156" cy="170" c="#5cf07a" r="4.5" blink delay=".6" />
      {/* salida */}
      <rect x="72" y="194" width="56" height="42" rx="10" fill="#241f58" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />
      <rect x="90" y="232" width="20" height="12" rx="4" fill="url(#gl-metal)" stroke="#8f96bd" strokeWidth="1.5" />
      {burst && (
        <g key={burst} className="gl-drip">
          <path d="M100 236c4 5 6 8 6 11a6 6 0 01-12 0c0-3 2-6 6-11z" style={{ fill: liquid }} stroke="#fff" strokeWidth="1.5" />
        </g>
      )}
    </g>
  );
}

/* ───────── 2. MEZCLADORA: domo de vidrio con paleta ───────── */
function Mixer({ tray, playing, active }) {
  const here = trayHere(tray, STATION.MIXING);
  const liquid = visibleColor(here ? (tray.pigment?.color ?? tray.base?.color) : '#ff5fa8');
  const idle = active && playing && Boolean(tray.pigment);
  return (
    <g>
      {/* base */}
      <path d="M22 168h156v50a18 18 0 01-18 18H40a18 18 0 01-18-18z" fill="url(#gl-blueD)" stroke="#3342aa" strokeWidth="2.5" />
      <rect x="30" y="174" width="140" height="7" rx="3.5" fill="#fff" opacity=".3" />
      {/* medidor de homogeneidad */}
      <rect x="44" y="198" width="112" height="16" rx="8" fill="#241f58" stroke="#fff" strokeOpacity=".4" strokeWidth="1.5" />
      <rect x="48" y="202" width="104" height="8" rx="4" fill="#3b3680" />
      <rect x="48" y="202" height="8" rx="4" style={{ width: `${Math.max(0, tray.mixLevel) * 1.04}px`, fill: visibleColor(tray.pigment?.color ?? '#ff5fa8'), transition: 'width .3s' }} />
      <Lamp cx="36" cy="222" c="#ff5a6e" r="4" /><Lamp cx="164" cy="222" c="#5cf07a" r="4" blink />

      {/* tubo lateral */}
      <path d="M150 76H172V160" stroke="url(#gl-metal)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="172" cy="118" r="8" fill="url(#gl-gold)" stroke="#d98a0c" strokeWidth="1.5" />

      {/* domo */}
      <path d="M40 170V114Q40 58 100 58T160 114V170Z" fill="#f3f5ff" stroke="#fff" strokeWidth="2.5" />
      <clipPath id="gl-c2"><path d="M44 168V116Q44 62 100 62T156 116V168Z" /></clipPath>
      <g clipPath="url(#gl-c2)">
        <rect x="40" y="110" width="120" height="64" style={{ fill: liquid, transition: 'fill .5s' }} />
        <ellipse cx="100" cy="110" rx="60" ry="9" style={{ fill: shade(liquid, 0.3), transition: 'fill .5s' }} />
        <ellipse cx="100" cy="118" rx="40" ry="6" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeDasharray="16 12"
          className={idle ? 'gl-swirl' : ''} />
        <ellipse cx="100" cy="140" rx="46" ry="7" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeDasharray="12 14"
          className={idle ? 'gl-swirl gl-swirl--rev' : ''} />
        <Bubble x="62" y="160" d="0" /><Bubble x="128" y="156" r="4" d=".7" /><Bubble x="100" y="162" r="2.4" d="1.3" />
      </g>
      {/* paleta */}
      <rect x="96.5" y="70" width="7" height="82" rx="3.5" fill="url(#gl-metal)" />
      <g className={idle ? 'gl-paddle gl-paddle--idle' : ''}>
        <g key={tray.mixLevel} className={tray.mixLevel > 0 ? 'gl-paddle gl-paddle--burst' : ''}>
          <rect x="76" y="136" width="48" height="10" rx="5" fill="url(#gl-metal)" stroke="#8f96bd" strokeWidth="1.5" />
          <rect x="84" y="118" width="32" height="8" rx="4" fill="url(#gl-metal)" stroke="#8f96bd" strokeWidth="1.5" />
        </g>
      </g>
      <path d="M52 84Q50 112 54 140" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".7" />
      <path d="M148 90Q152 100 150 110" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".5" />

      {/* tapa con luces y perilla */}
      <rect x="62" y="52" width="76" height="20" rx="10" fill="url(#gl-purple)" stroke="#5b2fc0" strokeWidth="2.5" />
      <Lamp cx="82" cy="62" c="#ff5a6e" r="4.5" blink /><Lamp cx="100" cy="62" c="#ffd23f" r="4.5" blink delay=".3" /><Lamp cx="118" cy="62" c="#5cf07a" r="4.5" blink delay=".6" />
      <rect x="92" y="38" width="16" height="16" rx="6" fill="url(#gl-gold)" stroke="#d98a0c" strokeWidth="2" />
      <circle cx="100" cy="32" r="10" fill="url(#gl-gold)" stroke="#d98a0c" strokeWidth="2" />
      <circle cx="97" cy="29" r="3" fill="#fff" opacity=".8" />
    </g>
  );
}

/* ───────── 3. MARMITA: olla, quemador y termómetro ───────── */
function Heater({ tray, burning }) {
  const here = trayHere(tray, STATION.HEATING);
  const liquid = visibleColor(here ? (tray.pigment?.color ?? tray.base?.color) : '#ffb347');
  const maxSafe = tray.pigment ? tray.pigment.maxTemp : 100;
  const t = tray.temperature;
  const merc = t < maxSafe - 15 ? '#3b82f6' : t <= maxSafe ? '#22c55e' : '#dc2626';
  const mh = Math.min(1, t / 120) * 92;
  return (
    <g>
      {/* soporte + quemador */}
      <path d="M36 178h128v44a16 16 0 01-16 16H52a16 16 0 01-16-16z" fill="url(#gl-blue)" stroke="#4455c9" strokeWidth="2.5" />
      <rect x="44" y="184" width="112" height="6" rx="3" fill="#fff" opacity=".35" />
      <rect x="56" y="194" width="88" height="36" rx="12" fill="#241f58" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />
      {burning && (
        <g className="gl-flames">
          {[72, 88, 104, 120].map((x, i) => (
            <path key={x} className="gl-flame" style={{ animationDelay: `${i * 0.12}s` }}
              d={`M${x} 228c-9-6-9-14-3-20 1 5 4 6 5 3 1-3 0-7 2-11 3 6 9 10 9 18 0 5-4 8-13 10z`} fill={i % 2 ? '#ffb02e' : '#ff6a1a'} />
          ))}
          <circle cx="100" cy="226" r="26" fill="#ff9d2e" opacity=".25" />
        </g>
      )}
      <rect x="60" y="226" width="80" height="4" rx="2" fill="#4b4590" />
      <Lamp cx="48" cy="204" c={burning ? '#ff5a6e' : '#8d86c9'} r="5" />

      {/* olla */}
      <path d="M32 120Q32 176 100 176T168 120Z" fill="url(#gl-purple)" stroke="#5b2fc0" strokeWidth="2.5" />
      <path d="M44 128Q46 160 74 168" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".55" />
      <rect x="22" y="116" width="16" height="10" rx="5" fill="url(#gl-gold)" stroke="#d98a0c" strokeWidth="1.5" />
      <rect x="162" y="116" width="16" height="10" rx="5" fill="url(#gl-gold)" stroke="#d98a0c" strokeWidth="1.5" />
      <ellipse cx="100" cy="120" rx="68" ry="13" fill="url(#gl-metal)" stroke="#8f96bd" strokeWidth="2" />
      <ellipse cx="100" cy="121" rx="60" ry="9.5" style={{ fill: liquid, transition: 'fill .5s' }} />
      <ellipse cx="86" cy="118" rx="22" ry="3" fill="#fff" opacity=".45" />
      {t > 55 && [78, 96, 114, 130].map((x, i) => (
        <circle key={x} className="gl-pop-bubble" style={{ animationDelay: `${i * 0.25}s` }} cx={x} cy="121" r="3.5" fill="#fff" opacity=".85" />
      ))}
      {t > 40 && [76, 100, 124].map((x, i) => (
        <path key={x} className="gl-steam" style={{ animationDelay: `${i * 0.5}s` }}
          d={`M${x} 108q-6 -9 0 -17t0 -17`} stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" />
      ))}
      {t > 80 && [92, 112].map((x, i) => <circle key={x} className="gl-puff" style={{ animationDelay: `${i * 0.4}s` }} cx={x} cy="86" r="9" fill="#6e6e80" />)}

      {/* termómetro */}
      <rect x="172" y="58" width="16" height="108" rx="8" fill="#fff" stroke="#b9c3ff" strokeWidth="2.5" />
      <rect x="176" y="62" width="8" height="100" rx="4" fill="#eef1ff" />
      <rect x="176" y={162 - mh} width="8" height={mh} rx="4" style={{ fill: merc, transition: 'all .3s' }} />
      <circle cx="180" cy="168" r="9" style={{ fill: merc, transition: 'fill .3s' }} stroke="#fff" strokeWidth="2" />
      <rect x="170" y={162 - (maxSafe / 120) * 92} width="20" height="3" rx="1.5" fill="#ff3d5a" />
    </g>
  );
}

/* ───────── 5. MOLDEADO: pistón + matriz ───────── */
function Molder({ tray, active, playing }) {
  const here = trayHere(tray, STATION.MOLDING);
  const pressing = active && playing && Boolean(tray.shape);
  const gum = tray.pigment?.color ?? tray.base?.color;
  return (
    <g>
      <rect x="24" y="84" width="152" height="152" rx="20" fill="url(#gl-blue)" stroke="#4455c9" strokeWidth="2.5" />
      <rect x="34" y="90" width="132" height="7" rx="3.5" fill="#fff" opacity=".35" />
      <path d="M24 214h152v2a20 20 0 01-20 20H44a20 20 0 01-20-20z" fill="url(#gl-blueD)" />

      {/* pistón */}
      <path d="M72 12h56l-8 22H80z" fill="url(#gl-gold)" stroke="#d98a0c" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="86" y="8" width="28" height="8" rx="4" fill="url(#gl-metal)" />
      <g className={pressing ? 'gl-piston' : ''}>
        <rect x="94" y="32" width="12" height="40" rx="5" fill="url(#gl-metal)" stroke="#8f96bd" strokeWidth="1.5" />
        <rect x="74" y="64" width="52" height="16" rx="8" fill="url(#gl-gold)" stroke="#d98a0c" strokeWidth="2" />
      </g>

      {/* ventana con molde */}
      <rect x="42" y="96" width="116" height="92" rx="14" fill="#1f2a78" stroke="#fff" strokeWidth="3" />
      <rect x="48" y="102" width="104" height="80" rx="10" fill="url(#gl-dark)" />
      <rect x="62" y="146" width="76" height="30" rx="12" fill="#d3d9ff" stroke="#8f9bdf" strokeWidth="2.5" />
      {tray.shape ? (
        <g className={here ? 'gl-jelly' : ''}>
          <Gummy shape={tray.shape} color={here ? gum : '#b7c2ff'} size={52} x="74" y="108" shadow={false} />
        </g>
      ) : (
        [78, 100, 122].map((x) => <ellipse key={x} cx={x} cy="162" rx="9" ry="7" fill="#9aa6ee" />)
      )}
      <path d="M56 110L86 106M56 122L70 118" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".6" />

      {/* insignia y rejillas */}
      <rect x="78" y="86" width="44" height="22" rx="11" fill="url(#gl-gold)" stroke="#d98a0c" strokeWidth="2" />
      {[90, 100, 110].map((x) => <circle key={x} cx={x} cy="97" r="3" fill="#fff" />)}
      {[196, 207, 218].map((y) => <rect key={y} x="62" y={y} width="76" height="5" rx="2.5" fill="#241f58" opacity=".55" />)}
      <Lamp cx="40" cy="196" c="#ffc928" r="4.5" blink /><Lamp cx="160" cy="196" c={pressing ? '#5cf07a' : '#ff5a6e'} r="4.5" />
    </g>
  );
}

/* ───────── 6. ENFRIAMIENTO: túnel de frío con turbinas ───────── */
function Cooler({ tray, cooling }) {
  const here = trayHere(tray, STATION.COOLING);
  const frost = tray.temperature <= 30 ? 0.42 : 0.1;
  const gum = tray.pigment?.color ?? tray.base?.color;
  return (
    <g>
      <rect x="24" y="84" width="152" height="152" rx="20" fill="url(#gl-teal)" stroke="#1b8f96" strokeWidth="2.5" />
      <rect x="34" y="90" width="132" height="7" rx="3.5" fill="#fff" opacity=".35" />
      <path d="M24 214h152v2a20 20 0 01-20 20H44a20 20 0 01-20-20z" fill="#25aab2" opacity=".7" />

      {/* ventana helada con molde */}
      <rect x="42" y="96" width="116" height="92" rx="14" fill="#1f2a78" stroke="#fff" strokeWidth="3" />
      <rect x="48" y="102" width="104" height="80" rx="10" fill="url(#gl-dark)" />
      <rect x="62" y="146" width="76" height="30" rx="12" fill="#d3d9ff" stroke="#8f9bdf" strokeWidth="2.5" />
      {tray.shape ? (
        <g className={here ? 'gl-jelly' : ''}>
          <Gummy shape={tray.shape} color={here ? gum : '#b7c2ff'} size={52} x="74" y="108" shadow={false} />
        </g>
      ) : (
        [78, 100, 122].map((x) => <ellipse key={x} cx={x} cy="162" rx="9" ry="7" fill="#9aa6ee" />)
      )}
      <rect x="48" y="102" width="104" height="80" rx="10" fill="#cfe9ff" style={{ opacity: frost, transition: 'opacity .6s' }} />
      <path d="M56 110L86 106M56 122L70 118" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".6" />
      {cooling && [60, 90, 120, 140].map((x, i) => (
        <path key={x} className="gl-twinkle" style={{ animationDelay: `${i * 0.2}s` }} d={`M${x} ${120 + (i % 2) * 24} l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z`} fill="#fff" />
      ))}

      {/* copo de nieve */}
      <rect x="78" y="56" width="44" height="26" rx="13" fill="url(#gl-blue)" stroke="#4455c9" strokeWidth="2" />
      <g transform="translate(88 58) scale(.8)" className={cooling ? 'gl-spin' : ''}>
        <g stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none"><path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17" /></g>
      </g>
      <rect x="92" y="30" width="16" height="28" rx="6" fill="url(#gl-metal)" stroke="#8f96bd" strokeWidth="1.5" />

      {/* turbinas */}
      {[68, 132].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="212" r="15" fill="#241f58" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
          <g className={cooling ? 'gl-spin gl-spin--fast' : ''}>
            {[0, 120, 240].map((r) => <ellipse key={r} cx={cx} cy="205" rx="4.5" ry="8" fill="#9fe7ff" transform={`rotate(${r} ${cx} 212)`} />)}
            <circle cx={cx} cy="212" r="3.5" fill="#fff" />
          </g>
        </g>
      ))}
      <Lamp cx="40" cy="196" c="#ffc928" r="4.5" blink /><Lamp cx="160" cy="196" c={cooling ? '#5cf07a' : '#ff5a6e'} r="4.5" />
    </g>
  );
}

/* ───────── 5. ESCÁNER QA: arco con rayo de luz ───────── */
function Scanner({ tray, active }) {
  const scanning = active || tray.station === STATION.QUALITY;
  return (
    <g>
      <rect x="62" y="104" width="76" height="132" fill="url(#gl-beam)" opacity={scanning ? 0.28 : 0.08} style={{ transition: 'opacity .4s' }} />
      <rect x="30" y="92" width="34" height="144" rx="14" fill="url(#gl-teal)" stroke="#1b8f96" strokeWidth="2.5" />
      <rect x="136" y="92" width="34" height="144" rx="14" fill="url(#gl-teal)" stroke="#1b8f96" strokeWidth="2.5" />
      <rect x="38" y="100" width="6" height="110" rx="3" fill="#fff" opacity=".4" />
      <rect x="144" y="100" width="6" height="110" rx="3" fill="#fff" opacity=".4" />
      <rect x="28" y="60" width="144" height="46" rx="18" fill="url(#gl-teal)" stroke="#1b8f96" strokeWidth="2.5" />
      <rect x="40" y="66" width="120" height="7" rx="3.5" fill="#fff" opacity=".4" />
      {/* ojo escáner */}
      <circle cx="100" cy="86" r="17" fill="#fff" stroke="#1b8f96" strokeWidth="2.5" />
      <circle cx="100" cy="86" r="11" fill="#241f58" />
      <circle cx="100" cy="86" r="6" fill="#52f2d9" className={scanning ? 'gl-blink' : ''} />
      <circle cx="97" cy="83" r="2.4" fill="#fff" />
      {/* antena */}
      <rect x="98" y="38" width="4" height="22" rx="2" fill="url(#gl-metal)" />
      <Lamp cx="100" cy="34" c="#ff5a6e" r="6" blink />
      <Lamp cx="47" cy="124" c="#5cf07a" r="5" blink /><Lamp cx="153" cy="124" c="#ffd23f" r="5" blink delay=".5" />
      {/* rayo de escaneo */}
      <g className={scanning ? 'gl-scan' : ''} style={{ opacity: scanning ? 1 : 0.35 }}>
        <rect x="64" y="120" width="72" height="5" rx="2.5" fill="#8fffe9" />
        <rect x="64" y="116" width="72" height="13" rx="6" fill="#8fffe9" opacity=".3" />
      </g>
    </g>
  );
}

/* ───────── 1. HIDRATACIÓN: silo de gelatina con reloj de reposo ───────── */
function Hydration({ tray, active, playing }) {
  const waiting = active && playing && Boolean(tray.gellingAgent) && tray.hasLumps === null;
  const lampColor = tray.hasLumps === null ? '#ffd23f' : tray.hasLumps ? '#ff5a6e' : '#5cf07a';
  return (
    <g>
      {/* silo */}
      <path d="M50 70H150L136 140H64Z" fill="url(#gl-pink)" stroke="#c23a85" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M62 76H76L80 130H72Z" fill="#fff" opacity=".3" />
      <ellipse cx="100" cy="70" rx="50" ry="10" fill="url(#gl-metal)" stroke="#8f96bd" strokeWidth="2" />
      <ellipse cx="100" cy="70" rx="43" ry="7" fill="#3b3680" />
      <path d="M62 70Q80 44 100 42Q122 46 138 70Q100 80 62 70Z" fill="#fff8e1" />
      <path d="M76 62Q86 50 98 47" stroke="#f1e2b0" strokeWidth="4" strokeLinecap="round" fill="none" />
      <rect x="86" y="136" width="28" height="14" rx="5" fill="url(#gl-metal)" stroke="#8f96bd" strokeWidth="1.5" />
      {waiting && [94, 100, 106].map((x, i) => (
        <circle key={x} className="gl-powder" style={{ animationDelay: `${i * 0.3}s` }} cx={x} cy="152" r="2.4" fill="#fff8e1" stroke="#e0c97a" strokeWidth=".8" />
      ))}

      {/* cuerpo con reloj */}
      <rect x="28" y="150" width="144" height="86" rx="18" fill="url(#gl-blue)" stroke="#4455c9" strokeWidth="2.5" />
      <rect x="38" y="156" width="124" height="7" rx="3.5" fill="#fff" opacity=".35" />
      <path d="M28 212h144v6a18 18 0 01-18 18H46a18 18 0 01-18-18z" fill="url(#gl-blueD)" />
      <circle cx="100" cy="192" r="26" fill="#fff" stroke="#8f9bdf" strokeWidth="3" />
      <circle cx="100" cy="192" r="21" fill="#f3f5ff" />
      {[0, 90, 180, 270].map((r) => <rect key={r} x="98.5" y="173" width="3" height="6" rx="1.5" fill="#5568e2" transform={`rotate(${r} 100 192)`} />)}
      <g className={waiting ? 'gl-spin gl-spin--slow' : ''}>
        <rect x="98.5" y="177" width="3" height="16" rx="1.5" fill="#e0314b" />
      </g>
      <circle cx="100" cy="192" r="3.5" fill="#241f58" />
      <Lamp cx="46" cy="172" c={lampColor} r="6" blink={waiting} />
      <Lamp cx="154" cy="172" c="#5cf07a" r="4.5" blink />
    </g>
  );
}

const MACHINES = {
  [STATION.HYDRATION]: Hydration,
  [STATION.FORMULATION]: Formulation,
  [STATION.MIXING]: Mixer,
  [STATION.HEATING]: Heater,
  [STATION.MOLDING]: Molder,
  [STATION.COOLING]: Cooler,
  [STATION.QUALITY]: Scanner,
};

/** Una máquina ilustrada. `active` = la bandeja está en esta estación. */
export function Machine({ id, ...props }) {
  const M = MACHINES[id];
  return (
    <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMax meet" className={`gl-machine ${props.active ? 'is-active' : ''}`} aria-hidden="true">
      <ellipse cx="100" cy="242" rx="88" ry="8" fill="#2a1a55" opacity=".2" />
      <M {...props} />
    </svg>
  );
}
