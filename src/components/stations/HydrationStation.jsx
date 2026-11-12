import { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import IngredientCard from '../entities/Ingredient';
import ingredientsData from '../../data/ingredients.json';

const TICK_MS = 100;   // cada tick = 0.1 min simulado (50 ticks = 5 min = 5 s reales)
const IDEAL_MIN = 40;  // 4 min
const IDEAL_MAX = 60;  // 6 min
const MAX_TICKS = 100; // 10 min: se pasa de largo y se detiene solo

const clock = (ticks) => {
  const sec = Math.round(ticks * 6); // 1 tick = 6 s simulados
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
};

export default function HydrationStation() {
  const { activeTray, isPlaying, sprinkleGelatin, finishHydration } = useGame();
  const [isHydrating, setIsHydrating] = useState(false);
  const [hydrationTime, setHydrationTime] = useState(0);
  const gelatin = ingredientsData.gellingAgents[0];

  const finished = activeTray.hasLumps !== null;
  const interrupted = !finished && !isHydrating && Boolean(activeTray.gellingAgent);

  const stop = (ticks) => {
    setIsHydrating(false);
    finishHydration(!(ticks >= IDEAL_MIN && ticks <= IDEAL_MAX));
  };

  useEffect(() => {
    if (!isHydrating || !isPlaying) return undefined;
    const id = setInterval(() => setHydrationTime((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [isHydrating, isPlaying]);

  useEffect(() => {
    if (isHydrating && hydrationTime >= MAX_TICKS) stop(hydrationTime);
  }); // eslint-disable-line

  const start = () => {
    sprinkleGelatin();
    setHydrationTime(0);
    setIsHydrating(true);
  };

  let msg = { cls: 'idle', text: 'Espolvorea la gelatina y déjala reposar el tiempo justo.' };
  if (isHydrating) msg = { cls: 'idle', text: 'Hidratando… detén el reposo cuando creas que está lista.' };
  else if (finished && !activeTray.hasLumps) msg = { cls: 'ok', text: 'Estado: Gelatina hidratada correctamente' };
  else if (finished) msg = { cls: 'bad', text: 'Estado: Grumos formados por mal tiempo' };
  else if (interrupted) msg = { cls: 'bad', text: 'Reposo interrumpido: la gelatina quedará con grumos' };

  return (
    <div className="gl-panel">
      <div className="gl-panel__head">
        <span className="gl-panel__num" style={{ '--n1': '#ffb6de', '--n2': '#ec5aa6' }}>1</span>
        <h2 className="gl-panel__title">01. HIDRATACIÓN DE LA GELATINA (BLOOMING)</h2>
      </div>

      <div className="gl-panel__body">
        <div className="gl-section" style={{ flex: 1 }}>
          <h3 className="gl-section__title">Agente Gelificante</h3>
          <div className="gl-section__body">
            <IngredientCard item={gelatin} onClick={() => {}} selected={Boolean(activeTray.gellingAgent)} artSize={74} />
          </div>
        </div>

        <div className="gl-section" style={{ flex: 2 }}>
          <h3 className="gl-section__title">Reposo</h3>
          <div className="gl-section__body" style={{ alignItems: 'center' }}>
            <div className="gl-hydro">
              <div className="gl-hydro__clock">{clock(hydrationTime)}</div>
              <div className="gl-hydro__bar"><i style={{ width: `${Math.min(100, hydrationTime)}%` }} /></div>
              <div className="flex gap-3">
                <button onClick={start} disabled={!isPlaying || isHydrating || finished || interrupted}
                  className="gl-btn gl-btn--gold">ESPOLVOREAR GELATINA</button>
                <button onClick={() => stop(hydrationTime)} disabled={!isPlaying || !isHydrating}
                  className="gl-btn gl-btn--blue">DETENER REPOSO</button>
              </div>
              <p className={`gl-hydro__msg gl-hydro__msg--${msg.cls}`}>{msg.text}{(finished || interrupted) && ' · La cinta ya puede avanzar →'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
