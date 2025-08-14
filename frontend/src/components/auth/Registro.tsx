import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { RegistroProps, DatosRegistro } from '@/types';

const Registro: React.FC<RegistroProps> = ({ onSubmit, loading, isDarkMode }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);

  const manejarEnvio = () => {
    if (!nombre.trim() || !email.trim() || !contrasena.trim() || !confirmarContrasena.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (contrasena.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const datosRegistro: DatosRegistro = {
      nombre: nombre.trim(),
      email: email.trim(),
      contrasena,
      confirmarContrasena,
      tipoUsuario: 'usuario',
    };

    onSubmit(datosRegistro);
  };

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, themeStyles.label]}>Nombre completo</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          placeholder="Ingresa tu nombre completo"
          placeholderTextColor={isDarkMode ? '#94a3b8' : '#64748b'}
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!loading}
        />
      </View>

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
        <View style={[styles.passwordContainer, themeStyles.input]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Crea una contraseña"
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

      <View style={styles.inputContainer}>
        <Text style={[styles.label, themeStyles.label]}>Confirmar contraseña</Text>
        <View style={[styles.passwordContainer, themeStyles.input]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirma tu contraseña"
            placeholderTextColor={isDarkMode ? '#94a3b8' : '#64748b'}
            value={confirmarContrasena}
            onChangeText={setConfirmarContrasena}
            secureTextEntry={!mostrarConfirmarContrasena}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
            disabled={loading}
          >
            <Text style={[styles.toggleText, themeStyles.toggleText]}>
              {mostrarConfirmarContrasena ? 'Ocultar' : 'Mostrar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.passwordRequirements}>
        <Text style={[styles.requirementText, themeStyles.secondaryText]}>
          • La contraseña debe tener al menos 6 caracteres
        </Text>
        <Text style={[styles.requirementText, themeStyles.secondaryText]}>
          • Las contraseñas deben coincidir
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          loading && styles.submitButtonDisabled,
        ]}
        onPress={manejarEnvio}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
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
    color: 'inherit',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  passwordRequirements: {
    marginBottom: 24,
  },
  requirementText: {
    fontSize: 12,
    marginBottom: 4,
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
  secondaryText: {
    color: '#64748b',
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
  secondaryText: {
    color: '#94a3b8',
  },
});

export default Registro;