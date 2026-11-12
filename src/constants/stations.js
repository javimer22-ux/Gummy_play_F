// Estaciones del flujo, en orden. Usa estas constantes en lugar de números sueltos
// para que agregar una estación nueva no obligue a tocar cada comparación.
export const STATION = {
  HYDRATION: 1,   // Hidratación de la gelatina (blooming)
  FORMULATION: 2, // Base / endulzante
  MIXING: 3,      // Pigmento y agitado
  HEATING: 4,     // Marmita
  MOLDING: 5,     // Moldeado (elegir la forma)
  COOLING: 6,     // Enfriamiento (túnel de frío y gelificación)
  QUALITY: 7,     // Control de calidad
};

export const FIRST_STATION = STATION.HYDRATION;
export const LAST_STATION = STATION.QUALITY;
