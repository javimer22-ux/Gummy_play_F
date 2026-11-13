import { useGame } from '../../context/GameContext';
import Gummy from '../entities/Gummy';
import { ClockIcon } from '../entities/Icons';
import ingredientsData from '../../data/ingredients.json';
import shapes from '../../data/shapes.json';

const mmss = (sec) => `${String(Math.floor(Math.max(0, sec) / 60)).padStart(2, '0')}:${String(Math.max(0, sec) % 60).padStart(2, '0')}`;

/** Mini-ticket del pedido activo para la vista ampliada (forma, sabor y base solicitados). */
export default function OrderTicketMini() {
  const { activeOrders } = useGame();
  const order = activeOrders[0];
  if (!order) return null;

  const { shape, pigment, sweetener } = order.targetSpecs;
  const pig = ingredientsData.pigments.find((p) => p.id === pigment);
  const sweet = ingredientsData.bases.find((b) => b.id === sweetener);
  const low = order.timeRemaining < 15;
  const shapeName = shapes.find((s) => s.id === shape)?.name ?? shape;

  return (
    <div className="gl-zoom__order" role="note" aria-label={`Pedido actual ${order.id}`}>
      <Gummy shape={shape} color={pig?.color} size={46} shadow={false} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="gl-zoom__order-tag">PEDIDO {order.id}</p>
          <p
            className={`m-0 inline-flex items-center gap-1 text-sm font-extrabold tabular-nums ${low ? 'text-red-300 gl-pulse' : 'text-white'}`}
            aria-label={`Tiempo restante ${mmss(order.timeRemaining)}`}
          >
            <ClockIcon size={14} />{mmss(order.timeRemaining)}
          </p>
        </div>
        <p className="gl-zoom__order-line"><b>Forma:</b> {shapeName}</p>
        <p className="gl-zoom__order-line"><b>Sabor:</b> {pig?.name ?? pigment} · {sweet?.name ?? sweetener}</p>
      </div>
    </div>
  );
}
