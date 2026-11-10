import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

export default function HeatingStation() {
  const { activeTray, setActiveTray } = useGame();
  const [isBurnerOn, setIsBurnerOn] = useState(false);

  // Efecto térmico: Sube rápido si está encendido, baja lento si está apagado
  useEffect(() => {
    let interval;
    if (isBurnerOn) {
      interval = setInterval(() => {
        setActiveTray(prev => ({
          ...prev,
          temperature: Math.min(120, prev.temperature + 5)
        }));
      }, 400);
    } else {
      interval = setInterval(() => {
        setActiveTray(prev => ({
          ...prev,
          temperature: Math.max(20, prev.temperature - 1)
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBurnerOn, setActiveTray]);

  // Si no hay pigmento, asumimos 100°C por defecto, si lo hay, leemos su límite
  const maxSafeTemp = activeTray.pigment ? activeTray.pigment.maxTemp : 100;

  // Lógica del color del termómetro (Dinámico)
  const getTempColor = (temp) => {
    if (temp < maxSafeTemp - 15) return 'bg-blue-500'; // Frío / Subiendo
    if (temp >= maxSafeTemp - 15 && temp <= maxSafeTemp) return 'bg-green-500'; // Óptimo
    return 'bg-red-600'; // Peligro / Quemado
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b-2 border-neutral-700 pb-2">
        <h2 className="text-xl font-black text-red-500">03. MARMITA TÉRMICA (CALOR)</h2>
        {/* Botón de avance eliminado */}
      </div>

      <div className="flex gap-8 flex-1">
        {/* Panel de Control del Fuego */}
        <div className="flex-1 bg-neutral-950 rounded-lg border border-neutral-800 p-6 flex flex-col items-center justify-center">
          <p className="text-neutral-400 font-bold mb-6 uppercase tracking-widest text-sm">Control de Quemador</p>
          <button 
            onClick={() => setIsBurnerOn(!isBurnerOn)}
            className={`w-40 h-40 rounded-full border-b-8 flex items-center justify-center transition-all active:border-b-0 active:translate-y-2 shadow-xl
              ${isBurnerOn 
                ? 'bg-red-600 border-red-900 shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse' 
                : 'bg-neutral-700 border-neutral-900'}`}
          >
            <span className="text-3xl font-black text-white">
              {isBurnerOn ? '🔥 APAGAR' : 'ENCENDER'}
            </span>
          </button>
        </div>

        {/* Termómetro Dinámico */}
        <div className="w-1/3 bg-neutral-950 rounded-lg border border-neutral-800 p-6 flex flex-col items-center justify-center">
          <p className="text-neutral-400 font-bold mb-4 uppercase text-sm">Termómetro: {activeTray.temperature}°C</p>
          
          <div className="relative w-12 h-32 bg-neutral-900 border-4 border-neutral-600 rounded-full flex flex-col justify-end p-1 overflow-hidden">
            
            {/* Zonas de advertencia visual basada en el pigmento elegido */}
            <div 
              className="absolute w-full bg-red-500/20 border-t-2 border-red-500/50 z-0 flex items-start justify-center pt-1"
              style={{ bottom: `${(maxSafeTemp / 120) * 100}%`, top: 0 }}
            >
               <span className="text-[8px] text-red-300 font-bold text-center leading-tight mt-1">LÍMITE:<br/>{maxSafeTemp}°C</span>
            </div>

            {/* Nivel de mercurio */}
            <div 
              className={`w-full rounded-full transition-all duration-300 z-10 ${getTempColor(activeTray.temperature)}`}
              style={{ height: `${(activeTray.temperature / 120) * 100}%` }}
            ></div>
          </div>
          
          {activeTray.pigment && (
            <p className="text-[10px] text-neutral-500 mt-4 text-center">
              Compuesto: <span className="font-bold text-yellow-500">{activeTray.pigment.compound}</span><br/>
              Temperatura Max: {maxSafeTemp}°C
            </p>
          )}
        </div>
      </div>
    </div>
  );
}