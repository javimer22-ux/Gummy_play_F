import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

export default function MoldingStation() {
  const { activeTray, setActiveTray } = useGame();
  const [isCooling, setIsCooling] = useState(false);

  // Efecto para el choque térmico (enfriamiento rápido)
  useEffect(() => {
    let interval;
    if (isCooling) {
      interval = setInterval(() => {
        setActiveTray(prev => ({
          ...prev,
          // La temperatura baja rápidamente gracias a los ventiladores
          temperature: Math.max(15, prev.temperature - 8)
        }));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isCooling, setActiveTray]);

  const shapes = [
    { id: 'cuadrado', icon: '🟥', name: 'Cuadrado' },
    { id: 'estrella', icon: '⭐', name: 'Estrella' },
    { id: 'osito', icon: '🧸', name: 'Osito' }
  ];

  const selectShape = (shapeId) => {
    setActiveTray(prev => ({ ...prev, shape: shapeId }));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b-2 border-neutral-700 pb-2">
        <h2 className="text-xl font-black text-orange-500">04. MOLDEADO Y ENFRIAMIENTO</h2>

      </div>

      <div className="flex gap-8 flex-1">
        {/* Panel de Selección de Moldes */}
        <div className="flex-1 bg-neutral-950 rounded-lg border border-neutral-800 p-4">
          <h3 className="text-sm text-neutral-400 font-bold mb-3 uppercase">1. Inyectar en matriz</h3>
          <div className="flex gap-4 h-24">
            {shapes.map(shape => (
              <button 
                key={shape.id}
                onClick={() => selectShape(shape.id)}
                className={`flex-1 flex flex-col items-center justify-center rounded-lg border-b-4 transition-all active:border-b-0 active:translate-y-1
                  ${activeTray.shape === shape.id 
                    ? 'bg-orange-800 border-orange-950 ring-2 ring-orange-500' 
                    : 'bg-neutral-800 border-neutral-900 hover:bg-neutral-700'}`}
              >
                <span className="text-3xl mb-1">{shape.icon}</span>
                <span className="text-xs font-bold">{shape.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Enfriamiento (Choque Térmico) */}
        <div className="flex-1 bg-neutral-950 rounded-lg border border-neutral-800 p-4 flex flex-col items-center justify-center relative overflow-hidden">
          <h3 className="text-sm text-neutral-400 font-bold mb-2 uppercase absolute top-4 left-4">2. Choque Térmico</h3>
          
          <div className="flex items-center gap-6 mt-4">
            {/* Indicador de temperatura actual */}
            <div className="text-center">
              <p className="text-xs text-neutral-500 font-bold">TEMP. ACTUAL</p>
              <p className={`text-3xl font-black font-mono ${activeTray.temperature > 40 ? 'text-red-500' : 'text-blue-400'}`}>
                {Math.floor(activeTray.temperature)}°C
              </p>
            </div>

            {/* Botón del Ventilador */}
            <button 
              onMouseDown={() => setIsCooling(true)}
              onMouseUp={() => setIsCooling(false)}
              onMouseLeave={() => setIsCooling(false)} // Por si el cursor sale del botón
              className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all select-none
                ${isCooling 
                  ? 'bg-blue-600 border-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.8)]' 
                  : 'bg-neutral-800 border-neutral-600'}`}
            >
              <span className={`text-4xl ${isCooling ? 'animate-spin' : ''}`}>
                ❄️
              </span>
            </button>
          </div>
          <p className="text-[10px] text-neutral-500 mt-4 uppercase font-bold text-center">
            Mantén presionado para encender turbinas.<br/>Enfría por debajo de 30°C para desmoldar.
          </p>
        </div>
      </div>
    </div>
  );
}