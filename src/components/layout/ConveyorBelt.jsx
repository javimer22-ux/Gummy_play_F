import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import FactoryBackdrop from '../entities/FactoryBackdrop';
import { Machine, MachineDefs } from '../entities/Machines';
import Tray from '../entities/Tray';

/** 'up' | 'down' | 'flat': hacia dónde se movió un valor (se apaga solo si deja de cambiar). */
function useTrend(value) {
  const prev = useRef(value);
  const [trend, setTrend] = useState('flat');
  useEffect(() => {
    if (value > prev.current) setTrend('up');
    else if (value < prev.current) setTrend('down');
    prev.current = value;
    const id = setTimeout(() => setTrend('flat'), 1500);
    return () => clearTimeout(id);
  }, [value]);
  return trend;
}

export default function ConveyorBelt() {
  const { isPlaying, activeTray } = useGame();

  const stations = [
    { id: 1, name: 'FORMULACIÓN' },
    { id: 2, name: 'MEZCLADORA' },
    { id: 3, name: 'MARMITA' },
    { id: 4, name: 'MOLDEADO' },
    { id: 5, name: 'ESCÁNER QA' },
  ];

  // Posición de la bandeja: centro de cada columna (20% por estación)
  const getTrayPosition = () => `${(activeTray.station - 1) * 20 + 10}%`;

  const isBeltMoving = isPlaying && activeTray.station < 5;

  // Color visual de la mezcla en la cinta
  const getRenderColor = () => {
    if (activeTray.pigment && activeTray.station >= 2) return activeTray.pigment.color;
    if (activeTray.base) return activeTray.base.color;
    return 'transparent';
  };

  // ── Efectos puramente visuales derivados del estado ──
  const [transit, setTransit] = useState(false); // la cinta acelera mientras la bandeja cambia de estación
  useEffect(() => {
    setTransit(true);
    const id = setTimeout(() => setTransit(false), 1000);
    return () => clearTimeout(id);
  }, [activeTray.station]);

  const tempTrend = useTrend(activeTray.temperature);
  const burning = activeTray.station === 3 && (tempTrend === 'up' || activeTray.temperature >= 120);
  const cooling = activeTray.station === 4 && tempTrend === 'down';
  const burst = `${activeTray.base?.id ?? ''}${activeTray.gellingAgent?.id ?? ''}`;

  const beltClass = isBeltMoving ? (transit ? 'is-fast' : 'is-slow') : '';

  return (
    <div className="gl-scene">
      <MachineDefs />
      <FactoryBackdrop />
      <div className="gl-floor" style={{ '--gl-belt-h': '4.2rem' }} />

      <div className="gl-line">
        {/* Máquinas */}
        <div className="gl-machines">
          {stations.map((s) => (
            <div key={s.id} className="gl-machine-slot">
              <Machine
                id={s.id} tray={activeTray} playing={isPlaying}
                active={activeTray.station === s.id}
                burst={s.id === 1 ? burst : undefined}
                burning={burning} cooling={cooling}
              />
            </div>
          ))}
        </div>

        {/* Cinta transportadora */}
        <div className={`gl-belt ${beltClass}`}>
          <div className="gl-belt__top" />
          <div className="gl-belt__front"><div className="gl-belt__rollers" /></div>

          {/* LA BANDEJA (se mueve dinámicamente) */}
          <div className="gl-tray" style={{ left: getTrayPosition() }}>
            <Tray tray={activeTray} color={getRenderColor()} />
          </div>
        </div>

        {/* Letreros de estación */}
        <div className="gl-labels">
          {stations.map((s) => (
            <span key={s.id} className={`gl-label ${activeTray.station === s.id ? 'is-current' : ''}`}>
              <b>{s.id}</b>{s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
