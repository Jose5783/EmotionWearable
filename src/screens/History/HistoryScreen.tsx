import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../../theme/colors';
import { Calendar, TrendingUp, Tag, Check, PlusCircle } from 'lucide-react-native';

export const HistoryScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);

  const triggers = ['Carga Laboral', 'Conflicto Familiar', 'Insomnio Crónico', 'Sobrecarga Sensorial', 'Desconocido'];

  const handleSelectTrigger = (trigger: string) => {
    setSelectedTrigger(trigger);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Calendar size={28} color={COLORS.accentPrimary} />
        <Text style={styles.title}>Histórico Longitudinal</Text>
        <Text style={styles.subtitle}>Diario Emocional y Correlación Clínica</Text>
      </View>

      {/* Post-Alert Context Prompt Card */}
      <View style={styles.promptCard}>
        <View style={styles.promptHeader}>
          <Tag size={20} color={COLORS.warning} />
          <Text style={styles.promptTitle}>Contexto Post-Alerta Reciente</Text>
        </View>
        <Text style={styles.promptDescription}>
          Ayude al especialista cruzando sus datos objetivos con su factor desencadenante subjetivo.
        </Text>
        
        <TouchableOpacity style={styles.promptButton} onPress={() => setModalVisible(true)}>
          <PlusCircle size={18} color={COLORS.bgDark} />
          <Text style={styles.promptButtonText}>
            {selectedTrigger ? `Registrado: ${selectedTrigger}` : 'Seleccionar Factor Desencadenante'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Longitudinal Stats Overview */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <TrendingUp size={22} color={COLORS.accentSecondary} />
          <Text style={styles.statsTitle}>Tendencia Semanal del SNA</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Promedio Frecuencia Cardíaca:</Text>
          <Text style={styles.statVal}>74.2 BPM</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Picos de Conductancia (GSR):</Text>
          <Text style={styles.statVal}>1.4 µS (Estable)</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Estabilidad Emocional Global:</Text>
          <Text style={[styles.statVal, { color: COLORS.success }]}>88%</Text>
        </View>
      </View>

      {/* History Journal List */}
      <Text style={styles.sectionTitle}>Entradas Anteriores del Diario</Text>

      {[
        { date: '13 May, 2026', trigger: 'Carga Laboral', hr: '82 BPM', status: 'Mitigado' },
        { date: '11 May, 2026', trigger: 'Insomnio Crónico', hr: '78 BPM', status: 'Mitigado' },
        { date: '09 May, 2026', trigger: 'Conflicto Familiar', hr: '85 BPM', status: 'Mitigado' },
      ].map((item, index) => (
        <View key={index} style={styles.journalItem}>
          <View>
            <Text style={styles.journalDate}>{item.date}</Text>
            <Text style={styles.journalTrigger}>Factor: {item.trigger}</Text>
          </View>
          <View style={styles.journalMeta}>
            <Text style={styles.journalHr}>{item.hr}</Text>
            <Text style={styles.journalStatus}>{item.status}</Text>
          </View>
        </View>
      ))}

      {/* Trigger Selection Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione Factor Desencadenante</Text>
            {triggers.map((trig, idx) => (
              <TouchableOpacity key={idx} style={styles.modalOption} onPress={() => handleSelectTrigger(trig)}>
                <Text style={styles.modalOptionText}>{trig}</Text>
                {selectedTrigger === trig && <Check size={18} color={COLORS.accentPrimary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  promptCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  promptDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  promptButton: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptButtonText: {
    color: COLORS.bgDark,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  statsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  journalItem: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  journalDate: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  journalTrigger: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  journalMeta: {
    alignItems: 'flex-end',
  },
  journalHr: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accentPrimary,
  },
  journalStatus: {
    fontSize: 11,
    color: COLORS.success,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalOptionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});
