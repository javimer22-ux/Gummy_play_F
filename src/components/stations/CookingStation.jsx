import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import HelperCharacter from '../HelperCharacter';
import ZoomShell, { INK, Pipe, mmss } from '../layout/ZoomShell';

const TICK_MS = 100;
const HEAT = 2;     // °C por tick con fuego (≈20°C/s)
const MIN_T = 20, MAX_T = 140;
const pct = (t) => ((Math.min(MAX_T, Math.max(MIN_T, t)) - MIN_T) / (MAX_T - MIN_T)) * 100;

/* Marmita con termómetro visible y llama */
function Marmita({ temp, limit, on, burned }) {
  const p = pct(temp);
  const col = burned || temp >= limit ? '#e0314b' : temp >= limit - 15 ? '#ffb020' : '#3b82f6';
  return (
    <svg viewBox="0 0 800 760" style={{ overflow: 'visible' }} role="img" aria-label="Marmita de cocción">
      <Pipe d="M650 -60 V230 Q650 270 610 270 H540" bands={[[650, 70, true]]} />
      {/* base y llama */}
      <rect x="250" y="620" width="300" height="90" rx="16" fill="#9aa3c2" stroke={INK} strokeWidth="6" />
      {[300, 400, 500].map((x) => <circle key={x} cx={x} cy="665" r="12" fill="#2c3052" stroke={INK} strokeWidth="4" />)}
      {on && [300, 400, 500].map((x, i) => (
        <path key={x} className="gl-blink" style={{ animationDelay: `${i * .15}s` }} d={`M${x} 612 q-26 -34 0 -68 q8 22 22 30 q8 -14 -2 -30 q36 22 6 68Z`} fill="#ff8a1e" stroke="#e0314b" strokeWidth="3" />
      ))}
      {/* olla */}
      <path d="M220 280 H580 V540 Q580 614 506 614 H294 Q220 614 220 540Z" fill="#c8d0ea" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d="M520 286 H574 V540 Q574 604 506 608 H500 Q520 580 520 540Z" fill="#8f99bf" opacity=".6" />
      <rect x="200" y="256" width="400" height="34" rx="16" fill="#b8c0dc" stroke={INK} strokeWidth="6" />
      <rect x="150" y="360" width="56" height="26" rx="10" fill="#7c5cf0" stroke={INK} strokeWidth="5" />
      <rect x="594" y="360" width="56" height="26" rx="10" fill="#7c5cf0" stroke={INK} strokeWidth="5" />
      {/* mezcla burbujeando */}
      <clipPath id="gl-pot-clip"><rect x="236" y="300" width="328" height="296" rx="40" /></clipPath>
      <g clipPath="url(#gl-pot-clip)">
        <rect x="236" y="340" width="328" height="270" fill={burned ? '#2a1a14' : '#ff9fcf'} style={{ transition: 'fill .4s' }} opacity=".92" />
        <ellipse cx="400" cy="340" rx="164" ry="10" fill="#fff" opacity=".35" />
        {on && [[300, 0], [380, .5], [450, 1], [340, 1.4]].map(([x, d]) => <circle key={x} className="gl-bubble" style={{ animationDelay: `${d}s` }} cx={x} cy="560" r="8" fill="#fff" opacity=".7" />)}
      </g>
      {/* termómetro */}
      <rect x="318" y="150" width="164" height="70" rx="14" fill="#2c3052" stroke={INK} strokeWidth="5" />
      <text x="400" y="196" textAnchor="middle" fontSize="38" fontWeight="800" fill={col} style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.floor(temp)}°C</text>
      <rect x="652" y="300" width="52" height="320" rx="26" fill="#fff" stroke={INK} strokeWidth="6" />
      <rect x="664" y={606 - 290 * (p / 100)} width="28" height={290 * (p / 100) + 6} rx="12" fill={col} style={{ transition: 'fill .3s' }} />
      <circle cx="678" cy="640" r="30" fill={col} stroke={INK} strokeWidth="6" style={{ transition: 'fill .3s' }} />
      <rect x="656" y={606 - 290 * pct(limit) / 100} width="44" height="5" fill="#16a34a" />
      <text x="716" y={612 - 290 * pct(limit) / 100} fontSize="14" fontWeight="800" fill="#16a34a">{limit}°</text>
    </svg>
  );
}

export default function CookingStation() {
  const { activeTray, setActiveTray } = useGame();
  const limit = activeTray.pigment?.maxTemp ?? 100; // zona segura: por debajo de este valor
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [on, setOn] = useState(false);
  const [temp, setTemp] = useState(activeTray.temperature);
  const [secs, setSecs] = useState(0);
  // true tras pulsar APAGAR FUEGO (o al volver con la bandeja ya calentada): la temperatura queda congelada y se evalúa
  const [stopped, setStopped] = useState(activeTray.temperature > MIN_T);
  const burned = Boolean(activeTray.burned);

  // Temporizador interno del fuego: solo corre mientras está encendido.
  // Al apagarlo no hay enfriamiento: la temperatura se congela en el valor alcanzado.
  useEffect(() => {
    if (!on) return undefined;
    const id = setInterval(() => {
      setTemp((t) => Math.min(MAX_T, t + HEAT));
      setSecs((s) => s + TICK_MS / 1000);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [on]);

  // Refleja la temperatura en la bandeja (efectos de la cinta) e inyecta burned al pasarse
  useEffect(() => {
    setActiveTray((prev) => {
      const nowBurned = prev.burned || temp > limit;
      return prev.temperature === temp && prev.burned === nowBurned ? prev : { ...prev, temperature: temp, burned: nowBurned };
    });
  }, [temp, limit, setActiveTray]);

  const turnOn = () => { setStopped(false); setOn(true); };
  const turnOff = () => { setOn(false); setStopped(true); };
  const confirm = () => { if (on) turnOff(); setIsZoomedIn(false); };

  // Tras APAGAR FUEGO: retroalimentación fija según el valor congelado
  const msg = stopped && !on
    ? (burned || temp > limit
      ? { cls: 'bad', text: '❌ Temperatura excedida (Quemado)' }
      : { cls: 'ok', text: '✅ Temperatura Correcta' })
    : burned ? { cls: 'bad', text: '¡Se quemó! Superaste los ' + limit + '°C. Apaga el fuego.' }
    : on && temp >= limit - 10 ? { cls: 'bad', text: '¡Casi! Apaga el fuego ya.' }
    : { cls: 'idle', text: `Zona segura: hasta ${limit}°C${limit < 100 ? ' (Pitahaya)' : ''}.` };

  return (
    <ZoomShell
      helper={<HelperCharacter type="warning" text="🚨 ¡ALERTA! ¡No superes los 40 °C! Controla el calor para proteger el pigmento." />}
      badge={['#ff9aa8', '#e0314b']} num="4" title="04. COCCIÓN"
      isZoomedIn={isZoomedIn} onOpen={() => setIsZoomedIn(true)} onConfirm={confirm}
      machine={<Marmita temp={temp} limit={limit} on={on} burned={burned} />}
    >
      <div className="gl-zoom__inset">
        <p className="gl-zoom__label">Tiempo de fuego</p>
        <p className="gl-zoom__label" style={{ textAlign: 'center', fontSize: '1.6rem' }}>{mmss(secs)}</p>
      </div>
      <div className="gl-zoom__btns">
        <button onClick={turnOn} disabled={on || burned} className="gl-btn gl-btn--orange gl-btn--xl">🔥 ENCENDER FUEGO</button>
        <button onClick={turnOff} disabled={!on} className="gl-btn gl-btn--blue gl-btn--xl">APAGAR FUEGO</button>
      </div>
      <p className={`gl-hydro__msg gl-hydro__msg--${msg.cls}`}>{msg.text}</p>
    </ZoomShell>
  );
}
