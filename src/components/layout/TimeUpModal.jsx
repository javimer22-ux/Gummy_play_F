import { useGame } from '../../context/GameContext';
import Gummy from '../entities/Gummy';
import { ArrowIcon, ClockIcon } from '../entities/Icons';

/** Alerta cuando el pedido activo llega a 00:00: se pierde (0 puntos) y se pasa al siguiente. */
export default function TimeUpModal() {
  const { activeOrders, activeTray, expireOrder } = useGame();
  const order = activeOrders[0];
  const upcoming = activeOrders[1];

  return (
    <div className="gl-modal">
      <div className="gl-report gl-report--bad" role="alertdialog" aria-live="assertive">
        <div className="gl-report__ribbon">
          <ClockIcon size={28} />
          ¡TIEMPO AGOTADO!
        </div>

        <div className="flex justify-center">
          <Gummy
            shape={order?.targetSpecs.shape ?? 'cuadrado'}
            color={activeTray.pigment?.color ?? activeTray.base?.color}
            size={92} className="gl-sad"
          />
        </div>

        <div className="gl-report__list" style={{ textAlign: 'center' }}>
          <p className="font-extrabold">Pedido {order?.id} perdido</p>
          <p className="font-bold" style={{ color: '#7458b0' }}>
            «{order?.title}» no se entregó a tiempo. No sumas puntos por este pedido.
          </p>
          <p className="font-bold mt-2" style={{ color: '#d98a0c' }}>
            {upcoming ? `Siguiente: ${upcoming.title}` : 'Era el último pedido de la partida'}
          </p>
        </div>

        <button onClick={expireOrder} className="gl-btn gl-btn--gold gl-btn--xl">
          {upcoming ? 'SIGUIENTE PEDIDO' : 'VER RESULTADOS'} <ArrowIcon size={24} />
        </button>
      </div>
    </div>
  );
}
