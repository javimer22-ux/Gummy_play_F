import { useEffect, useState } from 'react';
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
import Gummy from './components/entities/Gummy';
import { ArrowIcon, PauseIcon, PlayIcon, SpinIcon, StarIcon } from './components/entities/Icons';
import { STATION, FIRST_STATION, LAST_STATION } from './constants/stations';
import ingredientsData from './data/ingredients.json';
import shapesData from './data/shapes.json';

// Frases de la ingeniera guía según la estación en la que está la bandeja
const HELPER_BY_STATION = {
  [STATION.HYDRATION]: { text: '¡Hola! Vamos a preparar gelatina. Entra a la máquina para hidratarla con agua fría.' },
  [STATION.FORMULATION]: { text: '¡El momento de la verdad! Entra a la estación y elige tu base y pigmento.' },
  [STATION.MIXING]: { text: '¡A mezclar se ha dicho! Entra y asegúrate de que todo quede homogéneo.' },
  [STATION.HEATING]: { type: 'warning', text: '¡Atención aquí! Entra a cocinar, pero cuida que la temperatura no suba de 40°C.' },
  [STATION.MOLDING]: { text: '¡A darle forma! Entra y elige el molde correcto para tu pedido.' },
  [STATION.COOLING]: { text: '¡Casi listos! Entra al túnel y detén el frío justo a tiempo.' },
  [STATION.QUALITY]: { text: '¡Trabajo terminado! Veamos si la gomita cumple con las especificaciones.' },
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

function GameBoard() {
  useGameLoop();
  const {
    isPlaying, setIsPlaying, activeOrders, activeTray, score, totalOrders, gameFinished,
    advanceConveyor, retreatConveyor, restartGame, runId,
  } = useGame();
  const current = activeOrders[0];
  const currentInfo = current ? describeOrder(current) : null;
  const orderNumber = Math.min(totalOrders - activeOrders.length + 1, totalOrders);

  // Reiniciar partida con confirmación (pausa mientras se decide)
  const [confirming, setConfirming] = useState(false);
  const [resumeAfter, setResumeAfter] = useState(false);
  const askRestart = () => { setResumeAfter(isPlaying); setIsPlaying(false); setConfirming(true); };
  const cancelRestart = () => { setConfirming(false); if (resumeAfter) setIsPlaying(true); };
  const confirmRestart = () => { setConfirming(false); restartGame(); };

  // Pedido caducado: el reloj del pedido activo llegó a 0
  const orderExpired = Boolean(current) && current.timeRemaining <= 0 && activeTray.station < LAST_STATION;

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
    <div className="gl-app">

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
            <p className="gl-pill gl-pill--time">PEDIDO {orderNumber} / {totalOrders}</p>
            <p className="gl-pill gl-pill--score"><StarIcon size={24} />{score} PTS</p>
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
                  <span className={`font-extrabold tabular-nums ${current.timeRemaining < 15 ? 'text-red-600 gl-pulse' : ''}`}>
                    {formatTime(current.timeRemaining)}
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
              className="gl-btn gl-btn--lime gl-btn--pill" aria-label="Avanzar a la siguiente estación" title="Avanzar (→)"
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
      {!gameFinished && HELPER_BY_STATION[activeTray.station] && (
        <HelperCharacter variant="floating" {...HELPER_BY_STATION[activeTray.station]} />
      )}

      {/* ALERTA DE TIEMPO AGOTADO DEL PEDIDO / RESULTADOS FINALES */}
      {orderExpired && !gameFinished && <TimeUpModal />}
      {gameFinished && <ResultsModal />}

      {/* CONFIRMAR REINICIO */}
      {confirming && (
        <div className="gl-modal">
          <div className="gl-report gl-report--shift" role="alertdialog" style={{ maxWidth: '26rem' }}>
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

export default function App() {
  return (
    <GameProvider>
      <GameBoard />
    </GameProvider>
  );
}
