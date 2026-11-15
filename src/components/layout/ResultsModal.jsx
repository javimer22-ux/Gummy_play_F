import { useEffect } from 'react';
import { sfx } from '../../utils/soundEngine';
import { useGame } from '../../context/GameContext';
import Gummy from '../entities/Gummy';
import ordersData from '../../data/orders.json';
import ingredientsData from '../../data/ingredients.json';
import { StarIcon } from '../entities/Icons';

/* Estado de cada pedido → texto y colores del badge */
const STATUS = {
  approved: { label: 'Aprobado', cls: 'bg-emerald-500 text-white border-emerald-700' },
  expired: { label: 'Tiempo agotado', cls: 'bg-amber-400 text-amber-950 border-amber-600' },
  failed: { label: 'Rechazado', cls: 'bg-rose-500 text-white border-rose-700' },
};

/* Molde y color del pedido, leídos de orders.json (en modo infinito el id puede llevar un sufijo extra tras el id base) */
const orderLook = (id) => {
  const order = ordersData.find((o) => o.id === String(id)) ?? ordersData.find((o) => String(id).startsWith(o.id + '-'));
  const pigment = ingredientsData.pigments.find((p) => p.id === order?.targetSpecs.pigment);
  return { shape: order?.targetSpecs.shape ?? 'osito', color: pigment?.color ?? '#94a3b8' };
};

/* ───────── Decoración ───────── */
const Spark = ({ className = '', delay = '0s', size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={`absolute animate-ping motion-reduce:animate-none ${className}`} style={{ animationDelay: delay, animationDuration: '1.8s' }} aria-hidden="true">
    <path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" fill="#fde047" />
  </svg>
);
const Gear = ({ className = '', reverse = false }) => (
  <svg viewBox="0 0 40 40" width="32" height="32" className={`absolute animate-spin [animation-duration:8s] motion-reduce:animate-none ${reverse ? '[animation-direction:reverse]' : ''} ${className}`} aria-hidden="true">
    <path d="M17 2h6l1 5 4 2 4.5-3 4.2 4.2-3 4.5 2 4 5 1v6l-5 1-2 4 3 4.5-4.2 4.2-4.5-3-4 2-1 5h-6l-1-5-4-2-4.5 3-4.2-4.2 3-4.5-2-4-5-1v-6l5-1 2-4-3-4.5 4.2-4.2 4.5 3 4-2Z" fill="#c4b5fd" stroke="#5b21b6" strokeWidth="2.2" strokeLinejoin="round" />
    <circle cx="20" cy="20" r="6.5" fill="#faf7ff" stroke="#4c1d95" strokeWidth="2.2" />
  </svg>
);
const Floaty = ({ className = '', shape = 'osito', color, delay = '0s', size = 44 }) => (
  <div className={`absolute animate-bounce motion-reduce:animate-none ${className}`} style={{ animationDelay: delay, animationDuration: '2.6s' }} aria-hidden="true">
    <Gummy shape={shape} color={color} size={size} shadow={false} />
  </div>
);

/** Pantalla de fin de turno cuando NO se logró el Certificado: estrellas, puntaje y desglose de pedidos. */
export default function ResultsModal({ onExit }) {
  useEffect(() => { sfx.error(); }, []);
  const { results, score, totalOrders, restartGame, setIsPlaying } = useGame();
  const retry = () => { restartGame(); setIsPlaying(true); }; // reinicia el turno y arranca de una vez
  const approved = results.filter((r) => r.status === 'approved').length;
  const allApproved = totalOrders >= 3 && approved === totalOrders;

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm">
      {/* m-auto centra la tarjeta y, si la pantalla es baja, permite desplazarse sin cortar el banner superior */}
      <div className="relative m-auto w-full max-w-[36rem] px-8 pb-4 pt-8" role="dialog" aria-live="polite">
        {/* Decoración exterior */}
        <Floaty className="left-0 top-[18%]" color="#ff3d5a" />
        <Floaty className="right-0 top-[42%]" color="#ffc12e" delay=".8s" size={40} />
        <Floaty className="left-1 top-[70%]" shape="osito" color="#a66bff" delay="1.4s" size={38} />
        <Gear className="right-1 top-[14%]" />
        <Gear className="left-2 top-[46%] !h-6 !w-6" reverse />
        <Gear className="right-2 top-[78%] !h-6 !w-6" />

        <div className="relative w-full max-w-lg rounded-[30px] border-[5px] border-[#4c1d95] bg-[#faf7ff] px-6 pb-6 pt-9 shadow-[0_12px_0_#4c1d95,0_22px_28px_rgba(15,10,40,.4)]" style={{ margin: '0 auto' }}>
          {/* Banner superior 3D, completo y centrado sobre el borde */}
          <div className="absolute -top-8 left-1/2 z-10 w-[92%] -translate-x-1/2 -rotate-1">
            <div className="relative flex items-center justify-center gap-2 rounded-[24px] border-[4px] border-white bg-gradient-to-b from-violet-400 via-violet-600 to-purple-800 px-3 py-2 text-base font-extrabold tracking-wide text-white shadow-[inset_0_0_0_3px_#a78bfa,0_6px_0_#3b0764] [-webkit-text-stroke:2px_#3b0764] [paint-order:stroke_fill] sm:text-xl">
              🏆 RESUMEN DE FIN DE TURNO
            </div>
            <Spark className="-left-5 -top-2" />
            <Spark className="-right-5 -top-3" delay=".6s" />
            <Spark className="-right-3 bottom-0" delay="1.1s" size={16} />
          </div>

          {/* Estrellas */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5" aria-label={`${approved} de ${totalOrders} pedidos aprobados`}>
            {Array.from({ length: totalOrders }).map((_, i) => (
              <span
                key={i}
                className={i < approved
                  ? 'animate-pulse drop-shadow-[0_0_8px_rgba(250,204,21,.95)] motion-reduce:animate-none'
                  : 'opacity-35 grayscale'}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <StarIcon size={44} />
              </span>
            ))}
          </div>

          <p className="m-0 mt-1 text-center text-lg font-extrabold text-[#7458b0]">{approved} de {totalOrders} pedidos aprobados</p>
          <p className="m-0 text-center text-4xl font-extrabold leading-tight text-[#4c1d95] [text-shadow:0_3px_0_#ddd6fe]">⭐ {score} PTS</p>

          {/* Banner del Certificado (dinámico) */}
          {allApproved ? (
            <div className="relative mt-3 overflow-hidden rounded-2xl border-[3px] border-amber-600 bg-gradient-to-b from-yellow-200 via-amber-300 to-amber-500 px-3 py-2.5 text-center shadow-[inset_0_0_0_2px_#fef3c7,0_4px_0_#92400e]">
              <Spark className="left-2 top-1" size={16} />
              <Spark className="right-3 top-2" delay=".5s" size={14} />
              <Spark className="bottom-1 left-[40%]" delay="1s" size={12} />
              <p className="m-0 flex items-center justify-center gap-2 text-sm font-extrabold leading-snug text-amber-950">
                <span className="animate-bounce text-2xl motion-reduce:animate-none" aria-hidden="true">🏆</span>
                <span>¡CERTIFICADO DE EXCELENCIA AGROINDUSTRIAL OBTENIDO!</span>
              </p>
            </div>
          ) : (
            <p className="m-0 mt-3 rounded-2xl border-[3px] border-amber-500 bg-gradient-to-b from-[#fff8e1] to-[#f7e4b4] px-3 py-2 text-center text-sm font-extrabold leading-snug text-amber-900 shadow-[inset_0_0_0_2px_#fde68a,0_3px_0_#b45309]">
              🏆 Para obtener el Certificado de Excelencia Agroindustrial debes completar todos los pedidos del turno sin errores.
            </p>
          )}

          {/* Desglose de pedidos */}
          <ul className="m-0 mt-3 list-none space-y-2 overflow-y-auto rounded-2xl border-2 border-dashed border-purple-300 bg-white/90 p-3 max-h-[165px]">
            {results.map((r) => {
              const st = STATUS[r.status] ?? STATUS.failed;
              const { shape, color } = orderLook(r.id);
              return (
                <li key={r.id} className="flex items-center gap-2">
                  <span className="shrink-0"><Gummy shape={shape} color={color} size={32} shadow={false} /></span>
                  <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-[#1e1b4b]" title={r.title}>{r.title}</span>
                  {r.points > 0 && <span className="shrink-0 text-xs font-extrabold text-emerald-600">+{r.points}</span>}
                  <span className={`shrink-0 whitespace-nowrap rounded-full border-2 px-2.5 py-0.5 text-xs font-extrabold ${st.cls}`}>{st.label}</span>
                </li>
              );
            })}
          </ul>

          {/* Botones 3D */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={retry}
              className="rounded-full border-4 border-white bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 px-5 py-2.5 text-base font-extrabold tracking-wide text-white shadow-[0_5px_0_#b45309] transition-transform [-webkit-text-stroke:2px_#92400e] [paint-order:stroke_fill] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#b45309]"
            >
              🧸 REINTENTAR TURNO ➔
            </button>
            <button
              onClick={onExit}
              className="rounded-full border-4 border-white bg-gradient-to-b from-indigo-400 to-purple-600 px-5 py-2.5 text-base font-extrabold tracking-wide text-white shadow-[0_5px_0_#312e81] transition-transform [-webkit-text-stroke:2px_#312e81] [paint-order:stroke_fill] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#312e81]"
            >
              🏠 VOLVER AL INICIO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
