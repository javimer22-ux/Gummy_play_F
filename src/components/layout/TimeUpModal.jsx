import { useEffect } from 'react';
import { sfx } from '../../utils/soundEngine';
import { useGame } from '../../context/GameContext';
import ingredientsData from '../../data/ingredients.json';
import Gummy from '../entities/Gummy';
import { ArrowIcon } from '../entities/Icons';

/* Animaciones propias de esta pantalla (se desactivan con "reducir movimiento") */
const CSS = `
@keyframes gl-tu-sway { 0%,100% { transform: rotate(-4deg) translateY(0); } 50% { transform: rotate(4deg) translateY(4px); } }
@keyframes gl-tu-cloud { 0%,100% { transform: translateX(0); } 50% { transform: translateX(10px); } }
.gl-tu-sway { animation: gl-tu-sway 1.8s ease-in-out infinite; transform-origin: 50% 90%; }
.gl-tu-cloud { animation: gl-tu-cloud 4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .gl-tu-sway, .gl-tu-cloud { animation: none; } }
`;

const Drop = ({ className = '', delay = '0s' }) => (
  <svg viewBox="0 0 20 28" width="16" height="22" className={`absolute animate-bounce motion-reduce:animate-none ${className}`} style={{ animationDelay: delay }} aria-hidden="true">
    <path d="M10 1 C10 1 2 12 2 18 a8 8 0 0 0 16 0 C18 12 10 1 10 1Z" fill="#7dd3fc" stroke="#0369a1" strokeWidth="2" strokeLinejoin="round" />
    <ellipse cx="7" cy="18" rx="2" ry="3.2" fill="#fff" opacity=".8" />
  </svg>
);

const Cloud = ({ className = '', delay = '0s' }) => (
  <svg viewBox="0 0 70 36" width="64" height="33" className={`absolute gl-tu-cloud ${className}`} style={{ animationDelay: delay }} aria-hidden="true">
    <path d="M14 30 a11 11 0 0 1 1-22 a15 15 0 0 1 28-2 a12 12 0 0 1 14 12 a9 9 0 0 1-2 12Z" fill="#e0e7ff" stroke="#4c1d95" strokeWidth="3" strokeLinejoin="round" />
    <path d="M18 14 a8 8 0 0 1 8-5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Hourglass = ({ className = '' }) => (
  <svg viewBox="0 0 40 56" width="34" height="48" className={`absolute animate-pulse motion-reduce:animate-none ${className}`} aria-hidden="true">
    <rect x="4" y="2" width="32" height="6" rx="3" fill="#fb923c" stroke="#7c2d12" strokeWidth="2.5" />
    <rect x="4" y="48" width="32" height="6" rx="3" fill="#fb923c" stroke="#7c2d12" strokeWidth="2.5" />
    <path d="M9 8 H31 C31 20 22 24 22 28 C22 32 31 36 31 48 H9 C9 36 18 32 18 28 C18 24 9 20 9 8Z" fill="#fef3c7" stroke="#7c2d12" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M13 11 H27 C26 17 22 20 20 24 C18 20 14 17 13 11Z" fill="#fbbf24" />
    <path d="M14 46 H26 C25 41 22 39 20 36 C18 39 15 41 14 46Z" fill="#fbbf24" />
  </svg>
);

const Gear = ({ className = '', reverse = false }) => (
  <svg viewBox="0 0 40 40" width="34" height="34" className={`absolute animate-spin [animation-duration:7s] motion-reduce:animate-none ${reverse ? '[animation-direction:reverse]' : ''} ${className}`} aria-hidden="true">
    <path d="M17 2h6l1 5 4 2 4.5-3 4.2 4.2-3 4.5 2 4 5 1v6l-5 1-2 4 3 4.5-4.2 4.2-4.5-3-4 2-1 5h-6l-1-5-4-2-4.5 3-4.2-4.2 3-4.5-2-4-5-1v-6l5-1 2-4-3-4.5 4.2-4.2 4.5 3 4-2Z" fill="#a78bfa" stroke="#5b21b6" strokeWidth="2.2" strokeLinejoin="round" />
    <circle cx="20" cy="20" r="6.5" fill="#fff5fa" stroke="#4c1d95" strokeWidth="2.2" />
  </svg>
);

const Spark = ({ className = '', delay = '0s' }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" className={`absolute animate-ping motion-reduce:animate-none ${className}`} style={{ animationDelay: delay, animationDuration: '1.8s' }} aria-hidden="true">
    <path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" fill="#fde047" />
  </svg>
);

const Stopwatch = () => (
  <svg viewBox="0 0 40 44" width="34" height="38" className="shrink-0" aria-hidden="true">
    <rect x="16" y="1" width="8" height="6" rx="2" fill="#fecaca" stroke="#7f1d1d" strokeWidth="2.2" />
    <circle cx="20" cy="25" r="16" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2.5" />
    <circle cx="20" cy="25" r="11" fill="#fff" stroke="#7f1d1d" strokeWidth="2" />
    <path d="M20 25 V17 M20 25 L26 28" stroke="#7f1d1d" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

/* Rayos amarillos de "explosión" alrededor del banner */
const Rays = () => (
  <svg viewBox="0 0 400 90" className="pointer-events-none absolute -inset-x-6 -top-8 h-[120%] w-[calc(100%+3rem)] animate-pulse motion-reduce:animate-none" aria-hidden="true">
    <g stroke="#fbbf24" strokeWidth="5" strokeLinecap="round">
      <path d="M40 38 L22 28 M52 22 L40 8 M82 12 L76 -2 M200 6 V-6 M318 12 L324 -2 M348 22 L360 8 M360 38 L378 28" />
    </g>
    <g stroke="#fde68a" strokeWidth="3" strokeLinecap="round"><path d="M64 14 L60 4 M336 14 L340 4 M30 52 L16 50 M370 52 L384 50" /></g>
  </svg>
);

/** Alerta cuando el pedido activo llega a 00:00: se pierde (0 puntos) y se pasa al siguiente. */
export default function TimeUpModal() {
  useEffect(() => { sfx.error(); }, []);
  const { activeOrders, activeTray, expireOrder } = useGame();
  const order = activeOrders[0];
  const upcoming = activeOrders[1];
  // La figura es la del pedido perdido: su molde y su pigmento objetivo
  const targetPigment = ingredientsData.pigments.find((p) => p.id === order?.targetSpecs.pigment);
  const color = targetPigment?.color ?? activeTray.pigment?.color ?? activeTray.base?.color ?? '#94a3b8';

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm">
      <style>{CSS}</style>
      {/* m-auto centra la tarjeta y, si la pantalla es baja, permite desplazarse sin cortar arriba ni abajo */}
      <div className="relative m-auto w-full max-w-md px-9 pb-3 pt-9" role="alertdialog" aria-live="assertive">
        {/* Decoración lateral flotante */}
        <Hourglass className="left-0 top-[62%] -rotate-12" />
        <Gear className="left-2 top-[46%] !h-6 !w-6" />
        <Hourglass className="right-0 top-[34%] rotate-12" />
        <Gear className="right-2 top-[22%] !h-7 !w-7" reverse />
        <Gear className="right-3 top-[52%] !h-5 !w-5" />

        <div className="relative w-full rounded-[28px] border-[6px] border-[#ec4899] bg-[#fff1f6] px-4 pb-5 pt-11 shadow-[inset_0_0_0_3px_#f9a8d4,0_10px_0_#9d174d,0_20px_26px_rgba(15,10,40,.4)]">
          {/* Banner inclinado + destellos y signos !! */}
          <div className="absolute -top-8 left-1/2 z-10 w-[96%] -translate-x-1/2 -rotate-2">
            <Rays />
            <div className="relative flex items-center justify-center gap-2 rounded-[22px] border-[3px] border-[#7f1d1d] bg-gradient-to-b from-red-400 to-red-600 px-3 py-2 text-xl font-extrabold tracking-wide text-white shadow-[inset_0_0_0_3px_#fca5a5,0_6px_0_#7f1d1d] [-webkit-text-stroke:2px_#7f1d1d] [paint-order:stroke_fill]">
              <Stopwatch /> ¡TIEMPO AGOTADO!
            </div>
            <span className="absolute -left-7 top-1 -rotate-[24deg] animate-pulse text-3xl font-extrabold text-yellow-400 motion-reduce:animate-none [text-shadow:0_2px_0_#92400e]" aria-hidden="true">!!</span>
            <Spark className="-right-7 -top-2" delay=".6s" />
          </div>

          {/* Figura dinámica del pedido perdido */}
          <div className="relative mx-auto mb-3 flex h-32 w-56 items-center justify-center">
            <Cloud className="-left-2 top-1" />
            <Cloud className="-right-2 top-6" delay="1.2s" />
            <Drop className="left-[22%] top-2" />
            <Drop className="right-[22%] top-0" delay=".35s" />
            <Drop className="left-[12%] top-[52%]" delay=".7s" />
            <Drop className="right-[14%] top-[56%]" delay="1s" />
            <div className="absolute bottom-1 left-1/2 h-3 w-24 -translate-x-1/2 rounded-full bg-slate-900/15" aria-hidden="true" />
            <div className="gl-tu-sway relative">
              <Gummy shape={order?.targetSpecs.shape ?? 'cuadrado'} color={color} size={96} />
            </div>
          </div>

          {/* Recuadro de detalle */}
          <div className="rounded-2xl border-2 border-dashed border-purple-500 bg-[#f3eaff] px-4 py-3 text-center">
            <p className="m-0 text-lg font-extrabold text-[#1e1b4b]">Pedido {order?.id} perdido</p>
            <p className="m-0 mt-1 font-bold text-[#3b1d6e]">
              «{order?.title}» no se entregó a tiempo. No sumas puntos por este pedido.
            </p>
            <p className="m-0 mt-2 font-extrabold text-amber-600">
              {upcoming ? `Siguiente: ${upcoming.title}` : 'Era el último pedido de la partida'}
            </p>
          </div>

          {/* Botón 3D */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={expireOrder}
              className="group relative flex items-center gap-2 rounded-full border-4 border-[#f59e0b] bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 px-7 py-2.5 text-lg font-extrabold text-white shadow-[inset_0_0_0_2px_#fde68a,0_6px_0_#b45309] transition-transform [-webkit-text-stroke:2px_#92400e] [paint-order:stroke_fill] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[inset_0_0_0_2px_#fde68a,0_2px_0_#b45309]"
            >
              <Spark className="-left-4 -top-3 opacity-0 group-hover:opacity-100" />
              <Spark className="-right-4 -top-3 opacity-0 group-hover:opacity-100" delay=".4s" />
              {upcoming ? 'SIGUIENTE PEDIDO' : 'VER RESULTADOS'} <ArrowIcon size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
