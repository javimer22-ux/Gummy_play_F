import { useGame } from '../../context/GameContext';
import ingredientsData from '../../data/ingredients.json';
import IngredientCard from '../entities/Ingredient';

export default function FormulationStation() {
  const { activeTray, setActiveTray } = useGame();
  const { bases } = ingredientsData;

  const handleDispenseBase = (base) => {
    setActiveTray(prev => ({ ...prev, base }));
  };

  return (
    <div className="gl-panel">
      <div className="gl-panel__head">
        <span className="gl-panel__num" style={{ '--n1': '#8fb4ff', '--n2': '#3f6fe6' }}>2</span>
        <h2 className="gl-panel__title">02. PANEL DE FORMULACIÓN</h2>
      </div>

      <div className="gl-panel__body">
        <div className="gl-section" style={{ flex: 1.5 }}>
          <h3 className="gl-section__title">1. Seleccionar Base / Endulzante</h3>
          <div className="gl-section__body">
            {bases.map(base => (
              <IngredientCard
                key={base.id} item={base} onClick={() => handleDispenseBase(base)}
                selected={activeTray.base?.id === base.id} artSize={74}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
