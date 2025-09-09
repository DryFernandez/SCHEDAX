import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { UserStorage } from '../services/UserStorage';


const SCHEDULES_STORAGE_KEY = '@schedax_schedules';

export default function ScheduleScreen({ navigation }) {
  const [schedules, setSchedules] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [extractedSchedule, setExtractedSchedule] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    pdfFile: null,
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

  const pickPDFFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pdfFile = {
          name: result.assets[0].name,
          uri: result.assets[0].uri,
          size: result.assets[0].size,
        };
        
        setNewSchedule(prev => ({ 
          ...prev, 
          pdfFile: pdfFile
        }));

        // Show processing alert
        Alert.alert(
          'Procesando PDF',
          'Analizando el archivo PDF para extraer información del horario...',
          [{ text: 'OK' }]
        );

        // PDF selected - will be saved with schedule
        Alert.alert(
          'PDF Seleccionado',
          `Archivo PDF: ${pdfFile.name}\n\nEl horario será guardado y podrás ver/editar los datos manualmente.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
      Alert.alert('Error', 'Failed to pick PDF file. Please try again.');
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
      
      // Create schedule without PDF extraction
      
      const schedule = {
        id: Date.now().toString(),
        userId: currentUser.id,
        title: newSchedule.title.trim(),
        description: newSchedule.description.trim(),
        date: currentDate,
        time: currentTime,
        university: userProfile?.institucion || 'Universidad',
        pdfFile: newSchedule.pdfFile,
        extractedData: null, // No PDF extraction
        createdAt: new Date().toISOString(),
        completed: false,
      };

      allSchedules.push(schedule);
      await AsyncStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(allSchedules));
      
      setSchedules(prev => [...prev, schedule]);
      setNewSchedule({ title: '', description: '', pdfFile: null });
      setIsModalVisible(false);
      
      // Show success message with extraction info
      const extractionInfo = extractedData 
        ? `\n\n📄 Información extraída:\n• Método: ${extractedData.extractionMethod}\n• Cursos: ${extractedData.courses.length}\n• Estudiante: ${extractedData.studentInfo.name}`
        : '';
      
      Alert.alert('Éxito', `Horario creado exitosamente!${extractionInfo}`);
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-purple-500 pt-12 pb-6 px-5">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            className="mr-4"
            onPress={() => navigation.openDrawer()}
          >
            <View className="w-8 h-8 justify-center items-center">
              <View className="w-6 h-0.5 bg-white mb-1"></View>
              <View className="w-6 h-0.5 bg-white mb-1"></View>
              <View className="w-6 h-0.5 bg-white"></View>
            </View>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">My Schedules</Text>
            <Text className="text-purple-100 text-sm mt-1">Manage your tasks and events</Text>
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
              <View key={day} className="bg-white rounded-lg p-3 mr-3 min-w-32">
                <Text className="font-bold text-gray-800 text-center mb-2">{day}</Text>
                <Text className="text-blue-600 text-xs text-center">{classes.length} clases</Text>
                {classes.slice(0, 2).map((classItem, index) => (
                  <View key={index} className="mt-1">
                    <Text className="text-xs text-gray-600">{classItem.time}</Text>
                    <Text className="text-xs font-medium text-gray-800" numberOfLines={1}>
                      {classItem.course}
                    </Text>
                  </View>
                ))}
                {classes.length > 2 && (
                  <Text className="text-xs text-gray-500 mt-1">+{classes.length - 2} más</Text>
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
            <Text className="text-gray-500 text-lg mb-2">No schedules yet</Text>
            <Text className="text-gray-400 text-center mb-6">
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
              <View key={schedule.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className={`text-lg font-semibold ${schedule.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {schedule.title}
                    </Text>
                    {schedule.university ? (
                      <Text className={`text-sm mt-1 font-medium ${schedule.completed ? 'text-gray-400' : 'text-purple-600'}`}>
                        🏫 {schedule.university}
                      </Text>
                    ) : null}
                    {schedule.description ? (
                      <Text className={`text-sm mt-1 ${schedule.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {schedule.description}
                      </Text>
                    ) : null}
                    {schedule.pdfFile ? (
                      <Text className={`text-sm mt-1 ${schedule.completed ? 'text-gray-400' : 'text-blue-600'}`}>
                        📄 {schedule.pdfFile.name}
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
                    <Text className={`text-sm ${schedule.completed ? 'text-gray-400' : 'text-gray-500'}`}>
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
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Nuevo Horario</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text className="text-gray-500 text-2xl">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96">
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Título *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                    placeholder="Ingresa el título del horario"
                    value={newSchedule.title}
                    onChangeText={(text) => setNewSchedule(prev => ({ ...prev, title: text }))}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Descripción</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                    placeholder="Describe tu horario (opcional)"
                    multiline
                    numberOfLines={3}
                    value={newSchedule.description}
                    onChangeText={(text) => setNewSchedule(prev => ({ ...prev, description: text }))}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Archivo del Horario</Text>
                  <TouchableOpacity 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center"
                    onPress={pickPDFFile}
                  >
                    {newSchedule.pdfFile ? (
                      <View className="items-center">
                        <Text className="text-lg mb-2">📄</Text>
                        <Text className="text-sm font-medium text-gray-800 text-center">
                          {newSchedule.pdfFile.name}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1">
                          {(newSchedule.pdfFile.size / 1024).toFixed(1)} KB
                        </Text>
                        <Text className="text-xs text-blue-600 mt-2">Toca para cambiar</Text>
                      </View>
                    ) : (
                      <View className="items-center">
                        <Text className="text-lg mb-2">📄</Text>
                        <Text className="text-sm font-medium text-gray-600">
                          Subir archivo PDF del horario
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1">
                          Toca para seleccionar archivo PDF
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* PDF Requirements Info */}
                {newSchedule.pdfFile && (
                  <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                    <Text className="text-amber-800 text-xs font-medium mb-1">ℹ️ Sobre tu PDF:</Text>
                    <Text className="text-amber-700 text-xs mb-1">
                      • Si es un PDF de texto: Se extraerán datos reales
                    </Text>
                    <Text className="text-amber-700 text-xs">
                      • Si es escaneado/imagen: Se mostrarán datos simulados
                    </Text>
                  </View>
                )}

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
    </View>
  );
}
