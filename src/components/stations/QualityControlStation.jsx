import HelperCharacter from '../HelperCharacter';
import { useEffect, useState } from 'react';
import { sfx } from '../../utils/soundEngine';
import { useGame } from '../../context/GameContext';
import Gummy from '../entities/Gummy';
import ingredientsData from '../../data/ingredients.json';
import shapesData from '../../data/shapes.json';
import { ArrowIcon, CheckIcon, CrossIcon } from '../entities/Icons';

const shapeName = (id) => shapesData.find((s) => s.id === id)?.name ?? id ?? 'ninguno';

export default function QualityControlStation() {
  const { activeTray, activeOrders, recordResult, nextOrder, restartGame, setIsPlaying, config } = useGame();
  const orderCount = config?.orderCount;
  // El pedido que cierra un turno de 3 o 5 pedidos NO muestra el reporte individual: salta directo al certificado o al resumen
  const closesShift = (orderCount === 3 || orderCount === 5) && activeOrders.length <= 1;
  const [report, setReport] = useState(null);

  useEffect(() => {
    sfx.scanSweep();
    try {
      const currentOrder = activeOrders[0]; 
      
      if (!currentOrder) {
        setReport({ success: false, messages: ["Fábrica inactiva."], earnedPoints: 0 });
        return;
      }

      let errors = [];
      let isSuccess = true;

      // 0. Validación de Hidratación (Estación 1): la gelatina debe detenerse entre 05:00 y 05:30
      if (activeTray.hasLumps !== false) {
        errors.push(activeTray.hasLumps === true
          ? 'Hidratación fuera de tiempo ideal (05:00 - 05:30): gelatina con grumos.'
          : 'Hidratación omitida: la gelatina nunca se hidrató (05:00 - 05:30).');
        isSuccess = false;
      }

      // 1. Validación de Endulzante (Base)
      if (!activeTray.base || activeTray.base.id !== currentOrder.targetSpecs.sweetener) {
        errors.push(`Endulzante incorrecto. El lote requería ${currentOrder.targetSpecs.sweetener === 'b2' ? 'Panela' : 'Azúcar'}.`);
        isSuccess = false;
      }

      // 2. Validación de Pigmento
      if (!activeTray.pigment || activeTray.pigment.id !== currentOrder.targetSpecs.pigment) {
        errors.push(`Pigmento incorrecto. Se solicitó: ${ingredientsData.pigments.find((p) => p.id === currentOrder.targetSpecs.pigment)?.name ?? currentOrder.targetSpecs.pigment}.`);
        isSuccess = false;
      }

      // 3. Validación de Gelificación (textura resultante de la Estación de Enfriamiento)
      if (activeTray.finalTexture === 'frozen') {
        errors.push('Gelificación fallida. La gelatina se cristalizó por exceso de frío.');
        isSuccess = false;
      } else if (activeTray.finalTexture === 'melted') {
        errors.push('Gelificación fallida. La gomita seguía líquida al desmoldar.');
        isSuccess = false;
      } else if (activeTray.finalTexture !== 'perfect') {
        errors.push('Gelificación incompleta. El lote no se desmoldó en el túnel de frío.');
        isSuccess = false;
      }

      // Cocción: lote quemado
      if (activeTray.burned) {
        errors.push('Lote quemado. Se pasó de la temperatura segura en la Cocción.');
        isSuccess = false;
      }

      // Cocción mínima: la gelatina (activationTemp 60°C) debe disolverse; con pigmento delicado (Pitahaya) basta 25°C
      const minCookTemp = (activeTray.pigment?.maxTemp ?? 90) <= 40 ? 25 : 60;
      const cookedTemp = activeTray.cookTemp ?? activeTray.temperature; // `temperature` ya fue sobrescrita por Enfriamiento
      if (!activeTray.burned && cookedTemp < minCookTemp) {
        errors.push(`Cocción insuficiente (${Math.floor(cookedTemp)}°C). Debías calentar al menos a ${minCookTemp}°C para disolver la gelatina.`);
        isSuccess = false;
      }

      // 4. Validación de Mezcla
      if (activeTray.mixLevel < 100) {
        errors.push(`Mezcla heterogénea. Faltó tiempo de agitación en la estación de Mezclado.`);
        isSuccess = false;
      }

      // 5. Validación de Forma
      if (activeTray.shape !== currentOrder.targetSpecs.shape) {
        errors.push(`Molde incorrecto. Usaste ${shapeName(activeTray.shape)}, se pedía ${shapeName(currentOrder.targetSpecs.shape)}.`);
        isSuccess = false;
      }

      setReport({
        success: isSuccess,
        messages: isSuccess ? ["¡Análisis químico exitoso!", "Parámetros de extracción, temperatura y moldeado óptimos."] : errors,
        earnedPoints: isSuccess ? currentOrder.reward : 0
      });

      // Aprobado: suma los puntos del pedido. Rechazado: 0 puntos y se pasa al siguiente pedido.
      if (!closesShift) isSuccess ? sfx.success(0.75) : sfx.error(0.75);
      recordResult({
        id: currentOrder.id,
        title: currentOrder.title,
        status: isSuccess ? 'approved' : 'failed',
        points: isSuccess ? currentOrder.reward : 0
      });

      // Último pedido del turno (3 o 5): cierra la cola ya, sin pasar por el modal individual
      if (closesShift) nextOrder();

    } catch (error) {
      console.error(error);
      setReport({ success: false, messages: ["Error crítico en el escáner."], earnedPoints: 0 });
    }
  }, []); // Se ejecuta solo una vez cuando llega a la estación de QA

  const isLastOrder = activeOrders.length <= 1;

  // Avanza al siguiente pedido (o a los resultados si era el último) y limpia la bandeja
  const handleNextOrder = () => nextOrder();

  if (!report || closesShift) {
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

        <div className="mt-3 flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-800/90 px-4 py-3">
          <div className="min-w-0 flex-1">
          </div>
          {orderCount === 1 ? (
            // Modo tutorial (1 pedido): reporte del lote con volver / jugar de nuevo. Sin Certificado.
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { restartGame(); setIsPlaying(true); }} className="gl-btn gl-btn--gold gl-btn--xl">JUGAR DE NUEVO <ArrowIcon size={24} /></button>
              <button onClick={config?.onExit} className="gl-btn gl-btn--xl">⌂ VOLVER AL INICIO</button>
            </div>
          ) : (
            <button onClick={handleNextOrder} className="gl-btn gl-btn--gold gl-btn--xl">
              {isLastOrder ? 'VER RESULTADOS' : 'SIGUIENTE PEDIDO'} <ArrowIcon size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
