import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { createThemedStyles } from '../utils/themeStyles';
import { AcademicStatsStorage } from '../services/AcademicStatsStorage';

const ACADEMIC_STATS_KEY = '@schedax_academic_statistics';

export default function StatisticsScreen({ navigation }) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [academicStats, setAcademicStats] = useState({
    // Sistema académico
    systemType: '', // 'credits' o 'periods'
    divisionType: '', // 'semestres', 'cuatrimestres', 'trimestres', 'anuales'
    
    // Información de la carrera
    totalCredits: '',
    totalSubjects: '',
    totalPeriods: '',
    
    // Progreso actual
    completedCredits: '',
    completedSubjects: '',
    completedPeriods: '',
    currentPeriod: '',
    
    // Configuración específica
    periodValue: '', // Para sistema de períodos
    
    // Información económica
    totalCareerCost: '', // Costo total de la carrera
    costPerPeriod: '', // Costo por período/semestre
    costPerCredit: '', // Costo por crédito (si aplica)
    paidAmount: '', // Monto ya pagado
    currency: 'DOP', // Moneda (Peso Dominicano por defecto)
    isAutoCalculated: false, // Si el costo total fue calculado automáticamente
    includeBooks: false, // Si incluir costos de libros
    includeTransport: false, // Si incluir costos de transporte
    includeExtras: false, // Si incluir gastos extras
    booksPerPeriod: '', // Costo de libros por período
    transportPerMonth: '', // Costo de transporte mensual
    extrasPerPeriod: '', // Gastos extras por período
  });

  useEffect(() => {
    loadExistingStats();
  }, []);

  // Auto-sugerir cálculo de costo total cuando se completen los campos necesarios
  useEffect(() => {
    if (!academicStats.totalCareerCost) {
      const canCalculate = 
        (academicStats.systemType === 'credits' && academicStats.totalCredits && academicStats.costPerCredit) ||
        (academicStats.systemType === 'periods' && academicStats.totalPeriods && academicStats.costPerPeriod);
      
      if (canCalculate) {
        const calculatedCost = calculateTotalCareerCost(academicStats);
        if (calculatedCost) {
          // Auto-completar silenciosamente
          setAcademicStats(prev => ({
            ...prev,
            totalCareerCost: calculatedCost,
            isAutoCalculated: true
          }));
        }
      }
    }
  }, [academicStats.systemType, academicStats.totalCredits, academicStats.costPerCredit, 
      academicStats.totalPeriods, academicStats.costPerPeriod]);

  const loadExistingStats = async () => {
    try {
      const existingStats = await AcademicStatsStorage.getAcademicStats();
      if (existingStats) {
        setAcademicStats(existingStats);
      }
    } catch (error) {
      console.error('Error loading academic stats:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setAcademicStats(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Auto-calcular costo total cuando se actualicen campos relevantes
      if (field === 'costPerCredit' || field === 'totalCredits' || 
          field === 'costPerPeriod' || field === 'totalPeriods') {
        const calculatedCost = calculateTotalCareerCost(updated);
        if (calculatedCost && calculatedCost !== updated.totalCareerCost) {
          updated.totalCareerCost = calculatedCost;
          updated.isAutoCalculated = true;
        }
      }
      
      // Si el usuario modifica manualmente el costo total, marcarlo como manual
      if (field === 'totalCareerCost') {
        updated.isAutoCalculated = false;
      }
      
      return updated;
    });
  };

  // Función para calcular automáticamente el costo total de la carrera
  const calculateTotalCareerCost = (stats) => {
    if (stats.systemType === 'credits' && stats.costPerCredit && stats.totalCredits) {
      return (parseInt(stats.costPerCredit) * parseInt(stats.totalCredits)).toString();
    } else if (stats.systemType === 'periods' && stats.costPerPeriod && stats.totalPeriods) {
      return (parseInt(stats.costPerPeriod) * parseInt(stats.totalPeriods)).toString();
    }
    return stats.totalCareerCost || '';
  };

  // Función para auto-completar el costo total
  const autoCalculateTotalCost = () => {
    const calculatedCost = calculateTotalCareerCost(academicStats);
    if (calculatedCost && calculatedCost !== academicStats.totalCareerCost) {
      setAcademicStats(prev => ({
        ...prev,
        totalCareerCost: calculatedCost,
        isAutoCalculated: true
      }));
      Alert.alert(
        'Costo Calculado Automáticamente',
        `El costo total se ha calculado: DOP$${parseInt(calculatedCost).toLocaleString()}`,
        [{ text: 'OK' }]
      );
    }
  };

  const validateInputs = () => {
    if (!academicStats.systemType) {
      Alert.alert('Error', 'Por favor selecciona el sistema académico');
      return false;
    }
    
    if (!academicStats.divisionType) {
      Alert.alert('Error', 'Por favor selecciona cómo se divide tu carrera');
      return false;
    }

    if (academicStats.systemType === 'credits') {
      if (!academicStats.totalCredits || !academicStats.completedCredits) {
        Alert.alert('Error', 'Por favor completa la información de créditos');
        return false;
      }
    } else {
      if (!academicStats.totalPeriods || !academicStats.completedPeriods) {
        Alert.alert('Error', 'Por favor completa la información de períodos');
        return false;
      }
      if (!academicStats.periodValue) {
        Alert.alert('Error', 'Por favor indica el valor del período');
        return false;
      }
    }

    if (!academicStats.totalSubjects || !academicStats.completedSubjects) {
      Alert.alert('Error', 'Por favor completa la información de materias');
      return false;
    }

    return true;
  };

  const saveAcademicStats = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      // Guardar estadísticas académicas usando el servicio
      await AcademicStatsStorage.saveAcademicStats(academicStats);
      
      // Marcar que el setup académico está completo
      const profileData = await AsyncStorage.getItem('@schedax_user_profile');
      if (profileData) {
        const profile = JSON.parse(profileData);
        profile.academicSetupCompleted = true;
        await AsyncStorage.setItem('@schedax_user_profile', JSON.stringify(profile));
      }

      Alert.alert(
        'Configuración Guardada',
        'Tu información académica ha sido configurada exitosamente.',
        [
          { text: 'Continuar', onPress: () => navigation.replace('MainApp') }
        ]
      );
    } catch (error) {
      console.error('Error saving academic stats:', error);
      Alert.alert('Error', 'No se pudo guardar la información académica');
    } finally {
      setIsLoading(false);
    }
  };

  const skipAcademicSetup = () => {
    Alert.alert(
      'Omitir Configuración Académica',
      '¿Estás seguro de que quieres continuar sin configurar tu información académica? Puedes hacerlo más tarde desde la configuración.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Omitir', onPress: () => navigation.replace('MainApp') }
      ]
    );
  };

  const SystemTypeButton = ({ type, title, description, icon }) => (
    <TouchableOpacity 
      style={[
        styles.selectionButton,
        academicStats.systemType === type && styles.selectedButton
      ]}
      onPress={() => handleInputChange('systemType', type)}
    >
      <Text style={styles.selectionIcon}>{icon}</Text>
      <Text style={[
        styles.selectionTitle,
        academicStats.systemType === type && styles.selectedText
      ]}>
        {title}
      </Text>
      <Text style={[
        styles.selectionDescription,
        academicStats.systemType === type && styles.selectedText
      ]}>
        {description}
      </Text>
    </TouchableOpacity>
  );

  const DivisionTypeButton = ({ type, title, icon }) => (
    <TouchableOpacity 
      style={[
        styles.divisionButton,
        academicStats.divisionType === type && styles.selectedDivisionButton
      ]}
      onPress={() => handleInputChange('divisionType', type)}
    >
      <Text style={styles.divisionIcon}>{icon}</Text>
      <Text style={[
        styles.divisionTitle,
        academicStats.divisionType === type && styles.selectedDivisionText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const styles = createThemedStyles(theme);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24 }]}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              backgroundColor: 'white',
              width: 80,
              height: 80,
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Text style={{ fontSize: 36 }}>📊</Text>
            </View>
            <Text style={[styles.headerTitle, { color: 'white', fontSize: 28, fontWeight: 'bold' }]}>
              Configuración Académica
            </Text>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.9)', fontSize: 16 }]}>
              Configura el sistema de tu carrera
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          paddingTop: 30
        }}>
          <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
            {/* Tipo de Sistema */}
            <View style={{ marginBottom: 32 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
                ¿Cómo funciona tu carrera?
              </Text>
              
              <SystemTypeButton
                type="credits"
                title="Sistema de Créditos"
                description="Tu carrera se mide por créditos académicos"
                icon="🎓"
              />
              
              <SystemTypeButton
                type="periods"
                title="Sistema de Períodos"
                description="Tu carrera se mide por períodos/semestres"
                icon="📅"
              />
            </View>

            {/* División de la Carrera */}
            <View style={{ marginBottom: 32 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
                ¿Cómo se divide tu carrera?
              </Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <DivisionTypeButton type="semestres" title="Semestres" icon="📚" />
                <DivisionTypeButton type="cuatrimestres" title="Cuatrimestres" icon="📖" />
                <DivisionTypeButton type="trimestres" title="Trimestres" icon="📋" />
                <DivisionTypeButton type="anuales" title="Anuales" icon="📆" />
              </View>
            </View>

            {/* Información General */}
            <View style={{ marginBottom: 32 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
                Información General de tu Carrera
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Total de Materias en la Carrera</Text>
                <TextInput
                  style={styles.textInput}
                  value={academicStats.totalSubjects}
                  onChangeText={(text) => handleInputChange('totalSubjects', text)}
                  placeholder="Ej: 45"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Materias Completadas</Text>
                <TextInput
                  style={styles.textInput}
                  value={academicStats.completedSubjects}
                  onChangeText={(text) => handleInputChange('completedSubjects', text)}
                  placeholder="Ej: 20"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Configuración específica por sistema */}
            {academicStats.systemType === 'credits' && (
              <View style={{ marginBottom: 32 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
                  Sistema de Créditos
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Total de Créditos de la Carrera</Text>
                  <TextInput
                    style={styles.textInput}
                    value={academicStats.totalCredits}
                    onChangeText={(text) => handleInputChange('totalCredits', text)}
                    placeholder="Ej: 240"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Créditos Acumulados</Text>
                  <TextInput
                    style={styles.textInput}
                    value={academicStats.completedCredits}
                    onChangeText={(text) => handleInputChange('completedCredits', text)}
                    placeholder="Ej: 120"
                    keyboardType="numeric"
                  />
                </View>

                {/* Mostrar valor automático de cada crédito */}
                {academicStats.totalCredits && (
                  <View style={{
                    backgroundColor: theme.colors.secondary + '20',
                    padding: 16,
                    borderRadius: 8,
                    marginTop: 12
                  }}>
                    <Text style={[styles.textPrimary, { fontWeight: '600', marginBottom: 8 }]}>
                      💡 Información Automática
                    </Text>
                    <Text style={styles.textSecondary}>
                      Valor de cada crédito: {(100 / parseInt(academicStats.totalCredits || 1)).toFixed(3)}% de la carrera
                    </Text>
                    {academicStats.completedCredits && (
                      <Text style={styles.textSecondary}>
                        Progreso actual: {((parseInt(academicStats.completedCredits) / parseInt(academicStats.totalCredits)) * 100).toFixed(1)}%
                      </Text>
                    )}
                    <Text style={[styles.textSecondary, { marginTop: 4, fontSize: 12, fontStyle: 'italic' }]}>
                      Este cálculo se usa automáticamente para las estadísticas
                    </Text>
                  </View>
                )}
              </View>
            )}

            {academicStats.systemType === 'periods' && (
              <View style={{ marginBottom: 32 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
                  Sistema de Períodos
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Total de {academicStats.divisionType || 'Períodos'}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={academicStats.totalPeriods}
                    onChangeText={(text) => handleInputChange('totalPeriods', text)}
                    placeholder="Ej: 10"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{academicStats.divisionType || 'Períodos'} Completados</Text>
                  <TextInput
                    style={styles.textInput}
                    value={academicStats.completedPeriods}
                    onChangeText={(text) => handleInputChange('completedPeriods', text)}
                    placeholder="Ej: 5"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Valor del Período (%)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={academicStats.periodValue}
                    onChangeText={(text) => handleInputChange('periodValue', text)}
                    placeholder={academicStats.totalPeriods ? `Sugerido: ${(100 / parseInt(academicStats.totalPeriods || 1)).toFixed(1)}` : "Ej: 10"}
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputHelper}>
                    Porcentaje que representa cada período en la carrera.
                    {academicStats.totalPeriods && ` Sugerido: ${(100 / parseInt(academicStats.totalPeriods)).toFixed(1)}% (100% ÷ ${academicStats.totalPeriods} períodos)`}
                  </Text>
                  {academicStats.totalPeriods && (
                    <TouchableOpacity 
                      style={{
                        backgroundColor: theme.colors.secondary,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6,
                        marginTop: 8,
                        alignSelf: 'flex-start'
                      }}
                      onPress={() => handleInputChange('periodValue', (100 / parseInt(academicStats.totalPeriods)).toFixed(1))}
                    >
                      <Text style={{ color: 'white', fontSize: 12 }}>
                        Usar valor sugerido ({(100 / parseInt(academicStats.totalPeriods)).toFixed(1)}%)
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Período Actual</Text>
                  <TextInput
                    style={styles.textInput}
                    value={academicStats.currentPeriod}
                    onChangeText={(text) => handleInputChange('currentPeriod', text)}
                    placeholder="Ej: 6"
                    keyboardType="numeric"
                  />
                </View>

                {/* Mostrar información automática del sistema */}
                {academicStats.totalPeriods && academicStats.periodValue && (
                  <View style={{
                    backgroundColor: theme.colors.primary + '20',
                    padding: 16,
                    borderRadius: 8,
                    marginTop: 12
                  }}>
                    <Text style={[styles.textPrimary, { fontWeight: '600', marginBottom: 8 }]}>
                      💡 Información del Sistema
                    </Text>
                    <Text style={styles.textSecondary}>
                      Cada {academicStats.divisionType?.slice(0, -1) || 'período'} vale: {academicStats.periodValue}% de la carrera
                    </Text>
                    {academicStats.completedPeriods && (
                      <Text style={styles.textSecondary}>
                        Progreso por períodos: {(parseInt(academicStats.completedPeriods) * parseFloat(academicStats.periodValue)).toFixed(1)}%
                      </Text>
                    )}
                    <Text style={[styles.textSecondary, { marginTop: 4, fontSize: 12, fontStyle: 'italic' }]}>
                      Este sistema se usa para calcular tu progreso académico
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Información Económica */}
            <View style={{ marginBottom: 32 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
                💰 Información Económica (Opcional)
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Costo Total de la Carrera
                  {academicStats.isAutoCalculated && (
                    <Text style={{ color: theme.colors.success, fontSize: 12 }}> (Calculado automáticamente)</Text>
                  )}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.textPrimary, { marginRight: 8, fontSize: 16 }]}>DOP$</Text>
                  <TextInput
                    style={[
                      styles.textInput, 
                      { flex: 1 },
                      academicStats.isAutoCalculated && {
                        backgroundColor: theme.colors.success + '10',
                        borderColor: theme.colors.success,
                        borderWidth: 1
                      }
                    ]}
                    value={academicStats.totalCareerCost}
                    onChangeText={(text) => handleInputChange('totalCareerCost', text)}
                    placeholder={(() => {
                      const calculatedCost = calculateTotalCareerCost(academicStats);
                      return calculatedCost ? `Auto: ${parseInt(calculatedCost).toLocaleString()}` : "Ej: 500000";
                    })()}
                    keyboardType="numeric"
                  />
                  {academicStats.isAutoCalculated && (
                    <Text style={{ 
                      marginLeft: 8, 
                      color: theme.colors.success, 
                      fontSize: 16 
                    }}>🧮</Text>
                  )}
                </View>
                
                {/* Mostrar cálculo automático disponible */}
                {academicStats.systemType && academicStats.totalCredits && academicStats.costPerCredit && academicStats.systemType === 'credits' && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[styles.inputHelper, { marginBottom: 8 }]}>
                      Cálculo automático: {parseInt(academicStats.totalCredits)} créditos × DOP${parseInt(academicStats.costPerCredit).toLocaleString()} = 
                      DOP${(parseInt(academicStats.totalCredits) * parseInt(academicStats.costPerCredit)).toLocaleString()}
                    </Text>
                    <TouchableOpacity 
                      style={{
                        backgroundColor: theme.colors.primary,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 6,
                        alignSelf: 'flex-start'
                      }}
                      onPress={autoCalculateTotalCost}
                    >
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                        🧮 Calcular Automáticamente
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {academicStats.systemType && academicStats.totalPeriods && academicStats.costPerPeriod && academicStats.systemType === 'periods' && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[styles.inputHelper, { marginBottom: 8 }]}>
                      Cálculo automático: {parseInt(academicStats.totalPeriods)} {academicStats.divisionType?.slice(0, -1) || 'período'}
                      {parseInt(academicStats.totalPeriods) !== 1 ? 's' : ''} × DOP${parseInt(academicStats.costPerPeriod).toLocaleString()} = 
                      DOP${(parseInt(academicStats.totalPeriods) * parseInt(academicStats.costPerPeriod)).toLocaleString()}
                    </Text>
                    <TouchableOpacity 
                      style={{
                        backgroundColor: theme.colors.primary,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 6,
                        alignSelf: 'flex-start'
                      }}
                      onPress={autoCalculateTotalCost}
                    >
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                        🧮 Calcular Automáticamente
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Información automática si ya se calculó */}
                {academicStats.totalCareerCost && (academicStats.costPerCredit || academicStats.costPerPeriod) && (
                  <View style={{
                    backgroundColor: theme.colors.success + '20',
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 12
                  }}>
                    <Text style={[styles.textPrimary, { fontWeight: '600', marginBottom: 4 }]}>
                      ✅ Costo Total Configurado
                    </Text>
                    <Text style={styles.textSecondary}>
                      DOP${parseInt(academicStats.totalCareerCost).toLocaleString()}
                      {academicStats.systemType === 'credits' && academicStats.costPerCredit && 
                        ` (${parseInt(academicStats.totalCredits)} créditos × DOP${parseInt(academicStats.costPerCredit).toLocaleString()})`}
                      {academicStats.systemType === 'periods' && academicStats.costPerPeriod && 
                        ` (${parseInt(academicStats.totalPeriods)} ${academicStats.divisionType?.slice(0, -1) || 'período'}${parseInt(academicStats.totalPeriods) !== 1 ? 's' : ''} × DOP${parseInt(academicStats.costPerPeriod).toLocaleString()})`}
                    </Text>
                  </View>
                )}
              </View>

              {academicStats.systemType === 'periods' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Costo por {academicStats.divisionType?.slice(0, -1) || 'Período'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.textPrimary, { marginRight: 8, fontSize: 16 }]}>DOP$</Text>
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      value={academicStats.costPerPeriod}
                      onChangeText={(text) => handleInputChange('costPerPeriod', text)}
                      placeholder={academicStats.totalCareerCost && academicStats.totalPeriods ? 
                        `Sugerido: ${Math.round(parseInt(academicStats.totalCareerCost || 0) / parseInt(academicStats.totalPeriods || 1))}` : 
                        "Ej: 50000"}
                      keyboardType="numeric"
                    />
                  </View>
                  {academicStats.totalCareerCost && academicStats.totalPeriods && (
                    <TouchableOpacity 
                      style={{
                        backgroundColor: theme.colors.secondary,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6,
                        marginTop: 8,
                        alignSelf: 'flex-start'
                      }}
                      onPress={() => handleInputChange('costPerPeriod', 
                        Math.round(parseInt(academicStats.totalCareerCost) / parseInt(academicStats.totalPeriods)).toString()
                      )}
                    >
                      <Text style={{ color: 'white', fontSize: 12 }}>
                        Usar valor sugerido (DOP${Math.round(parseInt(academicStats.totalCareerCost) / parseInt(academicStats.totalPeriods)).toLocaleString()})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {academicStats.systemType === 'credits' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Costo por Crédito</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.textPrimary, { marginRight: 8, fontSize: 16 }]}>DOP$</Text>
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      value={academicStats.costPerCredit}
                      onChangeText={(text) => handleInputChange('costPerCredit', text)}
                      placeholder={academicStats.totalCareerCost && academicStats.totalCredits ? 
                        `Sugerido: ${Math.round(parseInt(academicStats.totalCareerCost || 0) / parseInt(academicStats.totalCredits || 1))}` : 
                        "Ej: 2000"}
                      keyboardType="numeric"
                    />
                  </View>
                  {academicStats.totalCareerCost && academicStats.totalCredits && (
                    <TouchableOpacity 
                      style={{
                        backgroundColor: theme.colors.secondary,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6,
                        marginTop: 8,
                        alignSelf: 'flex-start'
                      }}
                      onPress={() => handleInputChange('costPerCredit', 
                        Math.round(parseInt(academicStats.totalCareerCost) / parseInt(academicStats.totalCredits)).toString()
                      )}
                    >
                      <Text style={{ color: 'white', fontSize: 12 }}>
                        Usar valor sugerido (DOP${Math.round(parseInt(academicStats.totalCareerCost) / parseInt(academicStats.totalCredits)).toLocaleString()})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Monto ya Pagado</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.textPrimary, { marginRight: 8, fontSize: 16 }]}>DOP$</Text>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    value={academicStats.paidAmount}
                    onChangeText={(text) => handleInputChange('paidAmount', text)}
                    placeholder="Ej: 250000"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Gastos Adicionales */}
              <View style={{
                backgroundColor: theme.colors.surface,
                padding: 16,
                borderRadius: 8,
                marginTop: 16
              }}>
                <Text style={[styles.textPrimary, { fontWeight: '600', marginBottom: 12 }]}>
                  📚 Gastos Adicionales
                </Text>
                
                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8
                  }}
                  onPress={() => handleInputChange('includeBooks', !academicStats.includeBooks)}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: theme.colors.primary,
                    backgroundColor: academicStats.includeBooks ? theme.colors.primary : 'transparent',
                    marginRight: 12,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {academicStats.includeBooks && (
                      <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.textPrimary}>Incluir costo de libros</Text>
                </TouchableOpacity>

                {academicStats.includeBooks && (
                  <View style={[styles.inputGroup, { marginTop: 8, marginLeft: 32 }]}>
                    <Text style={[styles.inputLabel, { fontSize: 14 }]}>Libros por período</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.textSecondary, { marginRight: 8 }]}>DOP$</Text>
                      <TextInput
                        style={[styles.textInput, { flex: 1, height: 40 }]}
                        value={academicStats.booksPerPeriod}
                        onChangeText={(text) => handleInputChange('booksPerPeriod', text)}
                        placeholder="Ej: 5000"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8
                  }}
                  onPress={() => handleInputChange('includeTransport', !academicStats.includeTransport)}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: theme.colors.primary,
                    backgroundColor: academicStats.includeTransport ? theme.colors.primary : 'transparent',
                    marginRight: 12,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {academicStats.includeTransport && (
                      <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.textPrimary}>Incluir costo de transporte</Text>
                </TouchableOpacity>

                {academicStats.includeTransport && (
                  <View style={[styles.inputGroup, { marginTop: 8, marginLeft: 32 }]}>
                    <Text style={[styles.inputLabel, { fontSize: 14 }]}>Transporte mensual</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.textSecondary, { marginRight: 8 }]}>DOP$</Text>
                      <TextInput
                        style={[styles.textInput, { flex: 1, height: 40 }]}
                        value={academicStats.transportPerMonth}
                        onChangeText={(text) => handleInputChange('transportPerMonth', text)}
                        placeholder="Ej: 2000"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8
                  }}
                  onPress={() => handleInputChange('includeExtras', !academicStats.includeExtras)}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: theme.colors.primary,
                    backgroundColor: academicStats.includeExtras ? theme.colors.primary : 'transparent',
                    marginRight: 12,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {academicStats.includeExtras && (
                      <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.textPrimary}>Incluir gastos extras</Text>
                </TouchableOpacity>

                {academicStats.includeExtras && (
                  <View style={[styles.inputGroup, { marginTop: 8, marginLeft: 32 }]}>
                    <Text style={[styles.inputLabel, { fontSize: 14 }]}>Extras por período</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.textSecondary, { marginRight: 8 }]}>DOP$</Text>
                      <TextInput
                        style={[styles.textInput, { flex: 1, height: 40 }]}
                        value={academicStats.extrasPerPeriod}
                        onChangeText={(text) => handleInputChange('extrasPerPeriod', text)}
                        placeholder="Ej: 3000"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Resumen Económico */}
              {(academicStats.totalCareerCost || academicStats.paidAmount) && (
                <View style={{
                  backgroundColor: theme.colors.primary + '20',
                  padding: 16,
                  borderRadius: 8,
                  marginTop: 16
                }}>
                  <Text style={[styles.textPrimary, { fontWeight: '600', marginBottom: 8 }]}>
                    💡 Resumen Económico
                  </Text>
                  {academicStats.totalCareerCost && (
                    <Text style={styles.textSecondary}>
                      Costo total: DOP${parseInt(academicStats.totalCareerCost || 0).toLocaleString()}
                    </Text>
                  )}
                  {academicStats.paidAmount && (
                    <Text style={styles.textSecondary}>
                      Pagado: DOP${parseInt(academicStats.paidAmount || 0).toLocaleString()}
                    </Text>
                  )}
                  {academicStats.totalCareerCost && academicStats.paidAmount && (
                    <>
                      <Text style={styles.textSecondary}>
                        Restante: DOP${(parseInt(academicStats.totalCareerCost) - parseInt(academicStats.paidAmount)).toLocaleString()}
                      </Text>
                      <Text style={styles.textSecondary}>
                        Progreso de pago: {((parseInt(academicStats.paidAmount) / parseInt(academicStats.totalCareerCost)) * 100).toFixed(1)}%
                      </Text>
                    </>
                  )}
                </View>
              )}
            </View>

            {/* Botones de Acción */}
            <View style={{ marginBottom: 40 }}>
              <TouchableOpacity 
                style={[
                  styles.primaryButton,
                  { backgroundColor: theme.colors.primary, marginBottom: 12 }
                ]}
                onPress={saveAcademicStats}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, { color: 'white' }]}>
                  {isLoading ? 'Guardando...' : 'Guardar y Continuar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryButton]}
                onPress={skipAcademicSetup}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  Omitir por Ahora
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
