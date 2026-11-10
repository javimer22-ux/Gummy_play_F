import { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import ordersData from '../../data/orders.json';

export default function QualityControlStation() {
  const { activeTray, setActiveTray, activeOrders, setActiveOrders, setScore } = useGame();
  const [report, setReport] = useState(null);

  useEffect(() => {
    try {
      const currentOrder = activeOrders[0]; 
      
      if (!currentOrder) {
        setReport({ success: false, messages: ["Fábrica inactiva."], earnedPoints: 0 });
        return;
      }

      let errors = [];
      let isSuccess = true;

      // 1. Validación de Endulzante (Base)
      if (!activeTray.base || activeTray.base.id !== currentOrder.targetSpecs.sweetener) {
        errors.push(`Endulzante incorrecto. El lote requería ${currentOrder.targetSpecs.sweetener === 'b2' ? 'Panela' : 'Azúcar'}.`);
        isSuccess = false;
      }

      // 2. Validación de Pigmento
      if (!activeTray.pigment || activeTray.pigment.id !== currentOrder.targetSpecs.pigment) {
        errors.push(`Pigmento incorrecto. Se solicitó el extracto ${currentOrder.targetSpecs.pigment}.`);
        isSuccess = false;
      }

      // 3. Validación de Temperatura (¡Muy Importante!)
      if (activeTray.pigment) {
        // La temperatura actual no debe superar el máximo permitido por el pigmento
        // NOTA: Como la gomita debe llegar fría, evaluamos si en algún momento se "quemó" (Idealmente tendríamos un registro histórico en el state, pero por ahora evaluamos si llegó hirviendo)
        if (activeTray.temperature > 30) {
           errors.push(`Choque térmico fallido. La gomita llegó caliente al molde (${Math.floor(activeTray.temperature)}°C) y no gelificó.`);
           isSuccess = false;
        }
        // Asumimos que si está quemada/derretida, su mixLevel baja o su forma se pierde
      }

      // 4. Validación de Mezcla
      if (activeTray.mixLevel < 100) {
        errors.push(`Mezcla heterogénea. Faltó tiempo de agitación en la estación 2.`);
        isSuccess = false;
      }

      // 5. Validación de Forma
      if (activeTray.shape !== currentOrder.targetSpecs.shape) {
        errors.push(`Molde incorrecto. Usaste ${activeTray.shape}, se pedía ${currentOrder.targetSpecs.shape}.`);
        isSuccess = false;
      }

      setReport({
        success: isSuccess,
        messages: isSuccess ? ["¡Análisis químico exitoso!", "Parámetros de extracción, temperatura y moldeado óptimos."] : errors,
        earnedPoints: isSuccess ? currentOrder.reward : 0
      });

      if (isSuccess) setScore(prev => prev + currentOrder.reward);

    } catch (error) {
      console.error(error);
      setReport({ success: false, messages: ["Error crítico en el escáner."], earnedPoints: 0 });
    }
  }, []); // Se ejecuta solo una vez cuando llega a la estación 5

  const handleNextOrder = () => {
    // 1. Avanzamos la cola
    setActiveOrders(prev => {
      const nextQueue = prev.slice(1);
      if (nextQueue.length === 0) {
        return ordersData.map(o => ({ ...o, timeRemaining: o.timeLimit }));
      }
      return nextQueue;
    });

    // 2. Limpiamos la bandeja para el nuevo lote (Reset de variables a estado inicial)
    setActiveTray({
      station: 1, 
      base: null,
      gellingAgent: null,
      pigment: null,
      mixLevel: 0,
      temperature: 20,
      shape: null
    });
  };

  if (!report) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
         <h2 className="text-2xl font-bold text-yellow-500 animate-pulse">⚙️ Analizando composición química...</h2>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className={`w-full max-w-2xl border-4 p-8 rounded-lg bg-neutral-950 flex flex-col items-center shadow-2xl
        ${report.success ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.3)]'}`}
      >
        <h2 className={`text-4xl font-black mb-2 tracking-widest uppercase ${report.success ? 'text-green-500' : 'text-red-500'}`}>
          {report.success ? '✔ LOTE APROBADO' : '✖ LOTE RECHAZADO'}
        </h2>
        
        <div className="w-full bg-black p-4 border-2 border-neutral-800 rounded mb-8 mt-4 min-h-[150px]">
          <p className="text-yellow-500 font-mono text-sm font-bold mb-3 uppercase tracking-wider">Reporte de Laboratorio:</p>
          <ul className="list-disc pl-5 font-mono text-sm space-y-3">
            {report.messages.map((msg, idx) => (
              <li key={idx} className={`${report.success ? 'text-green-400' : 'text-red-400'} leading-relaxed`}>{msg}</li>
            ))}
          </ul>
        </div>

        <button 
          onClick={handleNextOrder}
          className="px-10 py-4 font-black text-xl rounded border-b-4 bg-yellow-500 text-black border-yellow-700 hover:bg-yellow-400 active:border-b-0 active:translate-y-1 transition-all shadow-lg"
        >
          PREPARAR NUEVO LOTE ➔
        </button>
      </div>
    </div>
  );
}