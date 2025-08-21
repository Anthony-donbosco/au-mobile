import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { formatCurrency, formatDate } from '../../utils/networkUtils';

interface Factura {
  id: number;
  nombre: string;
  tipo: string;
  monto: number;
  fechaVencimiento: string;
  estado: 'Pendiente' | 'Pagada' | 'Vencida';
  logoUrl?: string;
  ultimoPago?: string;
  descripcion?: string;
}

interface FacturasProps {
  onAuthChange: (isAuth: boolean) => void;
}

const Facturas: React.FC<FacturasProps> = ({ onAuthChange }) => {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isTablet, wp, hp } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [nuevaFactura, setNuevaFactura] = useState({
    nombre: '',
    tipo: '',
    monto: '',
    fechaVencimiento: '',
    descripcion: '',
  });

  useEffect(() => {
    loadFacturas();
  }, []);

  const loadFacturas = async () => {
    try {
      setLoading(true);
      
      // Simular carga de datos
      setTimeout(() => {
        setFacturas([
          {
            id: 1,
            nombre: 'Netflix Premium',
            tipo: 'Suscripción de streaming',
            monto: 15.99,
            fechaVencimiento: '2025-08-15',
            estado: 'Pendiente',
            logoUrl: 'https://logos-world.net/wp-content/uploads/2020/04/Netflix-Logo.png',
            ultimoPago: '2025-07-15',
            descripcion: 'Plan familiar mensual',
          },
          {
            id: 2,
            nombre: 'Spotify Familiar',
            tipo: 'Música y podcasts',
            monto: 14.99,
            fechaVencimiento: '2025-08-20',
            estado: 'Pendiente',
            logoUrl: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png',
            ultimoPago: '2025-07-20',
            descripcion: 'Cuenta familiar premium',
          },
          {
            id: 3,
            nombre: 'Adobe Creative Cloud',
            tipo: 'Software de diseño',
            monto: 52.99,
            fechaVencimiento: '2025-08-25',
            estado: 'Pagada',
            logoUrl: 'https://www.adobe.com/content/dam/cc/icons/Adobe_Corporate_Horizontal_Red_HEX.svg',
            ultimoPago: '2025-08-25',
            descripcion: 'Suite completa de herramientas creativas',
          },
          {
            id: 4,
            nombre: 'Electricidad',
            tipo: 'Servicio público',
            monto: 85.50,
            fechaVencimiento: '2025-08-10',
            estado: 'Vencida',
            descripcion: 'Factura mensual de electricidad',
          },
          {
            id: 5,
            nombre: 'Internet Fibra',
            tipo: 'Telecomunicaciones',
            monto: 45.00,
            fechaVencimiento: '2025-08-18',
            estado: 'Pendiente',
            descripcion: 'Plan de 100MB fibra óptica',
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.log('Error loading facturas:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFacturas();
    setRefreshing(false);
  };

  const handleAddFactura = () => {
    if (!nuevaFactura.nombre || !nuevaFactura.tipo || !nuevaFactura.monto || !nuevaFactura.fechaVencimiento) {
      Alert.alert(t("common.error"), t("common.fillAllFields"));
      return;
    }

    const monto = parseFloat(nuevaFactura.monto);
    if (isNaN(monto) || monto <= 0) {
      Alert.alert(t("common.error"), t("common.amountInvalid"));
      return;
    }

    const newFactura: Factura = {
      id: Date.now(),
      nombre: nuevaFactura.nombre,
      tipo: nuevaFactura.tipo,
      monto: monto,
      fechaVencimiento: nuevaFactura.fechaVencimiento,
      estado: 'Pendiente',
      descripcion: nuevaFactura.descripcion,
    };

    setFacturas(prev => [newFactura, ...prev]);
    setNuevaFactura({ nombre: '', tipo: '', monto: '', fechaVencimiento: '', descripcion: '' });
    setShowAddModal(false);
    Alert.alert(t("common.success"), t("bills.created"));
  };

  const handleMarcarPagada = (id: number) => {
    Alert.alert(
      'Marcar como pagada',
      '¿Estás seguro de que quieres marcar esta factura como pagada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, marcar',
          onPress: () => {
            setFacturas(prev => prev.map(f => 
              f.id === id 
                ? { ...f, estado: 'Pagada' as const, ultimoPago: new Date().toISOString().split('T')[0] }
                : f
            ));
          }
        }
      ]
    );
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pagada': return colors.success;
      case 'Pendiente': return colors.warning;
      case 'Vencida': return colors.error;
      default: return colors.light.textSecondary;
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Pagada': return 'checkmark-circle';
      case 'Pendiente': return 'time';
      case 'Vencida': return 'alert-circle';
      default: return 'document';
    }
  };

  const facturasFiltradas = facturas.filter(f => {
    const estadoMap: Record<Factura['estado'], 'pending' | 'paid' | 'overdue'> = {
      Pendiente: 'pending', Pagada: 'paid', Vencida: 'overdue'
    };
    const matchEstado = filtroEstado === 'all' || estadoMap[f.estado] === filtroEstado;
    const matchBusqueda = f.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
                         f.tipo.toLowerCase().includes(terminoBusqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });

  const totalPendientes = facturas.filter(f => f.estado === 'Pendiente').reduce((sum, f) => sum + f.monto, 0);
  const facturasPendientes = facturas.filter(f => f.estado === 'Pendiente').length;
  const facturasVencidas = facturas.filter(f => f.estado === 'Vencida').length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            {t("bills.loading")}
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
            {t("bills.title")}
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

      {/* Filtros y búsqueda */}
      <View style={[styles.filtersContainer, { paddingHorizontal: wp(4) }]}>
        <View style={[styles.searchContainer, isDarkMode && styles.darkSearchContainer]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary} 
          />
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
            placeholder={t("bills.searchPlaceholder")}
            placeholderTextColor={isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary}
            value={terminoBusqueda}
            onChangeText={setTerminoBusqueda}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterTabs}>
            {[ 'all', 'pending', 'paid', 'overdue' ].map((estado) => (
              <TouchableOpacity
                key={estado}
                style={[
                  styles.filterTab,
                  filtroEstado === estado && styles.filterTabActive,
                  isDarkMode && styles.darkFilterTab,
                  filtroEstado === estado && isDarkMode && styles.darkFilterTabActive,
                ]}
                onPress={() => setFiltroEstado(estado as any)}
              >
                <Text style={[
                  styles.filterTabText,
                  filtroEstado === estado && styles.filterTabTextActive,
                  isDarkMode && styles.darkText,
                  filtroEstado === estado && styles.filterTabTextActive,
                ]}>
                  {estado === 'all' ? t("bills.filters.all")
                                   : estado === 'pending' ? t("bills.filters.pending")
                                   : estado === 'paid' ? t("bills.filters.paid")
                                   : t("bills.filters.overdue")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
        {/* Resumen */}
        <View style={[
          styles.resumenContainer,
          isDarkMode && styles.darkCard,
          { marginHorizontal: wp(4), marginTop: hp(2) }
        ]}>
          <View style={styles.resumenItem}>
            <View style={[styles.resumenIcon, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="document-text" size={24} color={colors.warning} />
            </View>
            <Text style={[styles.resumenValue, isDarkMode && styles.darkText]}>
              {formatCurrency(totalPendientes)}
            </Text>
            <Text style={[styles.resumenLabel, isDarkMode && styles.darkTextSecondary]}>
              Total Pendiente
            </Text>
          </View>
          
          <View style={styles.resumenItem}>
            <View style={[styles.resumenIcon, { backgroundColor: colors.infoLight }]}>
              <Ionicons name="time" size={24} color={colors.info} />
            </View>
            <Text style={[styles.resumenValue, isDarkMode && styles.darkText]}>
              {facturasPendientes}
            </Text>
            <Text style={[styles.resumenLabel, isDarkMode && styles.darkTextSecondary]}>
              Pendientes
            </Text>
          </View>
          
          <View style={styles.resumenItem}>
            <View style={[styles.resumenIcon, { backgroundColor: colors.errorLight }]}>
              <Ionicons name="alert-circle" size={24} color={colors.error} />
            </View>
            <Text style={[styles.resumenValue, isDarkMode && styles.darkText]}>
              {facturasVencidas}
            </Text>
            <Text style={[styles.resumenLabel, isDarkMode && styles.darkTextSecondary]}>
              Vencidas
            </Text>
          </View>
        </View>

        {/* Lista de Facturas */}
        <View style={[
          styles.card,
          isDarkMode && styles.darkCard,
          { marginHorizontal: wp(4), marginTop: hp(2), marginBottom: hp(4) }
        ]}>
          {facturasFiltradas.length > 0 ? (
            facturasFiltradas.map((factura) => (
              <View key={factura.id} style={styles.facturaItem}>
                <View style={styles.facturaHeader}>
                  <View style={styles.facturaInfo}>
                    {factura.logoUrl ? (
                      <View style={styles.logoContainer}>
                        <Image 
                          source={{ uri: factura.logoUrl }} 
                          style={styles.logo}
                          resizeMode="contain"
                        />
                      </View>
                    ) : (
                      <View style={[styles.facturaIcon, { backgroundColor: colors.light.surfaceSecondary }]}>
                        <Ionicons 
                          name="document-text" 
                          size={24} 
                          color={isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary} 
                        />
                      </View>
                    )}
                    
                    <View style={styles.facturaTexts}>
                      <Text style={[styles.facturaNombre, isDarkMode && styles.darkText]}>
                        {factura.nombre}
                      </Text>
                      <Text style={[styles.facturaTipo, isDarkMode && styles.darkTextSecondary]}>
                        {factura.tipo}
                      </Text>
                      {factura.descripcion && (
                        <Text style={[styles.facturaDescripcion, isDarkMode && styles.darkTextSecondary]}>
                          {factura.descripcion}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.facturaRight}>
                    <Text style={[styles.facturaMonto, isDarkMode && styles.darkText]}>
                      {formatCurrency(factura.monto)}
                    </Text>
                    <View style={styles.facturaEstadoContainer}>
                      <View style={[
                        styles.estadoTag,
                        { backgroundColor: getEstadoColor(factura.estado) + '20' }
                      ]}>
                        <Ionicons 
                          name={getEstadoIcon(factura.estado) as any} 
                          size={12} 
                          color={getEstadoColor(factura.estado)} 
                        />
                        <Text style={[
                          styles.estadoText,
                          { color: getEstadoColor(factura.estado) }
                        ]}>
                          {factura.estado}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.facturaFooter}>
                  <View style={styles.facturaFechas}>
                    <Text style={[styles.fechaLabel, isDarkMode && styles.darkTextSecondary]}>
                      Vence: {formatDate(new Date(factura.fechaVencimiento))}
                    </Text>
                    {factura.ultimoPago && (
                      <Text style={[styles.fechaLabel, isDarkMode && styles.darkTextSecondary]}>
                        Último pago: {formatDate(new Date(factura.ultimoPago))}
                      </Text>
                    )}
                  </View>
                  
                  {factura.estado === 'Pendiente' && (
                    <TouchableOpacity
                      style={styles.pagarButton}
                      onPress={() => handleMarcarPagada(factura.id)}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.pagarButtonText}>Marcar Pagada</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons 
                name="document-outline" 
                size={48} 
                color={isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary} 
              />
              <Text style={[styles.emptyStateText, isDarkMode && styles.darkTextSecondary]}>
                No hay facturas que mostrar
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal Agregar Factura */}
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
              Nueva Factura
            </Text>
            <TouchableOpacity onPress={handleAddFactura}>
              <Text style={styles.saveButton}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}>
                Nombre *
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Ej: Netflix Premium"
                placeholderTextColor={isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary}
                value={nuevaFactura.nombre}
                onChangeText={(text) => setNuevaFactura(prev => ({ ...prev, nombre: text }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}>
                Tipo *
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Ej: Suscripción de streaming"
                placeholderTextColor={isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary}
                value={nuevaFactura.tipo}
                onChangeText={(text) => setNuevaFactura(prev => ({ ...prev, tipo: text }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}>
                Monto *
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="0.00"
                placeholderTextColor={isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary}
                value={nuevaFactura.monto}
                onChangeText={(text) => setNuevaFactura(prev => ({ ...prev, monto: text }))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}>
                Fecha de Vencimiento *
              </Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary}
                value={nuevaFactura.fechaVencimiento}
                onChangeText={(text) => setNuevaFactura(prev => ({ ...prev, fechaVencimiento: text }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkMode && styles.darkTextSecondary]}>
                Descripción (opcional)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
                placeholder="Agregar una descripción..."
                placeholderTextColor={isDarkMode ? colors.dark.textTertiary : colors.light.textTertiary}
                value={nuevaFactura.descripcion}
                onChangeText={(text) => setNuevaFactura(prev => ({ ...prev, descripcion: text }))}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
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
  filtersContainer: {
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  darkSearchContainer: {
    backgroundColor: colors.dark.surface,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.light.text,
  },
  darkSearchInput: {
    color: colors.dark.text,
  },
  filterTabs: {
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.light.surfaceSecondary,
    marginRight: 8,
  },
  darkFilterTab: {
    backgroundColor: colors.dark.surfaceSecondary,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  darkFilterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: colors.light.text,
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  resumenContainer: {
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    ...globalStyles.shadow,
  },
  resumenItem: {
    alignItems: 'center',
    flex: 1,
  },
  resumenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumenValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 4,
  },
  resumenLabel: {
    fontSize: 12,
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    padding: 20,
    ...globalStyles.shadow,
  },
  darkCard: {
    backgroundColor: colors.dark.surface,
  },
  facturaItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.divider,
  },
  facturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  facturaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.light.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logo: {
    width: 32,
    height: 32,
  },
  facturaIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  facturaTexts: {
    flex: 1,
  },
  facturaNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 2,
  },
  facturaTipo: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginBottom: 2,
  },
  facturaDescripcion: {
    fontSize: 12,
    color: colors.light.textSecondary,
    fontStyle: 'italic',
  },
  facturaRight: {
    alignItems: 'flex-end',
  },
  facturaMonto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 4,
  },
  facturaEstadoContainer: {
    alignItems: 'flex-end',
  },
  estadoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  facturaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  facturaFechas: {
    flex: 1,
  },
  fechaLabel: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginBottom: 2,
  },
  pagarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pagarButtonText: {
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
  darkText: {
    color: colors.dark.text,
  },
  darkTextSecondary: {
    color: colors.dark.textSecondary,
  },
});

export default Facturas;