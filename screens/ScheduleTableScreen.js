import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStorage } from '../services/UserStorage';

const SCHEDULES_STORAGE_KEY = '@schedax_schedules';

// Sample data structure for academic schedule
const sampleScheduleData = {
  subjects: [
    {
      id: '1',
      asignatura: 'Matemáticas I',
      carrera: 'Ingeniería de Sistemas',
      creditos: 4,
      profesor: 'Dr. García López',
      horarios: {
        lunes: [{ hora: '08:00-10:00', aula: 'A101' }],
        martes: [{ hora: '10:00-12:00', aula: 'A101' }],
        miercoles: [],
        jueves: [{ hora: '08:00-10:00', aula: 'A101' }],
        viernes: [{ hora: '10:00-12:00', aula: 'A101' }],
        sabado: [],
        domingo: []
      }
    },
    {
      id: '2',
      asignatura: 'Programación I',
      carrera: 'Ingeniería de Sistemas',
      creditos: 5,
      profesor: 'Ing. María Rodríguez',
      horarios: {
        lunes: [{ hora: '14:00-16:00', aula: 'Lab1' }],
        martes: [],
        miercoles: [{ hora: '14:00-17:00', aula: 'Lab1' }],
        jueves: [],
        viernes: [{ hora: '14:00-16:00', aula: 'Lab1' }],
        sabado: [],
        domingo: []
      }
    },
    {
      id: '3',
      asignatura: 'Física General',
      carrera: 'Ingeniería de Sistemas',
      creditos: 3,
      profesor: 'Dr. Carlos Mendoza',
      horarios: {
        lunes: [],
        martes: [{ hora: '16:00-18:00', aula: 'B205' }],
        miercoles: [],
        jueves: [{ hora: '16:00-18:00', aula: 'B205' }],
        viernes: [],
        sabado: [{ hora: '08:00-11:00', aula: 'Lab Física' }],
        domingo: []
      }
    }
  ]
};

export default function ScheduleTableScreen({ navigation }) {
  const [schedules, setSchedules] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);

  useEffect(() => {
    loadUserData();
    loadSchedules();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await UserStorage.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const schedulesJson = await AsyncStorage.getItem(SCHEDULES_STORAGE_KEY);
      const allSchedules = schedulesJson ? JSON.parse(schedulesJson) : [];
      const user = await UserStorage.getCurrentUser();
      if (user) {
        const userSchedules = allSchedules.filter(schedule => 
          schedule.userId === user.id && schedule.pdfFile
        );
        setSchedules(userSchedules);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const processSchedulePDF = (schedule) => {
    setSelectedSchedule(schedule);
    // In a real implementation, you would extract data from the PDF
    // For now, we'll use sample data
    setScheduleData(sampleScheduleData);
    
    Alert.alert(
      'PDF Processed',
      `Processing schedule from ${schedule.university}. Showing sample academic data.`,
      [{ text: 'OK' }]
    );
  };

  const getDaySchedule = (day, subjects) => {
    const daySchedule = [];
    subjects.forEach(subject => {
      if (subject.horarios[day] && subject.horarios[day].length > 0) {
        subject.horarios[day].forEach(horario => {
          daySchedule.push({
            ...horario,
            asignatura: subject.asignatura,
            profesor: subject.profesor,
            creditos: subject.creditos
          });
        });
      }
    });
    return daySchedule.sort((a, b) => a.hora.localeCompare(b.hora));
  };

  const renderScheduleTable = () => {
    if (!scheduleData) return null;

    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return (
      <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
        <View className="mb-4">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            Horario Académico - {selectedSchedule.university}
          </Text>
          <Text className="text-sm text-gray-600 mb-1">
            Carrera: {scheduleData.subjects[0]?.carrera}
          </Text>
          <Text className="text-sm text-gray-600">
            Total Créditos: {scheduleData.subjects.reduce((sum, subject) => sum + subject.creditos, 0)}
          </Text>
        </View>

        {/* Subjects Summary */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Asignaturas</Text>
          {scheduleData.subjects.map(subject => (
            <View key={subject.id} className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <View className="flex-1">
                <Text className="font-medium text-gray-800">{subject.asignatura}</Text>
                <Text className="text-sm text-gray-600">{subject.profesor}</Text>
              </View>
              <Text className="text-sm font-medium text-blue-600">{subject.creditos} créditos</Text>
            </View>
          ))}
        </View>

        {/* Weekly Schedule */}
        <View>
          <Text className="text-lg font-semibold text-gray-800 mb-3">Horario Semanal</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {days.map((day, index) => {
                const daySchedule = getDaySchedule(day, scheduleData.subjects);
                return (
                  <View key={day} className="w-40 mr-3">
                    <View className="bg-blue-500 p-2 rounded-t-lg">
                      <Text className="text-white font-semibold text-center text-sm">
                        {dayNames[index]}
                      </Text>
                    </View>
                    <View className="bg-gray-50 min-h-32 rounded-b-lg p-2">
                      {daySchedule.length > 0 ? (
                        daySchedule.map((clase, idx) => (
                          <View key={idx} className="bg-white rounded p-2 mb-2 border-l-2 border-blue-400">
                            <Text className="text-xs font-semibold text-gray-800 mb-1">
                              {clase.hora}
                            </Text>
                            <Text className="text-xs text-blue-600 font-medium mb-1">
                              {clase.asignatura}
                            </Text>
                            <Text className="text-xs text-gray-600">
                              {clase.aula}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <View className="flex-1 justify-center items-center">
                          <Text className="text-xs text-gray-400">Sin clases</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-500 pt-12 pb-6 px-5">
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
            <Text className="text-white text-2xl font-bold">Horarios Académicos</Text>
            <Text className="text-green-100 text-sm mt-1">Visualiza tus horarios de clase</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        {/* PDF Files List */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Archivos de Horario</Text>
          {schedules.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center shadow-sm border border-gray-200">
              <View className="bg-green-100 w-16 h-16 rounded-full items-center justify-center mb-3">
                <Text className="text-green-600 text-2xl">📊</Text>
              </View>
              <Text className="text-gray-500 text-center mb-2">
                No hay horarios con archivos PDF
              </Text>
              <Text className="text-gray-400 text-center text-sm mb-4">
                Crea un horario con archivo PDF para ver la tabla
              </Text>
              <TouchableOpacity 
                className="bg-green-500 px-4 py-2 rounded-lg"
                onPress={() => navigation.navigate('Schedule')}
              >
                <Text className="text-white font-medium">Ir a Horarios</Text>
              </TouchableOpacity>
            </View>
          ) : (
            schedules.map(schedule => (
              <TouchableOpacity
                key={schedule.id}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200"
                onPress={() => processSchedulePDF(schedule)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">{schedule.title}</Text>
                    <Text className="text-sm text-green-600 mt-1">🏫 {schedule.university}</Text>
                    <Text className="text-sm text-blue-600 mt-1">📄 {schedule.pdfFile.name}</Text>
                  </View>
                  <View className="bg-green-100 px-3 py-1 rounded-full">
                    <Text className="text-green-600 text-xs font-medium">Ver Tabla</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Schedule Table */}
        {renderScheduleTable()}
      </ScrollView>
    </View>
  );
}
