import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserStorage } from '../services/UserStorage';
import { useTheme } from '../contexts/ThemeContext';


const SCHEDULES_STORAGE_KEY = '@schedax_schedules';

export default function ScheduleScreen({ navigation }) {
  const { theme } = useTheme();
  const [schedules, setSchedules] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [extractedSchedule, setExtractedSchedule] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    materias: [],
  });

  const createThemedStyles = () => ({
    container: {
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
    },
    headerTitle: {
      color: theme.colors.textOnPrimary,
    },
    headerSubtitle: {
      color: theme.colors.textOnPrimary,
      opacity: 0.8,
    },
    menuIcon: {
      backgroundColor: theme.colors.textOnPrimary,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    modalBackground: {
      backgroundColor: theme.colors.surface,
    },
    textInput: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
    textPrimary: {
      color: theme.colors.text,
    },
    textSecondary: {
      color: theme.colors.textSecondary,
    },
    textTertiary: {
      color: theme.colors.textTertiary,
    }
  });
  const [currentMateria, setCurrentMateria] = useState({
    nombre: '',
    profesor: '',
    creditos: 3,
    horarios: {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: [],
      sabado: [],
      domingo: []
    }
  });
  const [horarioInput, setHorarioInput] = useState({
    visible: false,
    day: '',
    horaInicio: null,
    horaFin: null,
    aula: '',
    showTimePickerInicio: false,
    showTimePickerFin: false
  });

  useEffect(() => {
    loadUserData();
    loadSchedules();
    loadExtractedSchedule();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await UserStorage.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadExtractedSchedule = async () => {
    try {
      const profileData = await AsyncStorage.getItem('@schedax_user_profile');
      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserProfile(profile);
        
        if (profile.extractedSchedule) {
          setExtractedSchedule(profile.extractedSchedule);
        }
      }
    } catch (error) {
      console.error('Error loading extracted schedule:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const schedulesJson = await AsyncStorage.getItem(SCHEDULES_STORAGE_KEY);
      const allSchedules = schedulesJson ? JSON.parse(schedulesJson) : [];
      const user = await UserStorage.getCurrentUser();
      if (user) {
        const userSchedules = allSchedules.filter(schedule => schedule.userId === user.id);
        setSchedules(userSchedules);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };



  const saveSchedule = async () => {
    if (!newSchedule.title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para tu horario');
      return;
    }

    try {
      if (!currentUser || !currentUser.id) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      const schedulesJson = await AsyncStorage.getItem(SCHEDULES_STORAGE_KEY);
      const allSchedules = schedulesJson ? JSON.parse(schedulesJson) : [];
      
      // Get current date and time automatically
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      
      // Create schedule with materias
      
      const schedule = {
        id: Date.now().toString(),
        userId: currentUser.id,
        title: newSchedule.title.trim(),
        description: newSchedule.description.trim(),
        date: currentDate,
        time: currentTime,
        university: userProfile?.institucion || 'Universidad',
        materias: newSchedule.materias, // Add materias to schedule
        createdAt: new Date().toISOString(),
        completed: false,
      };

      allSchedules.push(schedule);
      await AsyncStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(allSchedules));
      
      setSchedules(prev => [...prev, schedule]);
      setNewSchedule({ title: '', description: '', materias: [] });
      setCurrentMateria({
        nombre: '',
        profesor: '',
        creditos: 3,
        horarios: {
          lunes: [],
          martes: [],
          miercoles: [],
          jueves: [],
          viernes: [],
          sabado: [],
          domingo: []
        }
      });
      setHorarioInput({
        visible: false,
        day: '',
        hora: '',
        aula: ''
      });
      setIsModalVisible(false);
      
      // Show success message with materias and extraction info
      const totalClasses = newSchedule.materias.reduce((sum, m) => 
        sum + Object.values(m.horarios).reduce((daySum, schedules) => daySum + schedules.length, 0), 0
      );
      
      Alert.alert('Éxito', `Horario creado exitosamente!\n\n📚 ${newSchedule.materias.length} materias agregadas\n🎓 ${newSchedule.materias.reduce((sum, m) => sum + m.creditos, 0)} créditos totales\n📅 ${totalClasses} clases programadas`);
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Failed to save schedule. Please try again.');
    }
  };

  const toggleScheduleComplete = async (scheduleId) => {
    try {
      const schedulesJson = await AsyncStorage.getItem(SCHEDULES_STORAGE_KEY);
      const allSchedules = schedulesJson ? JSON.parse(schedulesJson) : [];
      
      const updatedSchedules = allSchedules.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, completed: !schedule.completed }
          : schedule
      );
      
      await AsyncStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(updatedSchedules));
      
      setSchedules(prev => 
        prev.map(schedule => 
          schedule.id === scheduleId 
            ? { ...schedule, completed: !schedule.completed }
            : schedule
        )
      );
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const deleteSchedule = async (scheduleId) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const schedulesJson = await AsyncStorage.getItem(SCHEDULES_STORAGE_KEY);
              const allSchedules = schedulesJson ? JSON.parse(schedulesJson) : [];
              
              const updatedSchedules = allSchedules.filter(schedule => schedule.id !== scheduleId);
              await AsyncStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(updatedSchedules));
              
              setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
            } catch (error) {
              console.error('Error deleting schedule:', error);
            }
          }
        }
      ]
    );
  };

  const addMateria = () => {
    if (!currentMateria.nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre de la materia');
      return;
    }
    if (!currentMateria.profesor.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del profesor');
      return;
    }

    const newMateria = {
      id: Date.now().toString(),
      ...currentMateria
    };

    setNewSchedule(prev => ({
      ...prev,
      materias: [...prev.materias, newMateria]
    }));

    // Reset current materia
    setCurrentMateria({
      nombre: '',
      profesor: '',
      creditos: 3,
      horarios: {
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: [],
        sabado: [],
        domingo: []
      }
    });
    setHorarioInput({
      visible: false,
      day: '',
      hora: '',
      aula: ''
    });

    Alert.alert('Éxito', 'Materia añadida correctamente');
  };

  const removeMateria = (materiaId) => {
    setNewSchedule(prev => ({
      ...prev,
      materias: prev.materias.filter(materia => materia.id !== materiaId)
    }));
  };

  const showHorarioInput = (day) => {
    const now = new Date();
    const inicioDefault = new Date(now);
    inicioDefault.setHours(8, 0, 0, 0); // 8:00 AM por defecto
    
    const finDefault = new Date(now);
    finDefault.setHours(10, 0, 0, 0); // 10:00 AM por defecto
    
    setHorarioInput({
      visible: true,
      day: day,
      horaInicio: inicioDefault,
      horaFin: finDefault,
      aula: '',
      showTimePickerInicio: false,
      showTimePickerFin: false
    });
  };

  const addHorarioToMateria = () => {
    if (!horarioInput.horaInicio || !horarioInput.horaFin) {
      Alert.alert('Error', 'Por favor selecciona las horas de inicio y fin');
      return;
    }

    const formatTime = (date) => {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    };

    const horarioText = `${formatTime(horarioInput.horaInicio)} - ${formatTime(horarioInput.horaFin)}`;

    setCurrentMateria(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [horarioInput.day]: [...prev.horarios[horarioInput.day], { 
          hora: horarioText, 
          aula: horarioInput.aula || 'Aula TBD' 
        }]
      }
    }));

    setHorarioInput({
      visible: false,
      day: '',
      horaInicio: null,
      horaFin: null,
      aula: '',
      showTimePickerInicio: false,
      showTimePickerFin: false
    });

    Alert.alert('Éxito', 'Horario agregado correctamente');
  };

  const removeHorarioFromMateria = (day, index) => {
    setCurrentMateria(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [day]: prev.horarios[day].filter((_, i) => i !== index)
      }
    }));
  };

  const onTimeChangeInicio = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setHorarioInput(prev => ({
        ...prev,
        showTimePickerInicio: false,
        horaInicio: selectedTime || prev.horaInicio
      }));
    } else {
      setHorarioInput(prev => ({
        ...prev,
        horaInicio: selectedTime || prev.horaInicio
      }));
    }
  };

  const onTimeChangeFin = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setHorarioInput(prev => ({
        ...prev,
        showTimePickerFin: false,
        horaFin: selectedTime || prev.horaFin
      }));
    } else {
      setHorarioInput(prev => ({
        ...prev,
        horaFin: selectedTime || prev.horaFin
      }));
    }
  };

  const showTimePickerInicio = () => {
    const now = new Date();
    const defaultTime = new Date(now);
    defaultTime.setHours(8, 0, 0, 0);
    
    setHorarioInput(prev => ({ 
      ...prev, 
      showTimePickerInicio: true,
      horaInicio: prev.horaInicio || defaultTime
    }));
  };

  const showTimePickerFin = () => {
    const now = new Date();
    const defaultTime = new Date(now);
    defaultTime.setHours(10, 0, 0, 0);
    
    setHorarioInput(prev => ({ 
      ...prev, 
      showTimePickerFin: true,
      horaFin: prev.horaFin || defaultTime
    }));
  };

  const styles = createThemedStyles();
  
  return (
    <View style={[styles.container]} className="flex-1">
      {/* Header */}
      <View style={[styles.header]} className="pt-12 pb-6 px-5">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            className="mr-4"
            onPress={() => navigation.openDrawer()}
          >
            <View className="w-8 h-8 justify-center items-center">
              <View style={[styles.menuIcon]} className="w-6 h-0.5 mb-1"></View>
              <View style={[styles.menuIcon]} className="w-6 h-0.5 mb-1"></View>
              <View style={[styles.menuIcon]} className="w-6 h-0.5"></View>
            </View>
          </TouchableOpacity>
          <View className="flex-1">
            <Text style={[styles.headerTitle]} className="text-2xl font-bold">My Schedules</Text>
            <Text style={[styles.headerSubtitle]} className="text-sm mt-1">Manage your tasks and events</Text>
          </View>
          <TouchableOpacity 
            className="bg-purple-600 px-4 py-2 rounded-lg"
            onPress={() => setIsModalVisible(true)}
          >
            <Text className="text-white font-medium">+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Extracted Schedule Section */}
      {extractedSchedule && (
        <View className="bg-blue-50 p-4 border-b border-blue-200">
          <View className="flex-row items-center mb-3">
            <Text className="text-blue-800 text-lg font-bold flex-1">📄 Tu Horario Académico</Text>
            <TouchableOpacity 
              className="bg-blue-500 px-3 py-1 rounded-lg"
              onPress={() => navigation.navigate('ScheduleTable')}
            >
              <Text className="text-white text-sm font-medium">Ver Tabla</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(extractedSchedule).map(([day, classes]) => (
              <View key={day} style={[styles.card]} className="rounded-lg p-3 mr-3 min-w-32">
                <Text style={[styles.textPrimary]} className="font-bold text-center mb-2">{day}</Text>
                <Text className="text-blue-600 text-xs text-center">{classes.length} clases</Text>
                {classes.slice(0, 2).map((classItem, index) => (
                  <View key={index} className="mt-1">
                    <Text style={[styles.textSecondary]} className="text-xs">{classItem.time}</Text>
                    <Text style={[styles.textPrimary]} className="text-xs font-medium" numberOfLines={1}>
                      {classItem.course}
                    </Text>
                  </View>
                ))}
                {classes.length > 2 && (
                  <Text style={[styles.textTertiary]} className="text-xs mt-1">+{classes.length - 2} más</Text>
                )}
              </View>
            ))}
          </ScrollView>
          
          {userProfile && (
            <View className="mt-3 pt-3 border-t border-blue-200">
              <Text className="text-blue-700 text-sm">
                👤 {userProfile.nombre} {userProfile.apellido} • 🎓 {userProfile.carrera}
              </Text>
              <Text className="text-blue-600 text-xs">
                📋 {userProfile.matricula} • 📅 {userProfile.periodo}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Schedules List */}
      <ScrollView className="flex-1 p-5">
        {schedules.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="bg-purple-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Text className="text-purple-500 text-3xl">📋</Text>
            </View>
            <Text style={[styles.textTertiary]} className="text-lg mb-2">No schedules yet</Text>
            <Text style={[styles.textTertiary]} className="text-center mb-6">
              Create your first schedule to get started
            </Text>
            <TouchableOpacity 
              className="bg-purple-500 px-6 py-3 rounded-lg"
              onPress={() => setIsModalVisible(true)}
            >
              <Text className="text-white font-semibold">Create Schedule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-3">
            {schedules.map((schedule) => (
              <View key={schedule.id} style={[styles.card]} className="rounded-xl p-4 shadow-sm border">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text style={[schedule.completed ? styles.textTertiary : styles.textPrimary]} className={`text-lg font-semibold ${schedule.completed ? 'line-through' : ''}`}>
                      {schedule.title}
                    </Text>
                    {schedule.university ? (
                      <Text className={`text-sm mt-1 font-medium ${schedule.completed ? 'text-gray-400' : 'text-purple-600'}`}>
                        🏫 {schedule.university}
                      </Text>
                    ) : null}
                    {schedule.description ? (
                      <Text style={[schedule.completed ? styles.textTertiary : styles.textSecondary]} className="text-sm mt-1">
                        {schedule.description}
                      </Text>
                    ) : null}

                    {schedule.materias && schedule.materias.length > 0 ? (
                      <Text className={`text-sm mt-1 ${schedule.completed ? 'text-gray-400' : 'text-green-600'}`}>
                        📚 {schedule.materias.length} materias • {schedule.materias.reduce((sum, m) => sum + m.creditos, 0)} créditos
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity 
                    className="ml-3"
                    onPress={() => deleteSchedule(schedule.id)}
                  >
                    <Text className="text-red-500 text-lg">🗑️</Text>
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text style={[schedule.completed ? styles.textTertiary : styles.textSecondary]} className="text-sm">
                      📅 {schedule.date} • ⏰ {schedule.time}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    className={`px-3 py-1 rounded-full ${schedule.completed ? 'bg-green-100' : 'bg-gray-100'}`}
                    onPress={() => toggleScheduleComplete(schedule.id)}
                  >
                    <Text className={`text-sm font-medium ${schedule.completed ? 'text-green-600' : 'text-gray-600'}`}>
                      {schedule.completed ? 'Completed' : 'Mark Done'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Schedule Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View style={[styles.modalBackground]} className="rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text style={[styles.textPrimary]} className="text-xl font-bold">Nuevo Horario</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={[styles.textTertiary]} className="text-2xl">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96">
              <View className="space-y-4">
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-2">Título *</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="Ingresa el título del horario"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={newSchedule.title}
                    onChangeText={(text) => setNewSchedule(prev => ({ ...prev, title: text }))}
                  />
                </View>

                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-2">Descripción</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="Describe tu horario (opcional)"
                    placeholderTextColor={theme.colors.textTertiary}
                    multiline
                    numberOfLines={3}
                    value={newSchedule.description}
                    onChangeText={(text) => setNewSchedule(prev => ({ ...prev, description: text }))}
                  />
                </View>



                {/* Materias Section */}
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-2">Materias del Horario</Text>
                  
                  {/* Current Materia Input */}
                  <View style={[styles.card]} className="border rounded-lg p-3 mb-3">
                    <Text style={[styles.textSecondary]} className="text-sm font-medium mb-2">Agregar Nueva Materia</Text>
                    
                    <View className="space-y-3">
                      <View>
                        <Text style={[styles.textSecondary]} className="text-xs mb-1">Nombre de la Materia *</Text>
                        <TextInput
                          style={[styles.textInput]}
                          className="border rounded px-3 py-2 text-sm"
                          placeholder="Ej: Matemáticas I"
                          placeholderTextColor={theme.colors.textTertiary}
                          value={currentMateria.nombre}
                          onChangeText={(text) => setCurrentMateria(prev => ({ ...prev, nombre: text }))}
                        />
                      </View>
                      
                      <View className="flex-row space-x-2">
                        <View className="flex-1">
                          <Text style={[styles.textSecondary]} className="text-xs mb-1">Profesor *</Text>
                          <TextInput
                            style={[styles.textInput]}
                            className="border rounded px-3 py-2 text-sm"
                            placeholder="Nombre del profesor"
                            placeholderTextColor={theme.colors.textTertiary}
                            value={currentMateria.profesor}
                            onChangeText={(text) => setCurrentMateria(prev => ({ ...prev, profesor: text }))}
                          />
                        </View>
                        
                        <View className="w-20">
                          <Text style={[styles.textSecondary]} className="text-xs mb-1">Créditos</Text>
                          <TextInput
                            style={[styles.textInput]}
                            className="border rounded px-3 py-2 text-sm text-center"
                            placeholder="3"
                            placeholderTextColor={theme.colors.textTertiary}
                            keyboardType="numeric"
                            value={currentMateria.creditos.toString()}
                            onChangeText={(text) => setCurrentMateria(prev => ({ ...prev, creditos: parseInt(text) || 3 }))}
                          />
                        </View>
                      </View>

                      {/* Days and Hours Selection */}
                      <View>
                        <Text style={[styles.textSecondary]} className="text-xs mb-2">Horarios de la Materia</Text>
                        <View className="space-y-2">
                          {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'].map((day) => (
                            <View key={day} style={[styles.card]} className="border rounded p-2">
                              <Text style={[styles.textPrimary]} className="text-xs font-medium mb-2 capitalize">{day}</Text>
                              
                              {/* Show existing schedules for this day */}
                              {currentMateria.horarios[day].map((horario, index) => (
                                <View key={index} className="flex-row items-center justify-between bg-blue-50 p-2 rounded mb-1">
                                  <Text className="text-xs text-blue-700">
                                    {horario.hora} - {horario.aula}
                                  </Text>
                                  <TouchableOpacity 
                                    onPress={() => removeHorarioFromMateria(day, index)}
                                  >
                                    <Text className="text-red-500 text-xs">❌</Text>
                                  </TouchableOpacity>
                                </View>
                              ))}
                              
                              {/* Add new schedule button */}
                              <TouchableOpacity 
                                style={{borderColor: theme.colors.border}}
                                className="border border-dashed p-2 rounded items-center"
                                onPress={() => showHorarioInput(day)}
                              >
                                <Text style={[styles.textTertiary]} className="text-xs">+ Agregar horario</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      </View>
                      
                      <TouchableOpacity 
                        className="bg-green-500 py-2 px-4 rounded-lg"
                        onPress={addMateria}
                      >
                        <Text className="text-white text-center font-medium text-sm">+ Agregar Materia</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Added Materias List */}
                  {newSchedule.materias.length > 0 && (
                    <View className="mb-3">
                      <Text style={[styles.textSecondary]} className="text-xs mb-2">Materias Agregadas ({newSchedule.materias.length})</Text>
                      {newSchedule.materias.map((materia) => (
                        <View key={materia.id} style={[styles.card]} className="border rounded p-3 mb-2">
                          <View className="flex-row justify-between items-start">
                            <View className="flex-1">
                              <Text style={[styles.textPrimary]} className="font-medium text-sm">{materia.nombre}</Text>
                              <Text style={[styles.textSecondary]} className="text-xs">👨‍🏫 {materia.profesor}</Text>
                              <Text style={[styles.textSecondary]} className="text-xs">📚 {materia.creditos} créditos</Text>
                              
                              {/* Show scheduled days */}
                              <View className="mt-1">
                                {Object.entries(materia.horarios).map(([day, schedules]) => (
                                  schedules.length > 0 && (
                                    <Text key={day} className="text-xs text-blue-600">
                                      📅 {day.charAt(0).toUpperCase() + day.slice(1)}: {schedules.map(s => s.hora).join(', ')}
                                    </Text>
                                  )
                                ))}
                                {Object.values(materia.horarios).every(schedules => schedules.length === 0) && (
                                  <Text className="text-xs text-yellow-600">⚠️ Sin horarios programados</Text>
                                )}
                              </View>
                            </View>
                            <TouchableOpacity 
                              className="ml-2"
                              onPress={() => removeMateria(materia.id)}
                            >
                              <Text className="text-red-500">🗑️</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Auto-generated info display */}
                <View className="bg-blue-50 p-3 rounded-lg mt-3">
                  <Text className="text-sm font-medium text-blue-700 mb-2">Información automática:</Text>
                  <View className="space-y-1">
                    <Text className="text-xs text-blue-600">
                      📅 Fecha: {new Date().toLocaleDateString('es-ES')}
                    </Text>
                    <Text className="text-xs text-blue-600">
                      ⏰ Hora: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text className="text-xs text-blue-600">
                      🏫 Institución: {userProfile?.institucion || 'Universidad'}
                    </Text>
                    <Text className="text-xs text-blue-600">
                      📚 Total Materias: {newSchedule.materias.length}
                    </Text>
                    <Text className="text-xs text-blue-600">
                      🎓 Total Créditos: {newSchedule.materias.reduce((sum, m) => sum + m.creditos, 0)}
                    </Text>
                  </View>
                  <Text className="text-xs text-blue-500 mt-2">
                    ℹ️ Esta información se asigna automáticamente
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View className="flex-row space-x-3 mt-6">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-3 rounded-lg"
                onPress={() => setIsModalVisible(false)}
              >
                <Text className="text-center text-gray-700 font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-purple-500 py-3 rounded-lg"
                onPress={saveSchedule}
              >
                <Text className="text-center text-white font-semibold">Guardar Horario</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Horario Input Modal */}
      <Modal
        visible={horarioInput.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setHorarioInput(prev => ({ ...prev, visible: false }))}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-5">
          <View style={[styles.modalBackground]} className="rounded-xl p-6 w-full max-w-sm">
            <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4 text-center">
              Agregar Horario - {horarioInput.day.charAt(0).toUpperCase() + horarioInput.day.slice(1)}
            </Text>
            
            <View className="space-y-4">
              <View>
                <Text style={[styles.textPrimary]} className="text-sm font-medium mb-2">Hora de Inicio *</Text>
                <TouchableOpacity
                  style={[styles.textInput]}
                  className="border rounded-lg px-3 py-3 flex-row justify-between items-center"
                  onPress={showTimePickerInicio}
                >
                  <Text style={[styles.textPrimary]} className="text-base">
                    {horarioInput.horaInicio ? horarioInput.horaInicio.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    }) : 'Seleccionar hora'}
                  </Text>
                  <Text style={[styles.textTertiary]}>🕐</Text>
                </TouchableOpacity>
              </View>
              
              <View>
                <Text style={[styles.textPrimary]} className="text-sm font-medium mb-2">Hora de Fin *</Text>
                <TouchableOpacity
                  style={[styles.textInput]}
                  className="border rounded-lg px-3 py-3 flex-row justify-between items-center"
                  onPress={showTimePickerFin}
                >
                  <Text style={[styles.textPrimary]} className="text-base">
                    {horarioInput.horaFin ? horarioInput.horaFin.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    }) : 'Seleccionar hora'}
                  </Text>
                  <Text style={[styles.textTertiary]}>🕐</Text>
                </TouchableOpacity>
              </View>
              
              <View>
                <Text style={[styles.textPrimary]} className="text-sm font-medium mb-2">Aula/Salón</Text>
                <TextInput
                  style={[styles.textInput]}
                  className="border rounded-lg px-3 py-3 text-base"
                  placeholder="Ej: A-101 (opcional)"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={horarioInput.aula}
                  onChangeText={(text) => setHorarioInput(prev => ({ ...prev, aula: text }))}
                />
              </View>
            </View>
            
            {/* Time Pickers */}
            {horarioInput.showTimePickerInicio && horarioInput.horaInicio && (
              <DateTimePicker
                value={horarioInput.horaInicio}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeChangeInicio}
              />
            )}
            
            {horarioInput.showTimePickerFin && horarioInput.horaFin && (
              <DateTimePicker
                value={horarioInput.horaFin}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeChangeFin}
              />
            )}
            
            <View className="flex-row space-x-3 mt-6">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-3 rounded-lg"
                onPress={() => setHorarioInput(prev => ({ 
                  ...prev, 
                  visible: false, 
                  showTimePickerInicio: false, 
                  showTimePickerFin: false 
                }))}
              >
                <Text className="text-center text-gray-700 font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-green-500 py-3 rounded-lg"
                onPress={addHorarioToMateria}
              >
                <Text className="text-center text-white font-semibold">Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
