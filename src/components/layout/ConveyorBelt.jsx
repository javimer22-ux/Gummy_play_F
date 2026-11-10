import { useGame } from '../../context/GameContext';

export default function ConveyorBelt() {
  const { isPlaying, activeTray } = useGame();

  const stations = [
    { id: 1, name: "1. FORMULACIÓN", color: "bg-blue-900" },
    { id: 2, name: "2. MEZCLADORA", color: "bg-purple-900" },
    { id: 3, name: "3. MARMITA", color: "bg-red-900" },
    { id: 4, name: "4. MOLDEADO", color: "bg-orange-900" },
    { id: 5, name: "5. ESCÁNER QA", color: "bg-green-900" }
  ];

  // Calcula la posición de la bandeja (20% por estación)
  const getTrayPosition = () => {
    return `${(activeTray.station - 1) * 20 + 10}%`;
  };

  const isBeltMoving = isPlaying && activeTray.station < 5;

  // Lógica para determinar el color visual de la mezcla en la cinta
  const getRenderColor = () => {
    if (activeTray.pigment && activeTray.station >= 2) return activeTray.pigment.color;
    if (activeTray.base) return activeTray.base.color;
    return 'transparent';
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-end pb-8 px-10">
      <div className="flex w-full justify-between px-10 mb-2">
        {stations.map(station => (
          <div key={station.id} className="flex flex-col items-center">
            <div className={`w-32 h-40 ${station.color} border-4 border-neutral-700 rounded-t-lg shadow-lg flex items-center justify-center relative`}>
              <div className="absolute -bottom-4 w-8 h-8 bg-zinc-400 border-2 border-zinc-800 rounded-b-md z-10"></div>
              <span className="text-white font-bold opacity-30 text-4xl">{station.id}</span>
            </div>
            <p className="text-xs font-black text-yellow-500 mt-2 bg-black px-2 py-1 rounded">{station.name}</p>
          </div>
        ))}
      </div>

      <div className="w-full h-12 bg-neutral-800 border-y-4 border-neutral-600 relative overflow-hidden rounded shadow-inner">
        {/* Animación de la cinta */}
        <div className={`absolute inset-0 flex space-x-12 ${isBeltMoving ? 'animate-[slide_2s_linear_infinite]' : ''}`}>
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-2 h-full bg-neutral-900 opacity-50 transform -skew-x-12"></div>
          ))}
        </div>

        {/* LA BANDEJA (Se mueve dinámicamente) */}
        <div 
          className="absolute top-1 w-24 h-8 bg-zinc-200 border-2 border-zinc-500 rounded-lg shadow-lg transition-all duration-1000 ease-in-out z-20 flex items-end p-1 justify-center"
          style={{ left: getTrayPosition() }}
        >
          {/* El contenido de la bandeja */}
          <div 
            className="transition-all duration-500 flex items-center justify-center" 
            style={{ 
              width: activeTray.shape && activeTray.station >= 4 ? '50%' : '100%',
              height: activeTray.gellingAgent ? '100%' : (activeTray.base ? '50%' : '0%'),
              backgroundColor: getRenderColor(),
              // Redondea bordes si ya tiene forma (simulación visual básica)
              borderRadius: activeTray.shape && activeTray.station >= 4 ? '50%' : '2px',
              opacity: 0.9
            }}
          >
            {/* Si está en moldeado y tiene forma, mostramos un icono representativo */}
            {activeTray.station >= 4 && activeTray.shape === 'estrella' && <span className="text-xs">⭐</span>}
            {activeTray.station >= 4 && activeTray.shape === 'osito' && <span className="text-xs">🧸</span>}
          </div>
          
          {/* Alerta de quemado visual (Humo simulado) */}
          {activeTray.temperature > 80 && (
             <div className="absolute -top-4 w-4 h-4 bg-gray-500 rounded-full animate-ping opacity-50"></div>
          )}
        </div>
      </div>
      <style>{`@keyframes slide { from { transform: translateX(0); } to { transform: translateX(-4rem); } }`}</style>
    </div>
  );
}