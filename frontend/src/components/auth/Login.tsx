import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { LoginProps, CredencialesLogin } from '@/types';

const Login: React.FC<LoginProps> = ({ onSubmit, loading, isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const manejarEnvio = () => {
    if (!email.trim() || !contrasena.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    const credenciales: CredencialesLogin = {
      email: email.trim(),
      contrasena,
    };

    onSubmit(credenciales);
  };

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, themeStyles.label]}>Email</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Ingresa tu email"
          placeholderTextColor={isDarkMode ? '#94a3b8' : '#64748b'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, themeStyles.label]}>Contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.passwordInput, themeStyles.input]}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor={isDarkMode ? '#94a3b8' : '#64748b'}
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry={!mostrarContrasena}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setMostrarContrasena(!mostrarContrasena)}
            disabled={loading}
          >
            <Text style={[styles.toggleText, themeStyles.toggleText]}>
              {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => Alert.alert('Recuperar contraseña', 'Funcionalidad en desarrollo')}
        disabled={loading}
      >
        <Text style={[styles.forgotPasswordText, themeStyles.linkText]}>
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.submitButton,
          loading && styles.submitButtonDisabled,
        ]}
        onPress={manejarEnvio}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 0,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

const lightStyles = StyleSheet.create({
  label: {
    color: '#1e293b',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    color: '#1e293b',
  },
  toggleText: {
    color: '#f59e0b',
  },
  linkText: {
    color: '#f59e0b',
  },
});

const darkStyles = StyleSheet.create({
  label: {
    color: '#f1f5f9',
  },
  input: {
    backgroundColor: '#334155',
    borderColor: '#475569',
    color: '#f1f5f9',
  },
  toggleText: {
    color: '#f59e0b',
  },
  linkText: {
    color: '#f59e0b',
  },
});

export default Login;