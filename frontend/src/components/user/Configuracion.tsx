import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { RouteProp } from '@react-navigation/native';
import { UserTabParamList } from '@/navigation/UserNavigator'; // Adjust path as needed

interface ConfiguracionProps {
  route: RouteProp<UserTabParamList, 'Configuracion'>;
  navigation: any; // or proper navigation type
  onAuthChange: (isAuth: boolean) => void;
}

interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

interface ConfiguracionItem {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: 'toggle' | 'navegacion' | 'accion';
  icono: string;
  valor?: boolean;
  onPress?: () => void;
  onToggle?: (valor: boolean) => void;
}

export const Configuracion: React.FC<ConfiguracionProps> = ({ route, navigation, onAuthChange }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [datosUsuario, setDatosUsuario] = useState<Usuario | null>(null);
  const [notificacionesEmail, setNotificacionesEmail] = useState(false);
  const [notificacionesPush, setNotificacionesPush] = useState(true);
  const [sincronizacionAutomatica, setSincronizacionAutomatica] = useState(true);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatosUsuario();
    cargarConfiguraciones();
  }, []);

  const cargarDatosUsuario = async () => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem('usuario');
      if (usuarioGuardado) {
        setDatosUsuario(JSON.parse(usuarioGuardado));
      }
    } catch (error) {
      console.error('Error cargando datos de usuario:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarConfiguraciones = async () => {
    try {
      const notifEmail = await AsyncStorage.getItem('notificacionesEmail');
      const notifPush = await AsyncStorage.getItem('notificacionesPush');
      const sincronAuto = await AsyncStorage.getItem('sincronizacionAutomatica');

      if (notifEmail !== null) setNotificacionesEmail(JSON.parse(notifEmail));
      if (notifPush !== null) setNotificacionesPush(JSON.parse(notifPush));
      if (sincronAuto !== null) setSincronizacionAutomatica(JSON.parse(sincronAuto));
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    }
  };

  const guardarConfiguracion = async (clave: string, valor: boolean) => {
    try {
      await AsyncStorage.setItem(clave, JSON.stringify(valor));
    } catch (error) {
      console.error('Error guardando configuración:', error);
    }
  };

  const handleToggleNotificacionesEmail = (valor: boolean) => {
    setNotificacionesEmail(valor);
    guardarConfiguracion('notificacionesEmail', valor);
  };

  const handleToggleNotificacionesPush = (valor: boolean) => {
    setNotificacionesPush(valor);
    guardarConfiguracion('notificacionesPush', valor);
  };

  const handleToggleSincronizacion = (valor: boolean) => {
    setSincronizacionAutomatica(valor);
    guardarConfiguracion('sincronizacionAutomatica', valor);
  };

  const handleCambiarContrasena = () => {
    Alert.alert(
      'Cambiar Contraseña',
      'Se enviará un enlace de restablecimiento a tu correo electrónico.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => console.log('Enviando enlace...') }
      ]
    );
  };

  const handleExportarDatos = () => {
    Alert.alert(
      'Exportar Datos',
      'Tus datos se exportarán en formato JSON.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Exportar', onPress: () => console.log('Exportando datos...') }
      ]
    );
  };

  const handleEliminarCuenta = () => {
    Alert.alert(
      'Eliminar Cuenta',
      'Esta acción es irreversible. Se eliminarán todos tus datos permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => console.log('Eliminando cuenta...')
        }
      ]
    );
  };

  const handleAbrirSoporte = () => {
    Linking.openURL('mailto:soporte@aureum.app');
  };

  const handleAbrirTerminos = () => {
    Linking.openURL('https://aureum.app/terminos');
  };

  const handleAbrirPrivacidad = () => {
    Linking.openURL('https://aureum.app/privacidad');
  };

  const configuracionItems: ConfiguracionItem[] = [
    {
      id: 'darkMode',
      titulo: 'Modo Oscuro',
      descripcion: 'Activa o desactiva el tema oscuro de la aplicación',
      tipo: 'toggle',
      icono: isDarkMode ? 'moon' : 'sunny',
      valor: isDarkMode,
      onToggle: toggleTheme,
    },
    {
      id: 'notifEmail',
      titulo: 'Notificaciones por Email',
      descripcion: 'Recibir notificaciones importantes por correo electrónico',
      tipo: 'toggle',
      icono: 'mail',
      valor: notificacionesEmail,
      onToggle: handleToggleNotificacionesEmail,
    },
    {
      id: 'notifPush',
      titulo: 'Notificaciones Push',
      descripcion: 'Recibir notificaciones en el dispositivo',
      tipo: 'toggle',
      icono: 'notifications',
      valor: notificacionesPush,
      onToggle: handleToggleNotificacionesPush,
    },
    {
      id: 'sincronizacion',
      titulo: 'Sincronización Automática',
      descripcion: 'Sincronizar datos automáticamente en segundo plano',
      tipo: 'toggle',
      icono: 'sync',
      valor: sincronizacionAutomatica,
      onToggle: handleToggleSincronizacion,
    },
  ];

  const seguridadItems: ConfiguracionItem[] = [
    {
      id: 'cambiarContrasena',
      titulo: 'Cambiar Contraseña',
      descripcion: 'Actualizar tu contraseña de acceso',
      tipo: 'navegacion',
      icono: 'lock-closed',
      onPress: handleCambiarContrasena,
    },
    {
      id: 'exportarDatos',
      titulo: 'Exportar Mis Datos',
      descripcion: 'Descargar una copia de tu información',
      tipo: 'navegacion',
      icono: 'download',
      onPress: handleExportarDatos,
    },
  ];

  const soporteItems: ConfiguracionItem[] = [
    {
      id: 'soporte',
      titulo: 'Contactar Soporte',
      descripcion: 'Obtener ayuda del equipo de soporte',
      tipo: 'navegacion',
      icono: 'help-circle',
      onPress: handleAbrirSoporte,
    },
    {
      id: 'terminos',
      titulo: 'Términos y Condiciones',
      tipo: 'navegacion',
      icono: 'document-text',
      onPress: handleAbrirTerminos,
    },
    {
      id: 'privacidad',
      titulo: 'Política de Privacidad',
      tipo: 'navegacion',
      icono: 'shield-checkmark',
      onPress: handleAbrirPrivacidad,
    },
  ];

  const renderConfiguracionItem = (item: ConfiguracionItem) => {
    const themeStyles = isDarkMode ? darkStyles : lightStyles;

    return (
      <View key={item.id} style={[styles.itemContainer, themeStyles.itemContainer]}>
        <View style={styles.itemContent}>
          <View style={[styles.iconContainer, themeStyles.iconContainer]}>
            <Ionicons 
              name={item.icono as any} 
              size={20} 
              color={isDarkMode ? '#f59e0b' : '#f59e0b'} 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.itemTitle, themeStyles.itemTitle]}>
              {item.titulo}
            </Text>
            {item.descripcion && (
              <Text style={[styles.itemDescription, themeStyles.itemDescription]}>
                {item.descripcion}
              </Text>
            )}
          </View>
          {item.tipo === 'toggle' && (
            <Switch
              value={item.valor}
              onValueChange={item.onToggle}
              trackColor={{ false: '#767577', true: '#f59e0b' }}
              thumbColor={item.valor ? '#ffffff' : '#f4f3f4'}
            />
          )}
          {item.tipo === 'navegacion' && (
            <TouchableOpacity onPress={item.onPress}>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDarkMode ? '#94a3b8' : '#64748b'} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  if (cargando) {
    return (
      <SafeAreaView style={[styles.container, themeStyles.container]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, themeStyles.text]}>Cargando configuración...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <View style={[styles.header, themeStyles.header]}>
        <Text style={[styles.headerTitle, themeStyles.headerTitle]}>Configuración</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Información del Usuario */}
        {datosUsuario && (
          <View style={[styles.userSection, themeStyles.card]}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {datosUsuario.nombre.substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={[styles.userName, themeStyles.text]}>
                  {datosUsuario.nombre}
                </Text>
                <Text style={[styles.userEmail, themeStyles.secondaryText]}>
                  {datosUsuario.email}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Sección General */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, themeStyles.sectionTitle]}>General</Text>
          <View style={[styles.sectionCard, themeStyles.card]}>
            {configuracionItems.map(renderConfiguracionItem)}
          </View>
        </View>

        {/* Sección Seguridad */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, themeStyles.sectionTitle]}>Seguridad y Datos</Text>
          <View style={[styles.sectionCard, themeStyles.card]}>
            {seguridadItems.map(renderConfiguracionItem)}
          </View>
        </View>

        {/* Sección Soporte */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, themeStyles.sectionTitle]}>Soporte y Legal</Text>
          <View style={[styles.sectionCard, themeStyles.card]}>
            {soporteItems.map(renderConfiguracionItem)}
          </View>
        </View>

        {/* Zona de Peligro */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Zona de Peligro</Text>
          <View style={[styles.sectionCard, themeStyles.card]}>
            <TouchableOpacity 
              style={[styles.itemContainer, themeStyles.itemContainer]}
              onPress={handleEliminarCuenta}
            >
              <View style={styles.itemContent}>
                <View style={[styles.iconContainer, styles.dangerIconContainer]}>
                  <Ionicons name="trash" size={20} color="#ef4444" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.itemTitle, styles.dangerText]}>
                    Eliminar Cuenta
                  </Text>
                  <Text style={[styles.itemDescription, themeStyles.itemDescription]}>
                    Eliminar permanentemente tu cuenta y todos los datos
                  </Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color="#ef4444" 
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información de la App */}
        <View style={styles.appInfoSection}>
          <Text style={[styles.appInfoText, themeStyles.secondaryText]}>
            Aureum v1.0.0
          </Text>
          <Text style={[styles.appInfoText, themeStyles.secondaryText]}>
            © 2025 Aureum. Todos los derechos reservados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userSection: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemContainer: {
    borderBottomWidth: 1,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 14,
  },
  dangerTitle: {
    color: '#ef4444',
  },
  dangerIconContainer: {
    backgroundColor: '#fef2f2',
  },
  dangerText: {
    color: '#ef4444',
  },
  appInfoSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});

const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    color: '#1e293b',
  },
  card: {
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  text: {
    color: '#1e293b',
  },
  secondaryText: {
    color: '#64748b',
  },
  sectionTitle: {
    color: '#1e293b',
  },
  itemContainer: {
    borderBottomColor: '#f1f5f9',
  },
  itemTitle: {
    color: '#1e293b',
  },
  itemDescription: {
    color: '#64748b',
  },
  iconContainer: {
    backgroundColor: '#f8fafc',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  headerTitle: {
    color: '#f1f5f9',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  text: {
    color: '#f1f5f9',
  },
  secondaryText: {
    color: '#94a3b8',
  },
  sectionTitle: {
    color: '#f1f5f9',
  },
  itemContainer: {
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  itemTitle: {
    color: '#f1f5f9',
  },
  itemDescription: {
    color: '#94a3b8',
  },
  iconContainer: {
    backgroundColor: '#334155',
  },
});