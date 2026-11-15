import { useState, useEffect } from 'react';
import { sfx } from '../../utils/soundEngine';
import { useGame } from '../../context/GameContext';
import Gummy, { visibleColor } from '../entities/Gummy';
import HelperCharacter from '../HelperCharacter';
import ZoomShell, { INK, Pipe } from '../layout/ZoomShell';

// Estación 6: SOLO enfriamiento (minijuego térmico). Desmolda en el punto justo.
const START_TEMP = 40;  // °C al entrar al túnel
const MIN_TEMP = -10;   // el túnel no baja de aquí
const TICK_MS = 150;    // cada tick resta 1°C (~6,7°C/s)

// 4–10°C perfecta | >10°C sigue líquida | por debajo de 4°C (hasta 0°C o menos) se cristaliza
const evaluateTexture = (t) => (t > 10 ? 'melted' : t >= 4 ? 'perfect' : 'frozen');
const RESULTS = {
  perfect: { cls: 'ok', text: '¡Gelificación exitosa!' },
  frozen: { cls: 'bad', text: 'Se cristalizó la gelatina' },
  melted: { cls: 'bad', text: 'Sigue líquida' },
};

/* Túnel de frío industrial con bandeja, ventiladores, escarcha y humo frío */
function Tunnel({ temp, on, shape, color }) {
  const cold = Math.min(1, Math.max(0, (START_TEMP - temp) / 45));
  return (
    <svg viewBox="0 0 800 760" style={{ overflow: 'visible' }} role="img" aria-label="Túnel de frío industrial">
      <Pipe d="M-300 640 H110" bands={[[-60, 640, false], [30, 640, false]]} />
      {/* cuerpo */}
      <rect x="60" y="260" width="680" height="380" rx="54" fill="#c8d0ea" stroke={INK} strokeWidth="6" />
      <rect x="84" y="276" width="632" height="26" rx="13" fill="#fff" opacity=".4" />
      {/* ventiladores */}
      {[210, 590].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="190" r="62" fill="#2c3052" stroke={INK} strokeWidth="6" />
          <g className={on ? 'gl-spin gl-spin--fast' : ''}>
            {[0, 120, 240].map((r) => <ellipse key={r} cx={cx} cy="156" rx="16" ry="32" fill="#9fe7ff" stroke={INK} strokeWidth="3" transform={`rotate(${r} ${cx} 190)`} />)}
            <circle cx={cx} cy="190" r="10" fill="#fff" stroke={INK} strokeWidth="3" />
          </g>
        </g>
      ))}
      {/* ventana interior */}
      <clipPath id="gl-tun-clip"><rect x="110" y="330" width="580" height="220" rx="30" /></clipPath>
      <rect x="110" y="330" width="580" height="220" rx="30" fill="#26308a" stroke={INK} strokeWidth="6" />
      <g clipPath="url(#gl-tun-clip)">
        <rect x="110" y="500" width="580" height="50" fill="#1b1e4b" />
        <rect x="190" y="470" width="420" height="34" rx="14" fill="#d3d9ff" stroke="#8f9bdf" strokeWidth="4" />
        {[260, 330, 400, 470, 540].map((x) => <Gummy key={x} shape={shape} color={color} size={64} x={x - 32} y={410} shadow={false} />)}
        <rect x="110" y="330" width="580" height="220" fill="#dff4ff" style={{ opacity: cold * 0.7, transition: 'opacity .3s' }} />
        {on && [[170, 360], [280, 400], [420, 350], [540, 390], [630, 360]].map(([x, y], i) => (
          <path key={x} className="gl-twinkle" style={{ animationDelay: `${i * 0.25}s` }}
            d={`M${x} ${y} l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z`} fill="#fff" />
        ))}
      </g>
      {/* humo frío */}
      {on && [160, 300, 440, 580].map((x, i) => (
        <ellipse key={x} className="gl-coldfog" style={{ animationDelay: `${i * 0.5}s` }} cx={x} cy="650" rx="46" ry="24" fill="#e6f7ff" opacity=".8" />
      ))}
      {/* panel */}
      <rect x="110" y="570" width="580" height="50" rx="18" fill="#2c3052" stroke={INK} strokeWidth="5" />
      <text x="160" y="605" fontSize="30" fontWeight="800" fill={temp > 10 ? '#ff5a6e' : temp >= 4 ? '#5cf07a' : '#7fd0ff'} style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.floor(temp)}°C</text>
      <circle cx="640" cy="595" r="12" fill={on ? '#5cf07a' : '#8d86c9'} stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

/* Termómetro vertical (solo visual): degradado cálido → glaciar y franja ideal 4–10°C entre dos flechitas ▶ */
const T_TOP = START_TEMP, T_SPAN = START_TEMP - MIN_TEMP;
const topPct = (t) => ((T_TOP - Math.min(START_TEMP, Math.max(MIN_TEMP, t))) / T_SPAN) * 100;
function Thermo({ temp, inZone }) {
  const bandTop = topPct(10), bandH = topPct(4) - topPct(10);
  const pill = 'absolute -translate-y-1/2 rounded-full bg-slate-900/90 px-1.5 py-0.5 text-xs font-bold leading-none text-cyan-200 ring-1 ring-cyan-300/40';
  return (
    <div className="relative h-[150px] w-[92px] shrink-0" role="img" aria-label={`Termómetro ${Math.floor(temp)} grados, zona ideal 4 a 10`}>
      {/* barra */}
      <div className={`absolute left-[30px] top-0 h-full w-[18px] overflow-hidden rounded-full border-2 transition-all duration-200 ${inZone ? 'border-emerald-300 shadow-[0_0_12px_rgba(110,255,200,.9)]' : 'border-white/40'}`}
        style={{ background: 'linear-gradient(180deg,#ff3b30 0%,#ff9f0a 22%,#ffe066 40%,#7ee8ff 65%,#3aa0ff 85%,#9fd8ff 100%)' }}>
        {/* franja ideal */}
        <div className={`absolute inset-x-0 border-y-2 ${inZone ? 'animate-pulse border-white bg-emerald-300/70 motion-reduce:animate-none' : 'border-white/80 bg-emerald-300/45'}`} style={{ top: `${bandTop}%`, height: `${bandH}%` }} />
      </div>
      {/* flechitas laterales */}
      <span className="absolute left-[16px] -translate-y-1/2 text-xs font-bold leading-none text-emerald-300" style={{ top: `${bandTop}%` }} aria-hidden="true">▶</span>
      <span className="absolute left-[16px] -translate-y-1/2 text-xs font-bold leading-none text-emerald-300" style={{ top: `${bandTop + bandH}%` }} aria-hidden="true">▶</span>
      {/* etiquetas */}
      <span className={`${pill} left-[54px]`} style={{ top: `${bandTop}%` }}>10°C</span>
      <span className={`${pill} left-[54px]`} style={{ top: `${bandTop + bandH}%` }}>4°C</span>
      {/* indicador actual */}
      <div className={`absolute left-[24px] h-[4px] w-[30px] -translate-y-1/2 rounded-full bg-white transition-[top] duration-150 ease-linear ${inZone ? 'shadow-[0_0_10px_3px_rgba(110,255,200,.95)]' : 'shadow-[0_0_6px_rgba(255,255,255,.8)]'}`} style={{ top: `${topPct(temp)}%` }} />
      {/* copos */}
      {inZone && [[0, 22, 0], [2, 60, .4], [66, 8, .8]].map(([l, t, d]) => (
        <span key={l} className="absolute animate-bounce text-xs motion-reduce:animate-none" style={{ left: l, top: `${t}%`, animationDelay: `${d}s`, animationDuration: '1.4s' }} aria-hidden="true">❄️</span>
      ))}
    </div>
  );
}

export default function CoolingStation() {
  const { activeTray, setActiveTray, isPlaying } = useGame();
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [isCooling, setIsCooling] = useState(false);
  const [temperature, setTemperature] = useState(() => (activeTray.finalTexture !== null ? activeTray.temperature : START_TEMP));
  const [texture, setTexture] = useState(activeTray.finalTexture); // resultado local; se confirma al alejar la cámara
  const done = texture !== null;

  // Termostato: con el túnel encendido la temperatura baja rápido
  useEffect(() => {
    if (!isCooling || !isPlaying) return undefined;
    const id = setInterval(() => setTemperature((t) => Math.max(MIN_TEMP, t - 1)), TICK_MS);
    return () => clearInterval(id);
  }, [isCooling, isPlaying]);

  // Sonido: flujo de aire frío mientras el túnel está encendido; limpieza al salir
  useEffect(() => {
    if (!isCooling || !isPlaying) return undefined;
    sfx.startCoolingLoop();
    return () => sfx.stopLoop('cooling');
  }, [isCooling, isPlaying]);
  useEffect(() => () => sfx.stopAllLoops(), []);

  // El túnel se apaga solo al tocar el mínimo
  useEffect(() => { if (temperature <= MIN_TEMP) setIsCooling(false); }, [temperature]);

  // Efecto visual en la cinta mientras se enfría
  useEffect(() => {
    if (isCooling) setActiveTray((prev) => (prev.temperature === temperature ? prev : { ...prev, temperature }));
  }, [temperature, isCooling, setActiveTray]);

  // DESMOLDAR: detiene el túnel y fija la textura (un solo intento)
  const demold = () => {
    if (done) return;
    setIsCooling(false);
    setTexture(evaluateTexture(temperature));
    sfx.unmoldPop();
    evaluateTexture(temperature) === 'perfect' ? sfx.ding() : sfx.error();
  };

  // CONFIRMAR: guarda la textura en el estado global (si ya se desmoldó)
  const confirm = () => {
    setIsCooling(false);
    if (texture !== null) {
      setActiveTray((prev) => (prev.finalTexture !== null ? prev : { ...prev, temperature, finalTexture: texture }));
    }
    setIsZoomedIn(false);
  };

  const inZone = temperature >= 4 && temperature <= 10;
  const tempColor = temperature > 10 ? '#ff7a8c' : inZone ? '#7dffa0' : '#8fd8ff';
  const msg = done ? RESULTS[texture]
    : isCooling ? { cls: 'idle', text: 'Enfriando… ¡desmolda entre 4 y 10°C!' }
    : { cls: 'idle', text: 'Enciende el túnel y desmolda en la zona ideal. Un solo intento.' };
  const color = visibleColor(activeTray.pigment?.color ?? activeTray.base?.color ?? '#ff9fcf');

  return (
    <ZoomShell
      done={Boolean(done)}
      helper={<HelperCharacter text="¡Paciencia, que ya casi están listas! 🧊 Deja que las gomitas se enfríen." />}
      badge={['#8fb4ff', '#3f6fe6']} num="6" title="06. ENFRIAMIENTO (TÚNEL DE FRÍO)"
      isZoomedIn={isZoomedIn} onOpen={() => setIsZoomedIn(true)} onConfirm={confirm}
      machine={<Tunnel temp={temperature} on={isCooling} shape={activeTray.shape ?? 'cuadrado'} color={color} />}
    >
      <div className="gl-zoom__inset flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="gl-zoom__label">Temperatura</p>
          <div className="gl-zoom__lcd gl-zoom__lcd--temp" style={{ color: tempColor }}>{Math.floor(temperature)}°C</div>
          {inZone && !done ? (
            <p className="m-0 mt-1.5 animate-pulse rounded-full bg-cyan-400/25 px-2 py-0.5 text-center text-xs font-extrabold tracking-wide text-cyan-200 shadow-[0_0_10px_rgba(110,255,230,.55)] motion-reduce:animate-none">❄️ ¡TEMPERATURA IDEAL!</p>
          ) : (
            <p className="gl-zoom__label" style={{ marginTop: '.3rem', fontSize: '.7rem', opacity: .8 }}>Zona ideal: 4 – 10°C</p>
          )}
        </div>
        <Thermo temp={temperature} inZone={inZone} />
      </div>
      <div className="gl-zoom__btns">
        <button onClick={() => setIsCooling(true)} disabled={done || isCooling || temperature <= MIN_TEMP || !isPlaying}
          className="gl-btn gl-btn--blue gl-btn--xl">❄ ENCENDER TÚNEL</button>
        <button onClick={demold} disabled={done}
          className="gl-btn gl-btn--gold gl-btn--xl">DESMOLDAR</button>
      </div>
      <p className={`gl-hydro__msg gl-hydro__msg--${msg.cls}`}>{msg.text}</p>
    </ZoomShell>
  );
}
