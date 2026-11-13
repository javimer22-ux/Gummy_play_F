import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import ingredientsData from '../../data/ingredients.json';
import IngredientCard from '../entities/Ingredient';
import HelperCharacter from '../HelperCharacter';
import ZoomShell, { INK, Pipe } from '../layout/ZoomShell';

const WATER = '#a9defc';
const baseColor = (b) => (!b ? null : b.color === 'transparent' ? WATER : b.color);

/* Tanque industrial de formulación: el líquido toma el color del pigmento elegido */
function FormulationTank({ base, pigment }) {
  const liquid = pigment?.color ?? baseColor(base);
  const level = pigment ? 0.72 : base ? 0.5 : 0;
  const offset = level ? 242 * (1 - level) : 252;
  return (
    <svg viewBox="0 0 800 760" style={{ overflow: 'visible' }} role="img" aria-label="Tanque de formulación">
      <defs>
        <clipPath id="gl-form-clip"><rect x="280" y="304" width="240" height="242" rx="28" /></clipPath>
      </defs>
      <Pipe d="M650 -60 V190 Q650 232 612 232 H566" bands={[[650, 60, true]]} />
      <Pipe d="M-420 560 H232" bands={[[-20, 560, false], [70, 560, false]]} />

      {/* patas y salida */}
      <rect x="262" y="640" width="28" height="80" rx="8" fill="#9aa3c2" stroke={INK} strokeWidth="5" />
      <rect x="510" y="640" width="28" height="80" rx="8" fill="#9aa3c2" stroke={INK} strokeWidth="5" />
      <rect x="378" y="646" width="44" height="44" rx="8" fill="#b8c0dc" stroke={INK} strokeWidth="5" />
      <circle cx="400" cy="708" r="22" fill="#ffc93a" stroke={INK} strokeWidth="5" />
      <path d="M400 690v36M382 708h36" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".6" />

      {/* cuerpo */}
      <rect x="230" y="240" width="340" height="410" rx="44" fill="#3d6fe3" stroke={INK} strokeWidth="6" />
      <path d="M520 246 H536 Q570 246 570 282 V608 Q570 650 536 650 H520 Z" fill="#2a4cb8" opacity=".55" />
      <rect x="248" y="254" width="304" height="10" rx="5" fill="#9bbcff" opacity=".6" />
      {[[254, 270], [546, 270], [254, 630], [546, 630]].map(([x, y]) => (
        <circle key={x + '-' + y} cx={x} cy={y} r="7" fill="#a9c3ff" stroke={INK} strokeWidth="3" />
      ))}
      <rect x="250" y="214" width="300" height="36" rx="14" fill="#b8c0dc" stroke={INK} strokeWidth="5" />

      {/* ventana con el líquido */}
      <rect x="262" y="286" width="276" height="278" rx="40" fill="#c8d0ea" stroke={INK} strokeWidth="6" />
      <rect x="280" y="304" width="240" height="242" rx="28" fill="#26308a" stroke={INK} strokeWidth="4" />
      <g clipPath="url(#gl-form-clip)">
        <g style={{ transform: `translateY(${offset}px)`, transition: 'transform .8s cubic-bezier(.3, 1.15, .5, 1)' }}>
          <rect x="280" y="304" width="240" height="262" style={{ fill: liquid ?? '#26308a', transition: 'fill .5s' }} />
          <ellipse cx="400" cy="304" rx="120" ry="9" fill="#fff" opacity=".4" />
          {pigment && [[330, 0], [400, .8], [460, 1.6]].map(([x, d]) => (
            <circle key={x} className="gl-bubble" style={{ animationDelay: `${d}s` }} cx={x} cy="530" r="6" fill="#fff" opacity=".8" />
          ))}
        </g>
      </g>
      <rect x="296" y="320" width="9" height="110" rx="4.5" fill="#fff" opacity=".35" />
      <path d="M548 340h12M548 400h12M548 460h12M548 520h12" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".6" />

      {/* tolva de base (izquierda) */}
      <path d="M262 110 L306 202 H354 L398 110Z" fill="#eadfc8" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <ellipse cx="330" cy="110" rx="70" ry="17" fill="#f6edd8" stroke={INK} strokeWidth="6" />
      <ellipse cx="330" cy="112" rx="56" ry="11" fill={base ? baseColor(base) : '#6b5d44'} stroke={base ? '#0003' : 'none'} style={{ transition: 'fill .4s' }} />
      <rect x="306" y="200" width="48" height="18" rx="5" fill="#b8c0dc" stroke={INK} strokeWidth="4" />
      {base && [-8, 2, 10].map((dx, i) => (
        <circle key={dx} className="gl-drip" style={{ '--fall': '34px', animationDelay: `${i * 0.35}s` }} cx={330 + dx} cy="224" r="3.4" fill={baseColor(base)} stroke="#0003" strokeWidth="1" />
      ))}

      {/* gotero de pigmento (derecha) */}
      <rect x="452" y="64" width="62" height="108" rx="16" fill={pigment?.color ?? '#9aa3c2'} stroke={INK} strokeWidth="6" style={{ transition: 'fill .4s' }} />
      <rect x="462" y="94" width="42" height="40" rx="8" fill="#fff" opacity=".85" />
      <rect x="462" y="44" width="42" height="24" rx="8" fill="#2c3052" stroke={INK} strokeWidth="4" />
      <path d="M468 172 H498 L490 206 H476Z" fill="#b8c0dc" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <rect x="440" y="200" width="86" height="14" rx="6" fill="#9aa3c2" stroke={INK} strokeWidth="4" />
      {pigment && [0, 1].map((i) => (
        <ellipse key={i} className="gl-drip" style={{ '--fall': '44px', animationDelay: `${i * 0.55}s` }} cx="483" cy="214" rx="5" ry="7" fill={pigment.color} stroke="#fff" strokeWidth="1.5" />
      ))}

      {/* luces y placa */}
      {[[276, 604, Boolean(base), '#ffd93a', '#8a7a2a'], [524, 604, Boolean(pigment), '#4be06a', '#2a6a3a']].map(([x, y, lit, on, off]) => (
        <g key={x}>
          {lit && <circle cx={x} cy={y} r="22" fill={on} opacity=".35" />}
          <circle cx={x} cy={y} r="14" fill="#c9d0ea" stroke={INK} strokeWidth="3.5" />
          <circle cx={x} cy={y} r="9" fill={lit ? on : off} stroke={INK} strokeWidth="2.5" />
        </g>
      ))}
      <rect x="340" y="592" width="120" height="26" rx="13" fill="#2c3a8c" stroke="#fff" strokeWidth="2" />
      <text x="400" y="610" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" letterSpacing="1">FORMULACIÓN</text>
    </svg>
  );
}

export default function FormulationStation() {
  const { activeTray, setActiveTray } = useGame();
  const { bases, pigments } = ingredientsData;
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [base, setBase] = useState(activeTray.base);
  const [pigment, setPigment] = useState(activeTray.pigment);

  // Pigmentos sueltos y grupos (los tres tipos de ralladura de cítricos), en el orden del JSON
  const slots = [];
  pigments.forEach((p) => {
    if (!p.group) slots.push({ pigment: p });
    else if (!slots.some((s) => s.group === p.group)) {
      slots.push({ group: p.group, name: p.groupName, items: pigments.filter((q) => q.group === p.group) });
    }
  });

  // CONFIRMAR: inyecta la fórmula en la bandeja (cambiar de pigmento reinicia la mezcla, como antes)
  const confirm = () => {
    setActiveTray((prev) => ({
      ...prev,
      base: base ?? prev.base,
      pigment: pigment ?? prev.pigment,
      mixLevel: pigment && pigment.id !== prev.pigment?.id ? 0 : prev.mixLevel,
    }));
    setIsZoomedIn(false);
  };

  const msg = !base ? { cls: 'idle', text: 'Elige una base o endulzante.' }
    : !pigment ? { cls: 'idle', text: 'Ahora elige un extracto natural.' }
    : { cls: 'ok', text: `Fórmula lista: ${base.name} + ${pigment.name}` };

  return (
    <ZoomShell
      helper={<HelperCharacter text="¡Cada ingrediente cuenta! ⚗️ Combina los componentes para crear la fórmula perfecta." />}
      badge={['#8fb4ff', '#3f6fe6']} num="2" title="02. FORMULACIÓN"
      isZoomedIn={isZoomedIn} onOpen={() => setIsZoomedIn(true)} onConfirm={confirm}
      machine={<FormulationTank base={base} pigment={pigment} />}
    >
      <div className="gl-zoom__inset">
        <p className="gl-zoom__label">Base / Endulzante</p>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          {bases.map((b) => (
            <IngredientCard key={b.id} item={b} onClick={() => setBase(b)} selected={base?.id === b.id} artSize={44} />
          ))}
        </div>
      </div>

      <div className="gl-zoom__inset">
        <p className="gl-zoom__label">Pigmento natural</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            {slots.filter((s) => !s.group).map((s) => (
              <IngredientCard key={s.pigment.id} item={s.pigment} onClick={() => setPigment(s.pigment)} selected={pigment?.id === s.pigment.id} artSize={44} />
            ))}
          </div>
          {slots.filter((s) => s.group).map((s) => (
            <div key={s.group} style={{ padding: '.2rem .4rem .4rem', borderRadius: '18px', border: '3px dashed #cdb4ff', background: 'rgba(255, 255, 255, .08)' }}>
              <p className="gl-hint-text" style={{ color: '#e5dbff' }}>{s.name}</p>
              <div style={{ display: 'flex', gap: '.4rem' }}>
                {s.items.map((p) => (
                  <IngredientCard key={p.id} item={{ ...p, name: p.variant }} onClick={() => setPigment(p)} selected={pigment?.id === p.id} artSize={38} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className={`gl-hydro__msg gl-hydro__msg--${msg.cls}`}>{msg.text}</p>
    </ZoomShell>
  );
}
