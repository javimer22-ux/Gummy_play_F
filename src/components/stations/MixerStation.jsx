import { useGame } from '../../context/GameContext';
import ingredientsData from '../../data/ingredients.json';

export default function MixerStation() {
  const { activeTray, setActiveTray } = useGame();
  const { pigments } = ingredientsData;

  const handleDispensePigment = (pigment) => {
    setActiveTray(prev => ({ ...prev, pigment, mixLevel: 0 })); // Resetea la mezcla al cambiar color
  };

  const mixGently = () => {
    setActiveTray(prev => ({
      ...prev,
      mixLevel: Math.min(100, prev.mixLevel + 10)
    }));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b-2 border-neutral-700 pb-2">
        <h2 className="text-xl font-black text-purple-400">02. PANEL DE COLORACIÓN Y MEZCLADO</h2>
      </div>

      <div className="flex gap-6 flex-1">
        {/* Selector de Pigmentos Naturales */}
        <div className="flex-1 bg-neutral-950 rounded-lg border border-neutral-800 p-4">
          <h3 className="text-sm text-neutral-400 font-bold mb-3 uppercase">1. Añadir Extracto Natural</h3>
          <div className="flex flex-col gap-2">
            {pigments.map(pigment => (
              <button 
                key={pigment.id} onClick={() => handleDispensePigment(pigment)}
                className={`w-full py-2 px-3 border-l-4 rounded flex items-center justify-between transition-all
                  ${activeTray.pigment?.id === pigment.id ? 'bg-neutral-800 border-purple-500' : 'bg-neutral-900 border-neutral-700 hover:bg-neutral-800'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border border-neutral-500" style={{ backgroundColor: pigment.color }}></div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">{pigment.name}</p>
                    <p className="text-[10px] text-neutral-400">{pigment.compound}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Agitación */}
        <div className="flex-[1.5] flex flex-col items-center justify-center bg-neutral-950 rounded-lg border border-neutral-800 p-4">
          <p className="text-neutral-400 font-bold mb-2 uppercase text-sm">2. Homogeneidad: {activeTray.mixLevel}%</p>
          
          <div className="w-full max-w-sm h-6 bg-black border-2 border-neutral-600 p-1 rounded-full mb-4">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${activeTray.mixLevel}%`,
                backgroundColor: activeTray.pigment?.color || '#a855f7'
              }}
            ></div>
          </div>

          <button 
            onClick={mixGently}
            disabled={activeTray.mixLevel >= 100 || !activeTray.pigment}
            className="w-24 h-24 rounded-full bg-purple-700 border-b-8 border-purple-900 flex items-center justify-center active:border-b-0 active:translate-y-2 hover:bg-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl font-black text-white">AGITAR</span>
          </button>
        </div>
      </div>
    </div>
  );
}