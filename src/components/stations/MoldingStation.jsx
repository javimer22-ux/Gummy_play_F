import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import Gummy, { GummyMold, visibleColor } from '../entities/Gummy';
import shapes from '../../data/shapes.json';
import HelperCharacter from '../HelperCharacter';
import ZoomShell, { INK, Pipe } from '../layout/ZoomShell';

// Estación 5: SOLO elige la forma del molde. No hay temperatura aquí (eso es Enfriamiento).
const CAVITIES = [[235, 430], [400, 430], [565, 430], [235, 600], [400, 600], [565, 600]];

/* Vista superior: bandeja de silicón (6 cavidades) + boquilla inyectora */
function MoldMachine({ shape, liquid, injecting }) {
  return (
    <svg viewBox="0 0 800 760" style={{ overflow: 'visible' }} role="img" aria-label="Bandeja de moldes con boquilla inyectora">
      <Pipe d="M-300 120 H400" bands={[[-80, 120, false], [120, 120, false]]} />
      {/* bandeja de silicón */}
      <rect x="110" y="330" width="580" height="380" rx="44" fill="#7fd0ff" stroke={INK} strokeWidth="6" />
      <rect x="130" y="346" width="540" height="40" rx="20" fill="#fff" opacity=".3" />
      {CAVITIES.map(([cx, cy], i) => (
        <g key={cx + '-' + cy}>
          {shape ? (
            <>
              <Gummy shape={shape} color="#3d56b5" size={124} x={cx - 62} y={cy - 64} shadow={false} />
              <g key={shape} className="gl-fillup" style={{ animationDelay: `${(i % 3) * 0.25 + Math.floor(i / 3) * 0.5}s` }}>
                <Gummy shape={shape} color={liquid} size={112} x={cx - 56} y={cy - 58} shadow={false} />
              </g>
            </>
          ) : (
            <>
              <ellipse cx={cx} cy={cy} rx="58" ry="52" fill="#4a64c9" stroke={INK} strokeWidth="4" />
              <ellipse cx={cx} cy={cy + 4} rx="46" ry="40" fill="#3d56b5" />
            </>
          )}
        </g>
      ))}
      {/* boquilla inyectora: barre las cavidades mientras inyecta */}
      <g className={injecting ? 'gl-sweep' : ''}>
        <rect x="350" y="60" width="100" height="120" rx="18" fill="#7c5cf0" stroke={INK} strokeWidth="6" />
        <rect x="366" y="76" width="68" height="12" rx="6" fill="#c9b8ff" opacity=".7" />
        <path d="M368 180 H432 L416 250 H384 Z" fill="#b8c0dc" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <rect x="390" y="250" width="20" height="26" rx="6" fill="#ffd23f" stroke={INK} strokeWidth="4" />
        {injecting && <rect x="394" y="276" width="12" height="300" rx="6" fill={liquid} opacity=".85" />}
      </g>
    </svg>
  );
}

export default function MoldingStation() {
  const { activeTray, setActiveTray } = useGame();
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [pick, setPick] = useState(activeTray.shape);   // selección local; se guarda al confirmar
  const [injecting, setInjecting] = useState(false);
  const liquid = visibleColor(activeTray.pigment?.color ?? activeTray.base?.color ?? '#ff9fcf');

  useEffect(() => {
    if (!injecting) return undefined;
    const id = setTimeout(() => setInjecting(false), 1400);
    return () => clearTimeout(id);
  }, [injecting, pick]);

  const choose = (id) => { setPick(id); setInjecting(true); };
  const confirm = () => {
    if (pick) setActiveTray((prev) => (prev.shape === pick ? prev : { ...prev, shape: pick }));
    setInjecting(false);
    setIsZoomedIn(false);
  };

  const name = shapes.find((s) => s.id === pick)?.name;
  return (
    <ZoomShell
      helper={<HelperCharacter text="¡Que tu creatividad tome forma! Vierte la mezcla en los moldes." />}
      badge={['#ffc16b', '#f27a14']} num="5" title="05. MOLDEADO"
      isZoomedIn={isZoomedIn} onOpen={() => setIsZoomedIn(true)} onConfirm={confirm}
      machine={<MoldMachine shape={pick} liquid={liquid} injecting={injecting} />}
    >
      <p className="gl-zoom__label">Inyectar en matriz</p>
      <div className="gl-zoom__btns" style={{ flexWrap: 'wrap' }}>
        {shapes.map((s) => (
          <button
            key={s.id} onClick={() => choose(s.id)}
            className={`gl-item ${pick === s.id ? 'is-selected' : ''}`} style={{ flex: '1 1 30%' }}
          >
            <span className="gl-item__art"><GummyMold shape={s.id} size={58} /></span>
            <span className="gl-item__name" style={{ fontSize: '.8rem' }}>{s.name}</span>
          </button>
        ))}
      </div>
      <p className={`gl-hydro__msg gl-hydro__msg--${pick ? 'ok' : 'idle'}`}>
        {pick ? `Molde listo: ${name}. Confirma para guardarlo.` : 'Elige la forma de la gomita.'}
      </p>
    </ZoomShell>
  );
}
