import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../../api/firebase';
import { COLORS } from '../../theme/colors';
import { ShieldCheck, Lock, Mail, Cpu, User, Calendar, Stethoscope, Key } from 'lucide-react-native';

export const LoginScreen = ({ onLoginSuccess }: { onLoginSuccess: (role: 'patient' | 'doctor') => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [doctorCode, setDoctorCode] = useState(''); // Estado para el código secreto de doctor
  
  // Rol seleccionado: 'patient' o 'doctor'
  const [userRole, setUserRole] = useState<'patient' | 'doctor'>('patient');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Por favor ingrese correo y contraseña');
      return;
    }

    if (userRole === 'doctor' && doctorCode !== '2026') {
      setError('Código de autorización de doctor incorrecto. Acceso denegado.');
      return;
    }

    if (isRegistering && (!name || !lastName || !age)) {
      setError('Por favor complete todos los datos de registro (Nombre, Apellido y Edad)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        // 1. Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Guardar metadatos extendidos en la Realtime Database
        await set(ref(db, `users/${user.uid}`), {
          name,
          lastName,
          age: parseInt(age, 10),
          email,
          role: userRole,
          createdAt: new Date().toISOString()
        });

      } else {
        // Iniciar sesión normal
        await signInWithEmailAndPassword(auth, email, password);
      }

      // Notificamos el rol con el que ingresó
      onLoginSuccess(userRole);
    } catch (err: any) {
      setError(err.message || 'Error de autenticación biométrica');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Cpu size={48} color={COLORS.accentPrimary} strokeWidth={1.5} />
          <Text style={styles.title}>MindCheck Biometrics</Text>
          <Text style={styles.subtitle}>Reconocimiento Multimodal de Emociones</Text>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Selector de Rol (Paciente / Doctor) */}
          <Text style={styles.sectionLabel}>Seleccione su Perfil:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleButton, userRole === 'patient' && styles.roleButtonActive]}
              onPress={() => setUserRole('patient')}
            >
              <User size={18} color={userRole === 'patient' ? COLORS.bgDark : COLORS.textPrimary} />
              <Text style={[styles.roleText, userRole === 'patient' && styles.roleTextActive]}>Paciente</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleButton, userRole === 'doctor' && styles.roleButtonActive]}
              onPress={() => setUserRole('doctor')}
            >
              <Stethoscope size={18} color={userRole === 'doctor' ? COLORS.bgDark : COLORS.textPrimary} />
              <Text style={[styles.roleText, userRole === 'doctor' && styles.roleTextActive]}>Doctor / Especialista</Text>
            </TouchableOpacity>
          </View>

          {/* Campo de Código Secreto si selecciona Doctor */}
          {userRole === 'doctor' && (
            <View style={styles.inputWrapperDoctor}>
              <Key size={20} color={COLORS.warning} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Código de autorización médico (2026)"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                value={doctorCode}
                onChangeText={setDoctorCode}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Campos adicionales si se está registrando */}
          {isRegistering && (
            <>
              <View style={styles.inputWrapper}>
                <User size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  placeholderTextColor={COLORS.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputWrapper}>
                <User size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Apellido"
                  placeholderTextColor={COLORS.textSecondary}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Calendar size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Edad"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>
            </>
          )}

          <View style={styles.inputWrapper}>
            <Mail size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico clínico"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña de seguridad"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.bgDark} />
            ) : (
              <Text style={styles.buttonText}>
                {isRegistering ? `Completar Registro de ${userRole === 'doctor' ? 'Doctor' : 'Paciente'}` : 'Iniciar Sesión Segura'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={styles.switchButton}>
            <Text style={styles.switchText}>
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo usuario? Crear cuenta con datos clínicos'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ShieldCheck size={16} color={COLORS.success} />
          <Text style={styles.footerText}> Encriptación AES-256 Cloud Sync</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgDark,
    gap: 6,
  },
  roleButtonActive: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  roleText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  roleTextActive: {
    color: COLORS.bgDark,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  inputWrapperDoctor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.warning,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    paddingVertical: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.bgDark,
    fontWeight: '700',
    fontSize: 15,
  },
  switchButton: {
    marginTop: 14,
    alignItems: 'center',
  },
  switchText: {
    color: COLORS.accentSecondary,
    fontSize: 13,
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});