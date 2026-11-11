import { createContext, useState, useContext, useMemo } from 'react';
import ordersData from '../data/orders.json';

const GameContext = createContext();

// Una partida = la serie completa de pedidos de orders.json (cada uno con su propio tiempo)
const freshOrders = () => ordersData.map(o => ({ ...o, timeRemaining: o.timeLimit }));

const EMPTY_TRAY = {
  station: 1, // 1=Formulación, 2=Mezclado, 3=Calor, 4=Moldeado, 5=QA
  base: null, // Agua purificada / Endulzante
  gellingAgent: null, // Gelatina sin sabor
  pigment: null, // Pitahaya, Café o Cítricos
  mixLevel: 0, // Porcentaje de mezcla (0 a 100)
  temperature: 20, // Temperatura inicial
  shape: null // Molde
};

export const GameProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Cola de pedidos de la partida: el primero (índice 0) es el pedido activo
  const [activeOrders, setActiveOrders] = useState(freshOrders);

  // Un resultado por pedido cerrado: { id, title, status: 'approved' | 'failed' | 'expired', points }
  const [results, setResults] = useState([]);
  const score = useMemo(() => results.reduce((total, r) => total + r.points, 0), [results]);
  const totalOrders = ordersData.length;
  const gameFinished = activeOrders.length === 0; // se cerraron todos los pedidos

  // ESTADO DE LA BANDEJA FÍSICA
  const [activeTray, setActiveTray] = useState({ ...EMPTY_TRAY });

  // Controlador central de la cinta transportadora
  const advanceConveyor = () => {
    setActiveTray(prev => ({
      ...prev,
      station: Math.min(prev.station + 1, 5) // Avanza máximo hasta QA (5)
    }));
  };

  // Retrocede una estación (la bandeja conserva todo su contenido). No baja de la 1.
  const retreatConveyor = () => {
    setActiveTray(prev => ({
      ...prev,
      station: Math.max(prev.station - 1, 1)
    }));
  };

  // Guarda el resultado de un pedido (una sola vez por pedido) y suma sus puntos al marcador
  const recordResult = (result) => {
    setResults(prev => (prev.some(r => r.id === result.id) ? prev : [...prev, result]));
  };

  // Pasa al siguiente pedido (con su contador completo) y deja la bandeja limpia.
  // Si era el último, la cola queda vacía y la partida termina.
  const nextOrder = () => {
    setActiveOrders(prev => prev.slice(1));
    setActiveTray({ ...EMPTY_TRAY });
  };

  // Pedido caducado: no suma puntos, se registra y se pasa al siguiente
  const expireOrder = () => {
    const order = activeOrders[0];
    if (order) recordResult({ id: order.id, title: order.title, status: 'expired', points: 0 });
    nextOrder();
  };

  // Reinicia la partida completa (queda en pausa en el pedido 1)
  const restartGame = () => {
    setIsPlaying(false);
    setResults([]);
    setActiveOrders(freshOrders());
    setActiveTray({ ...EMPTY_TRAY });
  };

  const value = {
    isPlaying, setIsPlaying,
    score, results, totalOrders, gameFinished,
    activeOrders, setActiveOrders,
    activeTray, setActiveTray,
    advanceConveyor, retreatConveyor,
    recordResult, nextOrder, expireOrder, restartGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);