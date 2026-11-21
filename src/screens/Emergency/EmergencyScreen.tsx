import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Linking, Modal, TextInput, Alert 
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { 
  AlertTriangle, PhoneCall, ShieldAlert, Clock, 
  UserCheck, Plus, Edit2, Trash2, X, ArrowLeft 
} from 'lucide-react-native';

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
}

interface EmergencyScreenProps {
  onBack?: () => void;
}

export const EmergencyScreen = ({ onBack }: EmergencyScreenProps) => {
  // Estado inicial con los contactos por defecto
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Dr. Carlos Mendoza (Psiquiatría)',
      role: 'Especialista de Cabecera',
      phone: '+525512345678',
    },
    {
      id: '2',
      name: 'Línea de Apoyo Emocional 24/7',
      role: 'Centro de Respuesta Inmediata',
      phone: '911',
    },
  ]);

  // Estados para controlar el Modal de Agregar / Editar
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  const callEmergencyContact = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  // Abrir modal para agregar nuevo
  const openAddModal = () => {
    setEditingContact(null);
    setNameInput('');
    setRoleInput('');
    setPhoneInput('');
    setModalVisible(true);
  };

  // Abrir modal para editar existente
  const openEditModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setNameInput(contact.name);
    setRoleInput(contact.role);
    setPhoneInput(contact.phone);
    setModalVisible(true);
  };

  // Guardar contacto nuevo o editado
  const handleSaveContact = () => {
    if (!nameInput.trim() || !phoneInput.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa al menos un nombre y un número de teléfono.');
      return;
    }

    if (editingContact) {
      // Actualizar contacto existente
      setContacts(contacts.map(c => 
        c.id === editingContact.id 
          ? { ...c, name: nameInput, role: roleInput || 'Contacto de Emergencia', phone: phoneInput }
          : c
      ));
    } else {
      // Crear nuevo contacto
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        name: nameInput,
        role: roleInput || 'Contacto Personal',
        phone: phoneInput,
      };
      setContacts([...contacts, newContact]);
    }

    setModalVisible(false);
  };

  // Eliminar contacto
  const handleDeleteContact = (id: string) => {
    Alert.alert(
      'Eliminar contacto',
      '¿Estás seguro de que deseas eliminar este contacto de emergencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: () => setContacts(contacts.filter(c => c.id !== id)) 
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Botón para regresar al Dashboard */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={18} color={COLORS.textPrimary} />
          <Text style={styles.backButtonText}>Volver a Telemetría</Text>
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <ShieldAlert size={32} color={COLORS.danger} />
        <Text style={styles.title}>Protocolos de Emergencia</Text>
        <Text style={styles.subtitle}>Sistema Autónomo de Detección de Pánico Inverso</Text>
      </View>

      {/* Autonomous Status Card */}
      <View style={styles.alertActiveCard}>
        <View style={styles.alertCardHeader}>
          <AlertTriangle size={24} color={COLORS.warning} />
          <Text style={styles.alertCardTitle}>Vigilancia Activa de Crisis</Text>
        </View>
        <Text style={styles.alertCardDescription}>
          El algoritmo cruza picos de conductancia dérmica (GSR) con inmovilidad prolongada del MPU6050. No se han detectado falsos positivos críticos en las últimas 24 horas.
        </Text>
      </View>

      {/* Cabecera de Contactos + Botón Agregar */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Directorio de Contactos</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus size={16} color={COLORS.bgDark} />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista Dinámica de Contactos */}
      {contacts.map((contact) => (
        <View key={contact.id} style={styles.contactCard}>
          <View style={styles.contactInfo}>
            <UserCheck size={20} color={COLORS.accentPrimary} />
            <View style={styles.contactTextWrapper}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRole}>{contact.role}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {/* Botón Editar */}
            <TouchableOpacity style={styles.iconButton} onPress={() => openEditModal(contact)}>
              <Edit2 size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Botón Eliminar */}
            <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteContact(contact.id)}>
              <Trash2 size={16} color={COLORS.danger} />
            </TouchableOpacity>

            {/* Botón Llamar */}
            <TouchableOpacity style={styles.callButton} onPress={() => callEmergencyContact(contact.phone)}>
              <PhoneCall size={18} color={COLORS.bgDark} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Critical Events Log */}
      <Text style={styles.sectionTitle}>Bitácora Histórica de Eventos Críticos</Text>
      
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <Clock size={16} color={COLORS.textSecondary} />
          <Text style={styles.logTime}>14 de Mayo, 16:42 hrs</Text>
          <Text style={styles.logBadge}>Pánico Inverso Mitigado</Text>
        </View>
        <Text style={styles.logDetails}>HRV Drop (-35%) + GSR Peak (2.1µS) + Inmovilidad (120s). Háptico activado automáticamente.</Text>
      </View>

      {/* Modal para Agregar o Editar Contacto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingContact ? 'Editar Contacto' : 'Nuevo Contacto de Emergencia'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nombre o Institución *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Mamá / Dr. Pérez"
              placeholderTextColor={COLORS.textSecondary}
              value={nameInput}
              onChangeText={setNameInput}
            />

            <Text style={styles.inputLabel}>Rol o Parentesco</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Contacto Familiar / Especialista"
              placeholderTextColor={COLORS.textSecondary}
              value={roleInput}
              onChangeText={setRoleInput}
            />

            <Text style={styles.inputLabel}>Número de Teléfono *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. +584141234567"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
              value={phoneInput}
              onChangeText={setPhoneInput}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveContact}>
              <Text style={styles.saveButtonText}>Guardar Contacto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { padding: 20, paddingBottom: 40 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    gap: 6,
  },
  backButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 5 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginTop: 8 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2 },
  alertActiveCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.warning,
    marginBottom: 24,
  },
  alertCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  alertCardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.warning, marginLeft: 10 },
  alertCardDescription: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12, marginTop: 8 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: { color: COLORS.bgDark, fontWeight: '700', fontSize: 13 },
  contactCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
  contactTextWrapper: { marginLeft: 10, flex: 1 },
  contactName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  contactRole: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  contactPhone: { fontSize: 12, color: COLORS.accentPrimary, marginTop: 2, fontWeight: '500' },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  callButton: { backgroundColor: COLORS.accentPrimary, padding: 10, borderRadius: 10, marginLeft: 2 },
  logCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  logHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  logTime: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 6, flex: 1 },
  logBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  logDetails: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 16 },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  inputLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: COLORS.bgDark,
    color: COLORS.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: { color: COLORS.bgDark, fontWeight: '700', fontSize: 15 },
});