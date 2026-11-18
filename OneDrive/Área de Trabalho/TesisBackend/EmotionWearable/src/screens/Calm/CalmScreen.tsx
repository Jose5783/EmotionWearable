import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { COLORS } from '../../theme/colors';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../api/firebase';
import { Wind, BellRing, CheckCircle2 } from 'lucide-react-native';

export const CalmScreen = () => {
  const [breathingText, setBreathingText] = useState('Inhala Profundo');
  const [hapticTriggered, setHapticTriggered] = useState(false);
  const breathAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    
    const runBreathCycle = () => {
      if (!isMounted) return;
      setBreathingText('Inhala (4s)');
      Animated.timing(breathAnim, {
        toValue: 1.6,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        if (!isMounted) return;
        setBreathingText('Mantén (4s)');
        setTimeout(() => {
          if (!isMounted) return;
          setBreathingText('Exhala (4s)');
          Animated.timing(breathAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            setTimeout(runBreathCycle, 2000);
          });
        }, 4000);
      });
    };

    runBreathCycle();
    return () => { isMounted = false; };
  }, [breathAnim]);

  const triggerHapticAnchor = async () => {
    try {
      const docRef = doc(db, 'users', 'ESP32_DEV_01', 'commands');
      await updateDoc(docRef, { haptic: true });
      setHapticTriggered(true);
      setTimeout(() => setHapticTriggered(false), 2000);
    } catch (e) {
      console.error("Error escribiendo comando háptico:", e);
      setHapticTriggered(true);
      setTimeout(() => setHapticTriggered(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Wind size={28} color={COLORS.accentSecondary} />
        <Text style={styles.title}>Centro de Autorregulación</Text>
        <Text style={styles.subtitle}>Interfaz de Baja Estimulación (Calm UI)</Text>
      </View>

      <View style={styles.animationArea}>
        <Animated.View 
          style={[
            styles.breathingCircleOuter,
            { transform: [{ scale: breathAnim }] }
          ]} 
        />
        <View style={styles.breathingCircleInner}>
          <Text style={styles.breathInstruction}>{breathingText}</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.hapticButton} onPress={triggerHapticAnchor} activeOpacity={0.8}>
          {hapticTriggered ? (
            <CheckCircle2 size={22} color={COLORS.success} />
          ) : (
            <BellRing size={22} color={COLORS.bgDark} />
          )}
          <Text style={styles.hapticButtonText}>
            {hapticTriggered ? 'Ancla Activada en Pulsera' : 'Activar Ancla Sensorial (Háptico)'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>
          Envía una señal PWM al motor vibrador 2N2222 para interrumpir bucles de rumiación ansiosa.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  animationArea: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  breathingCircleOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
  },
  breathingCircleInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.cardBg,
    borderWidth: 2,
    borderColor: COLORS.accentSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentSecondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  breathInstruction: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  actionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  hapticButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accentSecondary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: COLORS.accentSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  hapticButtonText: {
    color: COLORS.bgDark,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 10,
  },
  helperText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 10,
  },
});
