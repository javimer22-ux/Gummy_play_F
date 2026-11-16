import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { sfx, setSoundEnabled } from './utils/soundEngine';
import StartScreen from './StartScreen';
import Watermark from './components/Watermark';
import SetupScreen from './SetupScreen';
import { GameProvider, useGame } from './context/GameContext';
import { useGameLoop } from './hooks/useGameLoop';
import HelperCharacter from './components/HelperCharacter';
import ConveyorBelt from './components/layout/ConveyorBelt';
import HydrationStation from './components/stations/HydrationStation';
import FormulationStation from './components/stations/FormulationStation';
import MixingStation from './components/stations/MixingStation';
import CookingStation from './components/stations/CookingStation';
import MoldingStation from './components/stations/MoldingStation';
import CoolingStation from './components/stations/CoolingStation';
import QualityControlStation from './components/stations/QualityControlStation';
import TimeUpModal from './components/layout/TimeUpModal';
import ResultsModal from './components/layout/ResultsModal';
import CertificateScreen from './components/layout/CertificateScreen';
import { useStationGuide } from './components/layout/ZoomShell';
import Gummy from './components/entities/Gummy';
import { ArrowIcon, PauseIcon, PlayIcon, SpinIcon, StarIcon } from './components/entities/Icons';
import { STATION, FIRST_STATION, LAST_STATION } from './constants/stations';
import ingredientsData from './data/ingredients.json';
import shapesData from './data/shapes.json';

// Frases de la ingeniera guía: [antes de operar, después de operar] según el modo
const NEXT_NAME = { 1: 'Formulación', 2: 'Mezclado', 3: 'Cocción', 4: 'Moldeado', 5: 'Enfriamiento', 6: 'Control de Calidad' };
const HELPER_TUTORIAL = {
  1: ['Vamos a preparar gelatina. Pulsa «Operar estación» para entrar a la máquina e hidratarla con agua fría.', '¡Gelatina hidratada!'],
  2: ['Pulsa «Operar estación» y elige tu base y tu pigmento natural.', '¡Fórmula lista!'],
  3: ['Pulsa «Operar estación» y agita varias veces hasta llegar al 100 %.', '¡Mezcla homogénea!'],
  4: ['Pulsa «Operar estación», enciende el fuego y apágalo antes de pasar la temperatura indicada.', '¡Cocción lista!'],
  5: ['Pulsa «Operar estación» y elige el molde que pide el pedido.', '¡Molde elegido!'],
  6: ['Pulsa «Operar estación», enciende el túnel y desmolda entre 4 y 10 °C.', '¡Gelatina desmoldada!'],
};
const HELPER_SHORT = {
  1: ['Hidratación: entra y detén el reposo en su punto.', 'Hidratación lista.'],
  2: ['Formulación: elige base y pigmento.', 'Formulación lista.'],
  3: ['Mezclado: agita hasta el 100 %.', 'Mezclado listo.'],
  4: ['Cocción: apaga antes del límite.', 'Cocción lista.'],
  5: ['Moldeado: elige el molde del pedido.', 'Moldeado listo.'],
  6: ['Enfriamiento: desmolda entre 4 y 10 °C.', 'Enfriamiento listo.'],
};
const helperFor = (station, isTutorial, stepDone, hasLumps) => {
  if (station === STATION.QUALITY) return { text: '¡Trabajo terminado! Veamos si la gomita cumple con las especificaciones.' };
  const pair = (isTutorial ? HELPER_TUTORIAL : HELPER_SHORT)[station];
  if (!pair) return null;
  const type = station === STATION.HEATING ? 'warning' : undefined;
  if (!stepDone) return { type, text: pair[0] };
  const lumps = isTutorial && station === 1 && hasLumps === true ? ' (con grumos: afectará al Mezclado)' : '';
  return {
    type, text: isTutorial
      ? `${pair[1]}${lumps} Ahora pulsa la flecha derecha (→) para ir a ${NEXT_NAME[station]}.`
      : `${pair[1]} Avanza a ${NEXT_NAME[station]} (→).`
  };
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Datos legibles de un pedido (solo presentación)
const describeOrder = (order) => {
  const { bases, pigments } = ingredientsData;
  const sweet = bases.find((b) => b.id === order.targetSpecs.sweetener);
  const pig = pigments.find((p) => p.id === order.targetSpecs.pigment);
  const shapeName = shapesData.find((s) => s.id === order.targetSpecs.shape)?.name ?? order.targetSpecs.shape;
  return { sweet, pig, shapeName };
};

function GameBoard({ onExit, onSettings }) {
  useGameLoop();
  const { isTutorial, stepDone, hint } = useStationGuide();
  const {
    isPlaying, setIsPlaying, activeOrders, activeTray, score, totalOrders, gameFinished,
    advanceConveyor, retreatConveyor, restartGame, runId, results,
  } = useGame();
  const infinite = totalOrders === Infinity;
  // Turno perfecto: todos los pedidos del turno cerrados y TODOS aprobados (sin errores y dentro de su tiempo)
  const perfectShift = !infinite && results.length === totalOrders && results.every((r) => r.status === 'approved');
  const current = activeOrders[0];
  const currentInfo = current ? describeOrder(current) : null;
  const orderNumber = infinite ? results.length + 1 : Math.min(totalOrders - activeOrders.length + 1, totalOrders);

  // Reiniciar partida con confirmación (pausa mientras se decide)
  const [confirming, setConfirming] = useState(false);
  const [resumeAfter, setResumeAfter] = useState(false);
  const askRestart = () => { setResumeAfter(isPlaying); setIsPlaying(false); setConfirming(true); };
  const cancelRestart = () => { setConfirming(false); if (resumeAfter) setIsPlaying(true); };
  const confirmRestart = () => { setConfirming(false); restartGame(); };

  // Pedido caducado: el reloj del pedido activo llegó a 0
  const orderExpired = Boolean(current) && current.timeRemaining <= 0 && activeTray.station < LAST_STATION;
  // Sonido: alerta cuando el tiempo del pedido está por acabarse
  useEffect(() => { const t = current?.timeRemaining; if (isPlaying && !isTutorial && (t === 15 || (t <= 5 && t > 0))) sfx.warning(); }, [current?.timeRemaining, isTutorial]);

  // Reglas de la cinta: ← no baja de la primera estación; se bloquean en pausa, en QA, con alertas y al terminar
  const blocked = gameFinished || orderExpired || confirming;
  // En Enfriamiento la cinta solo avanza después de DESMOLDAR (así QA siempre recibe una textura)
  const awaitingDemold = activeTray.station === STATION.COOLING && activeTray.finalTexture === null;
  const canAdvance = isPlaying && activeTray.station < LAST_STATION && !blocked && !awaitingDemold;
  const canRetreat = isPlaying && activeTray.station > FIRST_STATION && activeTray.station < LAST_STATION && !blocked;

  // Atajo de teclado: flechas ← → (misma lógica que los botones)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' && canAdvance) advanceConveyor();
      if (e.key === 'ArrowLeft' && canRetreat) retreatConveyor();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canAdvance, canRetreat, advanceConveyor, retreatConveyor]);

  return (
    <div className="gl-app gl-board">

      {/* ZONA 1: HUD y Pedidos */}
      <header className="gl-hud">
        {/* Lado Izquierdo: Controles */}
        <div className="flex items-center gap-5 flex-wrap">
          <h1 className="gl-logo">
            <Gummy shape="osito" color="#ff3d5a" size={38} shadow={false} wobble />
            GUMMY LAB
          </h1>
          <div className="flex gap-3 items-center flex-wrap">
            <button onClick={askRestart} className="gl-btn gl-btn--purple gl-btn--icon" aria-label="Reiniciar partida" title="Reiniciar partida">
              <SpinIcon size={20} />
            </button>
            <p className="gl-pill gl-pill--time">PEDIDO {orderNumber} / {infinite ? '∞' : totalOrders}</p>
            <p className="gl-pill gl-pill--score"><StarIcon size={24} />{score} PTS</p>
            {/* Navegación: ambos reinician el turno actual (se desmonta la partida) */}
            <button
              onClick={onSettings} title="Volver a Ajustes"
              className="rounded-full border-2 border-white/80 bg-gradient-to-b from-sky-400 to-blue-600 px-3 py-1 text-sm font-extrabold text-white shadow-[0_3px_0_#1e3a8a] transition-transform hover:brightness-110 active:translate-y-0.5"
            >⚙ Ajustes</button>
            <button
              onClick={onExit} title="Volver al Inicio"
              className="rounded-full border-2 border-white/80 bg-gradient-to-b from-yellow-300 to-orange-500 px-3 py-1 text-sm font-extrabold text-indigo-950 shadow-[0_3px_0_#b45309] transition-transform hover:brightness-110 active:translate-y-0.5"
            >🏠 Inicio</button>
          </div>
        </div>

        {/* Lado Derecho: Sistema de Tickets (Actual vs Cola) */}
        <div className="flex gap-5 items-center pt-2">
          {current && (
            <div className="gl-ticket" title={current.description}>
              <div className="gl-ticket__art">
                <Gummy shape={current.targetSpecs.shape} color={currentInfo.pig?.color} size={50} wobble />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <span className="gl-ticket__tag">LOTE ACTUAL: {current.id}</span>
                  <span className={`font-extrabold tabular-nums ${!isTutorial && current.timeRemaining < 15 ? 'text-red-600 gl-pulse' : ''}`}>
                    {isTutorial ? '🎓 TUTORIAL · SIN TIEMPO' : formatTime(current.timeRemaining)}
                  </span>
                </div>
                <p className="font-extrabold leading-tight mt-0.5">{current.title}</p>
                <p className="gl-ticket__meta">
                  Molde: {currentInfo.shapeName} · {currentInfo.pig?.name ?? current.targetSpecs.pigment}
                  <br />{currentInfo.sweet?.name ?? current.targetSpecs.sweetener}
                </p>
              </div>
            </div>
          )}

          {/* TICKETS EN COLA */}
          {activeOrders.slice(1, 2).map((order) => (
            <div key={order.id} className="gl-ticket gl-ticket--queue">
              <Gummy shape={order.targetSpecs.shape} color={describeOrder(order).pig?.color} size={34} shadow={false} />
              <div className="min-w-0">
                <p className="gl-ticket__meta" style={{ fontSize: '.66rem' }}>EN COLA: {order.id}</p>
                <p className="font-extrabold text-sm leading-tight truncate max-w-[9rem]">{order.title}</p>
              </div>
            </div>
          ))}
          {activeOrders.length > 2 && <span className="gl-pill" style={{ fontSize: '.9rem' }}>+{activeOrders.length - 2}</span>}
        </div>
      </header>

      {/* ZONA 2: Fábrica + cinta transportadora */}
      <main className="flex-1 min-h-0 flex flex-col relative">
        <ConveyorBelt />

        {!isPlaying && !confirming && !gameFinished && activeTray.station < LAST_STATION && (
          <div className="gl-hint">¡Pulsa «INICIAR TURNO» para arrancar la fábrica!</div>
        )}

        {/* CONTROL CENTRAL DE LA FÁBRICA: flechas para ir y volver entre estaciones */}
        <div className="gl-strip">
          <span className="gl-strip__label">MUEVE LA CINTA</span>
          <div className="gl-pad">
            <button
              onClick={retreatConveyor} disabled={!canRetreat}
              className="gl-btn gl-btn--lime gl-btn--pill" aria-label="Volver a la estación anterior" title="Volver (←)"
            >
              <ArrowIcon size={28} className="gl-flip" />
            </button>
            <button
              onClick={advanceConveyor} disabled={!canAdvance}
              className={`gl-btn gl-btn--lime gl-btn--pill ${stepDone && activeTray.station < LAST_STATION && hint ? '!ring-4 ring-amber-300 !animate-bounce !shadow-[0_0_22px_#fde047]' : ''}`} aria-label="Avanzar a la siguiente estación" title="Avanzar (→)"
            >
              <ArrowIcon size={28} />
            </button>
          </div>
        </div>
      </main>

      {/* ZONA 3: Panel de Control Dinámico */}
      <footer className="gl-dock">
        <div className="h-full flex items-stretch gap-3">
          {/* Control del turno: inicio / pausa de la fábrica */}
          <div className="gl-dock__turn">
            <span className="gl-dock__turn-label">TURNO</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`gl-btn gl-btn--xl ${isPlaying ? 'gl-btn--red' : 'gl-btn--green'}`}
            >
              {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
              {isPlaying ? 'PAUSAR FÁBRICA' : 'INICIAR TURNO'}
            </button>
          </div>
          <div className="h-full min-w-0 flex-1">
            {activeTray.station === STATION.HYDRATION && <HydrationStation key={runId} />}
            {activeTray.station === STATION.FORMULATION && <FormulationStation />}
            {activeTray.station === STATION.MIXING && <MixingStation />}
            {activeTray.station === STATION.HEATING && <CookingStation />}
            {activeTray.station === STATION.MOLDING && <MoldingStation />}
            {activeTray.station === STATION.COOLING && <CoolingStation />}
            {/* La última estación (QA) es modal */}
            {activeTray.station >= LAST_STATION && (
              <div className="gl-panel items-center justify-center">
                <h2 className="gl-panel__title" style={{ fontSize: '1.8rem', opacity: 0.55 }}>ESPERANDO REINICIO...</h2>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* PANTALLA DE CONTROL DE CALIDAD SUPERPUESTA (MODAL) */}
      {!gameFinished && !orderExpired && activeTray.station === STATION.QUALITY && (
        <div className="gl-modal">
          <QualityControlStation />
        </div>
      )}

      {/* PERSONAJE GUÍA: esquina inferior derecha de la vista general */}
      {!gameFinished && helperFor(activeTray.station, isTutorial, stepDone, activeTray.hasLumps) && (
        <HelperCharacter variant="floating" {...helperFor(activeTray.station, isTutorial, stepDone, activeTray.hasLumps)} />
      )}

      {/* ALERTA DE TIEMPO AGOTADO DEL PEDIDO / RESULTADOS FINALES */}
      {orderExpired && !gameFinished && <TimeUpModal />}
      {gameFinished && (perfectShift
        ? <CertificateScreen results={results} score={score} onExit={onExit} />
        : <ResultsModal onExit={onExit} />)}

      {/* CONFIRMAR REINICIO */}
      {confirming && (
        <div className="gl-modal">
          <div className="gl-report gl-report--shift" role="alertdialog" style={{ maxWidth: '26rem', overflow: 'visible', maxHeight: 'none', marginTop: '1.6rem' }}>
            <div className="gl-report__ribbon">¿REINICIAR PARTIDA?</div>
            <p className="font-bold mb-4" style={{ color: '#7458b0' }}>Perderás el progreso y los puntos de esta partida.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={cancelRestart} className="gl-btn gl-btn--blue">CANCELAR</button>
              <button onClick={confirmRestart} className="gl-btn gl-btn--red">REINICIAR</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function AppInner() {
  // Intro automática solo la primera vez por sesión (compatible con autoplay usando muted)
  const [showAutoIntro, setShowAutoIntro] = useState(true);
  const [introMuted, setIntroMuted] = useState(true);
  const introVideoRef = useRef(null);

  const closeAutoIntro = () => {
    sessionStorage.setItem('gummy_intro_seen', '1');
    setShowAutoIntro(false);
  };

  const toggleIntroSound = () => {
    const nextMuted = !introMuted;
    setIntroMuted(nextMuted);
    if (introVideoRef.current) {
      introVideoRef.current.muted = nextMuted;
      if (!nextMuted) introVideoRef.current.play().catch(() => { });
    }
  };

  useEffect(() => {
    if (!showAutoIntro) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeAutoIntro(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAutoIntro]);

  // Máquina de estados: START -> CONFIG -> PLAYING
  const [gameState, setGameState] = useState('START');
  const [gameConfig, setGameConfig] = useState({ soundOn: true, orderCount: 3 }); // orderCount: 3 | 5 | 'infinite'

  // Sonido: sincroniza con gameConfig.soundOn y da un pop a todos los botones habilitados
  useEffect(() => { setSoundEnabled(gameConfig.soundOn); }, [gameConfig.soundOn]);
  useEffect(() => {
    const h = (e) => { if (e.target.closest?.('button:not(:disabled)')) sfx.pop(); };
    window.addEventListener('click', h, true);
    return () => window.removeEventListener('click', h, true);
  }, []);

  if (showAutoIntro) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black" role="dialog" aria-modal="true" aria-label="Introducción inicial">
        <button
          type="button"
          onClick={toggleIntroSound}
          className="absolute left-5 top-5 z-10 rounded-full border-4 border-white bg-amber-400 px-4 py-1.5 text-sm font-black text-indigo-950 shadow-[0_4px_0_#b45309] transition-transform hover:brightness-110 active:translate-y-0.5"
        >
          {introMuted ? '🔊 ACTIVAR SONIDO' : '🔇 SILENCIAR'}
        </button>

        <button
          type="button"
          onClick={closeAutoIntro}
          className="absolute right-5 top-5 z-10 rounded-full border-4 border-white bg-rose-500 px-4 py-1.5 text-sm font-black text-white shadow-[0_4px_0_#9f1239] transition-transform hover:brightness-110 active:translate-y-0.5"
        >
          SALTAR INTRO ⏭
        </button>

        <video
          ref={introVideoRef}
          src="/assets/intro.mp4"
          autoPlay
          muted
          playsInline
          onEnded={closeAutoIntro}
          onError={closeAutoIntro}
          className="h-full w-full bg-black object-contain"
        />
      </div>
    );
  }

  if (gameState === 'START') {
    return (
      <>
        <StartScreen onPlay={() => setGameState('CONFIG')} />
        <Watermark />
      </>
    );
  }
  if (gameState === 'CONFIG') {
    return (
      <SetupScreen
        config={gameConfig}
        onBack={() => setGameState('START')}
        onStart={(cfg) => { setGameConfig(cfg); setGameState('PLAYING'); }}
      />
    );
  }
  return (
    <GameProvider config={{ ...gameConfig, onExit: () => setGameState('START') }}>
      <GameBoard onExit={() => setGameState('START')} onSettings={() => setGameState('CONFIG')} />
    </GameProvider>
  );
}

/* ───────── Escala responsiva (móvil / pantallas pequeñas) ─────────
   Si width < 1024 || height < 620, el juego se dibuja en un lienzo virtual (alto 720, ancho según la pantalla, mín. 1280)
   y se escala para llenar toda la pantalla. En escritorio no cambia nada (los contenedores son `display: contents`). */
const BASE_W = 1280;
const BASE_H = 720;
const EMU_ID = 'gl-viewport-emulation';

// <<VP-EMU
let emuW = BASE_W;
let emuH = BASE_H;
let UNITS = {};
const setEmuSize = (w, h) => {
  emuW = w; emuH = h;
  UNITS = { vw: w / 100, dvw: w / 100, svw: w / 100, lvw: w / 100, vh: h / 100, dvh: h / 100, svh: h / 100, lvh: h / 100, vmin: Math.min(w, h) / 100, vmax: Math.max(w, h) / 100 };
};
setEmuSize(BASE_W, BASE_H);
const UNIT_RE = /(-?\d*\.?\d+)(dvw|svw|lvw|vw|dvh|svh|lvh|vh|vmin|vmax)\b/g;
// Las unidades de viewport se convierten a píxeles de la pantalla base 1280×720 (así vh/vw son los de escritorio)
const toBaseUnits = (css) => css.replace(UNIT_RE, (_, n, u) => `${+(parseFloat(n) * UNITS[u]).toFixed(3)}px`);

const lenPx = (v) => {
  const m = /^\s*(-?[\d.]+)\s*(px|rem|em)?\s*$/.exec(v);
  return m ? parseFloat(m[1]) * (m[2] === 'rem' || m[2] === 'em' ? 16 : 1) : NaN;
};
// Evalúa una media query como si la ventana midiera emuW × emuH (el lienzo virtual)
function matchesBase(query) {
  const one = (q) => {
    let t = q.trim(); let neg = false;
    if (/^not\s+/i.test(t)) { neg = true; t = t.replace(/^not\s+/i, ''); }
    t = t.replace(/^only\s+/i, '');
    const ok = t.split(/\s+and\s+/i).every((raw) => {
      const p = raw.trim();
      if (p === '' || p === 'screen' || p === 'all') return true;
      if (p === 'print') return false;
      let m = /^\(\s*(min-width|max-width|min-height|max-height|width|height)\s*:\s*([^)]+)\)$/.exec(p);
      if (m) {
        const v = lenPx(m[2]); const size = m[1].endsWith('width') ? emuW : emuH;
        if (m[1].startsWith('min')) return size >= v;
        if (m[1].startsWith('max')) return size <= v;
        return size === v;
      }
      m = /^\(\s*(width|height)\s*(>=|<=|>|<)\s*([^)]+)\)$/.exec(p);
      if (m) {
        const v = lenPx(m[3]); const size = m[1] === 'width' ? emuW : emuH;
        return { '>=': size >= v, '<=': size <= v, '>': size > v, '<': size < v }[m[2]];
      }
      if (/^\(\s*orientation\s*:\s*landscape\s*\)$/.test(p)) return emuW >= emuH;
      if (/^\(\s*orientation\s*:\s*portrait\s*\)$/.test(p)) return emuW < emuH;
      return window.matchMedia(p).matches; // prefers-reduced-motion, hover, etc.: los reales del dispositivo
    });
    return neg ? !ok : ok;
  };
  return query.split(',').some(one);
}

function emitRules(rules, out, imports) {
  for (const r of rules) {
    if (r.type === 3) imports.push(r.cssText); // @import
    else if (r.type === 4) { // @media
      // el aviso de girar el teléfono y la marca de agua usan el tamaño REAL del dispositivo
      const real = r.cssText.includes('gl-rotate-hint') || r.cssText.includes('gl-watermark');
      if (real ? window.matchMedia(r.media.mediaText).matches : matchesBase(r.media.mediaText)) emitRules(r.cssRules, out, imports);
    } else if (r.type === 1) out.push(`${r.selectorText}{${toBaseUnits(r.style.cssText)}}`); // regla normal
    else if (r.type === 12) { out.push(`@supports ${r.conditionText}{`); emitRules(r.cssRules, out, imports); out.push('}'); }
    else out.push(toBaseUnits(r.cssText)); // @keyframes, @font-face...
  }
}

let disabledSheets = [];
function enableBaseEmulation(w, h) {
  disableBaseEmulation();
  setEmuSize(w, h);
  const out = []; const imports = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; } // hojas externas (Google Fonts): se dejan como están
    emitRules(rules, out, imports);
    sheet.disabled = true; disabledSheets.push(sheet);
  }
  const el = document.createElement('style');
  el.id = EMU_ID;
  el.textContent = imports.concat(out).join('\n');
  document.head.appendChild(el);
}
function disableBaseEmulation() {
  disabledSheets.forEach((s) => { s.disabled = false; });
  disabledSheets = [];
  document.getElementById(EMU_ID)?.remove();
}
// VP-EMU>>

const readViewport = () => ({ w: window.innerWidth, h: window.innerHeight });

function ScaledStage({ children }) {
  const [vp, setVp] = useState(readViewport);
  useEffect(() => {
    const on = () => setVp(readViewport());
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    window.visualViewport?.addEventListener('resize', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
      window.visualViewport?.removeEventListener('resize', on);
    };
  }, []);

  const scaled = vp.w < 1024 || vp.h < 620;
  const portrait = vp.w < vp.h;
  // Lienzo virtual que ocupa TODA la pantalla: alto 720 y ancho según la proporción del teléfono (mín. 1280).
  // Si la pantalla es más "cuadrada" que 16:9, se fija el ancho en 1280 y crece el alto.
  const aspect = vp.w / vp.h;
  const wide = aspect >= BASE_W / BASE_H;
  const stageW = wide ? Math.round(BASE_H * aspect) : BASE_W;
  const stageH = wide ? BASE_H : Math.round(BASE_W / aspect);
  const scale = wide ? vp.h / BASE_H : vp.w / BASE_W;

  // Antes de pintar: los estilos pasan a medirse como en una pantalla de stageW × stageH (y vuelven al salir)
  useLayoutEffect(() => {
    if (!scaled) return undefined;
    enableBaseEmulation(stageW, stageH);
    return disableBaseEmulation;
  }, [scaled, portrait, stageW, stageH]);

  if (!scaled) {
    return <div style={{ display: 'contents' }}><div style={{ display: 'contents' }}>{children}</div></div>;
  }
  return (
    <div style={{ position: 'fixed', inset: 0, width: '100dvw', height: '100dvh', overflow: 'hidden', background: '#2a1a55', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ flex: 'none', position: 'relative', width: stageW, height: stageH, overflow: 'hidden', transformOrigin: 'center center', transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return <ScaledStage><AppInner /></ScaledStage>;
}