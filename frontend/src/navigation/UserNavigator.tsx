import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../hooks/useResponsive';
import { useDarkMode } from '../hooks/useDarkMode';
import { colors } from '../styles/colors';


// Componentes
import Dashboard from '../components/user/Dashboard';
import Transacciones from '../components/user/Transacciones';
import Ingresos from '../components/user/Ingresos';
import Gastos from '../components/user/Gastos';
import Facturas from '../components/user/Facturas';
import Objetivos from '../components/user/Objetivos';
import {Configuracion} from '../components/user/Configuracion';
import {Perfil} from '../components/user/Perfil';

export type UserTabParamList = {
  Dashboard: undefined;
  Transacciones: undefined;
  Ingresos: undefined;
  Gastos: undefined;
  Facturas: undefined;
  Objetivos: undefined;
  Configuracion: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<UserTabParamList>();
const Stack = createNativeStackNavigator();

interface UserNavigatorProps {
  onAuthChange: (isAuth: boolean) => void;
  onRoleChange: (role: number | null) => void;
}

const MainTabNavigator: React.FC<UserNavigatorProps> = ({
  onAuthChange,
  onRoleChange,
}) => {
  const { isTablet } = useResponsive();
  const [isDarkMode] = useDarkMode();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? colors.dark.surface : colors.light.surface,
          borderTopColor: isDarkMode ? colors.dark.border : colors.light.border,
          height: isTablet ? 70 : 60,
          paddingBottom: isTablet ? 10 : 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary,
        tabBarLabelStyle: {
          fontSize: isTablet ? 14 : 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Transacciones':
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              break;
            case 'Ingresos':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case 'Gastos':
              iconName = focused ? 'trending-down' : 'trending-down-outline';
              break;
            case 'Facturas':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Objetivos':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Configuracion':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            case 'Perfil':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={isTablet ? size + 4 : size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        options={{ tabBarLabel: 'Inicio' }}
      >
        {(props) => (
          <Dashboard 
            {...props} 
            onAuthChange={onAuthChange}
            onRoleChange={onRoleChange}
          />
        )}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Transacciones" 
        options={{ tabBarLabel: 'Transacciones' }}
      >
        {(props) => (
          <Transacciones 
            {...props} 
            onAuthChange={onAuthChange}
          />
        )}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Ingresos" 
        options={{ tabBarLabel: 'Ingresos' }}
      >
        {(props) => (
          <Ingresos 
            {...props} 
            onAuthChange={onAuthChange}
          />
        )}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Gastos" 
        options={{ tabBarLabel: 'Gastos' }}
      >
        {(props) => (
          <Gastos 
            {...props} 
            onAuthChange={onAuthChange}
          />
        )}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Facturas" 
        options={{ tabBarLabel: 'Facturas' }}
      >
        {(props) => (
          <Facturas 
            {...props} 
            onAuthChange={onAuthChange}
          />
        )}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Objetivos" 
        options={{ tabBarLabel: 'Objetivos' }}
      >
        {(props) => (
          <Objetivos 
            {...props} 
            onAuthChange={onAuthChange}
          />
        )}
      </Tab.Screen>
      
      <Tab.Screen name="Configuracion" options={{ tabBarLabel: 'Configuración' }}>
        {(props) => <Configuracion {...props} onAuthChange={onAuthChange} />}
      </Tab.Screen>
      
      <Tab.Screen name="Perfil" options={{ tabBarLabel: 'Perfil' }}>
        {(props) => <Perfil {...props} onAuthChange={onAuthChange} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const UserNavigator: React.FC<UserNavigatorProps> = (props) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => <MainTabNavigator {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default UserNavigator;