import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../api/firebase';

export interface BiometricData {
  heartRate: number;
  spo2: number;
  gsrValue: number;
  accel: {
    x: number;
    y: number;
    z: number;
  };
  battery: number;
}

export const useBiometrics = (deviceId: string = 'ESP32_DEV_01') => {
  const [data, setData] = useState<BiometricData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    if (!deviceId) return;

    // Ruta en Realtime Database usando ref()
    const dbRef = ref(db, `users/${deviceId}/realtime/status`);

    // Escuchar cambios en tiempo real con onValue
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setData(val as BiometricData);
          setConnectionStatus('online');
        } else {
          // Datos por defecto si el nodo está vacío
          setData({
            heartRate: 72,
            spo2: 98,
            gsrValue: 0.45,
            accel: { x: 0.02, y: 0.98, z: 0.12 },
            battery: 88,
          });
          setConnectionStatus('online');
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error en Realtime Database:", error);
        setConnectionStatus('offline');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deviceId]);

  return { data, loading, connectionStatus };
};