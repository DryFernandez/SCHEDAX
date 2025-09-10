import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserStorage } from '../services/UserStorage';
import { useTheme } from '../contexts/ThemeContext';
import { createThemedStyles } from '../utils/themeStyles';

const EVENTS_STORAGE_KEY = '@schedax_institutional_events';

// Días de la semana en español
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Tipos de eventos predefinidos
const EVENT_TYPES = [
  { id: 'exposition', name: 'Exposición', color: '#3B82F6' },
  { id: 'project', name: 'Proyecto', color: '#10B981' },
  { id: 'exam', name: 'Examen', color: '#EF4444' },
  { id: 'presentation', name: 'Presentación', color: '#8B5CF6' },
  { id: 'workshop', name: 'Taller', color: '#F59E0B' },
  { id: 'conference', name: 'Conferencia', color: '#6366F1' },
  { id: 'deadline', name: 'Fecha Límite', color: '#EC4899' },
  { id: 'meeting', name: 'Reunión', color: '#EAB308' },
  { id: 'other', name: 'Otro', color: '#6B7280' }
];

export default function CalendarScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const styles = createThemedStyles(theme);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: new Date(),
    type: 'other',
    location: ''
  });

  useEffect(() => {
    loadCurrentUser();
    loadEvents();
  }, []);

  const loadCurrentUser = async () => {
    const user = await UserStorage.getCurrentUser();
    setCurrentUser(user);
  };

  const loadEvents = async () => {
    try {
      const eventsJson = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
      const allEvents = eventsJson ? JSON.parse(eventsJson) : [];
      
      if (currentUser) {
        // Cargar eventos del usuario actual
        const userEvents = allEvents.filter(event => event.userId === currentUser.id);
        setEvents(userEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const saveEvent = async () => {
    if (!newEvent.title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para el evento');
      return;
    }

    try {
      const eventsJson = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
      const allEvents = eventsJson ? JSON.parse(eventsJson) : [];
      
      const event = {
        id: Date.now().toString(),
        userId: currentUser?.id,
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        date: newEvent.date.toISOString().split('T')[0],
        time: newEvent.time.toTimeString().slice(0, 5),
        type: newEvent.type,
        location: newEvent.location.trim(),
        createdAt: new Date().toISOString()
      };

      const updatedEvents = [...allEvents, event];
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
      
      setEvents(prev => [...prev, event]);
      setShowEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        date: new Date(),
        time: new Date(),
        type: 'other',
        location: ''
      });
      
      Alert.alert('Éxito', 'Evento agregado correctamente');
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'No se pudo guardar el evento');
    }
  };

  const deleteEvent = async (eventId) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres eliminar este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const eventsJson = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
              const allEvents = eventsJson ? JSON.parse(eventsJson) : [];
              const updatedEvents = allEvents.filter(event => event.id !== eventId);
              
              await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
              setEvents(prev => prev.filter(event => event.id !== eventId));
              
              Alert.alert('Éxito', 'Evento eliminado correctamente');
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'No se pudo eliminar el evento');
            }
          }
        }
      ]
    );
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setNewEvent(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const onTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setNewEvent(prev => ({ ...prev, time: selectedTime }));
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Espacios vacíos para los días anteriores al primer día del mes
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <TouchableOpacity
          key={day}
          style={{
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            margin: 2,
            backgroundColor: isToday 
              ? theme.colors.primary 
              : dayEvents.length > 0 
                ? (isDark ? '#1E40AF' : '#DBEAFE')
                : 'transparent'
          }}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: isToday 
              ? theme.colors.textOnPrimary 
              : dayEvents.length > 0 
                ? (isDark ? '#93C5FD' : '#1D4ED8')
                : styles.textPrimary.color
          }}>
            {day}
          </Text>
          {dayEvents.length > 0 && (
            <View style={{
              position: 'absolute',
              bottom: 4,
              width: 4,
              height: 4,
              backgroundColor: '#EF4444',
              borderRadius: 2
            }} />
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getEventTypeColor = (type) => {
    const eventType = EVENT_TYPES.find(t => t.id === type);
    return eventType ? eventType.color : '#6B7280';
  };

  const getEventTypeName = (type) => {
    const eventType = EVENT_TYPES.find(t => t.id === type);
    return eventType ? eventType.name : 'Otro';
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
            <Text style={styles.headerTitle}>Calendario Institucional</Text>
            <Text style={styles.headerSubtitle}>Eventos y fechas importantes</Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20
            }}
            onPress={() => setShowEventModal(true)}
          >
            <Text style={{ color: theme.colors.textOnPrimary, fontSize: 18, fontWeight: 'bold' }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Calendar Header */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity 
              style={{ padding: 8 }}
              onPress={() => navigateMonth(-1)}
            >
              <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: 'bold' }}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.textTitle, { fontSize: 18 }]}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity 
              style={{ padding: 8 }}
              onPress={() => navigateMonth(1)}
            >
              <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: 'bold' }}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Days of the week */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
            {DAYS.map(day => (
              <Text key={day} style={[styles.textSecondary, { fontSize: 14, fontWeight: '500', width: 40, textAlign: 'center' }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {renderCalendarDays()}
          </View>
        </View>

        {/* Events List */}
        {selectedDate && (
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={[styles.textTitle, { marginBottom: 12 }]}>
              Eventos del {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
            </Text>
            
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={{
                    borderWidth: 1,
                    borderColor: isDark ? '#374151' : '#E5E7EB',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8
                  }}
                  onLongPress={() => deleteEvent(event.id)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <View style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: getEventTypeColor(event.type),
                          marginRight: 8
                        }} />
                        <Text style={[styles.textSecondary, { fontSize: 14, fontWeight: '500' }]}>
                          {getEventTypeName(event.type)}
                        </Text>
                      </View>
                      <Text style={[styles.textPrimary, { fontSize: 16, fontWeight: '600', marginBottom: 4 }]}>
                        {event.title}
                      </Text>
                      {event.description && (
                        <Text style={[styles.textSecondary, { marginBottom: 4 }]}>
                          {event.description}
                        </Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.textSecondary, { marginRight: 12 }]}>
                          🕐 {event.time}
                        </Text>
                        {event.location && (
                          <Text style={styles.textSecondary}>
                            📍 {event.location}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.textSecondary, { textAlign: 'center', paddingVertical: 16 }]}>
                No hay eventos programados para esta fecha
              </Text>
            )}
          </View>
        )}

        {/* Upcoming Events */}
        <View style={[styles.card, { marginTop: 16, marginBottom: 20 }]}>
          <Text style={[styles.textTitle, { marginBottom: 12 }]}>Próximos Eventos</Text>
          
          {events
            .filter(event => new Date(event.date) >= new Date().setHours(0, 0, 0, 0))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5)
            .map(event => (
              <TouchableOpacity
                key={event.id}
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8
                }}
                onLongPress={() => deleteEvent(event.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <View style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: getEventTypeColor(event.type),
                        marginRight: 8
                      }} />
                      <Text style={[styles.textSecondary, { fontSize: 14, fontWeight: '500' }]}>
                        {getEventTypeName(event.type)}
                      </Text>
                    </View>
                    <Text style={[styles.textPrimary, { fontSize: 16, fontWeight: '600', marginBottom: 4 }]}>
                      {event.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.textSecondary, { marginRight: 12 }]}>
                        📅 {new Date(event.date).toLocaleDateString('es-ES')}
                      </Text>
                      <Text style={styles.textSecondary}>
                        🕐 {event.time}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          
          {events.length === 0 && (
            <Text style={[styles.textSecondary, { textAlign: 'center', paddingVertical: 16 }]}>
              No hay eventos próximos. ¡Agrega algunos eventos!
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Add Event Modal */}
      <Modal
        visible={showEventModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={[
            styles.card, 
            { 
              borderTopLeftRadius: 20, 
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              margin: 0,
              maxHeight: '80%'
            }
          ]}>
            <Text style={[styles.textTitle, { fontSize: 20, marginBottom: 16, textAlign: 'center' }]}>
              Nuevo Evento Institucional
            </Text>
            
            <ScrollView>
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.textSecondary, { fontSize: 14, fontWeight: '500', marginBottom: 8 }]}>Título *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderWidth: 1,
                      borderColor: isDark ? '#374151' : '#D1D5DB',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: isDark ? '#374151' : '#FFFFFF',
                      color: styles.textPrimary.color
                    }
                  ]}
                  placeholder="Ej: Exposición de Proyectos Finales"
                  placeholderTextColor={styles.textTertiary.color}
                  value={newEvent.title}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, title: text }))}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.textSecondary, { fontSize: 14, fontWeight: '500', marginBottom: 8 }]}>Tipo de Evento</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {EVENT_TYPES.map(type => (
                    <TouchableOpacity
                      key={type.id}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 20,
                        marginRight: 8,
                        marginBottom: 8,
                        backgroundColor: newEvent.type === type.id 
                          ? type.color
                          : (isDark ? '#374151' : '#F3F4F6')
                      }}
                      onPress={() => setNewEvent(prev => ({ ...prev, type: type.id }))}
                    >
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: newEvent.type === type.id 
                          ? '#FFFFFF' 
                          : styles.textPrimary.color
                      }}>
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.textSecondary, { fontSize: 14, fontWeight: '500', marginBottom: 8 }]}>Fecha *</Text>
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: isDark ? '#374151' : '#D1D5DB',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    backgroundColor: isDark ? '#374151' : '#FFFFFF',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.textPrimary, { fontSize: 16 }]}>
                    {newEvent.date.toLocaleDateString('es-ES')}
                  </Text>
                  <Text style={styles.textTertiary}>📅</Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.textSecondary, { fontSize: 14, fontWeight: '500', marginBottom: 8 }]}>Hora *</Text>
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: isDark ? '#374151' : '#D1D5DB',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    backgroundColor: isDark ? '#374151' : '#FFFFFF',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.textPrimary, { fontSize: 16 }]}>
                    {newEvent.time.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    })}
                  </Text>
                  <Text style={styles.textTertiary}>🕐</Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.textSecondary, { fontSize: 14, fontWeight: '500', marginBottom: 8 }]}>Ubicación</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderWidth: 1,
                      borderColor: isDark ? '#374151' : '#D1D5DB',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: isDark ? '#374151' : '#FFFFFF',
                      color: styles.textPrimary.color
                    }
                  ]}
                  placeholder="Ej: Auditorio Principal, Aula A-101"
                  placeholderTextColor={styles.textTertiary.color}
                  value={newEvent.location}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, location: text }))}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.textSecondary, { fontSize: 14, fontWeight: '500', marginBottom: 8 }]}>Descripción</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderWidth: 1,
                      borderColor: isDark ? '#374151' : '#D1D5DB',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      fontSize: 16,
                      backgroundColor: isDark ? '#374151' : '#FFFFFF',
                      color: styles.textPrimary.color,
                      height: 80,
                      textAlignVertical: 'top'
                    }
                  ]}
                  placeholder="Detalles adicionales del evento..."
                  placeholderTextColor={styles.textTertiary.color}
                  value={newEvent.description}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, description: text }))}
                  multiline={true}
                />
              </View>
            </ScrollView>

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={newEvent.date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            {/* Time Picker */}
            {showTimePicker && (
              <DateTimePicker
                value={newEvent.time}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeChange}
              />
            )}

            <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
              <TouchableOpacity 
                style={[
                  styles.buttonOutline,
                  { flex: 1 }
                ]}
                onPress={() => {
                  setShowEventModal(false);
                  setNewEvent({
                    title: '',
                    description: '',
                    date: new Date(),
                    time: new Date(),
                    type: 'other',
                    location: ''
                  });
                }}
              >
                <Text style={styles.buttonOutlineText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.buttonPrimary,
                  { flex: 1 }
                ]}
                onPress={saveEvent}
              >
                <Text style={styles.buttonText}>Guardar Evento</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
