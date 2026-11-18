export interface StressAnalysisLevel {
  level: 'normal' | 'warning' | 'critical';
  label: string;
  color: string;
  interventionNeeded: boolean;
}

export const calculateStressIndex = (heartRate: number, gsrValue: number): StressAnalysisLevel => {
  // Se activa SOLO si el ritmo sube de 85 O si el GSR BAJA de 1000
  if (heartRate > 85 || gsrValue < 1000) {
    return {
      level: 'critical',
      label: 'Desbordamiento / Alerta de Crisis',
      color: '#c0392b', // Rojo alerta
      interventionNeeded: true,
    };
  } else if (heartRate > 80 || gsrValue < 1500) {
    return {
      level: 'warning',
      label: 'Elevación de Estrés Simpático',
      color: '#d35400', // Naranja precaución
      interventionNeeded: false,
    };
  } else {
    return {
      level: 'normal',
      label: 'Sistema Simpático: Normal',
      color: '#27ae60', // Verde estable
      interventionNeeded: false,
    };
  }
};