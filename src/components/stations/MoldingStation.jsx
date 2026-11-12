import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { GummyMold } from '../entities/Gummy';
import { SnowIcon } from '../entities/Icons';

export default function MoldingStation() {
  const { activeTray, setActiveTray } = useGame();
  const [isCooling, setIsCooling] = useState(false);

  // Efecto para el choque térmico (enfriamiento rápido)
  useEffect(() => {
    let interval;
    if (isCooling) {
      interval = setInterval(() => {
        setActiveTray(prev => ({
          ...prev,
          // La temperatura baja rápidamente gracias a los ventiladores
          temperature: Math.max(15, prev.temperature - 8)
        }));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isCooling, setActiveTray]);

  const shapes = [
    { id: 'cuadrado', name: 'Cuadrado' },
    { id: 'estrella', name: 'Estrella' },
    { id: 'osito', name: 'Osito' }
  ];

  const selectShape = (shapeId) => {
    setActiveTray(prev => ({ ...prev, shape: shapeId }));
  };

  return (
    <div className="gl-panel">
      <div className="gl-panel__head">
        <span className="gl-panel__num" style={{ '--n1': '#ffc16b', '--n2': '#f27a14' }}>5</span>
        <h2 className="gl-panel__title">05. MOLDEADO Y ENFRIAMIENTO</h2>
      </div>

      <div className="gl-panel__body">
        {/* Panel de Selección de Moldes */}
        <div className="gl-section" style={{ flex: 1.3 }}>
          <h3 className="gl-section__title">1. Inyectar en matriz</h3>
          <div className="gl-section__body">
            {shapes.map(shape => (
              <button
                key={shape.id}
                onClick={() => selectShape(shape.id)}
                className={`gl-item ${activeTray.shape === shape.id ? 'is-selected' : ''}`}
              >
                <span className="gl-item__art"><GummyMold shape={shape.id} size={58} /></span>
                <span className="gl-item__name" style={{ fontSize: '.8rem' }}>{shape.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Enfriamiento (Choque Térmico) */}
        <div className="gl-section" style={{ flex: 1 }}>
          <h3 className="gl-section__title">2. Choque Térmico</h3>
          <div className="gl-section__body" style={{ flexDirection: 'column', alignItems: 'center', gap: '.1rem' }}>
            <div className="flex items-center gap-5">
              {/* Indicador de temperatura actual */}
              <div className="text-center">
                <p className="gl-hint-text">TEMP. ACTUAL</p>
                <p style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1, color: activeTray.temperature > 40 ? '#e0314b' : '#3f6fe6', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.floor(activeTray.temperature)}°C
                </p>
              </div>

              {/* Botón del Ventilador */}
              <button
                onMouseDown={() => setIsCooling(true)}
                onMouseUp={() => setIsCooling(false)}
                onMouseLeave={() => setIsCooling(false)} // Por si el cursor sale del botón
                className={`gl-btn gl-btn--blue gl-btn--round ${isCooling ? 'gl-btn--glow' : ''}`}
                style={{ width: '4.8rem', height: '4.8rem', userSelect: 'none' }}
              >
                <span className={isCooling ? 'gl-spinner' : ''} style={{ display: 'grid' }}><SnowIcon size={38} /></span>
              </button>
            </div>
            <p className="gl-hint-text" style={{ fontSize: '.6rem' }}>
              Mantén presionado para encender turbinas.<br />Enfría por debajo de 30°C para desmoldar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
