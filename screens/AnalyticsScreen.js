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
import { useTheme } from '../contexts/ThemeContext';
import { createThemedStyles } from '../utils/themeStyles';

const SCHEDULES_STORAGE_KEY = '@schedax_schedules';
const EVENTS_STORAGE_KEY = '@schedax_institutional_events';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const styles = createThemedStyles(theme);
  const [currentUser, setCurrentUser] = useState(null);
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
