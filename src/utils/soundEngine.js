/* GUMMY LAB – Motor de efectos de sonido (Web Audio API, sin archivos externos).
   Uso:  import { sfx, setSoundEnabled } from '../utils/soundEngine';
         sfx.pop();  sfx.ding();  ...
   Si el sonido está desactivado (o el navegador no soporta Web Audio), todo retorna en silencio. */

let ctx = null;
let master = null;
let enabled = true;
let unlockBound = false;

const AudioCtor = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;

/* Crea el AudioContext la primera vez que se necesita */
function getCtx() {
  if (!AudioCtor) return null;
  if (!ctx) {
    try {
      ctx = new AudioCtor();
      master = ctx.createGain();
      master.gain.value = 0.55;
      const comp = ctx.createDynamicsCompressor(); // evita saturación cuando suenan varios efectos a la vez
      master.connect(comp);
      comp.connect(ctx.destination);
    } catch {
      ctx = null;
      return null;
    }
  }
  return ctx;
}

/* Los navegadores bloquean el audio hasta que el usuario interactúa: se reanuda en el primer gesto */
function bindUnlock() {
  if (unlockBound || typeof window === 'undefined') return;
  unlockBound = true;
  const unlock = () => {
    const c = getCtx();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
    if (c && c.state === 'running') {
      ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.removeEventListener(e, unlock, true));
    }
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.addEventListener(e, unlock, true));
}
bindUnlock();

/* Sincroniza con gameConfig.soundOn */
export function setSoundEnabled(value) {
  enabled = Boolean(value);
  if (!enabled) stopAllLoops(); // al silenciar se corta de inmediato todo sonido continuo
  if (enabled) {
    const c = getCtx();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  }
}
export const isSoundEnabled = () => enabled;

/* Devuelve el contexto listo para sonar, o null si hay que callar */
function ready() {
  if (!enabled) return null;
  const c = getCtx();
  if (!c) return null;
  if (c.state === 'suspended') c.resume().catch(() => {});
  return c;
}

/* Nota con envolvente: freq (o [inicio, fin] para deslizar), duración en s, inicio relativo en s */
function tone({ freq, type = 'sine', dur = 0.15, at = 0, vol = 0.3, attack = 0.008, filter, q = 1 }) {
  const c = ready();
  if (!c) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  const [f0, f1] = Array.isArray(freq) ? freq : [freq, freq];
  osc.frequency.setValueAtTime(f0, t0);
  if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let node = osc;
  if (filter) {
    const f = c.createBiquadFilter();
    f.type = filter.type;
    f.frequency.value = filter.freq;
    f.Q.value = q;
    osc.connect(f);
    node = f;
  }
  node.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/* Ráfaga de ruido filtrado (para motores, cinta, burbujeo) */
function noise({ dur = 0.2, at = 0, vol = 0.15, type = 'bandpass', freq = 1000, q = 1, sweepTo }) {
  const c = ready();
  if (!c) return;
  const t0 = c.currentTime + at;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t0);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

const N = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568 };

/* ───────── Efectos ───────── */

/** Burbuja/gelatina: clics de botones y cambios del slider. */
export function playPop() {
  const j = 1 + (Math.random() - 0.5) * 0.12; // variación mínima para que no suene repetitivo
  tone({ freq: [380 * j, 880 * j], type: 'sine', dur: 0.09, vol: 0.32 });
  tone({ freq: [760 * j, 1500 * j], type: 'triangle', dur: 0.05, vol: 0.1, at: 0.01 });
}

/** Cinta transportadora: traqueteo mecánico breve al avanzar de estación. */
export function playConveyor() {
  for (let i = 0; i < 6; i++) {
    noise({ dur: 0.05, at: i * 0.055, vol: 0.12, type: 'bandpass', freq: 900 + (i % 2) * 300, q: 2 });
    tone({ freq: 90 + (i % 2) * 14, type: 'square', dur: 0.05, at: i * 0.055, vol: 0.06, filter: { type: 'lowpass', freq: 400 } });
  }
  tone({ freq: [110, 190], type: 'sawtooth', dur: 0.36, vol: 0.05, filter: { type: 'lowpass', freq: 500 } });
}

/** Burbujeo: Formulación y Mezclado (se puede llamar en cada clic o tick). */
export function playBubble() {
  const n = 3 + Math.floor(Math.random() * 2);
  for (let i = 0; i < n; i++) {
    const base = 320 + Math.random() * 380;
    tone({ freq: [base, base * 2.1], type: 'sine', dur: 0.08 + Math.random() * 0.05, at: i * (0.05 + Math.random() * 0.04), vol: 0.17 });
  }
  noise({ dur: 0.18, vol: 0.03, type: 'lowpass', freq: 700 });
}

/** Campana positiva: hidratación en rango ideal o acción de estación completada. */
export function playDing() {
  tone({ freq: N.E6, type: 'sine', dur: 0.7, vol: 0.28 });
  tone({ freq: N.E6 * 2.76, type: 'sine', dur: 0.35, vol: 0.07 }); // armónico metálico
  tone({ freq: N.C6, type: 'triangle', dur: 0.5, vol: 0.12, at: 0.0 });
}

/** Alerta corta: sobrecalentamiento o tiempo por acabarse. */
export function playWarning() {
  [0, 0.14].forEach((at) => {
    tone({ freq: 880, type: 'square', dur: 0.1, at, vol: 0.1, filter: { type: 'lowpass', freq: 2200 } });
    tone({ freq: 660, type: 'square', dur: 0.1, at: at + 0.07, vol: 0.08, filter: { type: 'lowpass', freq: 2200 } });
  });
}

/** Acorde ascendente alegre: Control de Calidad aprueba. */
export function playSuccess(delay = 0) {
  [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => {
    tone({ freq: f, type: 'triangle', dur: 0.32, at: delay + i * 0.09, vol: 0.22 });
    tone({ freq: f * 2, type: 'sine', dur: 0.2, at: delay + i * 0.09, vol: 0.06 });
  });
  [N.C5, N.E5, N.G5, N.C6].forEach((f) => tone({ freq: f, type: 'sine', dur: 0.6, at: delay + 0.4, vol: 0.1 }));
}

/** Tono descendente suave: lote rechazado o pedido fallido. */
export function playError(delay = 0) {
  tone({ freq: [420, 300], type: 'triangle', dur: 0.22, at: delay, vol: 0.24 });
  tone({ freq: [300, 190], type: 'triangle', dur: 0.4, at: delay + 0.2, vol: 0.24, filter: { type: 'lowpass', freq: 1200 } });
}

/** Fanfarria festiva al abrir el certificado. */
export function playCertificateFanfare() {
  const mel = [[N.C5, 0, 0.14], [N.C5, 0.15, 0.14], [N.C5, 0.3, 0.14], [N.E5, 0.45, 0.3], [N.C5, 0.8, 0.14], [N.E5, 0.95, 0.14], [N.G5, 1.1, 0.5], [N.E5, 1.7, 0.14], [N.G5, 1.85, 0.14], [N.C6, 2.0, 0.8]];
  mel.forEach(([f, at, dur]) => {
    tone({ freq: f, type: 'square', dur, at, vol: 0.1, filter: { type: 'lowpass', freq: 3000 } });
    tone({ freq: f / 2, type: 'triangle', dur, at, vol: 0.14 });
  });
  [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone({ freq: f, type: 'sine', dur: 1.2, at: 2.0, vol: 0.09 }));
  // destellos
  [0, 0.12, 0.24, 0.36].forEach((at, i) => tone({ freq: N.G6 + i * 120, type: 'sine', dur: 0.2, at: 2.05 + at, vol: 0.07 }));
}

/* ───────── Sonidos continuos (loops) ───────── */
const activeLoops = new Map(); // nombre -> { stop() }
let noiseBuf = null;

function getNoiseBuf(c) {
  if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

/* Ruido filtrado en bucle, con fundido de entrada y salida */
function noiseLoop(c, { type = 'bandpass', freq = 800, q = 1, vol = 0.08 }) {
  const src = c.createBufferSource();
  src.buffer = getNoiseBuf(c);
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.12);
  src.connect(f); f.connect(g); g.connect(master);
  src.start();
  return {
    stop() {
      const n = c.currentTime;
      g.gain.cancelScheduledValues(n);
      g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), n);
      g.gain.exponentialRampToValueAtTime(0.0001, n + 0.1);
      src.stop(n + 0.12);
    },
  };
}

/* Oscilador en bucle (zumbidos de motor); devuelve también el oscilador para modularlo */
function oscLoop(c, { type = 'sine', freq = 80, vol = 0.06, lp = 0, wobble = 0, wobbleHz = 6 }) {
  const osc = c.createOscillator();
  osc.type = type; osc.frequency.value = freq;
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.15);
  let out = osc;
  if (lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; osc.connect(f); out = f; }
  out.connect(g); g.connect(master);
  osc.start();
  let lfo = null;
  if (wobble) { // modulación lenta de la frecuencia: da vida al motor
    lfo = c.createOscillator();
    const lg = c.createGain();
    lfo.frequency.value = wobbleHz; lg.gain.value = wobble;
    lfo.connect(lg); lg.connect(osc.frequency); lfo.start();
  }
  return {
    stop() {
      const n = c.currentTime;
      g.gain.cancelScheduledValues(n);
      g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), n);
      g.gain.exponentialRampToValueAtTime(0.0001, n + 0.1);
      osc.stop(n + 0.12);
      if (lfo) lfo.stop(n + 0.12);
    },
  };
}

function startLoop(name, build) {
  if (activeLoops.has(name)) return;
  const c = ready();
  if (!c) return;
  activeLoops.set(name, build(c));
}

/** Detiene un sonido continuo por nombre ('tick' | 'mixer' | 'boil' | 'cooling'). */
export function stopLoop(name) {
  const loop = activeLoops.get(name);
  if (!loop) return;
  activeLoops.delete(name);
  try { loop.stop(); } catch { /* ya detenido */ }
}

/** Detiene de inmediato TODO sonido continuo (desmontar estación, apagar máquina, silenciar). */
export function stopAllLoops() {
  [...activeLoops.keys()].forEach(stopLoop);
}

/** Hidratación: tic-tac mecánico suave mientras corre el reposo. */
export function startTickLoop() {
  startLoop('tick', () => {
    let i = 0;
    const beat = () => {
      const hi = i++ % 2 === 0;
      tone({ freq: hi ? 1500 : 1100, type: 'square', dur: 0.03, vol: 0.045, filter: { type: 'lowpass', freq: 2600 } });
      noise({ dur: 0.02, vol: 0.03, type: 'highpass', freq: 3000 });
    };
    beat();
    const id = setInterval(beat, 500);
    return { stop: () => clearInterval(id) };
  });
}

/** Mezclado: zumbido de motor + burbujeo viscoso. */
export function startMixerLoop() {
  startLoop('mixer', (c) => {
    const motor = oscLoop(c, { type: 'sawtooth', freq: 62, vol: 0.07, lp: 320, wobble: 9, wobbleHz: 7 });
    const hum = noiseLoop(c, { type: 'lowpass', freq: 260, vol: 0.05 });
    const id = setInterval(() => {
      const b = 180 + Math.random() * 260;
      tone({ freq: [b, b * 1.8], type: 'sine', dur: 0.07 + Math.random() * 0.06, vol: 0.075 });
    }, 110);
    return { stop() { clearInterval(id); motor.stop(); hum.stop(); } };
  });
}

/** Cocción: hervor suave continuo. */
export function startBoilLoop() {
  startLoop('boil', (c) => {
    const body = noiseLoop(c, { type: 'bandpass', freq: 650, q: 0.8, vol: 0.05 });
    const low = noiseLoop(c, { type: 'lowpass', freq: 180, vol: 0.05 });
    const id = setInterval(() => {
      if (Math.random() < 0.65) {
        const b = 240 + Math.random() * 320;
        tone({ freq: [b, b * 1.6], type: 'sine', dur: 0.05 + Math.random() * 0.05, vol: 0.08 });
      }
    }, 90);
    return { stop() { clearInterval(id); body.stop(); low.stop(); } };
  });
}

/** Enfriamiento: flujo de aire frío + compresor del túnel. */
export function startCoolingLoop() {
  startLoop('cooling', (c) => {
    const air = noiseLoop(c, { type: 'highpass', freq: 1800, vol: 0.035 });
    const flow = noiseLoop(c, { type: 'bandpass', freq: 420, q: 0.5, vol: 0.05 });
    const comp = oscLoop(c, { type: 'sine', freq: 55, vol: 0.07, wobble: 2, wobbleHz: 3 });
    const fan = oscLoop(c, { type: 'triangle', freq: 110, vol: 0.025, lp: 400 });
    return { stop() { air.stop(); flow.stop(); comp.stop(); fan.stop(); } };
  });
}

/* ───────── Efectos por estación ───────── */

/** Hidratación: polvo fino granular al espolvorear la gelatina. */
export function playSprinkle() {
  for (let i = 0; i < 30; i++) {
    noise({ dur: 0.03, at: i * 0.017 + Math.random() * 0.01, vol: 0.04 + Math.random() * 0.04, type: 'highpass', freq: 3500 + Math.random() * 3000, q: 0.7 });
  }
  noise({ dur: 0.5, vol: 0.02, type: 'bandpass', freq: 5000, q: 0.6 });
}

/** Hidratación: campana cristalina al entrar a la ventana ideal. */
export function playZoneReady() {
  [N.E6, N.G6, 2093].forEach((f, i) => {
    tone({ freq: f, type: 'sine', dur: 0.7, at: i * 0.1, vol: 0.14 });
    tone({ freq: f * 2.76, type: 'sine', dur: 0.3, at: i * 0.1, vol: 0.03 });
  });
}

/** Formulación: vertido líquido (agua / endulzante). */
export function playPour() {
  noise({ dur: 0.7, vol: 0.07, type: 'bandpass', freq: 900, q: 0.8, sweepTo: 1600 });
  noise({ dur: 0.7, vol: 0.05, type: 'lowpass', freq: 500 });
  for (let i = 0; i < 6; i++) {
    const f = 200 + i * 35;
    tone({ freq: [f, f * 1.9], type: 'sine', dur: 0.09, at: 0.05 + i * (0.11 - i * 0.008), vol: 0.1 });
  }
}

/** Formulación: gota densa ("plop") del extracto de pigmento. */
export function playDropExtract() {
  tone({ freq: [520, 140], type: 'sine', dur: 0.16, vol: 0.36 });
  tone({ freq: [260, 90], type: 'sine', dur: 0.22, at: 0.03, vol: 0.2 });
  noise({ dur: 0.02, vol: 0.05, type: 'highpass', freq: 2500 });
  tone({ freq: [900, 500], type: 'sine', dur: 0.1, at: 0.12, vol: 0.06 });
}

/** Cocción: encendido de quemador de gas ("whoosh"). */
export function playIgnite() {
  [0, 0.07, 0.13].forEach((at) => noise({ dur: 0.02, at, vol: 0.1, type: 'highpass', freq: 3000 })); // chispas
  noise({ dur: 0.55, at: 0.2, vol: 0.2, type: 'bandpass', freq: 250, q: 0.9, sweepTo: 1800 });
  tone({ freq: [70, 140], type: 'sawtooth', dur: 0.6, at: 0.2, vol: 0.09, filter: { type: 'lowpass', freq: 400 } });
}

/** Cocción: pitido corto de alerta térmica. */
export function playTempWarning() {
  [0, 0.12].forEach((at) => tone({ freq: 1250, type: 'square', dur: 0.08, at, vol: 0.08, filter: { type: 'lowpass', freq: 3000 } }));
}

/** Moldeado: presión neumática suave al llenar el molde. */
export function playMoldInject() {
  noise({ dur: 0.6, vol: 0.14, type: 'lowpass', freq: 1400, q: 0.6, sweepTo: 300 });
  noise({ dur: 0.5, vol: 0.04, type: 'highpass', freq: 4500 });
  tone({ freq: [120, 60], type: 'sine', dur: 0.25, vol: 0.18 });
  tone({ freq: [160, 70], type: 'sine', dur: 0.12, at: 0.55, vol: 0.18 });
}

/** Enfriamiento: destello gelatinoso al desmoldar. */
export function playUnmoldPop() {
  tone({ freq: [260, 1100], type: 'sine', dur: 0.1, vol: 0.3 });
  tone({ freq: [1500, 2600], type: 'triangle', dur: 0.12, at: 0.06, vol: 0.08 });
  [2200, 2900, 3500].forEach((f, i) => tone({ freq: f, type: 'sine', dur: 0.12, at: 0.1 + i * 0.05, vol: 0.05 }));
}

/** Control de Calidad: barrido electrónico de escáner (dura ≈ 0,75 s). */
export function playScanSweep() {
  tone({ freq: [250, 2400], type: 'sawtooth', dur: 0.35, vol: 0.06, filter: { type: 'bandpass', freq: 1200 }, q: 4 });
  tone({ freq: [2400, 400], type: 'sawtooth', dur: 0.35, at: 0.35, vol: 0.06, filter: { type: 'bandpass', freq: 1200 }, q: 4 });
  tone({ freq: 1800, type: 'square', dur: 0.05, at: 0.7, vol: 0.06, filter: { type: 'lowpass', freq: 3000 } });
}

/* Objeto práctico: sfx.pop(), sfx.ding()... */
export const sfx = {
  pop: playPop,
  conveyor: playConveyor,
  bubble: playBubble,
  ding: playDing,
  warning: playWarning,
  success: playSuccess,
  error: playError,
  fanfare: playCertificateFanfare,
  // por estación
  sprinkle: playSprinkle,
  zoneReady: playZoneReady,
  pour: playPour,
  dropExtract: playDropExtract,
  ignite: playIgnite,
  tempWarning: playTempWarning,
  moldInject: playMoldInject,
  unmoldPop: playUnmoldPop,
  scanSweep: playScanSweep,
  // sonidos continuos
  startTickLoop,
  startMixerLoop,
  startBoilLoop,
  startCoolingLoop,
  stopLoop,
  stopAllLoops,
};

export default sfx;
