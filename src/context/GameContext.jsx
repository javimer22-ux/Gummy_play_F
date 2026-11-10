import { createContext, useState, useContext } from 'react';
import ordersData from '../data/orders.json';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [shiftTime, setShiftTime] = useState(300);
  
  const initialOrder = { ...ordersData[0], timeRemaining: ordersData[0].timeLimit };
  const [activeOrders, setActiveOrders] = useState([initialOrder]);
  
  // ESTADO DE LA BANDEJA FÍSICA (Actualizado para química de Nanegal)
  const [activeTray, setActiveTray] = useState({
    station: 1, // 1=Formulación, 2=Mezclado, 3=Calor, 4=Moldeado, 5=QA
    base: null, // Agua purificada / Endulzante
    gellingAgent: null, // Gelatina sin sabor
    pigment: null, // NUEVO: Pitahaya, Café o Cítricos
    mixLevel: 0, // Porcentaje de mezcla (0 a 100)
    temperature: 20, // Temperatura inicial
    shape: null // Molde
  });

  // NUEVA FUNCIÓN MAESTRA: Controlador central de la cinta transportadora
  const advanceConveyor = () => {
    setActiveTray(prev => ({
      ...prev,
      station: Math.min(prev.station + 1, 5) // Avanza máximo hasta QA (5)
    }));
  };

  const value = {
    isPlaying, setIsPlaying,
    score, setScore,
    shiftTime, setShiftTime,
    activeOrders, setActiveOrders,
    activeTray, setActiveTray,
    advanceConveyor // Exportamos la función maestra
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);