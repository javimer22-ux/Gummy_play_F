import { useGame } from '../../context/GameContext';
import ingredientsData from '../../data/ingredients.json';
import IngredientCard from '../entities/Ingredient';
import { SpinIcon } from '../entities/Icons';

export default function MixerStation() {
  const { activeTray, setActiveTray } = useGame();
  const { pigments } = ingredientsData;

  // Pigmentos sueltos y grupos (p. ej. los tres tipos de ralladura de cítricos), en el orden del JSON
  const slots = [];
  pigments.forEach((pigment) => {
    if (!pigment.group) slots.push({ pigment });
    else if (!slots.some((s) => s.group === pigment.group)) {
      slots.push({ group: pigment.group, name: pigment.groupName, items: pigments.filter((p) => p.group === pigment.group) });
    }
  });

  const handleDispensePigment = (pigment) => {
    setActiveTray(prev => ({ ...prev, pigment, mixLevel: 0 })); // Resetea la mezcla al cambiar color
  };

  const mixGently = () => {
    setActiveTray(prev => ({
      ...prev,
      mixLevel: Math.min(100, prev.mixLevel + 10)
    }));
  };

  return (
    <div className="gl-panel">
      <div className="gl-panel__head">
        <span className="gl-panel__num" style={{ '--n1': '#d2b3ff', '--n2': '#8b4fe8' }}>3</span>
        <h2 className="gl-panel__title">03. PANEL DE COLORACIÓN Y MEZCLADO</h2>
      </div>

      <div className="gl-panel__body">
        {/* Selector de Pigmentos Naturales */}
        <div className="gl-section" style={{ flex: 2.4 }}>
          <h3 className="gl-section__title">1. Añadir Extracto Natural</h3>
          <div className="gl-section__body">
            {slots.map((slot) => (slot.group ? (
              <div
                key={slot.group}
                style={{
                  flex: `${slot.items.length} 1 0`, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '.2rem',
                  padding: '.15rem .35rem .3rem', borderRadius: '18px', border: '3px dashed #cdb4ff', background: 'rgba(255, 255, 255, .45)'
                }}
              >
                <p className="gl-hint-text">{slot.name}</p>
                <div style={{ flex: '1 1 0', minHeight: 0, display: 'flex', gap: '.4rem' }}>
                  {slot.items.map((pigment) => (
                    <IngredientCard
                      key={pigment.id} item={{ ...pigment, name: pigment.variant }}
                      onClick={() => handleDispensePigment(pigment)}
                      selected={activeTray.pigment?.id === pigment.id} artSize={46}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <IngredientCard
                key={slot.pigment.id} item={slot.pigment} sub={slot.pigment.compound}
                onClick={() => handleDispensePigment(slot.pigment)}
                selected={activeTray.pigment?.id === slot.pigment.id} artSize={66}
              />
            )))}
          </div>
        </div>

        {/* Panel de Agitación */}
        <div className="gl-section" style={{ flex: 1 }}>
          <h3 className="gl-section__title">2. Homogeneidad: {activeTray.mixLevel}%</h3>
          <div className="gl-section__body" style={{ flexDirection: 'column', alignItems: 'center', gap: '.6rem' }}>
            <div className="gl-progress">
              <div
                className="gl-progress__fill"
                style={{
                  width: `${activeTray.mixLevel}%`,
                  backgroundColor: activeTray.pigment?.color || '#a855f7'
                }}
              ></div>
            </div>

            <button
              onClick={mixGently}
              disabled={activeTray.mixLevel >= 100 || !activeTray.pigment}
              className="gl-btn gl-btn--purple gl-btn--round"
            >
              <SpinIcon size={26} />
              AGITAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
