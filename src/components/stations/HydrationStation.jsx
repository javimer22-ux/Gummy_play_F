import HelperCharacter from '../HelperCharacter';
import OrderTicketMini from '../layout/OrderTicketMini';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../context/GameContext';
import { IngredientArt } from '../entities/Ingredient';
import ingredientsData from '../../data/ingredients.json';

const TICK_MS = 100;    // cada tick real (0,1 s)...
const SIM_SEC = 5;      // ...suma 2 s simulados: 5 min de reposo ≈ 15 s reales
const IDEAL_MIN = 60;  // 05:00
const IDEAL_MAX = 66;  // 05:30 (rango ideal 05:00 – 05:30, ambos inclusive)
const MAX_TICKS = 120;  // 10:00: se pasa de largo y el reposo se detiene solo

const clock = (ticks) => {
  const sec = Math.round(ticks * SIM_SEC);
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
};

/* ───────── Reloj digital de 7 segmentos ───────── */
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
function Digit({ d, x }) {
  const w = 30, h = 54, t = 7, on = SEG[d] ?? '';
  const seg = (k, sx, sy, sw, sh) => (
    <rect key={k} x={x + sx} y={sy} width={sw} height={sh} rx={t / 2} fill={on.includes(k) ? '#fff' : 'rgba(255,255,255,.07)'} />
  );
  return (
    <>
      {seg('a', 4, 0, w - 8, t)}{seg('g', 4, h / 2 - t / 2, w - 8, t)}{seg('d', 4, h - t, w - 8, t)}
      {seg('f', 0, 4, t, h / 2 - 6)}{seg('b', w - t, 4, t, h / 2 - 6)}
      {seg('e', 0, h / 2 + 2, t, h / 2 - 6)}{seg('c', w - t, h / 2 + 2, t, h / 2 - 6)}
    </>
  );
}
function SegDisplay({ text }) {
  return (
    <svg viewBox="0 0 170 56" className="gl-zoom__digits" role="img" aria-label={`Tiempo ${text}`}>
      <Digit d={text[0]} x={2} /><Digit d={text[1]} x={38} />
      <circle cx="82" cy="19" r="4" fill="#fff" /><circle cx="82" cy="37" r="4" fill="#fff" />
      <Digit d={text[3]} x={98} /><Digit d={text[4]} x={134} />
    </svg>
  );
}

/* ───────── Máquina de hidratación en primer plano (solo visual) ───────── */
const INK = '#1b1e4b';
const POWDER = [[-46, 0], [30, .15], [-18, .3], [52, .45], [-60, .6], [8, .75], [40, .9], [-34, 1.05], [20, 1.2], [-8, 1.35], [60, 1.5], [-52, .1], [0, .55], [26, 1.0]];
const FOAM = [[300, 640, 30], [345, 628, 24], [405, 636, 34], [465, 628, 26], [515, 640, 30], [370, 648, 22], [440, 650, 22]];
const LUMPS = [[318, 650, 12], [392, 662, 10], [452, 648, 13], [506, 664, 9], [352, 676, 9]];

function Gear({ cx, cy, r, reverse, spinning }) {
  return (
    <g className={spinning ? 'gl-spin' : ''} style={reverse ? { animationDirection: 'reverse' } : undefined}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={cx - 6} y={cy - r - 9} width="12" height="16" rx="3" fill="#b8c0dc" stroke={INK} strokeWidth="3" transform={`rotate(${i * 45} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="#b8c0dc" stroke={INK} strokeWidth="4" />
      <circle cx={cx} cy={cy} r={r * 0.4} fill="#7a84ad" stroke={INK} strokeWidth="3" />
    </g>
  );
}

function Pipe({ d, bands = [] }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={INK} strokeWidth="46" />
      <path d={d} stroke="#9aa3c2" strokeWidth="34" />
      <path d={d} stroke="#fff" strokeWidth="6" opacity=".35" transform="translate(-7 -7)" />
      {bands.map(([x, y, vertical]) => (
        <rect key={x + '-' + y} x={vertical ? x - 26 : x - 8} y={vertical ? y - 8 : y - 26} width={vertical ? 52 : 16} height={vertical ? 16 : 52} rx="5" fill="#7a84ad" stroke={INK} strokeWidth="3.5" />
      ))}
    </g>
  );
}

function HydrationMachine({ hasGelatin, started, hydrating, hasLumps, bloomed, ticks, color, canStart, onHopper }) {
  const angle = ((ticks % MAX_TICKS) / MAX_TICKS) * 360;
  return (
    <svg viewBox="0 0 800 760" style={{ overflow: 'visible' }} role="img" aria-label="Máquina de hidratación">
      <defs>
        <clipPath id="gl-h2o-clip"><path d="M205 604 Q205 736 405 736 Q605 736 605 604Z" /></clipPath>
        <linearGradient id="gl-h2o-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6f6ff" stopOpacity=".7" /><stop offset="1" stopColor="#9fd8ff" stopOpacity=".35" />
        </linearGradient>
      </defs>

      {/* tuberías */}
      <Pipe d="M150 -80 V60 Q150 120 210 120 H236" bands={[[150, 30, true], [200, 120, false]]} />
      <Pipe d="M-420 250 H96 Q140 250 140 294 V330 H196" bands={[[-20, 250, false], [70, 250, false]]} />
      <Pipe d="M-420 548 H196" bands={[[40, 548, false], [120, 548, false]]} />

      {/* cuerpo de la máquina */}
      <rect x="190" y="170" width="440" height="490" rx="36" fill="#3d6fe3" stroke={INK} strokeWidth="6" />
      <rect x="206" y="182" width="408" height="16" rx="8" fill="#9bbcff" opacity=".6" />
      <path d="M560 176 H594 Q630 176 630 212 V622 Q630 660 594 660 H560 Z" fill="#2a4cb8" opacity=".55" />
      {[[214, 204], [606, 204], [214, 640], [606, 640]].map(([x, y]) => (
        <circle key={x + '-' + y} cx={x} cy={y} r="7" fill="#a9c3ff" stroke={INK} strokeWidth="3" />
      ))}

      {/* engranajes y válvulas laterales */}
      <Gear cx={196} cy={338} r={30} spinning={hydrating} />
      <Gear cx={192} cy={408} r={22} reverse spinning={hydrating} />
      <rect x="626" y="392" width="46" height="26" rx="7" fill="#b8c0dc" stroke={INK} strokeWidth="4" />
      <rect x="668" y="372" width="18" height="66" rx="7" fill="#9aa3c2" stroke={INK} strokeWidth="4" />
      <g className={hydrating ? 'gl-spin' : ''}>
        <circle cx="712" cy="405" r="30" fill="#e8478a" stroke={INK} strokeWidth="5" />
        <path d="M712 380v50M687 405h50" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".55" />
        <circle cx="712" cy="405" r="9" fill="#a8205f" stroke={INK} strokeWidth="3" />
      </g>
      <rect x="590" y="140" width="22" height="34" rx="6" fill="#9aa3c2" stroke={INK} strokeWidth="4" />
      <rect x="566" y="126" width="70" height="18" rx="9" fill="#d6d9ea" stroke={INK} strokeWidth="4" />
      <circle cx="636" cy="135" r="10" fill="#e5304e" stroke={INK} strokeWidth="3.5" />

      {/* tolva rosa con gelatina en polvo (clic para espolvorear) */}
      <g onClick={onHopper} style={{ cursor: canStart ? 'pointer' : 'default' }}>
        <path d="M236 72 L350 206 H470 L584 72Z" fill="#e0338b" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <path d="M262 84 L360 198" stroke="#ff9bd0" strokeWidth="9" strokeLinecap="round" opacity=".7" />
        <ellipse cx="410" cy="72" rx="176" ry="32" fill="#ff72b8" stroke={INK} strokeWidth="6" />
        <ellipse cx="410" cy="74" rx="152" ry="23" fill="#7a1647" />
        <path d="M264 72 Q300 22 360 34 Q410 10 462 34 Q522 22 556 72 Q410 104 264 72Z" fill="#f3e5c8" stroke="#c9b48a" strokeWidth="3" />
        {[[330, 54, 14], [400, 44, 16], [470, 52, 14], [372, 70, 9], [440, 72, 10]].map(([x, y, r]) => (
          <ellipse key={x} cx={x} cy={y} rx={r} ry={r * 0.55} fill="#fff8e6" opacity=".9" />
        ))}
        <rect x="350" y="204" width="120" height="34" rx="8" fill="#b8c0dc" stroke={INK} strokeWidth="5" />
        <rect x="350" y="214" width="120" height="8" fill="#7a84ad" opacity=".5" />
        <ellipse cx="410" cy="238" rx="50" ry="9" fill="#2c3052" stroke={INK} strokeWidth="3" />
      </g>

      {/* panel frontal */}
      <rect x="232" y="262" width="356" height="298" rx="28" fill="#4f82f2" stroke={INK} strokeWidth="5" />
      <rect x="246" y="274" width="328" height="10" rx="5" fill="#fff" opacity=".25" />
      {[[252, 284], [568, 284], [252, 544], [568, 544]].map(([x, y]) => (
        <circle key={x + '-' + y} cx={x} cy={y} r="6" fill="#a9c3ff" stroke={INK} strokeWidth="2.5" />
      ))}

      {/* luces: amarilla = en espera / verde = hidratando */}
      {[[276, 312, hasGelatin && !hydrating, '#ffd93a', '#8a7a2a'], [544, 312, hydrating, '#4be06a', '#2a6a3a']].map(([x, y, lit, on, off]) => (
        <g key={x}>
          {lit && <circle cx={x} cy={y} r="36" fill={on} opacity=".35" className={hydrating ? 'gl-blink' : ''} />}
          <circle cx={x} cy={y} r="25" fill="#c9d0ea" stroke={INK} strokeWidth="4" />
          <circle cx={x} cy={y} r="17" fill={lit ? on : off} stroke={INK} strokeWidth="3" />
          <circle cx={x - 5} cy={y - 6} r="4" fill="#fff" opacity=".7" />
        </g>
      ))}

      {/* dial central con reloj digital */}
      <circle cx="410" cy="414" r="114" fill="#c8d0ea" stroke={INK} strokeWidth="6" />
      <circle cx="410" cy="414" r="98" fill="#8e98c0" stroke={INK} strokeWidth="3" />
      <circle cx="410" cy="414" r="88" fill="#f6f8ff" stroke={INK} strokeWidth="4" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="410" y1={i % 3 === 0 ? 336 : 342} x2="410" y2="352" stroke="#5a6288" strokeWidth={i % 3 === 0 ? 5 : 3.5} strokeLinecap="round" transform={`rotate(${i * 30} 410 414)`} />
      ))}
      <path d="M338 380 Q352 350 384 338" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".8" />
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '410px 414px', transition: 'transform .1s linear' }}>
        <path d="M403 420 L410 340 L417 420Z" fill="#e5304e" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      </g>
      <circle cx="410" cy="414" r="12" fill={INK} />
      <rect x="360" y="452" width="100" height="34" rx="7" fill="#20243d" stroke={INK} strokeWidth="3" />
      <text x="410" y="477" textAnchor="middle" fontFamily="ui-monospace, Menlo, Consolas, monospace" fontSize="24" fontWeight="800" fill="#e8f0ff">{clock(ticks)}</text>

      {/* polvo cayendo desde la tolva */}
      {hydrating && POWDER.map(([dx, d], i) => (
        <circle key={i} className="gl-powder" style={{ '--dx': `${dx}px`, animationDelay: `${d}s` }} cx={410 + dx * 0.2} cy="244" r={i % 3 === 0 ? 4 : 2.8} fill="#fff" stroke="#cfdcff" strokeWidth="1" />
      ))}

      {/* bol de cristal con agua */}
      <ellipse cx="405" cy="744" rx="190" ry="12" fill={INK} opacity=".28" />
      <path d="M200 600 Q200 742 405 742 Q610 742 610 600Z" fill="url(#gl-h2o-glass)" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <g clipPath="url(#gl-h2o-clip)">
        <rect x="200" y="632" width="410" height="120" fill="#7fd0ff" />
        <ellipse cx="405" cy="632" rx="200" ry="26" fill="#b6e6ff" />
        <rect x="200" y="606" width="410" height="146" style={{ fill: color, opacity: hasGelatin ? 0.34 : 0, transition: 'opacity .6s' }} />
        {started && FOAM.map(([x, y, r]) => (
          <ellipse key={x} className={hydrating ? 'gl-foam' : ''} cx={x} cy={y} rx={r} ry={r * 0.62} fill="#fff" opacity=".92" />
        ))}
        {hydrating && [[250, 0], [310, .7], [380, 1.4], [450, .35], [520, 1.1], [570, 1.8]].map(([x, d]) => (
          <circle key={x} className="gl-bubble" style={{ animationDelay: `${d}s` }} cx={x} cy="712" r="6" fill="#fff" opacity=".85" />
        ))}
        {hasLumps === true && LUMPS.map(([x, y, r]) => (
          <circle key={x} cx={x} cy={y} r={r} fill="#fff3d6" stroke="#d9c08a" strokeWidth="2.5" />
        ))}
      </g>
      {bloomed && [[300, 590], [420, 575], [530, 595]].map(([x, y], i) => (
        <path key={x} className="gl-twinkle" style={{ animationDelay: `${i * 0.25}s` }} d={`M${x} ${y} l5 12 12 5 -12 5 -5 12 -5 -12 -12 -5 12 -5z`} fill="#fff" />
      ))}
      <ellipse cx="405" cy="600" rx="205" ry="34" fill="#e6f6ff" fillOpacity=".25" stroke={INK} strokeWidth="6" />
      <ellipse cx="405" cy="600" rx="190" ry="26" fill="none" stroke="#fff" strokeWidth="4" opacity=".7" />
      <path d="M226 650 Q240 712 300 730" stroke="#fff" strokeWidth="8" strokeLinecap="round" fill="none" opacity=".6" />
    </svg>
  );
}

/* ───────── Estación 1: Hidratación ───────── */
export default function HydrationStation() {
  const { activeTray, isPlaying, sprinkleGelatin, finishHydration } = useGame();
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [chosen, setChosen] = useState(Boolean(activeTray.gellingAgent)); // selección visual de la gelatina
  const [isHydrating, setIsHydrating] = useState(false);
  const [stopped, setStopped] = useState(false);          // reposo detenido, pendiente de evaluar al confirmar
  const [hydrationTime, setHydrationTime] = useState(0);
  const gelatin = ingredientsData.gellingAgents[0];

  const finished = activeTray.hasLumps !== null;
  const started = isHydrating || stopped || Boolean(activeTray.gellingAgent);
  const interrupted = !finished && !isHydrating && !stopped && Boolean(activeTray.gellingAgent);
  const hasGelatin = chosen || Boolean(activeTray.gellingAgent);

  useEffect(() => {
    if (!isHydrating || !isPlaying) return undefined;
    const id = setInterval(() => setHydrationTime((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [isHydrating, isPlaying]);

  // A los 10 min el reposo se detiene solo (se evalúa al confirmar)
  useEffect(() => {
    if (isHydrating && hydrationTime >= MAX_TICKS) { setIsHydrating(false); setStopped(true); }
  }, [isHydrating, hydrationTime]);

  // Con la vista ampliada abierta, los atajos de teclado de la cinta no deben actuar
  useEffect(() => {
    if (!isZoomedIn) return undefined;
    const block = (e) => { if (e.key.startsWith('Arrow')) e.stopPropagation(); };
    window.addEventListener('keydown', block, true);
    return () => window.removeEventListener('keydown', block, true);
  }, [isZoomedIn]);

  const canStart = isPlaying && !isHydrating && !stopped && !finished && !interrupted;
  const start = () => {
    if (!canStart) return;
    sprinkleGelatin();
    setChosen(true);
    setHydrationTime(0);
    setIsHydrating(true);
  };
  const stop = () => { setIsHydrating(false); setStopped(true); };

  // Elegir la gelatina tiñe el agua del bol. Una vez espolvoreada ya no se puede quitar.
  const toggleGelatin = () => {
    if (started) return;
    setChosen((c) => !c);
  };

  // CONFIRMAR Y ALEJAR CÁMARA: evalúa el tiempo, guarda el resultado en la bandeja y cierra la vista
  const confirm = () => {
    if (!finished) {
      if (isHydrating || stopped) finishHydration(!(hydrationTime >= IDEAL_MIN && hydrationTime <= IDEAL_MAX));
      else if (interrupted) finishHydration(true);
    }
    setIsHydrating(false);
    setStopped(false);
    setIsZoomedIn(false);
  };

  let msg = { cls: 'idle', text: 'Espolvorea la gelatina y déjala reposar el tiempo justo.' };
  if (isHydrating) msg = { cls: 'idle', text: 'Hidratando… detén el reposo cuando creas que está lista.' };
  else if (stopped) msg = { cls: 'idle', text: `Reposo detenido en ${clock(hydrationTime)}. Confirma para evaluar.` };
  else if (finished && !activeTray.hasLumps) msg = { cls: 'ok', text: 'Estado: Gelatina hidratada correctamente' };
  else if (finished) msg = { cls: 'bad', text: 'Estado: Grumos formados por mal tiempo' };
  else if (interrupted) msg = { cls: 'bad', text: 'Reposo interrumpido: la gelatina quedará con grumos' };

  // Vista ampliada a pantalla completa (se monta dentro de .gl-app para heredar la fuente)
  const zoomView = isZoomedIn && (
    <div className="gl-zoom" role="dialog" aria-modal="true" aria-label="Máquina de hidratación">
      <div className="gl-zoom__scene" aria-hidden="true">
        <div className="gl-zoom__window" />
        <div className="gl-zoom__floor" />
        <div className="gl-zoom__belt" />
      </div>

      <div className="gl-zoom__stage">
        {/* Izquierda (~65 %): la máquina en primer plano */}
        <div className="gl-zoom__machine">
          <HydrationMachine
            hasGelatin={hasGelatin} started={started} hydrating={isHydrating} hasLumps={activeTray.hasLumps}
            bloomed={finished && activeTray.hasLumps === false} ticks={hydrationTime}
            color={gelatin.color} canStart={canStart} onHopper={start}
          />
        </div>

        {/* Derecha (~35 %): panel de controles */}
        <div className="gl-zoom__side">
          <div className="gl-zoom__glass">
            <OrderTicketMini />
            <h2 className="gl-zoom__ptitle">01. HIDRATACIÓN DE LA GELATINA (BLOOMING)</h2>

            <div className="gl-zoom__inset" style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="button" onClick={toggleGelatin} className={`gl-gcard ${hasGelatin ? 'is-selected' : ''}`} aria-pressed={hasGelatin}>
                <span className="gl-gcard__tag">Agente gelificante</span>
                <IngredientArt id={gelatin.id} color={gelatin.color} size={54} />
                <span className="gl-gcard__name">{gelatin.name}</span>
                {hasGelatin && <span className="gl-gcard__check">✓</span>}
              </button>
            </div>

            <div>
              <p className="gl-zoom__label">Reposo</p>
              <div className="gl-zoom__inset gl-zoom__lcd"><SegDisplay text={clock(hydrationTime)} /></div>
              <p className="gl-zoom__label" style={{ textAlign: 'center', marginTop: '.35rem' }}>
                Detén entre {clock(IDEAL_MIN)} y {clock(IDEAL_MAX)}
              </p>
            </div>

            <div className="gl-zoom__btns">
              <button onClick={start} disabled={!canStart} className="gl-btn gl-btn--gold">ESPOLVOREAR GELATINA</button>
              <button onClick={stop} disabled={!isPlaying || !isHydrating} className="gl-btn gl-btn--blue">DETENER REPOSO</button>
            </div>

            <p className={`gl-hydro__msg gl-hydro__msg--${msg.cls}`}>{msg.text}</p>
          </div>

        </div>
      </div>

      {/* Pie oscuro: ayudante a la izquierda/centro, botón verde a la derecha */}
      <div className="gl-zoom__footer flex w-full items-center justify-between px-8">
        <div className="flex min-w-0 flex-1 justify-center">
          <HelperCharacter text="¡A despertar la gelatina! 💦 Mézclala con agua fría y deja que se hidrate." />
        </div>
        <div className="gl-zoom__exit">
          <button onClick={confirm} className="gl-btn gl-btn--xl">
            <span className="gl-zoom__tick">✔</span>
            <span>CONFIRMAR Y<br />ALEJAR CÁMARA</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="gl-panel">
      <div className="gl-panel__head">
        <span className="gl-panel__num" style={{ '--n1': '#ffb6de', '--n2': '#ec5aa6' }}>1</span>
        <h2 className="gl-panel__title">01. HIDRATACIÓN DE LA GELATINA (BLOOMING)</h2>
      </div>

      <div className="gl-panel__body">
        <div className="gl-section" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setIsZoomedIn(true)} className="gl-btn gl-btn--gold gl-btn--xl">
            OPERAR ESTACIÓN
          </button>
        </div>
      </div>

      {zoomView && createPortal(zoomView, document.querySelector('.gl-app') ?? document.body)}
    </div>
  );
}
