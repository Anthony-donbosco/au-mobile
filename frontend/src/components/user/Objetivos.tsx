import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { formatCurrency, formatDate } from '../../utils/networkUtils';

interface Objetivo {
  id: number;
  nombre: string;
  metaTotal: number;
  ahorroActual: number;
  fechaLimite: string;
  descripcion?: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  categoria: string;
}

interface ObjetivosProps {
  onAuthChange: (isAuth: boolean) => void;
}

const CircularProgress: React.FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}> = ({ percentage, size = 120, strokeWidth = 8, color = colors.primary }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <View style={styles.progressCircle}>
        <View style={[
          styles.progressBackground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
          }
        ]} />
        <View style={[
          styles.progressForeground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            transform: [{ rotate: '-90deg' }],
          }
        ]} />
        <View style={styles.progressText}>
          <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
        </View>
      </View>
    </View>
  );
};

const Objetivos: React.FC<ObjetivosProps> = ({ onAuthChange }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isTablet, wp, hp } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedObjetivo, setSelectedObjetivo] = useState<Objetivo | null>(null);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [nuevoObjetivo, setNuevoObjetivo] = useState({
    nombre: '',
    metaTotal: '',
    fechaLimite: '',
    descripcion: '',
    prioridad: 'Media' as 'Alta' | 'Media' | 'Baja',
    categoria: 'Viaje',
  });

  const categorias = ['Viaje', 'Casa', 'Auto', 'Educación', 'Emergencia', 'Inversión', 'Otros'];
  const prioridades = ['Alta', 'Media', 'Baja'];

  useEffect(() => {
    loadObjetivos();
  }, []);

  const loadObjetivos = async () => {
    try {
      setLoading(true);
      
      // Simular carga de datos
      setTimeout(() => {
        setObjetivos([
          {
            id: 1,
            nombre: 'Viaje a Europa',
            metaTotal: 5000,
            ahorroActual: 3200,
            fechaLimite: '2025-12-31',
            descripcion: 'Viaje de 15 días por Europa visitando París, Roma y Barcelona',
            prioridad: 'Alta',
            categoria: 'Viaje',
          },
          {
            id: 2,
            nombre: 'Fondo de Emergencia',
            metaTotal: 10000,
            ahorroActual: 4500,
            fechaLimite: '2026-06-30',
            descripcion: 'Fondo para gastos inesperados equivalente a 6 meses de gastos',
            prioridad: 'Alta',
            categoria: 'Emergencia',
          },
          {
            id: 3,
            nombre: 'Auto Nuevo',
            metaTotal: 25000,
            ahorroActual: 8000,
            fechaLimite: '2026-12-31',
            descripcion: 'Ahorrar para el down payment de un auto nuevo',
            prioridad: 'Media',
            categoria: 'Auto',
          },
          {
            id: 4,
            nombre: 'Curso de Programación',
            metaTotal: 1500,
            ahorroActual: 1200,
            fechaLimite: '2025-10-15',
            descripcion: 'Bootcamp de desarrollo web full stack',
            prioridad: 'Media',
            categoria: 'Educación',
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.log('Error loading objetivos:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadObjetivos();
    setRefreshing(false);
  };

  const handleAddObjetivo = () => {
    if (!nuevoObjetivo.nombre || !nuevoObjetivo.metaTotal || !nuevoObjetivo.fechaLimite) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const metaTotal = parseFloat(nuevoObjetivo.metaTotal);
    if (isNaN(metaTotal) || metaTotal <= 0) {
      Alert.alert('Error', 'La meta debe ser un número válido mayor a 0');
      return;
    }

    const newObjetivo: Objetivo = {
      id: Date.now(),
      nombre: nuevoObjetivo.nombre,
      metaTotal: metaTotal,
      ahorroActual: 0,
      fechaLimite: nuevoObjetivo.fechaLimite,
      descripcion: nuevoObjetivo.descripcion,
      prioridad: nuevoObjetivo.prioridad,
      categoria: nuevoObjetivo.categoria,
    };

    setObjetivos(prev => [newObjetivo, ...prev]);
    setNuevoObjetivo({ 
      nombre: '', 
      metaTotal: '', 
      fechaLimite: '', 
      descripcion: '', 
      prioridad: 'Media', 
      categoria: 'Viaje' 
    });
    setShowAddModal(false);
    Alert.alert('Éxito', 'Objetivo creado correctamente');
  };

  const handleAddMoney = (objetivoId: number, cantidad: number) => {
    setObjetivos(prev => prev.map(obj => 
      obj.id === objetivoId 
        ? { ...obj, ahorroActual: Math.min(obj.ahorroActual + cantidad, obj.metaTotal) }
        : obj
    ));
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta': return colors.error;
      case 'Media': return colors.warning;
      case 'Baja': return colors.success;
      default: return colors.light.textSecondary;
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'Viaje': return 'airplane';
      case 'Casa': return 'home';
      case 'Auto': return 'car';
      case 'Educación': return 'school';
      case 'Emergencia': return 'medical';
      case 'Inversión': return 'trending-up';
      default: return 'star';
    }
  };

  const getDiasRestantes = (fechaLimite: string) => {
    const hoy = new Date();
    const limite = new Date(fechaLimite);
    const diferencia = limite.getTime() - hoy.getTime();
    const dias = Math.ceil(diferencia / (1000 * 3600 * 24));
    return dias;
  };

  const objetivosPorPrioridad = objetivos.sort((a, b) => {
    const prioridadOrder = { 'Alta': 0, 'Media': 1, 'Baja': 2 };
    return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
  });

  const totalAhorrado = objetivos.reduce((sum, obj) => sum + obj.ahorroActual, 0);
  const totalMetas = objetivos.reduce((sum, obj) => sum + obj.metaTotal, 0);
  const progresoGeneral = totalMetas > 0 ? (totalAhorrado / totalMetas) * 100 : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            Cargando objetivos...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View>
          <Text style={[
            styles.headerTitle,
            isDarkMode && styles.darkText,
            { fontSize: isTablet ? 24 : 20 }
          ]}>
            Mis Objetivos Financieros
          </Text>
          <Text style={[styles.headerDate, isDarkMode && styles.darkTextSecondary]}>
            {formatDate(new Date())}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.headerButton}
          >
            <Ionicons 
              name={isDarkMode ? "sunny" : "moon"} 
              size={24} 
              color={isDarkMode ? colors.dark.text : colors.light.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={[styles.headerButton, styles.addButton]}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Resumen General */}
        <View style={[
          styles.resumenCard,
          isDarkMode && styles.darkCard,
          { marginHorizontal: wp(4), marginTop: hp(2) }
        ]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>
            Progreso General
          </Text>
          
          <View style={styles.resumenContent}>
            <View style={styles.resumenStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, isDarkMode && styles.darkText]}>
                  {formatCurrency(totalAhorrado)}
                </Text>
                <Text style={[styles.statLabel, isDarkMode && styles.darkTextSecondary]}>
                  Total Ahorrado
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, isDarkMode && styles.darkText]}>
                  {formatCurrency(totalMetas)}
                </Text>
                <Text style={[styles.statLabel, isDarkMode && styles.darkTextSecondary]}>
                  Total Metas
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, isDarkMode && styles.darkText]}>
                  {objetivos.length}
                </Text>
                <Text style={[styles.statLabel, isDarkMode && styles.darkTextSecondary]}>
                  Objetivos Activos
                </Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <CircularProgress 
                percentage={progresoGeneral}
                size={isTablet ? 140 : 120}
                color={colors.primary}
              />
            </View>
          </View>
        </View>

        {/* Lista de Objetivos */}
        <View style={[
          styles.card,
          isDarkMode && styles.darkCard,
          { marginHorizontal: wp(4), marginTop: hp(2), marginBottom: hp(4) }
        ]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>
            Objetivos por Prioridad
          </Text>

          {objetivosPorPrioridad.length > 0 ? (
            objetivosPorPrioridad.map((objetivo) => {
              const progreso = (objetivo.ahorroActual / objetivo.metaTotal) * 100;
              const diasRestantes = getDiasRestantes(objetivo.fechaLimite);
              
              return (
                <TouchableOpacity
                  key={objetivo.id}
                  style={styles.objetivoItem}
                  onPress={() => {
                    setSelectedObjetivo(objetivo);
                    setShowDetailsModal(true);
                  }}
                >
                  <View style={styles.objetivoHeader}>
                    <View style={styles.objetivoInfo}>
                      <View style={[
                        styles.categoriaIcon,
                        { backgroundColor: colors.primary + '20' }
                      ]}>
                        <Ionicons 
                          name={getCategoriaIcon(objetivo.categoria) as any} 
                          size={24} 
                          color={colors.primary} 
                        />
                      </View>
                      
                      <View style={styles.objetivoTexts}>
                        <View style={styles.objetivoTitleRow}>
                          <Text style={[styles.objetivoNombre, isDarkMode && styles.darkText]}>
                            {objetivo.nombre}
                          </Text>
                          <View style={[
                            styles.prioridadTag,
                            { backgroundColor: getPrioridadColor(objetivo.prioridad) + '20' }
                          ]}>
                            <Text style={[
                              styles.prioridadText,
                              { color: getPrioridadColor(objetivo.prioridad) }
                            ]}>
                              {objetivo.prioridad}
                            </Text>
                          </View>
                        </View>
                        
                        <Text style={[styles.objetivoCategoria, isDarkMode && styles.darkTextSecondary]}>
                          {objetivo.categoria}
                        </Text>
                        
                        {objetivo.descripcion && (
                          <Text style={[styles.objetivoDescripcion, isDarkMode && styles.darkTextSecondary]}>
                            {objetivo.descripcion}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.objetivoProgress}>
                    <View style={styles.objetivoAmounts}>
                      <Text style={[styles.objetivoActual, isDarkMode && styles.darkText]}>
                        {formatCurrency(objetivo.ahorroActual)}
                      </Text>
                      <Text style={[styles.objetivoMeta, isDarkMode && styles.darkTextSecondary]}>
                        de {formatCurrency(objetivo.metaTotal)}
                      </Text>
                    </View>
                    
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill,
                            { 
                              width: `${progreso}%`,
                              backgroundColor: progreso >= 100 ? colors.success : colors.primary,
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.progressPercent, isDarkMode && styles.darkTextSecondary]}>
                        {Math.round(progreso)}%
                      </Text>
                    </View>
                    
                    <View style={styles.objetivoFooter}>
                      <Text style={[
                        styles.diasRestantes,
                        isDarkMode && styles.darkTextSecondary,
                        { color: diasRestantes < 30 ? colors.error : isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary }
                      ]}>
                        {diasRestantes > 0 
                          ? `${diasRestantes} días restantes`
                          : `Vencido hace ${Math.abs(diasRestantes)} días`
                        }
                      </Text>
                      
                      {progreso < 100 && (
                        <TouchableOpacity
                          style={styles.addMoneyButton}
                          onPress={() => {
                            Alert.prompt(
                              'Agregar Dinero',
                              `¿Cuánto quieres agregar a "${objetivo.nombre}"?`,
                              [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                  text: 'Agregar',
                                  onPress: (value) => {
                                    const cantidad = parseFloat(value || '0');
                                    if (!isNaN(cantidad) && cantidad > 0) {
                                      handleAddMoney(objetivo.id, cantidad);
                                    }
                                  }
                                }
                              ],
                              'plain-text',
                              '',
                              'numeric'
                            );
                          }}
                        >
                          <Ionicons name="add" size={16} color="#fff" />
                          <Text style={styles.addMoneyText}>Agregar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons 
                name="flag-outline" 
                size={48} 
                color={isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary} 
              />
              <Text style={[styles.emptyStateText, isDarkMode && styles.darkTextSecondary]}>
                No tienes objetivos financieros aún
              </Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.createFirstButtonText}>Crear mi primer objetivo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal Agregar Objetivo */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, isDarkMode && styles.darkContainer]}>
          <View style={[styles.modalHeader, isDarkMode && styles.darkHeader]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Nuevo Objetivo
            </Text>
            <TouchableOpacity onPress={handleAddObjetivo}>
              <Text style={styles.saveButton}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}>
                Nombre del Objetivo *
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Ej: Viaje a Europa"
                placeholderTextColor={isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary}
                value={nuevoObjetivo.nombre}
                onChangeText={(text) => setNuevoObjetivo(prev => ({ ...prev, nombre: text }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}>
                Meta Total *
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="0.00"
                placeholderTextColor={isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary}
                value={nuevoObjetivo.metaTotal}
                onChangeText={(text) => setNuevoObjetivo(prev => ({ ...prev, metaTotal: text }))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}>
                Fecha Límite *
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary}
                value={nuevoObjetivo.fechaLimite}
                onChangeText={(text) => setNuevoObjetivo(prev => ({ ...prev, fechaLimite: text }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}>
                Categoría
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoriasPicker}>
                  {categorias.map((categoria) => (
                    <TouchableOpacity
                      key={categoria}
                      style={[
                        styles.categoriaOption,
                        nuevoObjetivo.categoria === categoria && styles.categoriaSelected,
                        isDarkMode && styles.darkCategoriaOption,
                        nuevoObjetivo.categoria === categoria && isDarkMode && styles.darkCategoriaSelected,
                      ]}
                      onPress={() => setNuevoObjetivo(prev => ({ ...prev, categoria }))}
                    >
                      <Ionicons 
                        name={getCategoriaIcon(categoria) as any} 
                        size={16} 
                        color={nuevoObjetivo.categoria === categoria ? '#fff' : (isDarkMode ? colors.dark.text : colors.light.text)}
                      />
                      <Text style={[
                        styles.categoriaOptionText,
                        nuevoObjetivo.categoria === categoria && styles.categoriaSelectedText,
                        isDarkMode && styles.darkText,
                        nuevoObjetivo.categoria === categoria && styles.categoriaSelectedText,
                      ]}>
                        {categoria}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}>
                Prioridad
              </Text>
              <View style={styles.prioridadSelector}>
                {prioridades.map((prioridad) => (
                  <TouchableOpacity
                    key={prioridad}
                    style={[
                      styles.prioridadOption,
                      nuevoObjetivo.prioridad === prioridad && styles.prioridadSelected,
                      nuevoObjetivo.prioridad === prioridad && { backgroundColor: getPrioridadColor(prioridad) },
                    ]}
                    onPress={() => setNuevoObjetivo(prev => ({ ...prev, prioridad: prioridad as any }))}
                  >
                    <Text style={[
                      styles.prioridadOptionText,
                      nuevoObjetivo.prioridad === prioridad && styles.prioridadSelectedText,
                      { color: nuevoObjetivo.prioridad === prioridad ? '#fff' : getPrioridadColor(prioridad) }
                    ]}>
                      {prioridad}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}>
                Descripción (opcional)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
                placeholder="Describe tu objetivo..."
                placeholderTextColor={isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary}
                value={nuevoObjetivo.descripcion}
                onChangeText={(text) => setNuevoObjetivo(prev => ({ ...prev, descripcion: text }))}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal Detalles del Objetivo */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, isDarkMode && styles.darkContainer]}>
          <View style={[styles.modalHeader, isDarkMode && styles.darkHeader]}>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Text style={styles.cancelButton}>Cerrar</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Detalles del Objetivo
            </Text>
            <View style={{ width: 60 }} />
          </View>

          {selectedObjetivo && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailsContainer}>
                <View style={styles.detailsHeader}>
                  <View style={[
                    styles.detailsIcon,
                    { backgroundColor: colors.primary + '20' }
                  ]}>
                    <Ionicons 
                      name={getCategoriaIcon(selectedObjetivo.categoria) as any} 
                      size={32} 
                      color={colors.primary} 
                    />
                  </View>
                  <Text style={[styles.detailsTitle, isDarkMode && styles.darkText]}>
                    {selectedObjetivo.nombre}
                  </Text>
                </View>

                <View style={styles.detailsProgress}>
                  <CircularProgress 
                    percentage={(selectedObjetivo.ahorroActual / selectedObjetivo.metaTotal) * 100}
                    size={150}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.detailsStats}>
                  <View style={styles.detailsStat}>
                    <Text style={[styles.detailsStatLabel, isDarkMode && styles.darkTextSecondary]}>
                      Ahorrado
                    </Text>
                    <Text style={[styles.detailsStatValue, isDarkMode && styles.darkText]}>
                      {formatCurrency(selectedObjetivo.ahorroActual)}
                    </Text>
                  </View>
                  <View style={styles.detailsStat}>
                    <Text style={[styles.detailsStatLabel, isDarkMode && styles.darkTextSecondary]}>
                      Meta
                    </Text>
                    <Text style={[styles.detailsStatValue, isDarkMode && styles.darkText]}>
                      {formatCurrency(selectedObjetivo.metaTotal)}
                    </Text>
                  </View>
                  <View style={styles.detailsStat}>
                    <Text style={[styles.detailsStatLabel, isDarkMode && styles.darkTextSecondary]}>
                      Restante
                    </Text>
                    <Text style={[styles.detailsStatValue, isDarkMode && styles.darkText]}>
                      {formatCurrency(selectedObjetivo.metaTotal - selectedObjetivo.ahorroActual)}
                    </Text>
                  </View>
                </View>

                {selectedObjetivo.descripcion && (
                  <View style={styles.detailsDescription}>
                    <Text style={[styles.detailsDescriptionLabel, isDarkMode && styles.darkTextSecondary]}>
                      Descripción
                    </Text>
                    <Text style={[styles.detailsDescriptionText, isDarkMode && styles.darkText]}>
                      {selectedObjetivo.descripcion}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  darkContainer: {
    backgroundColor: colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.light.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  darkHeader: {
    backgroundColor: colors.dark.surface,
    borderBottomColor: colors.dark.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.light.text,
  },
  headerDate: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  resumenCard: {
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    padding: 20,
    ...globalStyles.shadow,
  },
  darkCard: {
    backgroundColor: colors.dark.surface,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 16,
  },
  resumenContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumenStats: {
    flex: 1,
  },
  statItem: {
    marginBottom: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressCircle: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBackground: {
    borderColor: colors.light.surfaceSecondary,
    position: 'absolute',
  },
  progressForeground: {
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
  },
  progressText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    padding: 20,
    ...globalStyles.shadow,
  },
  objetivoItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.divider,
  },
  objetivoHeader: {
    marginBottom: 12,
  },
  objetivoInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoriaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  objetivoTexts: {
    flex: 1,
  },
  objetivoTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  objetivoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  prioridadTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prioridadText: {
    fontSize: 10,
    fontWeight: '600',
  },
  objetivoCategoria: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginBottom: 4,
  },
  objetivoDescripcion: {
    fontSize: 12,
    color: colors.light.textSecondary,
    fontStyle: 'italic',
  },
  objetivoProgress: {
    marginTop: 8,
  },
  objetivoAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  objetivoActual: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
  },
  objetivoMeta: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.light.surfaceSecondary,
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: colors.light.textSecondary,
    minWidth: 35,
    textAlign: 'right',
  },
  objetivoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diasRestantes: {
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addMoneyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.light.textSecondary,
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  createFirstButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.light.textSecondary,
  },
  saveButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.light.surface,
    color: colors.light.text,
  },
  darkInput: {
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.surface,
    color: colors.dark.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoriasPicker: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoriaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.light.surfaceSecondary,
    marginRight: 8,
  },
  darkCategoriaOption: {
    backgroundColor: colors.dark.surfaceSecondary,
  },
  categoriaSelected: {
    backgroundColor: colors.primary,
  },
  darkCategoriaSelected: {
    backgroundColor: colors.primary,
  },
  categoriaOptionText: {
    fontSize: 14,
    color: colors.light.text,
    marginLeft: 6,
  },
  categoriaSelectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  prioridadSelector: {
    flexDirection: 'row',
  },
  prioridadOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  prioridadSelected: {
    borderWidth: 0,
  },
  prioridadOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  prioridadSelectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  detailsContainer: {
    paddingBottom: 20,
  },
  detailsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.light.text,
    textAlign: 'center',
  },
  detailsProgress: {
    alignItems: 'center',
    marginBottom: 30,
  },
  detailsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  detailsStat: {
    alignItems: 'center',
  },
  detailsStatLabel: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginBottom: 4,
  },
  detailsStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
  },
  detailsDescription: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.light.divider,
  },
  detailsDescriptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.textSecondary,
    marginBottom: 8,
  },
  detailsDescriptionText: {
    fontSize: 16,
    color: colors.light.text,
    lineHeight: 24,
  },
  darkText: {
    color: colors.dark.text,
  },
  darkTextSecondary: {
    color: colors.dark.textSecondary,
  },
});

export default Objetivos;