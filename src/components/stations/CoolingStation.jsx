import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { SnowIcon } from '../entities/Icons';

// Estación 6: túnel de frío. Se enfría la gelatina y se desmolda en el punto justo.
const START_TEMP = 40;   // °C al entrar al túnel
const MIN_TEMP = -10;    // el túnel no baja de aquí
const TICK_MS = 150;     // cada tick el túnel resta 1°C (≈ 6,7°C por segundo)

// Escala visual del termómetro
const SCALE_MIN = -10;
const SCALE_MAX = 40;
const pct = (t) => ((Math.min(SCALE_MAX, Math.max(SCALE_MIN, t)) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

// Gelificación: 4–10°C perfecta | más de 10°C sigue líquida | por debajo (hielo) se cristaliza
const evaluateTexture = (t) => {
  if (t > 10) return 'melted';
  if (t >= 4) return 'perfect';
  return 'frozen';
};

const RESULTS = {
  perfect: { text: '¡Gelificación exitosa!', color: '#1d8a37' },
  frozen: { text: 'Se cristalizó la gelatina', color: '#3f6fe6' },
  melted: { text: 'Sigue líquida', color: '#e0314b' },
};

export default function CoolingStation() {
  const { activeTray, setActiveTray } = useGame();
  const done = activeTray.finalTexture !== null;

  // Si el jugador vuelve a esta estación después de desmoldar, se muestra la temperatura ya registrada
  const [temperature, setTemperature] = useState(() => (done ? activeTray.temperature : START_TEMP));
  const [isCooling, setIsCooling] = useState(false);

  // Termostato: mientras el túnel está encendido, la temperatura baja rápidamente
  useEffect(() => {
    if (!isCooling) return undefined;
    const interval = setInterval(() => {
      setTemperature(prev => Math.max(MIN_TEMP, prev - 1));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [isCooling]);

  // El túnel se apaga solo al tocar el mínimo
  useEffect(() => {
    if (temperature <= MIN_TEMP) setIsCooling(false);
  }, [temperature]);

  // Refleja la temperatura en la bandeja mientras se enfría (solo efectos visuales de la cinta)
  useEffect(() => {
    if (isCooling) setActiveTray(prev => (prev.temperature === temperature ? prev : { ...prev, temperature }));
  }, [temperature, isCooling, setActiveTray]);

  // DESMOLDAR: un solo intento por pedido. Guarda la textura para el Control de Calidad.
  const demold = () => {
    if (done) return;
    setIsCooling(false);
    const finalTexture = evaluateTexture(temperature);
    setActiveTray(prev => (prev.finalTexture !== null ? prev : { ...prev, temperature, finalTexture }));
  };

  const inZone = temperature >= 4 && temperature <= 10;
  const tempColor = temperature > 10 ? '#e0314b' : inZone ? '#1d8a37' : '#3f6fe6';
  const result = done ? RESULTS[activeTray.finalTexture] : null;

  return (
    <div className="gl-panel">
      <div className="gl-panel__head">
        <span className="gl-panel__num" style={{ '--n1': '#8fb4ff', '--n2': '#3f6fe6' }}>6</span>
        <h2 className="gl-panel__title">06. ENFRIAMIENTO</h2>
      </div>

      <div className="gl-panel__body">
        {/* Termostato */}
        <div className="gl-section" style={{ flex: 1 }}>
          <h3 className="gl-section__title">Termostato</h3>
          <div className="gl-section__body" style={{ alignItems: 'center', gap: '1rem' }}>
            <div className="gl-thermo">
              {/* Zona ideal de gelificación (4–10°C) */}
              <div
                className="gl-thermo__danger"
                style={{
                  top: 'auto', bottom: `${pct(4)}%`, height: `${pct(10) - pct(4)}%`,
                  background: 'repeating-linear-gradient(135deg, rgba(34, 197, 94, .35) 0 6px, rgba(34, 197, 94, .15) 6px 12px)',
                  borderTop: '3px solid #22c55e', borderBottom: '3px solid #22c55e', alignItems: 'center'
                }}
              />
              <div
                className="gl-thermo__fill"
                style={{ height: `${pct(temperature)}%`, backgroundColor: temperature > 10 ? '#dc2626' : inZone ? '#22c55e' : '#3b82f6' }}
              ></div>
            </div>

            <div className="text-center">
              <p className="gl-hint-text">TEMP. ACTUAL</p>
              <p style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1, color: tempColor, fontVariantNumeric: 'tabular-nums' }}>
                {Math.floor(temperature)}°C
              </p>
              <p className="gl-hint-text" style={{ fontSize: '.6rem', marginTop: '.2rem' }}>
                Zona ideal:<br /><b style={{ color: '#1d8a37', fontSize: '.8rem' }}>4 – 10°C</b>
              </p>
            </div>
          </div>
        </div>

        {/* Controles del túnel */}
        <div className="gl-section" style={{ flex: 1.2 }}>
          <h3 className="gl-section__title">Túnel de frío</h3>
          <div className="gl-section__body" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
            <button
              onClick={() => setIsCooling(c => !c)}
              disabled={done || temperature <= MIN_TEMP}
              className={`gl-btn gl-btn--blue ${isCooling ? 'gl-btn--glow' : ''}`}
              style={{ userSelect: 'none' }}
            >
              <span className={isCooling ? 'gl-spinner' : ''} style={{ display: 'grid' }}><SnowIcon size={24} /></span>
              {isCooling ? 'APAGAR TÚNEL DE FRÍO' : 'ENCENDER TÚNEL DE FRÍO'}
            </button>

            <button onClick={demold} disabled={done} className="gl-btn gl-btn--gold">
              DESMOLDAR
            </button>

            {result ? (
              <p className="font-extrabold" style={{ color: result.color, fontSize: '.95rem' }}>{result.text}</p>
            ) : (
              <p className="gl-hint-text" style={{ fontSize: '.6rem' }}>
                Enfría hasta la zona ideal y desmolda.<br />Solo tienes un intento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
