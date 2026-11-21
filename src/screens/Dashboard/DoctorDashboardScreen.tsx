import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { COLORS } from '../../theme/colors';
import { Stethoscope, Clock, User, LogOut, ShieldCheck, Activity, Users } from 'lucide-react-native';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../../api/firebase';

interface DoctorDashboardProps {
  onLogout: () => void;
}

interface CrisisLog {
  id: string;
  timestamp: string;
  fechaLegible: string;
  diagnostico: string;
  detalles: string;
}

interface PatientData {
  uid: string;
  name: string;
  LastName: string;
  age: number | string;
  email: string;
}

export const DoctorDashboardScreen = ({ onLogout }: DoctorDashboardProps) => {
  const [patientsList, setPatientsList] = useState<PatientData[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [crisisLogs, setCrisisLogs] = useState<CrisisLog[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // 1. Cargar la lista completa de pacientes registrados en Firebase
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const patientsArray: PatientData[] = Object.keys(usersData)
            .map((key) => ({
              uid: key,
              ...usersData[key],
            }))
            .filter((user) => user.role === 'patient' || !user.role);

          setPatientsList(patientsArray);
          
          // Por defecto, seleccionamos al primer paciente si existe
          if (patientsArray.length > 0) {
            setSelectedPatient(patientsArray[0]);
          }
        }
      } catch (error) {
        console.error("Error al cargar la lista de pacientes:", error);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  // 2. Cargar la bitácora de crisis en tiempo real del paciente seleccionado
  useEffect(() => {
    if (!selectedPatient) return;

    setLoadingLogs(true);
    // Apuntamos a la bitácora específica del paciente usando su UID (o respaldo al nodo general si prefieres)
    const logsRef = ref(db, `bitacora_crisis/${selectedPatient.uid}`);

    const unsubscribe = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const logsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        logsArray.reverse();
        setCrisisLogs(logsArray);
      } else {
        setCrisisLogs([]);
      }
      setLoadingLogs(false);
    }, (error) => {
      console.error('Error al leer la bitácora del paciente:', error);
      setLoadingLogs(false);
    });

    return () => unsubscribe();
  }, [selectedPatient]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cabecera del Doctor */}
      <View style={styles.headerRow}>
        <View style={styles.doctorInfo}>
          <View style={styles.avatarContainer}>
            <Stethoscope size={24} color={COLORS.bgDark} />
          </View>
          <View>
            <Text style={styles.welcomeText}>Panel Médico Especializado</Text>
            <Text style={styles.doctorName}>Dr. Especialista en Monitoreo</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <LogOut size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      {/* Sección: Lista de Pacientes Registrados */}
      <View style={styles.sectionHeader}>
        <Users size={20} color={COLORS.textPrimary} />
        <Text style={styles.sectionTitle}>Pacientes Registrados ({patientsList.length})</Text>
      </View>
      <Text style={styles.sectionSubtitle}>
        Seleccione un paciente para consultar su perfil y bitácora de eventos críticos en tiempo real.
      </Text>

      {loadingPatients ? (
        <ActivityIndicator size="small" color={COLORS.accentPrimary} style={{ marginVertical: 15 }} />
      ) : patientsList.length === 0 ? (
        <Text style={styles.noPatientsText}>No hay pacientes registrados en el sistema.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.patientsScroll}>
          {patientsList.map((patient) => {
            const isSelected = selectedPatient?.uid === patient.uid;
            return (
              <TouchableOpacity
                key={patient.uid}
                style={[styles.patientChip, isSelected && styles.patientChipSelected]}
                onPress={() => setSelectedPatient(patient)}
              >
                <User size={16} color={isSelected ? COLORS.bgDark : COLORS.accentPrimary} />
                <Text style={[styles.patientChipText, isSelected && styles.patientChipTextSelected]}>
                  {patient.name} {patient.LastName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Tarjeta de Información del Paciente Seleccionado */}
      {selectedPatient && (
        <View style={styles.patientCard}>
          <View style={styles.patientCardHeader}>
            <User size={20} color={COLORS.accentPrimary} />
            <Text style={styles.patientCardTitle}>
              {selectedPatient.name} {selectedPatient.LastName}
            </Text>
          </View>
          <Text style={styles.patientCardDetails}>
            Edad: <Text style={{ color: COLORS.textPrimary, fontWeight: '700' }}>{selectedPatient.age || 'N/D'} años</Text>
            {'  |  '}
            Estado: <Text style={{ color: COLORS.success, fontWeight: '700' }}>Conectado (Cloud Sync)</Text>
          </Text>
          <Text style={styles.patientCardSubtext}>
            Correo: {selectedPatient.email}
          </Text>
        </View>
      )}

      {/* Sección de Bitácora Crítica del Paciente */}
      <View style={styles.sectionHeader}>
        <Activity size={20} color={COLORS.textPrimary} />
        <Text style={styles.sectionTitle}>
          Bitácora de {selectedPatient ? selectedPatient.name : 'Paciente'}
        </Text>
      </View>
      <Text style={styles.sectionSubtitle}>
        Registro de episodios de crisis y alertas biométricas del paciente seleccionado.
      </Text>

      {loadingLogs ? (
        <ActivityIndicator size="large" color={COLORS.accentPrimary} style={{ marginTop: 40 }} />
      ) : crisisLogs.length === 0 ? (
        <View style={styles.emptyCard}>
          <ShieldCheck size={40} color={COLORS.success} />
          <Text style={styles.emptyTitle}>Sin eventos críticos</Text>
          <Text style={styles.emptyText}>
            Este paciente no presenta episodios registrados en su bitácora.
          </Text>
        </View>
      ) : (
        crisisLogs.map((log) => (
          <View key={log.id} style={styles.logCard}>
            <View style={styles.logHeader}>
              <Clock size={15} color={COLORS.textSecondary} />
              <Text style={styles.logTime}>{log.fechaLegible || 'Fecha no registrada'}</Text>
              <Text style={styles.logBadge}>{log.diagnostico || 'Crisis Detectada'}</Text>
            </View>
            <Text style={styles.logDetails}>{log.detalles}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  logoutButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  noPatientsText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 15,
  },
  patientsScroll: {
    marginBottom: 20,
  },
  patientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
  },
  patientChipSelected: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  patientChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  patientChipTextSelected: {
    color: COLORS.bgDark,
  },
  patientCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  patientCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  patientCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  patientCardDetails: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  patientCardSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  emptyCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  logCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  logTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  logBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  logDetails: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
});