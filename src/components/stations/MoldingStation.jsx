import { useGame } from '../../context/GameContext';
import { GummyMold } from '../entities/Gummy';
import shapes from '../../data/shapes.json';

// Estación 5: solo elige la forma del molde. El enfriamiento vive en CoolingStation.
export default function MoldingStation() {
  const { activeTray, setActiveTray } = useGame();

  const selectShape = (shapeId) => {
    setActiveTray(prev => ({ ...prev, shape: shapeId }));
  };

  return (
    <div className="gl-panel">
      <div className="gl-panel__head">
        <span className="gl-panel__num" style={{ '--n1': '#ffc16b', '--n2': '#f27a14' }}>5</span>
        <h2 className="gl-panel__title">05. MOLDEADO</h2>
      </div>

      <div className="gl-panel__body">
        {/* Panel de Selección de Moldes */}
        <div className="gl-section" style={{ flex: 1 }}>
          <h3 className="gl-section__title">Inyectar en matriz</h3>
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
      </div>
    </div>
  );
}
