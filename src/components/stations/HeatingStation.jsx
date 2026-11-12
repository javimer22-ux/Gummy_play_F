import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { FlameIcon } from '../entities/Icons';

export default function HeatingStation() {
  const { activeTray, setActiveTray } = useGame();
  const [isBurnerOn, setIsBurnerOn] = useState(false);

  // Efecto térmico: Sube rápido si está encendido, baja lento si está apagado
  useEffect(() => {
    let interval;
    if (isBurnerOn) {
      interval = setInterval(() => {
        setActiveTray(prev => ({
          ...prev,
          temperature: Math.min(120, prev.temperature + 5)
        }));
      }, 400);
    } else {
      interval = setInterval(() => {
        setActiveTray(prev => ({
          ...prev,
          temperature: Math.max(20, prev.temperature - 1)
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBurnerOn, setActiveTray]);

  // Si no hay pigmento, asumimos 100°C por defecto, si lo hay, leemos su límite
  const maxSafeTemp = activeTray.pigment ? activeTray.pigment.maxTemp : 100;

  // Lógica del color del termómetro (Dinámico)
  const getTempColor = (temp) => {
    if (temp < maxSafeTemp - 15) return '#3b82f6'; // Frío / Subiendo
    if (temp >= maxSafeTemp - 15 && temp <= maxSafeTemp) return '#22c55e'; // Óptimo
    return '#dc2626'; // Peligro / Quemado
  };

  return (
    <div className="gl-panel">
      <div className="gl-panel__head">
        <span className="gl-panel__num" style={{ '--n1': '#ff9aa8', '--n2': '#e0314b' }}>4</span>
        <h2 className="gl-panel__title">04. MARMITA TÉRMICA (CALOR)</h2>
      </div>

      <div className="gl-panel__body">
        {/* Panel de Control del Fuego */}
        <div className="gl-section" style={{ flex: 1.4 }}>
          <h3 className="gl-section__title">Control de Quemador</h3>
          <div className="gl-section__body" style={{ alignItems: 'center' }}>
            <button
              onClick={() => setIsBurnerOn(!isBurnerOn)}
              className={`gl-btn gl-btn--round ${isBurnerOn ? 'gl-btn--red gl-btn--glow' : 'gl-btn--orange'}`}
              style={{ width: '6.6rem', height: '6.6rem', fontSize: '1.1rem' }}
            >
              <FlameIcon size={isBurnerOn ? 44 : 38} />
              {isBurnerOn ? 'APAGAR' : 'ENCENDER'}
            </button>
          </div>
        </div>

        {/* Termómetro Dinámico */}
        <div className="gl-section" style={{ flex: 1 }}>
          <h3 className="gl-section__title">Termómetro: {activeTray.temperature}°C</h3>
          <div className="gl-section__body" style={{ alignItems: 'center', gap: '1rem' }}>
            <div className="gl-thermo">
              {/* Zonas de advertencia visual basada en el pigmento elegido */}
              <div className="gl-thermo__danger" style={{ bottom: `${(maxSafeTemp / 120) * 100}%` }}>
                <span>LÍMITE:<br />{maxSafeTemp}°C</span>
              </div>

              {/* Nivel de mercurio */}
              <div
                className="gl-thermo__fill"
                style={{ height: `${(activeTray.temperature / 120) * 100}%`, backgroundColor: getTempColor(activeTray.temperature) }}
              ></div>
            </div>

            {activeTray.pigment && (
              <p className="gl-hint-text" style={{ textAlign: 'left' }}>
                Compuesto:<br /><b style={{ color: '#d98a0c', fontSize: '.8rem' }}>{activeTray.pigment.compound}</b><br />
                Temperatura Max: {maxSafeTemp}°C
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
