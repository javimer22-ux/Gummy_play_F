import { useGame } from '../../context/GameContext';
import Gummy from '../entities/Gummy';
import { ArrowIcon, CheckIcon, ClockIcon, CrossIcon, StarIcon } from '../entities/Icons';

const STATUS = {
  approved: { label: 'Aprobado', icon: <CheckIcon size={12} />, cls: 'is-ok' },
  failed: { label: 'Rechazado', icon: <CrossIcon size={12} />, cls: 'is-bad' },
  expired: { label: 'Tiempo agotado', icon: <ClockIcon size={14} />, cls: 'is-late' },
};

/** Pantalla final de la partida: pedidos aprobados, estrellas y puntaje. */
export default function ResultsModal() {
  const { results, score, totalOrders, restartGame } = useGame();
  const approved = results.filter((r) => r.status === 'approved').length;

  return (
    <div className="gl-modal">
      <div className="gl-report gl-report--shift" role="dialog" aria-live="polite">
        <div className="gl-report__ribbon">PARTIDA TERMINADA</div>

        <div className="gl-stars" aria-label={`${approved} de ${totalOrders} pedidos aprobados`}>
          {Array.from({ length: totalOrders }).map((_, i) => (
            <span key={i} className={i < approved ? 'is-on' : ''} style={{ animationDelay: `${i * 0.12}s` }}>
              <StarIcon size={44} />
            </span>
          ))}
        </div>

        <p className="font-extrabold" style={{ fontSize: '1.15rem', color: '#7458b0' }}>
          {approved} de {totalOrders} pedidos aprobados
        </p>
        <p className="font-extrabold flex items-center justify-center gap-2" style={{ fontSize: '2.2rem', lineHeight: 1.1 }}>
          <StarIcon size={34} />{score} PTS
        </p>

        <ul className="gl-results">
          {results.map((r) => {
            const st = STATUS[r.status];
            return (
              <li key={r.id} className={st.cls}>
                <span className="gl-report__dot">{st.icon}</span>
                <span className="gl-results__title">{r.title}</span>
                <span className="gl-results__pts">{r.points > 0 ? `+${r.points}` : st.label}</span>
              </li>
            );
          })}
        </ul>

        <button onClick={restartGame} className="gl-btn gl-btn--gold gl-btn--xl">
          <Gummy shape="osito" color="#ff3d5a" size={28} shadow={false} />
          JUGAR DE NUEVO <ArrowIcon size={24} />
        </button>
      </div>
    </div>
  );
}
