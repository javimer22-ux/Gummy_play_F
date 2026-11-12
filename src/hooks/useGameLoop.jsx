import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { LAST_STATION } from '../constants/stations';

export const useGameLoop = () => {
  const { isPlaying, activeOrders, setActiveOrders, activeTray } = useGame();
  const orderTimeLeft = activeOrders[0]?.timeRemaining;

  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    // Se detiene si el juego está pausado, no quedan pedidos, estamos en la pantalla de QA (última estación)
    // o el pedido activo se quedó sin tiempo (lo gestiona la alerta de tiempo agotado)
    if (!isPlaying || activeOrders.length === 0 || activeTray.station >= LAST_STATION || orderTimeLeft <= 0) {
      // Actualizamos la referencia para que no haya "saltos" de tiempo al despausar
      lastTickRef.current = Date.now();
      return;
    }

    const tickRate = 1000;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;

      if (delta >= tickRate) {
        // Reducir el tiempo SOLO del pedido activo (el primero en la lista: índice 0)
        setActiveOrders((orders) => {
          if (orders.length === 0) return orders;

          const newOrders = [...orders]; // Hacemos una copia
          newOrders[0] = {
            ...newOrders[0],
            timeRemaining: Math.max(0, newOrders[0].timeRemaining - 1)
          };

          return newOrders;
        });

        lastTickRef.current = now;
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [isPlaying, activeOrders.length, setActiveOrders, activeTray.station, orderTimeLeft]);
};