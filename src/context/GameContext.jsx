import { createContext, useState, useContext, useMemo } from 'react';
import ordersData from '../data/orders.json';
import ingredientsData from '../data/ingredients.json';
import { FIRST_STATION, LAST_STATION } from '../constants/stations';

const GameContext = createContext();

// Una partida = la serie completa de pedidos de orders.json (cada uno con su propio tiempo)
const freshOrders = () => ordersData.map(o => ({ ...o, timeRemaining: o.timeLimit }));

// Gelatina que se espolvorea en la Estación de Hidratación
const GELATIN = ingredientsData.gellingAgents[0];

const EMPTY_TRAY = {
  station: FIRST_STATION, // ver src/constants/stations.js (1=Hidratación ... 7=QA)
  hasLumps: null, // Hidratación: null = aún sin hidratar | true = grumos | false = gelatina hidratada correctamente
  gellingAgent: null, // Gelatina sin sabor (la coloca la Estación de Hidratación)
  base: null, // Agua purificada / Endulzante
  pigment: null, // Pitahaya, Café o Cítricos
  mixLevel: 0, // Porcentaje de mezcla (0 a 100)
  temperature: 20, // Temperatura inicial
  shape: null, // Molde (lo fija la Estación de Moldeado)
  finalTexture: null // Enfriamiento: null = sin desmoldar | 'perfect' | 'frozen' | 'melted'
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

  // Sube cada vez que empieza un pedido nuevo o se reinicia la partida.
  // Úsalo como `key` en estaciones con estado local para que arranquen limpias.
  const [runId, setRunId] = useState(0);

  // Controlador central de la cinta transportadora
  const advanceConveyor = () => {
    setActiveTray(prev => ({
      ...prev,
      station: Math.min(prev.station + 1, LAST_STATION) // Avanza máximo hasta QA
    }));
  };

  // Retrocede una estación (la bandeja conserva todo su contenido). No baja de la primera.
  const retreatConveyor = () => {
    setActiveTray(prev => ({
      ...prev,
      station: Math.max(prev.station - 1, FIRST_STATION)
    }));
  };

  // ── HIDRATACIÓN ──────────────────────────────────────────────
  // Espolvorear: coloca la gelatina en la bandeja. Solo una vez por pedido.
  const sprinkleGelatin = () => {
    setActiveTray(prev => (prev.gellingAgent ? prev : { ...prev, gellingAgent: GELATIN }));
  };

  // Detener el reposo: guarda el resultado del minijuego. Un solo intento por pedido:
  // si ya hay resultado (true/false), no se puede sobrescribir.
  // El error NO bloquea el juego: la bandeja sigue y `hasLumps` viaja a las siguientes estaciones.
  const finishHydration = (hasLumps) => {
    setActiveTray(prev => (prev.hasLumps !== null ? prev : { ...prev, hasLumps: Boolean(hasLumps) }));
  };

  // ── PEDIDOS ──────────────────────────────────────────────────
  // Guarda el resultado de un pedido (una sola vez por pedido) y suma sus puntos al marcador
  const recordResult = (result) => {
    setResults(prev => (prev.some(r => r.id === result.id) ? prev : [...prev, result]));
  };

  // Pasa al siguiente pedido (con su contador completo) y deja la bandeja limpia.
  // Si era el último, la cola queda vacía y la partida termina.
  const nextOrder = () => {
    setActiveOrders(prev => prev.slice(1));
    setActiveTray({ ...EMPTY_TRAY });
    setRunId(id => id + 1);
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
    setRunId(id => id + 1);
  };

  const value = {
    isPlaying, setIsPlaying,
    score, results, totalOrders, gameFinished,
    activeOrders, setActiveOrders,
    activeTray, setActiveTray,
    runId,
    advanceConveyor, retreatConveyor,
    sprinkleGelatin, finishHydration,
    recordResult, nextOrder, expireOrder, restartGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);