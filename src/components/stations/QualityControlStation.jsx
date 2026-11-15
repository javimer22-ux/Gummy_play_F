import HelperCharacter from '../HelperCharacter';
import { useEffect, useState } from 'react';
import { sfx } from '../../utils/soundEngine';
import { useGame } from '../../context/GameContext';
import Gummy from '../entities/Gummy';
import ingredientsData from '../../data/ingredients.json';
import shapesData from '../../data/shapes.json';

/* ───────── Decoración del modal de resultado (solo visual) ───────── */
const Spark = ({ className = '', delay = '0s', size = 20, color = '#fde047' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={`absolute animate-ping motion-reduce:animate-none ${className}`} style={{ animationDelay: delay, animationDuration: '1.8s' }} aria-hidden="true">
    <path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" fill={color} />
  </svg>
);
const CONFETTI = ['#fb7185', '#fde047', '#38bdf8', '#a78bfa', '#4ade80', '#fb923c'];
const Confetti = () => (
  <>
    {CONFETTI.map((c, i) => (
      <span key={i} aria-hidden="true" className="pointer-events-none absolute h-2.5 w-1.5 animate-bounce rounded-sm motion-reduce:animate-none"
        style={{ background: c, left: `${8 + i * 16}%`, top: `${-4 + (i % 3) * 5}%`, animationDelay: `${i * 0.18}s`, animationDuration: `${1.2 + (i % 3) * 0.3}s`, transform: `rotate(${i * 35}deg)` }} />
    ))}
  </>
);

const BTN_GOLD = 'rounded-full border-4 border-white bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 px-6 py-2.5 text-base font-extrabold tracking-wide text-white shadow-[0_6px_0_#b45309] transition-transform [-webkit-text-stroke:2px_#92400e] [paint-order:stroke_fill] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#b45309]';
const BTN_INDIGO = 'rounded-full border-4 border-white bg-gradient-to-b from-indigo-400 to-purple-600 px-6 py-2.5 text-base font-extrabold tracking-wide text-white shadow-[0_6px_0_#312e81] transition-transform [-webkit-text-stroke:2px_#312e81] [paint-order:stroke_fill] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#312e81]';

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

      // Cocción mínima: la gelatina (activationTemp 60°C) debe disolverse; con pigmento delicado (Pitahaya) basta 30°C
      const minCookTemp = (activeTray.pigment?.maxTemp ?? 90) <= 40 ? 30 : 60; // igual que el MÍN que muestra la Cocción
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
  const ok = report.success;
  const pal = ok
    ? { card: 'border-[#065f46] bg-[#f4fff9] shadow-[0_12px_0_#065f46,0_22px_28px_rgba(15,10,40,.4)]', ribbon: 'from-emerald-300 via-emerald-500 to-green-700 shadow-[inset_0_0_0_3px_#6ee7b7,0_6px_0_#064e3b] [-webkit-text-stroke:2px_#064e3b]', dash: 'border-emerald-400', head: 'text-emerald-800' }
    : { card: 'border-[#881337] bg-[#fff5f7] shadow-[0_12px_0_#881337,0_22px_28px_rgba(15,10,40,.4)]', ribbon: 'from-rose-400 via-red-500 to-red-700 shadow-[inset_0_0_0_3px_#fda4af,0_6px_0_#7f1d1d] [-webkit-text-stroke:2px_#7f1d1d]', dash: 'border-rose-400', head: 'text-rose-800' };

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-950/75 p-4 pt-8 backdrop-blur-sm">
      <style>{`@keyframes gl-qa-sway{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}@keyframes gl-qa-alert{0%,100%{opacity:.35}50%{opacity:1}}@media (prefers-reduced-motion:reduce){.gl-qa-sway,.gl-qa-alert{animation:none!important}}`}</style>
      {/* m-auto: centrado; en pantallas bajas se puede desplazar sin que el banner quede cortado */}
      <div className="relative m-auto w-full max-w-lg px-2 pb-3 pt-6" role="dialog" aria-live="polite">
        <div className={`relative w-full rounded-[30px] border-[5px] px-6 pb-6 pt-9 ${pal.card}`}>
          {/* Banner 3D curvo */}
          <div className="absolute -top-8 left-1/2 z-10 w-[88%] -translate-x-1/2 -rotate-1">
            <div className={`flex items-center justify-center gap-2 rounded-[24px] border-[4px] border-white bg-gradient-to-b px-3 py-2 text-lg font-extrabold tracking-wide text-white [paint-order:stroke_fill] sm:text-2xl ${pal.ribbon}`}>
              {ok ? '✅ ¡LOTE APROBADO!' : '❌ LOTE RECHAZADO'}
            </div>
            {ok ? (
              <>
                <Spark className="-left-5 -top-2" />
                <Spark className="-right-5 -top-3" delay=".6s" />
                <Spark className="-right-3 bottom-0" delay="1.1s" size={14} color="#ffffff" />
                <Spark className="-left-3 bottom-0" delay=".3s" size={14} color="#ffffff" />
              </>
            ) : (
              <>
                <span className="gl-qa-alert absolute -left-6 top-1 text-xl" style={{ animation: 'gl-qa-alert 1s infinite' }} aria-hidden="true">🚨</span>
                <span className="gl-qa-alert absolute -right-6 top-1 text-xl" style={{ animation: 'gl-qa-alert 1s .5s infinite' }} aria-hidden="true">🚨</span>
              </>
            )}
          </div>

          {ok && <Confetti />}

          {/* Gomita protagonista */}
          <div className="relative mt-5 flex justify-center">
            {ok && (
              <>
                <Spark className="left-[28%] top-1" delay=".2s" size={18} />
                <Spark className="right-[28%] top-3" delay=".8s" size={16} />
                <Spark className="left-[34%] bottom-2" delay="1.2s" size={12} color="#ffffff" />
              </>
            )}
            <div className={ok ? 'animate-bounce motion-reduce:animate-none' : 'gl-qa-sway'} style={ok ? undefined : { animation: 'gl-qa-sway 1.6s ease-in-out infinite' }}>
              <Gummy
                shape={activeTray.shape ?? 'cuadrado'} color={gummyColor} size={88}
                sparkle={ok}
                className={ok ? '' : 'gl-sad'}
              />
            </div>
          </div>

          {/* Puntos */}
          <div className="mt-2 flex justify-center">
            {ok ? (
              <span className="rounded-full border-4 border-white bg-gradient-to-b from-yellow-300 to-amber-500 px-5 py-1 text-xl font-extrabold text-amber-950 shadow-[0_4px_0_#b45309]">+{report.earnedPoints} PTS</span>
            ) : (
              <span className="rounded-full border-4 border-white bg-slate-300 px-5 py-1 text-xl font-extrabold text-slate-600 shadow-[0_4px_0_#64748b]">0 PTS</span>
            )}
          </div>

          {/* Reporte de laboratorio */}
          <div className={`mt-4 rounded-2xl border-2 border-dashed bg-white/95 p-4 ${pal.dash}`}>
            <p className={`m-0 mb-2 text-sm font-extrabold uppercase tracking-wider ${pal.head}`}>🔬 Reporte de laboratorio:</p>
            <ul className="m-0 max-h-[200px] list-none space-y-1.5 overflow-y-auto p-0">
              {report.messages.map((msg, idx) => (
                <li key={idx} className={`flex items-start gap-2 text-sm font-bold leading-snug ${ok ? 'text-emerald-900' : 'text-rose-800'}`}>
                  <span className="shrink-0" aria-hidden="true">{ok ? '✅' : '⚠️'}</span>
                  <span>{msg}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Botones centrados */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {orderCount === 1 ? (
              // Modo tutorial (1 pedido): reporte del lote con volver / jugar de nuevo. Sin Certificado.
              <>
                <button onClick={() => { restartGame(); setIsPlaying(true); }} className={BTN_GOLD}>🧸 JUGAR DE NUEVO ➔</button>
                <button onClick={config?.onExit} className={BTN_INDIGO}>🏠 VOLVER AL INICIO</button>
              </>
            ) : (
              <button onClick={handleNextOrder} className={BTN_GOLD}>
                {isLastOrder ? 'VER RESUMEN DEL TURNO 🏆' : 'SIGUIENTE PEDIDO ➔'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
