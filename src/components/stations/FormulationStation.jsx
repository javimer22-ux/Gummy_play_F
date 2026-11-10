import { useGame } from '../../context/GameContext';
import ingredientsData from '../../data/ingredients.json';

export default function FormulationStation() {
  const { activeTray, setActiveTray } = useGame();
  const { bases, gellingAgents } = ingredientsData;

  const handleDispenseBase = (base) => {
    setActiveTray(prev => ({ ...prev, base }));
  };

  const handleDispenseAgent = (agent) => {
    setActiveTray(prev => ({ ...prev, gellingAgent: agent }));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b-2 border-neutral-700 pb-2">
        <h2 className="text-xl font-black text-blue-400">01. PANEL DE FORMULACIÓN</h2>
      </div>
      
      <div className="flex gap-8 flex-1">
        <div className="flex-1 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
          <h3 className="text-sm text-neutral-400 font-bold mb-3 uppercase">1. Seleccionar Base / Endulzante</h3>
          <div className="flex gap-4">
            {bases.map(base => (
              <button 
                key={base.id} onClick={() => handleDispenseBase(base)}
                className={`flex-1 h-20 border-b-8 rounded-lg flex flex-col items-center justify-center transition-all active:border-b-0 active:translate-y-2
                  ${activeTray.base?.id === base.id ? 'bg-blue-800 border-blue-950 ring-2 ring-blue-400' : 'bg-neutral-800 border-neutral-900 hover:bg-neutral-700'}`}
              >
                <div className="w-6 h-6 rounded-full border-2 border-white mb-2" style={{ backgroundColor: base.color || '#fff' }}></div>
                <span className="text-[10px] font-bold leading-tight px-1 text-center">{base.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
          <h3 className="text-sm text-neutral-400 font-bold mb-3 uppercase">2. Agente Gelificante</h3>
          <div className="flex gap-4">
            {gellingAgents.map(agent => (
              <button 
                key={agent.id} onClick={() => handleDispenseAgent(agent)}
                className={`flex-1 h-20 border-b-8 rounded-lg flex flex-col items-center justify-center transition-all active:border-b-0 active:translate-y-2
                  ${activeTray.gellingAgent?.id === agent.id ? 'bg-purple-800 border-purple-950 ring-2 ring-purple-400' : 'bg-neutral-800 border-neutral-900 hover:bg-neutral-700'}`}
              >
                <div className="text-xl mb-1">🧪</div>
                <span className="text-xs font-bold leading-tight">{agent.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}