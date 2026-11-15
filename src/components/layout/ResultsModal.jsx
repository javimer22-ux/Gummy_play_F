import { useEffect } from 'react';
import { sfx } from '../../utils/soundEngine';
import { useGame } from '../../context/GameContext';
import Gummy from '../entities/Gummy';
import { ArrowIcon, CheckIcon, ClockIcon, CrossIcon, StarIcon } from '../entities/Icons';

const STATUS = {
  approved: { label: 'Aprobado', icon: <CheckIcon size={12} />, cls: 'is-ok' },
  failed: { label: 'Rechazado', icon: <CrossIcon size={12} />, cls: 'is-bad' },
  expired: { label: 'Tiempo agotado', icon: <ClockIcon size={14} />, cls: 'is-late' },
};

/** Pantalla final de la partida: pedidos aprobados, estrellas y puntaje. */
export default function ResultsModal({ onExit }) {
  useEffect(() => { sfx.error(); }, []);
  const { results, score, totalOrders, restartGame, setIsPlaying } = useGame();
  const retry = () => { restartGame(); setIsPlaying(true); }; // reinicia el turno y arranca de una vez
  const approved = results.filter((r) => r.status === 'approved').length;

  return (
    <div className="gl-modal">
      <div className="gl-report gl-report--shift" role="dialog" aria-live="polite">
        <div className="gl-report__ribbon">RESUMEN DE FIN DE TURNO</div>

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

        <p className="m-0 mt-1 rounded-xl bg-amber-100 px-3 py-2 text-center text-sm font-extrabold text-amber-900">
          🏆 Para obtener el Certificado de Excelencia Agroindustrial debes completar todos los pedidos del turno sin errores.
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

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={retry} className="gl-btn gl-btn--gold gl-btn--xl">
            <Gummy shape="osito" color="#ff3d5a" size={28} shadow={false} />
            REINTENTAR TURNO <ArrowIcon size={24} />
          </button>
          <button
            onClick={onExit}
            className="rounded-full border-4 border-white/80 bg-gradient-to-b from-violet-400 to-indigo-600 px-6 py-3 text-lg font-extrabold tracking-wide text-white shadow-[0_5px_0_#3730a3] transition-transform hover:brightness-110 active:translate-y-1"
          >
            ⌂ VOLVER AL INICIO
          </button>
        </div>
      </div>
    </div>
  );
}
