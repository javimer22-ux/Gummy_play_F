import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

export const useGameLoop = () => {
  const { isPlaying, shiftTime, setShiftTime, setActiveOrders, activeTray } = useGame();
  
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    // Si el juego está pausado, se acabó el turno, o estamos leyendo la pantalla de QA (estación 5), detenemos el reloj
    if (!isPlaying || shiftTime <= 0 || activeTray.station >= 5) {
      // Actualizamos la referencia para que no haya "saltos" de tiempo al despausar
      lastTickRef.current = Date.now(); 
      return;
    }

    const tickRate = 1000;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;

      if (delta >= tickRate) {
        // 1. Reducir el tiempo general del turno
        setShiftTime((prev) => Math.max(0, prev - 1));

        // 2. Reducir el tiempo SOLO del pedido activo (el primero en la lista: índice 0)
        setActiveOrders((orders) => {
          if (orders.length === 0) return orders;
          
          const newOrders = [...orders]; // Hacemos una copia
          // Solo le restamos tiempo al ticket actual
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
  }, [isPlaying, shiftTime, setShiftTime, setActiveOrders, activeTray.station]);
};