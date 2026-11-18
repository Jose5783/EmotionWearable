import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration, Alert } from 'react-native';
import { COLORS } from '../../theme/colors';
import { Wind, CheckCircle2 } from 'lucide-react-native';
import { ref, push, set } from 'firebase/database';
import { auth, db } from '../../api/firebase';

export const CalmScreen = ({ onFinish }: { onFinish?: () => void }) => {
  const [phase, setPhase] = useState<'Inhala' | 'Mantén' | 'Exhala'>('Inhala');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const breathAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;

    const runCycle = () => {
      if (!isMounted) return;

      // 1. FASE: INHALA (4 segundos)
      setPhase('Inhala');
      setSecondsLeft(4);
      Vibration.vibrate(60);
      
      Animated.timing(breathAnim, {
        toValue: 1.5,
        duration: 4000,
        useNativeDriver: true,
      }).start();

      let sec = 4;
      const inhaleInterval = setInterval(() => {
        sec -= 1;
        if (isMounted) setSecondsLeft(sec);
        if (sec <= 0) clearInterval(inhaleInterval);
      }, 1000);

      // 2. FASE: MANTÉN (2 segundos)
      setTimeout(() => {
        if (!isMounted) return;
        setPhase('Mantén');
        setSecondsLeft(2);
        
        let secHold = 2;
        const holdInterval = setInterval(() => {
          secHold -= 1;
          if (isMounted) setSecondsLeft(secHold);
          if (secHold <= 0) clearInterval(holdInterval);
        }, 1000);

        // 3. FASE: EXHALA (4 segundos)
        setTimeout(() => {
          if (!isMounted) return;
          setPhase('Exhala');
          setSecondsLeft(4);
          Vibration.vibrate(60);

          Animated.timing(breathAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }).start();

          let secExhale = 4;
          const exhaleInterval = setInterval(() => {
            secExhale -= 1;
            if (isMounted) setSecondsLeft(secExhale);
            if (secExhale <= 0) clearInterval(exhaleInterval);
          }, 1000);

          setTimeout(() => {
            if (!isMounted) return;
            setCyclesCompleted((prev) => prev + 1);
            setTimeout(runCycle, 1000);
          }, 4000);

        }, 2000);

      }, 4000);
    };

    runCycle();
    return () => { isMounted = false; };
  }, [breathAnim]);

  // Modificado: Ahora envía el registro a la misma bitácora de crisis del paciente actual
  const handleFinishAndSave = async () => {
    const currentUser = auth.currentUser;
    if (currentUser && cyclesCompleted > 0) {
      try {
        // Apuntamos directamente a la bitácora de crisis del UID del usuario logueado
        const crisisLogRef = ref(db, `bitacora_crisis/${currentUser.uid}`);
        const newLogRef = push(crisisLogRef);
        
        const now = new Date();
        const fechaLegible = now.toLocaleString();

        await set(newLogRef, {
          timestamp: now.toISOString(),
          fechaLegible: fechaLegible,
          diagnostico: 'Intervención de Calma Completada',
          detalles: `El paciente completó ${cyclesCompleted} ciclos de respiración guiada para autorregulación.`,
        });

        Alert.alert("Éxito", "Sesión de calma registrada en la bitácora del paciente.");
      } catch (error) {
        console.error("Error al guardar bitácora de calma:", error);
      }
    }

    if (onFinish) {
      onFinish();
    }
  };

  return (
    <View style={styles.container}>
      <Wind size={32} color={COLORS.accentPrimary} style={{ marginBottom: 10 }} />
      <Text style={styles.title}>Microintervención Guiada</Text>
      <Text style={styles.subtitle}>Ancla Sensorial y Regulación Autónoma</Text>

      <View style={styles.counterBadge}>
        <CheckCircle2 size={16} color={COLORS.success} />
        <Text style={styles.counterText}>Ciclos completados: {cyclesCompleted}</Text>
      </View>

      <View style={styles.circleContainer}>
        <Animated.View style={[styles.breathingCircle, { transform: [{ scale: breathAnim }] }]}>
          <Text style={styles.phaseText}>{phase}</Text>
          <Text style={styles.timerText}>{secondsLeft}s</Text>
        </Animated.View>
      </View>

      <Text style={styles.instruction}>
        Sigue el ritmo del círculo y los números para estabilizar tu ritmo cardíaco.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleFinishAndSave}>
        <Text style={styles.buttonText}>Finalizar y Guardar en Bitácora</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, textAlign: 'center' },
  counterBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.cardBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  counterText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  circleContainer: { width: 220, height: 220, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  breathingCircle: { width: 170, height: 170, borderRadius: 85, backgroundColor: COLORS.accentPrimary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.accentPrimary, shadowOpacity: 0.8, shadowRadius: 15, elevation: 10 },
  phaseText: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  timerText: { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  instruction: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 20, marginBottom: 30, lineHeight: 18 },
  button: { backgroundColor: COLORS.success, paddingVertical: 14, paddingHorizontal: 30, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});