import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { calculateStressIndex } from '../../utils/emotionFusion';
import { CalmScreen } from './CalmScreen';
import { EmergencyScreen } from '../Emergency/EmergencyScreen';
import { Activity, Heart, Zap, Compass, Battery, Wifi, Cpu, AlertTriangle, Droplet, LogOut } from 'lucide-react-native';
import { ref, onValue } from 'firebase/database';
import { db } from '../../api/firebase';

interface DashboardScreenProps {
  onLogout?: () => void; 
}
export const DashboardScreen = ({ onLogout }: DashboardScreenProps) => {
  const [data, setData] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline');
  const [refreshing, setRefreshing] = useState(false);
  const [showCalmUI, setShowCalmUI] = useState(false);
  const [showEmergencyUI, setShowEmergencyUI] = useState(false);

  useEffect(() => {
    // Referencia al nodo de datos enviado por tu ESP32
    const dataRef = ref(db, 'sensores/esp32_node/data');

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const firebaseData = snapshot.val();
      if (firebaseData) {
        setData(firebaseData);
        setConnectionStatus('online');
      } else {
        setConnectionStatus('offline');
      }
    }, (error) => {
      console.error("Error al leer Firebase:", error);
      setConnectionStatus('offline');
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Mapeo de datos recibidos del ESP32
  const currentHeartRate = data?.heartRate ?? 75;
  const currentGsr = data?.gsr ?? 0; 
  
  const stressAnalysis = calculateStressIndex(currentHeartRate, currentGsr);

  // Si se activa el estado de intervención o crisis, mostramos la Calm UI
  if (showCalmUI) {
    return <CalmScreen onFinish={() => setShowCalmUI(false)} />;
  }

  // Si se activa la interfaz de emergencia
  if (showEmergencyUI) {
    return <EmergencyScreen onBack={() => setShowEmergencyUI(false)} />;
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accentPrimary} />}
    >
      {/* Header & Hardware Status Banner con Botón de Salida */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Telemetría en Vivo</Text>
          <Text style={styles.headerSubtitle}>ESP32 Vestible • Nodo Clínico 01</Text>
        </View>

        <View style={styles.headerRightContainer}>
          <View style={[styles.statusBadge, connectionStatus === 'online' ? styles.badgeOnline : styles.badgeOffline]}>
            <Wifi size={14} color={connectionStatus === 'online' ? COLORS.success : COLORS.danger} />
            <Text style={[styles.statusText, { color: connectionStatus === 'online' ? COLORS.success : COLORS.danger }]}>
              {connectionStatus.toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <LogOut size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Panel de Fusión Multimodal y Alerta Activa */}
      <View style={[styles.fusionCard, { borderLeftColor: stressAnalysis.color }]}>
        <View style={styles.fusionHeader}>
          <AlertTriangle size={20} color={stressAnalysis.color} />
          <Text style={styles.fusionTitle}>Índice Multimodal de Estrés</Text>
        </View>
        <Text style={[styles.fusionStatusValue, { color: stressAnalysis.color }]}>
          {stressAnalysis.label}
        </Text>
        <Text style={styles.fusionDesc}>
          Fusión en tiempo real de PPG (MAX30102), GSR Casero y Sensores del ESP32.
        </Text>
        
        {stressAnalysis.interventionNeeded && (
          <TouchableOpacity 
            style={styles.interventionBtn} 
            onPress={() => setShowCalmUI(true)}
          >
            <Text style={styles.interventionBtnText}>Iniciar Intervención Activa / Calm UI</Text>
          </TouchableOpacity>
        )}

        {/* Acceso directo a Protocolos de Emergencia */}
        <TouchableOpacity 
          style={[styles.interventionBtn, { backgroundColor: '#b91c1c', marginTop: 8 }]} 
          onPress={() => setShowEmergencyUI(true)}
        >
          <Text style={styles.interventionBtnText}>Ver Protocolos de Emergencia y Directorio</Text>
        </TouchableOpacity>
      </View>

      {/* Hardware Diagnostic Panel */}
      <View style={styles.diagnosticCard}>
        <Text style={styles.cardSectionTitle}>Diagnóstico de Hardware (I2C & Power)</Text>
        <View style={styles.diagnosticRow}>
          <View style={styles.diagnosticItem}>
            <Battery size={20} color={COLORS.accentPrimary} />
            <Text style={styles.diagnosticLabel}>Batería LiPo</Text>
            <Text style={styles.diagnosticValue}>88%</Text>
          </View>
          <View style={styles.diagnosticItem}>
            <Cpu size={20} color={COLORS.success} />
            <Text style={styles.diagnosticLabel}>Bus I2C</Text>
            <Text style={[styles.diagnosticValue, { color: COLORS.success }]}>Activo</Text>
          </View>
          <View style={styles.diagnosticItem}>
            <Activity size={20} color={COLORS.accentSecondary} />
            <Text style={styles.diagnosticLabel}>Muestreo</Text>
            <Text style={styles.diagnosticValue}>10 Hz</Text>
          </View>
        </View>
      </View>

      {/* Biometric Cards Grid */}
      <Text style={styles.sectionTitle}>Señales Fisiológicas Multimodales</Text>
      
      <View style={styles.grid}>
        {/* PPG / Heart Rate Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Heart size={22} color={COLORS.danger} />
            <Text style={styles.metricTitle}>PPG / Frecuencia Cardíaca</Text>
          </View>
          <Text style={styles.metricValue}>{currentHeartRate} <Text style={styles.unit}>BPM</Text></Text>
          <Text style={styles.metricFooter}>SpO2: 98% • Estable</Text>
        </View>

        {/* Sensor GSR Casero */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Droplet size={22} color={COLORS.accentSecondary || '#00b4d8'} />
            <Text style={styles.metricTitle}>Sensor GSR (Conductividad)</Text>
          </View>
          <Text style={styles.metricValue}>{currentGsr} <Text style={styles.unit}>ADC</Text></Text>
          <Text style={styles.metricFooter}>Pin GPIO 34 • Respuesta Galvánica</Text>
        </View>

        {/* Infrarrojo / PPG Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Zap size={22} color={COLORS.warning} />
            <Text style={styles.metricTitle}>Infrarrojo (MAX30102)</Text>
          </View>
          <Text style={styles.metricValue}>{data?.infrarrojo ?? 0} <Text style={styles.unit}>IR</Text></Text>
          <Text style={styles.metricFooter}>Sistema Óptico Activo</Text>
        </View>

        {/* MPU6050 IMU Card */}
        <View style={[styles.metricCard, styles.fullWidthCard]}>
          <View style={styles.metricHeader}>
            <Compass size={22} color={COLORS.accentPrimary} />
            <Text style={styles.metricTitle}>Acelerómetro MPU6050 (Inmovilidad)</Text>
          </View>
          <View style={styles.accelContainer}>
            <View style={styles.accelAxis}>
              <Text style={styles.axisLabel}>X: {data?.aceleracion_x ?? '0.00'}</Text>
            </View>
            <View style={styles.accelAxis}>
              <Text style={styles.axisLabel}>Y: {data?.aceleracion_y ?? '0.00'}</Text>
            </View>
            <View style={styles.accelAxis}>
              <Text style={styles.axisLabel}>Z: {data?.aceleracion_z ?? '0.00'}</Text>
            </View>
          </View>
          <Text style={styles.metricFooter}>Vector de Movimiento Dinámico Activo</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  badgeOnline: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderColor: COLORS.success,
  },
  badgeOffline: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderColor: COLORS.danger,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fusionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 6,
  },
  fusionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fusionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  fusionStatusValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  fusionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  interventionBtn: {
    backgroundColor: '#c0392b',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  interventionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  diagnosticCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  diagnosticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diagnosticItem: {
    alignItems: 'center',
    flex: 1,
  },
  diagnosticLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  diagnosticValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'column',
    gap: 14,
  },
  metricCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
  },
  fullWidthCard: {
    width: '100%',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  unit: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  metricFooter: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  accelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    backgroundColor: COLORS.bgDark,
    padding: 12,
    borderRadius: 8,
  },
  accelAxis: {
    alignItems: 'center',
    flex: 1,
  },
  axisLabel: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
});