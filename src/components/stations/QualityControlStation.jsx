import { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import Gummy from '../entities/Gummy';
import { ArrowIcon, CheckIcon, CrossIcon } from '../entities/Icons';

export default function QualityControlStation() {
  const { activeTray, activeOrders, recordResult, nextOrder } = useGame();
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
        errors.push(`Mezcla heterogénea. Faltó tiempo de agitación en la estación de Mezclado.`);
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

      // Aprobado: suma los puntos del pedido. Rechazado: 0 puntos y se pasa al siguiente pedido.
      recordResult({
        id: currentOrder.id,
        title: currentOrder.title,
        status: isSuccess ? 'approved' : 'failed',
        points: isSuccess ? currentOrder.reward : 0
      });

    } catch (error) {
      console.error(error);
      setReport({ success: false, messages: ["Error crítico en el escáner."], earnedPoints: 0 });
    }
  }, []); // Se ejecuta solo una vez cuando llega a la estación de QA

  const isLastOrder = activeOrders.length <= 1;

  // Avanza al siguiente pedido (o a los resultados si era el último) y limpia la bandeja
  const handleNextOrder = () => nextOrder();

  if (!report) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-extrabold text-yellow-300 gl-pulse flex items-center gap-3">
          <svg className="gl-spinner" width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="#ffd84a" strokeWidth="3" strokeDasharray="30 26" fill="none" strokeLinecap="round" /></svg>
          Analizando composición química...
        </h2>
      </div>
    );
  }

  // Visual: gomita resultante (color de la mezcla o del pigmento elegido)
  const gummyColor = activeTray.pigment?.color ?? activeTray.base?.color;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className={`gl-report ${report.success ? '' : 'gl-report--bad'}`}>
        <div className="gl-report__ribbon">
          {report.success ? <CheckIcon size={26} /> : <CrossIcon size={26} />}
          {report.success ? 'LOTE APROBADO' : 'LOTE RECHAZADO'}
        </div>

        <div className="flex justify-center">
          <Gummy
            shape={activeTray.shape ?? 'cuadrado'} color={gummyColor} size={92}
            wobble={report.success} sparkle={report.success}
            className={report.success ? '' : 'gl-sad'}
          />
        </div>
        {report.success && (
          <p className="font-extrabold text-lg mt-1" style={{ color: '#d98a0c' }}>+{report.earnedPoints} PTS</p>
        )}

        <div className="gl-report__list">
          <p className="font-extrabold text-sm uppercase tracking-wider mb-2" style={{ color: '#7458b0' }}>Reporte de Laboratorio:</p>
          <ul>
            {report.messages.map((msg, idx) => (
              <li key={idx}>
                <span className="gl-report__dot">{report.success ? <CheckIcon size={12} /> : <CrossIcon size={12} />}</span>
                <span>{msg}</span>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={handleNextOrder} className="gl-btn gl-btn--gold gl-btn--xl">
          {isLastOrder ? 'VER RESULTADOS' : 'SIGUIENTE PEDIDO'} <ArrowIcon size={24} />
        </button>
      </div>
    </div>
  );
}
