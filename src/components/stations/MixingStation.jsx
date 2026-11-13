import { useState, useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import HelperCharacter from '../HelperCharacter';
import ZoomShell, { INK, Pipe } from '../layout/ZoomShell';

const STEP = 5;          // cada clic aporta 5% (20 clics para completar)
const STEP_LUMPS = 3;    // con grumos el motor se atasca y rinde menos

/* Mezcladora industrial: las aspas giran con cada clic; con grumos el cuerpo vibra */
function MixerMachine({ pigment, level, spin, shake, lumps }) {
  const liquid = pigment?.color ?? '#a9defc';
  const fill = 250 * (0.35 + 0.55 * (level / 100));
  return (
    <svg viewBox="0 0 800 760" style={{ overflow: 'visible' }} role="img" aria-label="Mezcladora industrial">
      <Pipe d="M-420 600 H250" bands={[[-20, 600, false], [80, 600, false]]} />
      <g className={shake ? 'gl-shake' : ''} style={{ transformOrigin: '400px 600px' }}>
        {/* motor */}
        <rect x="340" y="40" width="120" height="110" rx="20" fill="#7c5cf0" stroke={INK} strokeWidth="6" />
        <rect x="356" y="58" width="88" height="14" rx="7" fill="#c9b8ff" opacity=".7" />
        {[0, 1, 2].map((i) => <rect key={i} x={362 + i * 28} y="86" width="14" height="40" rx="5" fill="#4a35b0" />)}
        <rect x="384" y="150" width="32" height="70" fill="#b8c0dc" stroke={INK} strokeWidth="5" />
        {/* cuba */}
        <path d="M240 250 H560 V560 Q560 620 500 620 H300 Q240 620 240 560Z" fill="#c8d0ea" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <clipPath id="gl-mix-clip"><path d="M258 262 H542 V556 Q542 602 496 602 H304 Q258 602 258 556Z" /></clipPath>
        <g clipPath="url(#gl-mix-clip)">
          <rect x="258" y="262" width="284" height="340" fill="#26308a" />
          <rect x="258" y={602 - fill} width="284" height={fill + 4} style={{ fill: liquid, transition: 'fill .5s, y .4s' }} />
          <ellipse cx="400" cy={602 - fill} rx="142" ry="8" fill="#fff" opacity=".4" />
          {lumps && [[320, 520], [440, 548], [380, 490], [490, 510]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="9" fill="#fff6dc" stroke="#0003" strokeWidth="2" />)}
        </g>
        {/* eje y aspas */}
        <rect x="392" y="214" width="16" height="300" rx="6" fill="#9aa3c2" stroke={INK} strokeWidth="4" />
        <g style={{ transformOrigin: '400px 500px', transform: `rotate(${spin}deg)`, transition: 'transform .25s ease-out' }}>
          <ellipse cx="400" cy="500" rx="108" ry="14" fill="#ffc93a" stroke={INK} strokeWidth="5" />
          <ellipse cx="400" cy="500" rx="14" ry="108" fill="#ffc93a" stroke={INK} strokeWidth="5" opacity=".0" />
        </g>
        <g style={{ transformOrigin: '400px 420px', transform: `rotate(${-spin * 1.3}deg)`, transition: 'transform .25s ease-out' }}>
          <ellipse cx="400" cy="420" rx="90" ry="11" fill="#ffd966" stroke={INK} strokeWidth="5" />
        </g>
        <circle cx="400" cy="500" r="12" fill="#b8c0dc" stroke={INK} strokeWidth="4" />
        <rect x="270" y="274" width="9" height="150" rx="4.5" fill="#fff" opacity=".35" />
        <rect x="230" y="240" width="340" height="22" rx="10" fill="#b8c0dc" stroke={INK} strokeWidth="5" />
        {/* patas */}
        <rect x="270" y="620" width="30" height="90" rx="8" fill="#9aa3c2" stroke={INK} strokeWidth="5" />
        <rect x="500" y="620" width="30" height="90" rx="8" fill="#9aa3c2" stroke={INK} strokeWidth="5" />
      </g>
      <rect x="330" y="660" width="140" height="26" rx="13" fill="#4a35b0" stroke="#fff" strokeWidth="2" />
      <text x="400" y="678" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" letterSpacing="1">MEZCLADORA</text>
    </svg>
  );
}

export default function MixingStation() {
  const { activeTray, setActiveTray } = useGame();
  const pigment = activeTray.pigment;
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [level, setLevel] = useState(activeTray.mixLevel);
  const [spin, setSpin] = useState(0);
  const [shake, setShake] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const lumps = activeTray.hasLumps === true;
  const canMix = Boolean(pigment) && level < 100;

  const agitate = () => {
    if (!canMix) return;
    setLevel((l) => Math.min(100, l + (lumps ? STEP_LUMPS : STEP)));
    setSpin((s) => s + 90);
    if (lumps) { // atasco breve
      setShake(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setShake(false), 380);
    }
  };

  const confirm = () => {
    setActiveTray((prev) => ({ ...prev, mixLevel: level }));
    setIsZoomedIn(false);
  };

  const msg = !pigment ? { cls: 'bad', text: 'Falta el pigmento: formúlalo en la estación 2.' }
    : level >= 100 ? { cls: 'ok', text: '¡Mezcla homogénea!' }
    : lumps ? { cls: 'bad', text: '¡Grumos! El motor se atasca, agita más.' }
    : { cls: 'idle', text: 'Agita repetidamente hasta el 100%.' };

  return (
    <ZoomShell
      helper={<HelperCharacter text="¡Nuestra mezcla empieza a tomar color!" />}
      badge={['#d2b3ff', '#8b4fe8']} num="3" title="03. MEZCLADO"
      isZoomedIn={isZoomedIn} onOpen={() => setIsZoomedIn(true)} onConfirm={confirm}
      machine={<MixerMachine pigment={pigment} level={level} spin={spin} shake={shake} lumps={lumps} />}
    >
      <div className="gl-zoom__inset w-full">
        <p className="gl-zoom__label">Homogeneidad</p>
        <div className="gl-progress gl-progress--full w-full" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(level)}>
          <div className="gl-progress__fill h-full" style={{ width: `${level}%`, background: pigment?.color || '#a855f7' }} />
        </div>
        <p className="gl-zoom__label" style={{ textAlign: 'center', marginTop: '.3rem' }}>{Math.floor(level)}%</p>
      </div>
      <div className="gl-zoom__btns">
        <button onClick={agitate} disabled={!canMix} className="gl-btn gl-btn--purple gl-btn--xl" style={{ userSelect: 'none' }}>AGITAR</button>
      </div>
      <p className={`gl-hydro__msg gl-hydro__msg--${msg.cls}`}>{msg.text}</p>
    </ZoomShell>
  );
}
