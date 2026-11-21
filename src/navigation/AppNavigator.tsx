import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../api/firebase';
import { COLORS } from '../theme/colors';

// Importación de pantallas (Módulos 1 al 5 y Doctor)
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { CalmScreen } from '../screens/Calm/CalmScreen';
import { EmergencyScreen } from '../screens/Emergency/EmergencyScreen';
import { HistoryScreen } from '../screens/History/HistoryScreen';
import { DoctorDashboardScreen } from '../screens/Dashboard/DoctorDashboardScreen'; // <-- IMPORTANTE: Importamos el panel del doctor

// Iconos
import { Activity, Wind, ShieldAlert, Calendar } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const MainTabs = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.cardBg,
          borderTopColor: COLORS.border,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.accentPrimary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Telemetría" 
        children={() => <DashboardScreen onLogout={onLogout} />} 
        options={{
          tabBarIcon: ({ color, size }) => <Activity size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Calm UI" 
        component={CalmScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Wind size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Emergencia" 
        component={EmergencyScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <ShieldAlert size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="Histórico" 
        component={HistoryScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Consultar el rol del usuario en la base de datos de Firebase
        try {
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserRole(userData.role || 'patient');
          } else {
            setUserRole('patient');
          }
        } catch (error) {
          console.error("Error al obtener el rol:", error);
          setUserRole('patient');
        }
      } else {
        setUserRole(null);
      }

      if (initializing) setInitializing(false);
    });

    return subscriber;
  }, [initializing]);

  // Función global para cerrar sesión desde cualquier rol
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (initializing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.accentPrimary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        userRole === 'doctor' ? (
          // CORREGIDO: Ahora sí carga exclusivamente el panel especializado del doctor con su función de salida
          <DoctorDashboardScreen onLogout={handleLogout} />
        ) : (
          // Si es paciente, cargamos las pestañas normales pasando el logout
          <MainTabs onLogout={handleLogout} />
        )
      ) : (
        <LoginScreen onLoginSuccess={(role) => setUserRole(role)} />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});