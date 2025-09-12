import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStorage } from '../services/UserStorage';
import { AcademicStatsStorage } from '../services/AcademicStatsStorage';
import { useTheme } from '../contexts/ThemeContext';
import { createThemedStyles } from '../utils/themeStyles';

const SCHEDULES_STORAGE_KEY = '@schedax_schedules';
const EVENTS_STORAGE_KEY = '@schedax_institutional_events';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const styles = createThemedStyles(theme);
  const [currentUser, setCurrentUser] = useState(null);
  const [academicStats, setAcademicStats] = useState(null);
  const [academicProgress, setAcademicProgress] = useState(null);
  const [academicInsights, setAcademicInsights] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalSchedules: 0,
    totalMaterias: 0,
    totalEvents: 0,
    totalCredits: 0,
    busyHours: 0,
    freeHours: 0,
    materiasPerDay: {},
    eventsByType: {},
    busyDays: [],
    freeDays: [],
    averageClassTime: 0,
    mostBusyDay: '',
    leastBusyDay: ''
  });

  useEffect(() => {
    loadCurrentUser();
    loadAcademicStats();
  }, []);

  useEffect(() => {
    if (currentUser) {
      calculateAnalytics();
    }
  }, [currentUser]);

  const loadCurrentUser = async () => {
    const user = await UserStorage.getCurrentUser();
    setCurrentUser(user);
  };

  const loadAcademicStats = async () => {
    try {
      const stats = await AcademicStatsStorage.getAcademicStats();
      if (stats) {
        setAcademicStats(stats);
        
        // Calcular progreso académico
        const progress = AcademicStatsStorage.calculateProgress(stats);
        setAcademicProgress(progress);
        
        // Obtener insights académicos
        const insights = AcademicStatsStorage.getAcademicInsights(stats);
        setAcademicInsights(insights);
      }
    } catch (error) {
      console.error('Error loading academic stats:', error);
    }
  };

  const calculateTimeEstimations = () => {
    if (!academicStats || !academicProgress) return null;

    const estimations = {};
    const STANDARD_SUBJECTS_PER_PERIOD = 7; // Estándar de 7 materias por período
    
    // Función helper para convertir períodos a años y meses
    const convertPeriodsToYearsMonths = (periods, divisionType) => {
      let monthsPerPeriod;
      
      switch (divisionType) {
        case 'semestres':
          monthsPerPeriod = 6;
          break;
        case 'cuatrimestres':
          monthsPerPeriod = 4;
          break;
        case 'trimestres':
          monthsPerPeriod = 3;
          break;
        case 'anuales':
          monthsPerPeriod = 12;
          break;
        default:
          monthsPerPeriod = 6; // Default a semestre
      }
      
      const totalMonths = periods * monthsPerPeriod;
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      
      return { years, months, totalMonths };
    };

    // Estimación basada en períodos restantes (para sistema de períodos)
    if (academicStats.systemType === 'periods' && academicStats.totalPeriods) {
      const totalPeriods = parseInt(academicStats.totalPeriods);
      const completedPeriods = parseInt(academicStats.completedPeriods) || 0;
      const remainingPeriods = totalPeriods - completedPeriods;
      
      estimations.remainingPeriods = remainingPeriods;
      estimations.periodType = academicStats.divisionType?.slice(0, -1) || 'período';
      
      // Convertir a años y meses
      const timeRemaining = convertPeriodsToYearsMonths(remainingPeriods, academicStats.divisionType);
      estimations.timeRemainingByPeriods = timeRemaining;
    }

    // Estimación basada en materias restantes (usando estándar de 7 materias por período)
    const remainingSubjects = academicProgress.remainingSubjects;
    if (remainingSubjects > 0) {
      const estimatedPeriods = Math.ceil(remainingSubjects / STANDARD_SUBJECTS_PER_PERIOD);
      estimations.estimatedPeriodsBasedOnSubjects = estimatedPeriods;
      estimations.standardSubjectsPerPeriod = STANDARD_SUBJECTS_PER_PERIOD;
      
      // Convertir a años y meses
      const timeRemaining = convertPeriodsToYearsMonths(estimatedPeriods, academicStats.divisionType);
      estimations.timeRemainingBySubjects = timeRemaining;
    }

    // Estimación basada en carga académica actual (si tiene horarios creados)
    if (remainingSubjects > 0 && analytics.totalMaterias > 0) {
      const currentSubjectsPerPeriod = analytics.totalMaterias;
      const estimatedPeriodsWithCurrentLoad = Math.ceil(remainingSubjects / Math.max(1, currentSubjectsPerPeriod));
      
      estimations.estimatedPeriodsWithCurrentLoad = estimatedPeriodsWithCurrentLoad;
      estimations.currentSubjectsPerPeriod = currentSubjectsPerPeriod;
      
      // Convertir a años y meses
      const timeRemaining = convertPeriodsToYearsMonths(estimatedPeriodsWithCurrentLoad, academicStats.divisionType);
      estimations.timeRemainingWithCurrentLoad = timeRemaining;
    }

    return estimations;
  };

  // Función helper para formatear tiempo en años y meses
  const formatTimeRemaining = (timeObj) => {
    if (!timeObj) return '';
    
    const { years, months } = timeObj;
    let result = '';
    
    if (years > 0) {
      result += `${years} año${years !== 1 ? 's' : ''}`;
    }
    
    if (months > 0) {
      if (result) result += ' y ';
      result += `${months} mes${months !== 1 ? 'es' : ''}`;
    }
    
    if (!result) result = 'Menos de 1 mes';
    
    return result;
  };

  // Función para calcular estimaciones económicas
  const calculateEconomicEstimations = () => {
    if (!academicStats || !academicProgress) return null;

    const estimations = {};
    
    // Costo restante de la carrera (solo matrícula)
    if (academicStats.totalCareerCost && academicStats.paidAmount) {
      const totalCost = parseInt(academicStats.totalCareerCost);
      const paidAmount = parseInt(academicStats.paidAmount);
      estimations.remainingCareerCost = Math.max(0, totalCost - paidAmount);
      estimations.paymentProgress = (paidAmount / totalCost) * 100;
    }

    // Estimación basada en créditos restantes
    if (academicStats.systemType === 'credits' && academicStats.costPerCredit && academicProgress.remainingCredits > 0) {
      const costPerCredit = parseInt(academicStats.costPerCredit);
      estimations.remainingCostByCredits = academicProgress.remainingCredits * costPerCredit;
    }

    // Estimación basada en períodos restantes  
    if (academicStats.systemType === 'periods' && academicStats.costPerPeriod && academicProgress.remainingPeriods > 0) {
      const costPerPeriod = parseInt(academicStats.costPerPeriod);
      estimations.remainingCostByPeriods = academicProgress.remainingPeriods * costPerPeriod;
    }

    // Gastos adicionales restantes
    if (academicProgress.remainingPeriods > 0) {
      let additionalCosts = 0;
      
      if (academicStats.includeBooks && academicStats.booksPerPeriod) {
        const booksCost = parseInt(academicStats.booksPerPeriod) * academicProgress.remainingPeriods;
        additionalCosts += booksCost;
        estimations.remainingBooksCost = booksCost;
      }
      
      if (academicStats.includeExtras && academicStats.extrasPerPeriod) {
        const extrasCost = parseInt(academicStats.extrasPerPeriod) * academicProgress.remainingPeriods;
        additionalCosts += extrasCost;
        estimations.remainingExtrasCost = extrasCost;
      }
      
      // Transporte (calcular por meses restantes)
      if (academicStats.includeTransport && academicStats.transportPerMonth) {
        const timeEstimations = calculateTimeEstimations();
        if (timeEstimations && timeEstimations.timeRemainingByPeriods) {
          const remainingMonths = timeEstimations.timeRemainingByPeriods.totalMonths;
          const transportCost = parseInt(academicStats.transportPerMonth) * remainingMonths;
          additionalCosts += transportCost;
          estimations.remainingTransportCost = transportCost;
        }
      }
      
      estimations.totalAdditionalCosts = additionalCosts;
    }

    // Costo total restante (matrícula + gastos adicionales)
    if (estimations.remainingCareerCost !== undefined || estimations.totalAdditionalCosts) {
      estimations.totalRemainingCost = (estimations.remainingCareerCost || 0) + (estimations.totalAdditionalCosts || 0);
    }

    return estimations;
  };

  const calculateAnalytics = async () => {
    try {
      // Cargar schedules
      const schedulesJson = await AsyncStorage.getItem(SCHEDULES_STORAGE_KEY);
      const allSchedules = schedulesJson ? JSON.parse(schedulesJson) : [];
      const userSchedules = allSchedules.filter(schedule => schedule.userId === currentUser.id);

      // Cargar eventos
      const eventsJson = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
      const allEvents = eventsJson ? JSON.parse(eventsJson) : [];
      const userEvents = allEvents.filter(event => event.userId === currentUser.id);

      // Calcular estadísticas
      let totalMaterias = 0;
      let totalCredits = 0;
      let totalHours = 0;
      const materiasPerDay = {
        'lunes': 0,
        'martes': 0,
        'miércoles': 0,
        'jueves': 0,
        'viernes': 0,
        'sábado': 0,
        'domingo': 0
      };

      const eventsByType = {};
      const hoursPerDay = {
        'lunes': 0,
        'martes': 0,
        'miércoles': 0,
        'jueves': 0,
        'viernes': 0,
        'sábado': 0,
        'domingo': 0
      };

      // Procesar schedules
      userSchedules.forEach(schedule => {
        if (schedule.materias) {
          schedule.materias.forEach(materia => {
            totalMaterias++;
            totalCredits += parseInt(materia.credits || 0);

            // Contar materias por día y calcular horas
            if (materia.horarios) {
              Object.keys(materia.horarios).forEach(day => {
                if (materia.horarios[day] && materia.horarios[day].length > 0) {
                  materiasPerDay[day.toLowerCase()] += materia.horarios[day].length;
                  
                  // Calcular horas por día
                  materia.horarios[day].forEach(horario => {
                    const timeMatch = horario.hora.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
                    if (timeMatch) {
                      const startHour = parseInt(timeMatch[1]);
                      const startMin = parseInt(timeMatch[2]);
                      const endHour = parseInt(timeMatch[3]);
                      const endMin = parseInt(timeMatch[4]);
                      
                      const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                      totalHours += duration / 60;
                      hoursPerDay[day.toLowerCase()] += duration / 60;
                    }
                  });
                }
              });
            }
          });
        }
      });

      // Procesar eventos por tipo
      userEvents.forEach(event => {
        const type = event.type || 'other';
        eventsByType[type] = (eventsByType[type] || 0) + 1;
      });

      // Encontrar el día más ocupado y menos ocupado
      const sortedDays = Object.entries(hoursPerDay).sort((a, b) => b[1] - a[1]);
      const mostBusyDay = sortedDays[0][0];
      const leastBusyDay = sortedDays[sortedDays.length - 1][0];

      // Calcular días ocupados y libres
      const busyDays = Object.keys(hoursPerDay).filter(day => hoursPerDay[day] > 0);
      const freeDays = Object.keys(hoursPerDay).filter(day => hoursPerDay[day] === 0);

      // Promedio de tiempo de clase
      const averageClassTime = totalMaterias > 0 ? totalHours / totalMaterias : 0;

      setAnalytics({
        totalSchedules: userSchedules.length,
        totalMaterias,
        totalEvents: userEvents.length,
        totalCredits,
        busyHours: Math.round(totalHours * 100) / 100,
        freeHours: Math.round((7 * 12 - totalHours) * 100) / 100, // Asumiendo 12 horas laborales por día
        materiasPerDay,
        eventsByType,
        busyDays,
        freeDays,
        averageClassTime: Math.round(averageClassTime * 100) / 100,
        mostBusyDay,
        leastBusyDay
      });

    } catch (error) {
      console.error('Error calculating analytics:', error);
      Alert.alert('Error', 'No se pudieron calcular las estadísticas');
    }
  };

  const getEventTypeName = (type) => {
    const types = {
      exposition: 'Exposiciones',
      project: 'Proyectos',
      exam: 'Exámenes',
      presentation: 'Presentaciones',
      workshop: 'Talleres',
      conference: 'Conferencias',
      deadline: 'Fechas Límite',
      meeting: 'Reuniones',
      other: 'Otros'
    };
    return types[type] || 'Otros';
  };

  const StatCard = ({ title, value, subtitle, color, icon }) => (
    <View style={[
      styles.card, 
      { 
        width: (width - 40) / 2 - 8, 
        backgroundColor: color,
        margin: 8,
        shadowColor: isDark ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }
    ]}>
      <Text style={{ fontSize: 24, marginBottom: 4 }}>{icon}</Text>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{value}</Text>
      <Text style={{ color: '#fff', fontSize: 14, opacity: 0.9 }}>{title}</Text>
      {subtitle && <Text style={{ color: '#fff', fontSize: 12, opacity: 0.75, marginTop: 4 }}>{subtitle}</Text>}
    </View>
  );

  const ProgressBar = ({ label, value, maxValue, color }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.textPrimary, { fontWeight: '500', textTransform: 'capitalize' }]}>{label}</Text>
          <Text style={styles.textSecondary}>{value}</Text>
        </View>
        <View style={{ 
          backgroundColor: isDark ? '#374151' : '#E5E7EB', 
          borderRadius: 6, 
          height: 12 
        }}>
          <View 
            style={{ 
              backgroundColor: color, 
              borderRadius: 6, 
              height: 12,
              width: `${Math.min(percentage, 100)}%` 
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ marginRight: 16 }}
            onPress={() => navigation.openDrawer()}
          >
            <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: 24, height: 2, backgroundColor: theme.colors.textOnPrimary, marginBottom: 4 }}></View>
              <View style={{ width: 24, height: 2, backgroundColor: theme.colors.textOnPrimary, marginBottom: 4 }}></View>
              <View style={{ width: 24, height: 2, backgroundColor: theme.colors.textOnPrimary }}></View>
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Estadísticas Académicas</Text>
            <Text style={styles.headerSubtitle}>Análisis de tu rendimiento</Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20
            }}
            onPress={calculateAnalytics}
          >
            <Text style={{ color: theme.colors.textOnPrimary, fontSize: 18 }}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 12 }}>
        {/* Mensaje si no hay estadísticas académicas configuradas */}
        {!academicStats && (
          <View style={[styles.card, { marginTop: 16, marginHorizontal: 8 }]}>
            <Text style={[styles.textTitle, { marginBottom: 12 }]}>Configurar Información Académica</Text>
            <Text style={[styles.textSecondary, { marginBottom: 16 }]}>
              Configura tu información académica para ver estadísticas detalladas sobre tu progreso en la carrera.
            </Text>
            <TouchableOpacity 
              style={[styles.buttonPrimary, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Statistics')}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>
                Configurar Ahora
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progreso Académico */}
        {academicStats && (
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.textTitle, { marginBottom: 12, marginHorizontal: 8 }]}>Progreso Académico</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <StatCard
                title="Progreso Total"
                value={`${academicProgress?.completionPercentage?.toFixed(1)}%`}
                subtitle={academicStats.systemType === 'credits' ? 'Por créditos' : 'Por períodos'}
                color="#10B981"
                icon="📊"
              />
              
              {academicStats.systemType === 'credits' && (
                <StatCard
                  title="Créditos Restantes"
                  value={academicProgress?.remainingCredits || 0}
                  subtitle={`De ${academicStats.totalCredits} totales`}
                  color="#EF4444"
                  icon="⭐"
                />
              )}
              
              <StatCard
                title="Materias Restantes"
                value={academicProgress?.remainingSubjects || 0}
                subtitle={`De ${academicStats.totalSubjects} totales`}
                color="#F59E0B"
                icon="📖"
              />
              
              {academicStats.systemType === 'periods' && academicProgress?.remainingPeriods > 0 && (
                <StatCard
                  title="Períodos Restantes"
                  value={academicProgress.remainingPeriods}
                  subtitle={academicStats.divisionType || 'Períodos'}
                  color="#8B5CF6"
                  icon="⏰"
                />
              )}
            </View>
          </View>
        )}

        {/* Progreso Económico */}
        {academicStats && (academicStats.totalCareerCost || academicStats.paidAmount) && (
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.textTitle, { marginBottom: 12, marginHorizontal: 8 }]}>Progreso Económico</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {academicStats.totalCareerCost && (
                <StatCard
                  title="Costo Total"
                  value={`DOP$${(parseInt(academicStats.totalCareerCost) / 1000).toFixed(0)}K`}
                  subtitle="Costo completo de la carrera"
                  color="#6366F1"
                  icon="💰"
                />
              )}
              
              {academicStats.paidAmount && (
                <StatCard
                  title="Pagado"
                  value={`DOP$${(parseInt(academicStats.paidAmount) / 1000).toFixed(0)}K`}
                  subtitle={academicStats.totalCareerCost ? 
                    `${((parseInt(academicStats.paidAmount) / parseInt(academicStats.totalCareerCost)) * 100).toFixed(1)}% del total` : 
                    'Monto abonado'}
                  color="#10B981"
                  icon="💳"
                />
              )}
              
              {academicStats.totalCareerCost && academicStats.paidAmount && (
                <StatCard
                  title="Restante"
                  value={`DOP$${((parseInt(academicStats.totalCareerCost) - parseInt(academicStats.paidAmount)) / 1000).toFixed(0)}K`}
                  subtitle="Por pagar"
                  color="#EF4444"
                  icon="📊"
                />
              )}

              {/* Cálculo del costo por crédito o período */}
              {academicStats.systemType === 'credits' && academicStats.costPerCredit && (
                <StatCard
                  title="Por Crédito"
                  value={`DOP$${parseInt(academicStats.costPerCredit).toLocaleString()}`}
                  subtitle={academicProgress?.remainingCredits ? 
                    `Faltan: DOP$${(parseInt(academicStats.costPerCredit) * academicProgress.remainingCredits / 1000).toFixed(0)}K` : 
                    'Costo unitario'}
                  color="#8B5CF6"
                  icon="🎓"
                />
              )}

              {academicStats.systemType === 'periods' && academicStats.costPerPeriod && (
                <StatCard
                  title={`Por ${academicStats.divisionType?.slice(0, -1) || 'Período'}`}
                  value={`DOP$${(parseInt(academicStats.costPerPeriod) / 1000).toFixed(0)}K`}
                  subtitle={academicProgress?.remainingPeriods ? 
                    `Faltan: DOP$${(parseInt(academicStats.costPerPeriod) * academicProgress.remainingPeriods / 1000).toFixed(0)}K` : 
                    'Costo unitario'}
                  color="#F59E0B"
                  icon="📅"
                />
              )}
            </View>

            {/* Detalle de gastos adicionales */}
            {(academicStats.includeBooks || academicStats.includeTransport || academicStats.includeExtras) && (
              <View style={[styles.card, { marginTop: 16, marginHorizontal: 8 }]}>
                <Text style={[styles.textTitle, { marginBottom: 12 }]}>💸 Gastos Adicionales</Text>
                
                {academicStats.includeBooks && academicStats.booksPerPeriod && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={styles.textSecondary}>📚 Libros por período:</Text>
                    <Text style={styles.textPrimary}>DOP${parseInt(academicStats.booksPerPeriod).toLocaleString()}</Text>
                  </View>
                )}
                
                {academicStats.includeTransport && academicStats.transportPerMonth && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={styles.textSecondary}>🚗 Transporte mensual:</Text>
                    <Text style={styles.textPrimary}>DOP${parseInt(academicStats.transportPerMonth).toLocaleString()}</Text>
                  </View>
                )}
                
                {academicStats.includeExtras && academicStats.extrasPerPeriod && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={styles.textSecondary}>📝 Extras por período:</Text>
                    <Text style={styles.textPrimary}>DOP${parseInt(academicStats.extrasPerPeriod).toLocaleString()}</Text>
                  </View>
                )}

                {/* Cálculo de gastos totales restantes */}
                {academicProgress?.remainingPeriods > 0 && (
                  <View style={{ 
                    borderTopWidth: 1, 
                    borderTopColor: isDark ? '#374151' : '#E5E7EB', 
                    paddingTop: 12,
                    marginTop: 12
                  }}>
                    <Text style={[styles.textPrimary, { fontWeight: '600', marginBottom: 8 }]}>
                      Gastos adicionales restantes:
                    </Text>
                    {academicStats.includeBooks && academicStats.booksPerPeriod && (
                      <Text style={styles.textSecondary}>
                        Libros: DOP${(parseInt(academicStats.booksPerPeriod) * academicProgress.remainingPeriods).toLocaleString()}
                      </Text>
                    )}
                    {academicStats.includeExtras && academicStats.extrasPerPeriod && (
                      <Text style={styles.textSecondary}>
                        Extras: DOP${(parseInt(academicStats.extrasPerPeriod) * academicProgress.remainingPeriods).toLocaleString()}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Estadísticas Generales */}
        <View style={{ marginTop: 16 }}>
          <Text style={[styles.textTitle, { marginBottom: 12, marginHorizontal: 8 }]}>Resumen General</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <StatCard
              title="Horarios Creados"
              value={analytics.totalSchedules}
              color="#3B82F6"
              icon="📅"
            />
            <StatCard
              title="Materias Totales"
              value={analytics.totalMaterias}
              color="#10B981"
              icon="📚"
            />
            <StatCard
              title="Créditos Totales"
              value={analytics.totalCredits}
              color="#8B5CF6"
              icon="🎓"
            />
            <StatCard
              title="Eventos Programados"
              value={analytics.totalEvents}
              color="#F59E0B"
              icon="🗓️"
            />
          </View>
        </View>

        {/* Análisis de Tiempo */}
        <View style={[styles.card, { marginTop: 16, marginHorizontal: 8 }]}>
          <Text style={[styles.textTitle, { marginBottom: 16 }]}>Análisis de Tiempo</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ 
              flex: 1, 
              alignItems: 'center', 
              backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2', 
              borderRadius: 8, 
              padding: 12, 
              marginRight: 8 
            }}>
              <Text style={{ 
                color: isDark ? '#FCA5A5' : '#DC2626', 
                fontSize: 20, 
                fontWeight: 'bold' 
              }}>{analytics.busyHours}h</Text>
              <Text style={{ 
                color: isDark ? '#FCA5A5' : '#DC2626', 
                fontSize: 14 
              }}>Horas Ocupadas</Text>
            </View>
            <View style={{ 
              flex: 1, 
              alignItems: 'center', 
              backgroundColor: isDark ? '#14532D' : '#F0FDF4', 
              borderRadius: 8, 
              padding: 12, 
              marginLeft: 8 
            }}>
              <Text style={{ 
                color: isDark ? '#86EFAC' : '#16A34A', 
                fontSize: 20, 
                fontWeight: 'bold' 
              }}>{analytics.freeHours}h</Text>
              <Text style={{ 
                color: isDark ? '#86EFAC' : '#16A34A', 
                fontSize: 14 
              }}>Horas Libres</Text>
            </View>
          </View>

          <View style={{ 
            borderTopWidth: 1, 
            borderTopColor: isDark ? '#374151' : '#E5E7EB', 
            paddingTop: 16 
          }}>
            <Text style={[styles.textPrimary, { fontWeight: '500', marginBottom: 8 }]}>📊 Promedio por Clase</Text>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: theme.colors.primary, 
              marginBottom: 4 
            }}>{analytics.averageClassTime}h</Text>
            
            <Text style={[styles.textPrimary, { fontWeight: '500', marginBottom: 4, marginTop: 16 }]}>📈 Día Más Ocupado</Text>
            <Text style={{ 
              color: '#3B82F6', 
              fontWeight: '600', 
              textTransform: 'capitalize' 
            }}>{analytics.mostBusyDay}</Text>
            
            <Text style={[styles.textPrimary, { fontWeight: '500', marginBottom: 4, marginTop: 8 }]}>📉 Día Menos Ocupado</Text>
            <Text style={{ 
              color: '#10B981', 
              fontWeight: '600', 
              textTransform: 'capitalize' 
            }}>{analytics.leastBusyDay}</Text>
          </View>
        </View>

        {/* Insights Académicos */}
        {academicInsights.length > 0 && (
          <View style={[styles.card, { marginTop: 16, marginHorizontal: 8 }]}>
            <Text style={[styles.textTitle, { marginBottom: 16 }]}>Insights Académicos</Text>
            
            {academicInsights.map((insight, index) => (
              <View key={index} style={{ 
                backgroundColor: insight.type === 'success' 
                  ? (isDark ? '#14532D' : '#F0FDF4')
                  : insight.type === 'warning'
                  ? (isDark ? '#451A03' : '#FFFBEB')
                  : (isDark ? '#1E3A8A' : '#EFF6FF'),
                borderLeftWidth: 4, 
                borderLeftColor: insight.type === 'success' 
                  ? '#10B981'
                  : insight.type === 'warning'
                  ? '#F59E0B'
                  : '#3B82F6',
                padding: 12, 
                borderRadius: 8,
                marginBottom: 12
              }}>
                <Text style={{ 
                  color: insight.type === 'success' 
                    ? (isDark ? '#86EFAC' : '#065F46')
                    : insight.type === 'warning'
                    ? (isDark ? '#FDE68A' : '#92400E')
                    : (isDark ? '#93C5FD' : '#1E40AF'),
                  fontWeight: '500',
                  marginBottom: 4
                }}>{insight.icon} {insight.title}</Text>
                <Text style={{ 
                  color: insight.type === 'success' 
                    ? (isDark ? '#6EE7B7' : '#047857')
                    : insight.type === 'warning'
                    ? (isDark ? '#FCD34D' : '#B45309')
                    : (isDark ? '#DBEAFE' : '#1D4ED8'),
                  fontSize: 14 
                }}>{insight.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Estimaciones de Tiempo */}
        {academicStats && academicProgress && (
          <View style={[styles.card, { marginTop: 16, marginHorizontal: 8 }]}>
            <Text style={[styles.textTitle, { marginBottom: 16 }]}>Estimaciones de Finalización</Text>
            
            {(() => {
              const estimations = calculateTimeEstimations();
              if (!estimations) return null;

              return (
                <View>
                  {/* Estimación oficial por períodos restantes */}
                  {estimations.remainingPeriods !== undefined && estimations.timeRemainingByPeriods && (
                    <View style={{ 
                      backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 12
                    }}>
                      <Text style={{ 
                        color: isDark ? '#93C5FD' : '#1E40AF',
                        fontWeight: '600',
                        marginBottom: 4
                      }}>⏰ Tiempo Oficial Restante</Text>
                      <Text style={{ 
                        color: isDark ? '#DBEAFE' : '#1D4ED8',
                        fontSize: 14
                      }}>
                        Te faltan {estimations.remainingPeriods} {estimations.periodType}
                        {estimations.remainingPeriods !== 1 ? 's' : ''} ({formatTimeRemaining(estimations.timeRemainingByPeriods)}) 
                        para completar tu carrera.
                      </Text>
                    </View>
                  )}

                  {/* Estimación estándar por materias (7 materias por período) */}
                  {estimations.estimatedPeriodsBasedOnSubjects && estimations.timeRemainingBySubjects && (
                    <View style={{ 
                      backgroundColor: isDark ? '#581C87' : '#FAF5FF',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 12
                    }}>
                      <Text style={{ 
                        color: isDark ? '#C4B5FD' : '#7C3AED',
                        fontWeight: '600',
                        marginBottom: 4
                      }}>📊 Estimación Estándar (7 materias/{academicStats.divisionType?.slice(0, -1) || 'período'})</Text>
                      <Text style={{ 
                        color: isDark ? '#DDD6FE' : '#6D28D9',
                        fontSize: 14
                      }}>
                        Con una carga estándar de {estimations.standardSubjectsPerPeriod} materias por {estimations.periodType || 'período'}, 
                        te tomaría aproximadamente {formatTimeRemaining(estimations.timeRemainingBySubjects)} completar 
                        las {academicProgress.remainingSubjects} materias restantes.
                      </Text>
                    </View>
                  )}

                  {/* Estimación basada en carga actual */}
                  {estimations.estimatedPeriodsWithCurrentLoad && estimations.timeRemainingWithCurrentLoad && analytics.totalMaterias > 0 && (
                    <View style={{ 
                      backgroundColor: isDark ? '#0F766E' : '#F0FDFA',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 12
                    }}>
                      <Text style={{ 
                        color: isDark ? '#5EEAD4' : '#0F766E',
                        fontWeight: '600',
                        marginBottom: 4
                      }}>🎯 Basado en tu Carga Actual</Text>
                      <Text style={{ 
                        color: isDark ? '#99F6E4' : '#134E4A',
                        fontSize: 14
                      }}>
                        Con tu carga actual de {estimations.currentSubjectsPerPeriod} materias por período, 
                        te tomaría aproximadamente {formatTimeRemaining(estimations.timeRemainingWithCurrentLoad)} 
                        completar la carrera.
                      </Text>
                    </View>
                  )}

                  {/* Meta de créditos (solo para sistema de créditos) */}
                  {academicStats.systemType === 'credits' && academicProgress.remainingCredits > 0 && (
                    <View style={{ 
                      backgroundColor: isDark ? '#14532D' : '#F0FDF4',
                      borderRadius: 8,
                      padding: 12
                    }}>
                      <Text style={{ 
                        color: isDark ? '#86EFAC' : '#065F46',
                        fontWeight: '600',
                        marginBottom: 4
                      }}>💪 Meta de Créditos</Text>
                      <Text style={{ 
                        color: isDark ? '#6EE7B7' : '#047857',
                        fontSize: 14
                      }}>
                        Te faltan {academicProgress.remainingCredits} créditos de {academicStats.totalCredits} totales 
                        para completar tu carrera ({academicProgress.completionPercentage.toFixed(1)}% completado).
                      </Text>
                    </View>
                  )}
                </View>
              );
            })()}
          </View>
        )}

        {/* Estimaciones Económicas */}
        {academicStats && (academicStats.totalCareerCost || academicStats.paidAmount) && (
          <View style={[styles.card, { marginTop: 16, marginHorizontal: 8 }]}>
            <Text style={[styles.textTitle, { marginBottom: 16 }]}>Estimaciones Económicas</Text>
            
            {(() => {
              const economicEstimations = calculateEconomicEstimations();
              if (!economicEstimations) return null;

              return (
                <View>
                  {/* Progreso de pagos */}
                  {economicEstimations.remainingCareerCost !== undefined && (
                    <View style={{ 
                      backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 12
                    }}>
                      <Text style={{ 
                        color: isDark ? '#93C5FD' : '#1E40AF',
                        fontWeight: '600',
                        marginBottom: 4
                      }}>💳 Progreso de Pagos</Text>
                      <Text style={{ 
                        color: isDark ? '#DBEAFE' : '#1D4ED8',
                        fontSize: 14
                      }}>
                        Has pagado DOP${parseInt(academicStats.paidAmount).toLocaleString()} de DOP${parseInt(academicStats.totalCareerCost).toLocaleString()} 
                        ({economicEstimations.paymentProgress.toFixed(1)}% del costo total).
                      </Text>
                      <Text style={{ 
                        color: isDark ? '#BFDBFE' : '#3B82F6',
                        fontSize: 14,
                        marginTop: 4
                      }}>
                        Restante: DOP${economicEstimations.remainingCareerCost.toLocaleString()}
                      </Text>
                    </View>
                  )}

                  {/* Estimación por créditos restantes */}
                  {economicEstimations.remainingCostByCredits && (
                    <View style={{ 
                      backgroundColor: isDark ? '#581C87' : '#FAF5FF',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 12
                    }}>
                      <Text style={{ 
                        color: isDark ? '#C4B5FD' : '#7C3AED',
                        fontWeight: '600',
                        marginBottom: 4
                      }}>🎓 Por Créditos Restantes</Text>
                      <Text style={{ 
                        color: isDark ? '#DDD6FE' : '#6D28D9',
                        fontSize: 14
                      }}>
                        Te faltan {academicProgress.remainingCredits} créditos a DOP${parseInt(academicStats.costPerCredit).toLocaleString()} cada uno = 
                        DOP${economicEstimations.remainingCostByCredits.toLocaleString()}
                      </Text>
                    </View>
                  )}

                  {/* Estimación por períodos restantes */}
                  {economicEstimations.remainingCostByPeriods && (
                    <View style={{ 
                      backgroundColor: isDark ? '#0F766E' : '#F0FDFA',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 12
                    }}>
                      <Text style={{ 
                        color: isDark ? '#5EEAD4' : '#0F766E',
                        fontWeight: '600',
                        marginBottom: 4
                      }}>📅 Por Períodos Restantes</Text>
                      <Text style={{ 
                        color: isDark ? '#99F6E4' : '#134E4A',
                        fontSize: 14
                      }}>
                        Te faltan {academicProgress.remainingPeriods} {academicStats.divisionType?.slice(0, -1) || 'período'}
                        {academicProgress.remainingPeriods !== 1 ? 's' : ''} a DOP${parseInt(academicStats.costPerPeriod).toLocaleString()} cada uno = 
                        DOP${economicEstimations.remainingCostByPeriods.toLocaleString()}
                      </Text>
                    </View>
                  )}

                  {/* Gastos adicionales */}
                  {economicEstimations.totalAdditionalCosts > 0 && (
                    <View style={{ 
                      backgroundColor: isDark ? '#451A03' : '#FFFBEB',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 12
                    }}>
                      <Text style={{ 
                        color: isDark ? '#FDE68A' : '#92400E',
                        fontWeight: '600',
                        marginBottom: 4
                      }}>💸 Gastos Adicionales Restantes</Text>
                      
                      {economicEstimations.remainingBooksCost && (
                        <Text style={{ 
                          color: isDark ? '#FCD34D' : '#B45309',
                          fontSize: 14
                        }}>
                          📚 Libros: DOP${economicEstimations.remainingBooksCost.toLocaleString()}
                        </Text>
                      )}
                      
                      {economicEstimations.remainingTransportCost && (
                        <Text style={{ 
                          color: isDark ? '#FCD34D' : '#B45309',
                          fontSize: 14
                        }}>
                          🚗 Transporte: DOP${economicEstimations.remainingTransportCost.toLocaleString()}
                        </Text>
                      )}
                      
                      {economicEstimations.remainingExtrasCost && (
                        <Text style={{ 
                          color: isDark ? '#FCD34D' : '#B45309',
                          fontSize: 14
                        }}>
                          📝 Extras: DOP${economicEstimations.remainingExtrasCost.toLocaleString()}
                        </Text>
                      )}
                      
                      <Text style={{ 
                        color: isDark ? '#FBBF24' : '#D97706',
                        fontSize: 14,
                        fontWeight: '500',
                        marginTop: 4,
                        borderTopWidth: 1,
                        borderTopColor: isDark ? '#92400E' : '#FDE68A',
                        paddingTop: 4
                      }}>
                        Total adicional: DOP${economicEstimations.totalAdditionalCosts.toLocaleString()}
                      </Text>
                    </View>
                  )}

                  {/* Costo total restante */}
                  {economicEstimations.totalRemainingCost && (
                    <View style={{ 
                      backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2',
                      borderRadius: 8,
                      padding: 12
                    }}>
                      <Text style={{ 
                        color: isDark ? '#FCA5A5' : '#DC2626',
                        fontWeight: '600',
                        marginBottom: 4
                      }}>🎯 Inversión Total Restante</Text>
                      <Text style={{ 
                        color: isDark ? '#FEE2E2' : '#991B1B',
                        fontSize: 16,
                        fontWeight: 'bold'
                      }}>
                        DOP${economicEstimations.totalRemainingCost.toLocaleString()}
                      </Text>
                      <Text style={{ 
                        color: isDark ? '#FECACA' : '#B91C1C',
                        fontSize: 12,
                        marginTop: 4
                      }}>
                        Incluye matrícula y gastos adicionales para completar la carrera
                      </Text>
                    </View>
                  )}
                </View>
              );
            })()}
          </View>
        )}

        {/* Materias por Día */}
        <View style={[styles.card, { marginTop: 16, marginHorizontal: 8 }]}>
          <Text style={[styles.textTitle, { marginBottom: 16 }]}>Distribución Semanal</Text>
          
          {Object.entries(analytics.materiasPerDay).map(([day, count]) => (
            <ProgressBar
              key={day}
              label={day}
              value={count}
              maxValue={Math.max(...Object.values(analytics.materiasPerDay)) || 1}
              color="#3B82F6"
            />
          ))}
        </View>

        {/* Eventos por Tipo */}
        {analytics.totalEvents > 0 && (
          <View style={[styles.card, { marginTop: 16, marginHorizontal: 8 }]}>
            <Text style={[styles.textTitle, { marginBottom: 16 }]}>Eventos por Categoría</Text>
            
            {Object.entries(analytics.eventsByType).map(([type, count]) => (
              <ProgressBar
                key={type}
                label={getEventTypeName(type)}
                value={count}
                maxValue={Math.max(...Object.values(analytics.eventsByType)) || 1}
                color="#8B5CF6"
              />
            ))}
          </View>
        )}

        {/* Recomendaciones */}
        <View style={[styles.card, { marginTop: 16, marginHorizontal: 8, marginBottom: 24 }]}>
          <Text style={[styles.textTitle, { marginBottom: 16 }]}>💡 Recomendaciones</Text>
          
          <View>
            {analytics.busyHours > 40 && (
              <View style={{ 
                backgroundColor: isDark ? '#451A03' : '#FFFBEB', 
                borderLeftWidth: 4, 
                borderLeftColor: '#F59E0B', 
                padding: 12, 
                borderRadius: 8,
                marginBottom: 12
              }}>
                <Text style={{ 
                  color: isDark ? '#FDE68A' : '#92400E', 
                  fontWeight: '500',
                  marginBottom: 4
                }}>⚠️ Carga Académica Alta</Text>
                <Text style={{ 
                  color: isDark ? '#FCD34D' : '#B45309', 
                  fontSize: 14 
                }}>Tienes más de 40 horas semanales. Considera optimizar tu horario.</Text>
              </View>
            )}
            
            {analytics.freeDays.length > 2 && (
              <View style={{ 
                backgroundColor: isDark ? '#14532D' : '#F0FDF4', 
                borderLeftWidth: 4, 
                borderLeftColor: '#10B981', 
                padding: 12, 
                borderRadius: 8,
                marginBottom: 12
              }}>
                <Text style={{ 
                  color: isDark ? '#86EFAC' : '#065F46', 
                  fontWeight: '500',
                  marginBottom: 4
                }}>✅ Buen Balance</Text>
                <Text style={{ 
                  color: isDark ? '#6EE7B7' : '#047857', 
                  fontSize: 14 
                }}>Tienes {analytics.freeDays.length} días libres. ¡Excelente distribución!</Text>
              </View>
            )}
            
            {analytics.totalEvents === 0 && (
              <View style={{ 
                backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF', 
                borderLeftWidth: 4, 
                borderLeftColor: '#3B82F6', 
                padding: 12, 
                borderRadius: 8,
                marginBottom: 12
              }}>
                <Text style={{ 
                  color: isDark ? '#93C5FD' : '#1E40AF', 
                  fontWeight: '500',
                  marginBottom: 4
                }}>📅 Organiza tus Eventos</Text>
                <Text style={{ 
                  color: isDark ? '#BFDBFE' : '#1D4ED8', 
                  fontSize: 14 
                }}>Agrega eventos importantes para una mejor planificación.</Text>
              </View>
            )}

            {analytics.totalMaterias < 5 && (
              <View style={{ 
                backgroundColor: isDark ? '#581C87' : '#FAF5FF', 
                borderLeftWidth: 4, 
                borderLeftColor: '#8B5CF6', 
                padding: 12, 
                borderRadius: 8,
                marginBottom: 12
              }}>
                <Text style={{ 
                  color: isDark ? '#C4B5FD' : '#6B21A8', 
                  fontWeight: '500',
                  marginBottom: 4
                }}>📚 Carga Ligera</Text>
                <Text style={{ 
                  color: isDark ? '#DDD6FE' : '#7C3AED', 
                  fontSize: 14 
                }}>Podrías considerar agregar más materias o actividades extracurriculares.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
