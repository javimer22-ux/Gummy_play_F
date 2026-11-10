import { GameProvider, useGame } from './context/GameContext';
import { useGameLoop } from './hooks/useGameLoop';
import ConveyorBelt from './components/layout/ConveyorBelt';
import FormulationStation from './components/stations/FormulationStation';
import MixerStation from './components/stations/MixerStation';
import HeatingStation from './components/stations/HeatingStation';
import MoldingStation from './components/stations/MoldingStation';
import QualityControlStation from './components/stations/QualityControlStation';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

function GameBoard() {
  useGameLoop();
  const { isPlaying, setIsPlaying, shiftTime, activeOrders, activeTray, score, advanceConveyor } = useGame();

  return (
    <div className="flex flex-col h-screen bg-neutral-900 font-sans text-neutral-100 relative">

    {/* ZONA 1: HUD y Pedidos Rediseñado */}
      <header className="h-32 bg-neutral-800 border-b-4 border-yellow-500 flex items-center px-6 justify-between z-10 shadow-lg">
        {/* Lado Izquierdo: Controles */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-yellow-500 tracking-wider drop-shadow-md">GUMMY LAB</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-1 font-bold rounded shadow-inner ${isPlaying ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-green-600 text-white hover:bg-green-500'}`}
            >
              {isPlaying ? '◼ PAUSAR FÁBRICA' : '▶ INICIAR TURNO'}
            </button>
            <p className="text-xl font-mono text-yellow-500 bg-black px-3 py-1 rounded border-2 border-neutral-700 shadow-inner">
              ⏱ {formatTime(shiftTime)}
            </p>
            <p className="text-xl font-mono text-green-400 bg-black px-3 py-1 rounded border-2 border-neutral-700 shadow-inner">
              ⭐ {score} PTS
            </p>
          </div>
        </div>

        {/* Lado Derecho: Sistema de Tickets (Actual vs Cola) */}
        <div className="flex gap-6 items-center overflow-x-auto pb-2">
          
          {/* TICKET DESTACADO: EL PEDIDO ACTUAL */}
          {activeOrders.length > 0 && (
            <div className="w-64 bg-yellow-300 text-black p-3 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.5)] border-4 border-yellow-600 flex flex-col justify-between transform scale-105">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-black uppercase bg-black text-yellow-400 px-2 py-1 rounded shadow">LOTE ACTUAL: {activeOrders[0].id}</p>
                  <p className={`text-sm font-bold font-mono ${activeOrders[0].timeRemaining < 15 ? 'text-red-600 animate-pulse' : 'text-neutral-800'}`}>
                    {formatTime(activeOrders[0].timeRemaining)}
                  </p>
                </div>
                <p className="text-sm font-black leading-tight mt-1">{activeOrders[0].title}</p>
              </div>
              <div className="mt-2 pt-2 border-t-2 border-yellow-500">
                <p className="text-[11px] text-black font-bold uppercase">
                  Molde: {activeOrders[0].targetSpecs.shape} | Pigm: {activeOrders[0].targetSpecs.pigment}
                </p>
              </div>
            </div>
          )}

          {/* TICKETS EN COLA */}
          {activeOrders.length > 1 && (
            <div className="flex gap-2 border-l-2 border-neutral-600 pl-4 opacity-70">
              {activeOrders.slice(1).map(order => (
                <div key={order.id} className="w-40 bg-neutral-700 text-neutral-300 p-2 rounded border border-neutral-500 flex flex-col justify-between">
                  <p className="text-[10px] font-black uppercase text-yellow-500">EN COLA: {order.id}</p>
                  <p className="text-xs font-bold truncate">{order.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ZONA 2: Cinta Transportadora */}
      <main className="flex-1 relative bg-neutral-800 flex flex-col">
        <div className="flex-1 relative">
          <ConveyorBelt />
        </div>
        
        {/* ¡NUEVO!: CONTROL CENTRAL DE LA FÁBRICA (ESTILO PURBLE PLACE) */}
        <div className="h-16 bg-neutral-900 border-t-2 border-neutral-700 flex justify-center items-center px-6 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
          <button 
            onClick={advanceConveyor}
            disabled={!isPlaying || activeTray.station >= 5}
            className="px-12 py-2 text-xl font-black rounded border-b-4 bg-yellow-500 text-black border-yellow-700 hover:bg-yellow-400 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-widest"
          >
            MUEVE LA CINTA ➔
          </button>
        </div>
      </main>

      {/* ZONA 3: Panel de Control Dinámico */}
      <footer className="h-64 bg-neutral-900 p-6 flex gap-6 border-t-4 border-yellow-500 z-10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.3)]">
        <div className="flex-1 bg-neutral-900 rounded-lg p-2 border-2 border-neutral-700">
          {activeTray.station === 1 && <FormulationStation />}
          {activeTray.station === 2 && <MixerStation />}
          {activeTray.station === 3 && <HeatingStation />}
          {activeTray.station === 4 && <MoldingStation />}
          {/* La estación 5 (QA) es modal ahora */}
          {activeTray.station >= 5 && (
            <div className="h-full flex items-center justify-center flex-col">
              <h2 className="text-3xl font-black text-neutral-600 mb-2">ESPERANDO REINICIO...</h2>
            </div>
          )}
        </div>
      </footer>

      {/* PANTALLA DE CONTROL DE CALIDAD SUPERPUESTA (MODAL) */}
      {activeTray.station === 5 && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <QualityControlStation />
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