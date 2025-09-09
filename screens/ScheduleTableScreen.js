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
  const [extractedSchedule, setExtractedSchedule] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadUserData();
    loadSchedules();
    loadExtractedSchedule();
  }, []);

  // Load the most recent schedule with extracted PDF data
  useEffect(() => {
    if (schedules.length > 0) {
      // Find the most recent schedule with extracted data
      const scheduleWithData = schedules.find(schedule => 
        schedule.extractedData && schedule.extractedData.courses.length > 0
      );
      
      if (scheduleWithData && !selectedSchedule) {
        console.log('Auto-loading schedule with extracted data:', scheduleWithData.title);
        processSchedulePDF(scheduleWithData);
      }
    }
  }, [schedules]);

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
          // Convert extracted schedule to table format
          const convertedData = convertExtractedScheduleToTableData(profile);
          setScheduleData(convertedData);
        }
      }
    } catch (error) {
      console.error('Error loading extracted schedule:', error);
    }
  };

  // Convert extracted schedule to table format
  const convertExtractedScheduleToTableData = (profile) => {
    if (!profile.extractedSchedule || !profile.extractedCourses) {
      return null;
    }

    const subjects = profile.extractedCourses.map((course, index) => {
      // Find schedule times for this course
      const courseSchedules = {};
      const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      
      days.forEach(day => {
        const daySchedule = profile.extractedSchedule[day] || [];
        const courseClasses = daySchedule.filter(classItem => 
          classItem.course === course.name
        );
        
        courseSchedules[day.toLowerCase()] = courseClasses.map(classItem => ({
          hora: classItem.time,
          aula: classItem.classroom || 'N/A'
        }));
      });

      return {
        id: (index + 1).toString(),
        asignatura: course.name,
        carrera: profile.carrera || 'N/A',
        creditos: course.credits || 3,
        profesor: course.professor,
        horarios: courseSchedules
      };
    });

    return {
      subjects,
      studentInfo: {
        name: `${profile.nombre} ${profile.apellido}`,
        matricula: profile.matricula,
        carrera: profile.carrera,
        periodo: profile.periodo,
        institucion: profile.institucion
      }
    };
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
        
        // Sort schedules by creation date (most recent first) and prioritize those with extracted data
        userSchedules.sort((a, b) => {
          // First, prioritize schedules with extracted data
          const aHasData = a.extractedData && a.extractedData.courses.length > 0;
          const bHasData = b.extractedData && b.extractedData.courses.length > 0;
          
          if (aHasData && !bHasData) return -1;
          if (!aHasData && bHasData) return 1;
          
          // Then sort by creation date
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setSchedules(userSchedules);
        console.log('Loaded schedules:', userSchedules.length, 'with extracted data:', userSchedules.filter(s => s.extractedData).length);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const processSchedulePDF = (schedule) => {
    setSelectedSchedule(schedule);
    
    // Use real extracted data if available
    if (schedule.extractedData) {
      const convertedData = convertExtractedDataToTableFormat(schedule.extractedData);
      setScheduleData(convertedData);
      
      const isRealData = schedule.extractedData.extractionMethod === 'text-extraction';
      const isEncodedPDF = schedule.extractedData.extractionMethod === 'encoded-pdf-fallback';
      const methodText = isRealData ? 'Datos reales extraídos del PDF' : 
                        isEncodedPDF ? 'PDF con formato complejo - Datos simulados' : 
                        'Datos simulados - PDF no procesable';
      
      // Enhanced alert with comprehensive analysis
      const analysisResult = schedule.extractedData.analysisResult;
      const confidence = schedule.extractedData.confidence || 0;
      
      let alertTitle, alertMessage;
      
      if (isRealData && confidence >= 70) {
        alertTitle = '✅ Extracción Exitosa';
        alertMessage = `Datos reales extraídos del PDF "${schedule.pdfFile.name}".\n\n📊 Análisis:\n• Tipo: ${analysisResult?.pdfType || 'PDF de texto'}\n• Confianza: ${confidence}%\n• Cursos encontrados: ${schedule.extractedData.courses.length}\n• Calidad: ${analysisResult?.extractionViability || 'Buena'}`;
      } else if (confidence >= 30) {
        alertTitle = '⚠️ Extracción Parcial';
        alertMessage = `PDF "${schedule.pdfFile.name}" procesado con confianza moderada.\n\n📊 Análisis:\n• Tipo: ${analysisResult?.pdfType || 'PDF complejo'}\n• Confianza: ${confidence}%\n• Datos: Parcialmente extraídos\n• Calidad: ${analysisResult?.extractionViability || 'Limitada'}\n\n💡 Recomendaciones:\n${(analysisResult?.recommendations || []).slice(0, 2).map(r => `• ${r.replace(/^[🔒📷🗜️📝📚🎓📊💡✅❌]\s*/, '')}`).join('\n') || '• Considere re-exportar como PDF simple'}`;
      } else {
        alertTitle = '❌ Extracción Fallida';
        alertMessage = `Mostrando datos de ejemplo para el archivo "${schedule.pdfFile.name}".\n\nPuede crear su horario manualmente usando las opciones de la aplicación.`;
      }
      
      Alert.alert(alertTitle, alertMessage, [{ text: 'Entendido' }]);
    } else {
      // Fallback to sample data if no extraction data is available
      setScheduleData(sampleScheduleData);
      
      Alert.alert(
        'Mostrando datos de ejemplo',
        `El archivo "${schedule.pdfFile.name}" no tiene datos extraídos. Mostrando información de ejemplo.`,
        [{ text: 'OK' }]
      );
    }
  };

  // Convert extracted PDF data to table format
  const convertExtractedDataToTableFormat = (extractedData) => {
    const subjects = extractedData.courses.map((course, index) => {
      // Find schedule times for this course from the extracted schedule
      const courseSchedules = {};
      const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      
      days.forEach(day => {
        const dayKey = day.toLowerCase();
        const daySchedule = extractedData.schedule[day] || extractedData.schedule[dayKey] || [];
        const courseClasses = daySchedule.filter(classItem => 
          classItem.course && classItem.course.toLowerCase().includes(course.name.toLowerCase().substring(0, 10))
        );
        
        courseSchedules[dayKey] = courseClasses.map(classItem => ({
          hora: classItem.time,
          aula: classItem.classroom || 'Aula TBD'
        }));
      });

      return {
        id: (index + 1).toString(),
        asignatura: course.name,
        carrera: extractedData.studentInfo.career || 'No especificada',
        creditos: course.credits || 3,
        profesor: course.professor,
        horarios: courseSchedules
      };
    });

    return {
      subjects,
      studentInfo: {
        name: extractedData.studentInfo.name,
        matricula: extractedData.studentInfo.studentId,
        carrera: extractedData.studentInfo.career,
        periodo: extractedData.studentInfo.period,
        institucion: extractedData.studentInfo.institution
      },
      extractionInfo: {
        method: extractedData.extractionMethod,
        extractedAt: extractedData.extractedAt,
        sourceFile: extractedData.sourceFile,
        hasRawText: extractedData.rawText && typeof extractedData.rawText === 'string' && extractedData.rawText.length > 10
      }
    };
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
          <TouchableOpacity 
            className="bg-green-600 px-4 py-2 rounded-lg"
            onPress={() => {
              loadSchedules();
              Alert.alert('Actualizado', 'Lista de horarios actualizada');
            }}
          >
            <Text className="text-white font-medium">🔄 Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        {/* Data Authenticity Warning */}
        {scheduleData && scheduleData.extractionInfo && scheduleData.extractionInfo.method !== 'text-extraction' && (
          <View className={`border-2 rounded-lg p-4 mb-4 ${
            scheduleData.extractionInfo.method === 'encoded-pdf-fallback' 
              ? 'bg-amber-50 border-amber-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">⚠️</Text>
              <Text className={`font-bold text-lg flex-1 ${
                scheduleData.extractionInfo.method === 'encoded-pdf-fallback' 
                  ? 'text-amber-800' 
                  : 'text-red-800'
              }`}>
                {scheduleData.extractionInfo.method === 'encoded-pdf-fallback' 
                  ? 'PDF COMPLEJO - DATOS SIMULADOS' 
                  : 'DATOS NO REALES'}
              </Text>
            </View>
            <Text className={`text-base mb-2 ${
              scheduleData.extractionInfo.method === 'encoded-pdf-fallback' 
                ? 'text-amber-700' 
                : 'text-red-700'
            }`}>
              {scheduleData.extractionInfo.method === 'encoded-pdf-fallback' 
                ? 'El PDF contiene texto pero está codificado de manera compleja. Los datos mostrados son SIMULADOS basados en el análisis del nombre del archivo.' 
                : 'El PDF cargado no se pudo procesar correctamente. Los datos mostrados son SIMULADOS y no reflejan el contenido real del documento.'}
            </Text>
            <Text className={`text-sm ${
              scheduleData.extractionInfo.method === 'encoded-pdf-fallback' 
                ? 'text-amber-600' 
                : 'text-red-600'
            }`}>
              Para mostrar datos reales: ingrese datos manualmente usando las opciones de la aplicación.
            </Text>
          </View>
        )}

        {/* Extracted Schedule Section */}
        {scheduleData && scheduleData.studentInfo && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">📄 Tu Horario Académico</Text>
            
            {/* Extraction Info Card */}
            {scheduleData.extractionInfo && (
              <View className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                <View className="flex-row items-center mb-2">
                  <Text className="text-blue-800 font-semibold flex-1">Información de Extracción</Text>
                  <View className={`px-2 py-1 rounded-full ${
                    scheduleData.extractionInfo.method === 'text-extraction' 
                      ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      scheduleData.extractionInfo.method === 'text-extraction' 
                        ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {scheduleData.extractionInfo.method === 'text-extraction' ? 'Texto Extraído' : 'Por Nombre'}
                    </Text>
                  </View>
                </View>
                <Text className="text-blue-700 text-xs">
                  📄 Archivo: {scheduleData.extractionInfo.sourceFile}
                </Text>
                <Text className="text-blue-700 text-xs">
                  📊 Texto detectado: {scheduleData.extractionInfo.hasRawText ? 'Sí' : 'No'}
                </Text>
                <Text className="text-blue-700 text-xs">
                  🕒 Extraído: {new Date(scheduleData.extractionInfo.extractedAt).toLocaleString('es-ES')}
                </Text>
                
                {/* Show extraction quality indicator */}
                <View className="mt-2 pt-2 border-t border-blue-200">
                  <Text className="text-blue-700 text-xs font-medium mb-1">Calidad de Extracción:</Text>
                  <View className="flex-row items-center">
                    {scheduleData.extractionInfo.method === 'text-extraction' ? (
                      <>
                        <View className="bg-green-500 w-2 h-2 rounded-full mr-1"></View>
                        <Text className="text-green-700 text-xs">Alta - Datos del PDF procesados</Text>
                      </>
                    ) : (
                      <>
                        <View className="bg-yellow-500 w-2 h-2 rounded-full mr-1"></View>
                        <Text className="text-yellow-700 text-xs">Media - Basado en patrones del nombre</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            )}
            
            {/* Student Info Card */}
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
              <View className="flex-row items-center mb-2">
                <Text className="text-lg font-bold text-gray-800 flex-1">
                  {scheduleData.studentInfo.name}
                </Text>
                <View className="bg-green-100 px-2 py-1 rounded-full">
                  <Text className="text-green-600 text-xs font-medium">Extraído</Text>
                </View>
              </View>
              <Text className="text-gray-600 text-sm">🆔 {scheduleData.studentInfo.matricula}</Text>
              <Text className="text-gray-600 text-sm">🎓 {scheduleData.studentInfo.carrera}</Text>
              <Text className="text-gray-600 text-sm">📅 {scheduleData.studentInfo.periodo}</Text>
              <Text className="text-gray-600 text-sm">🏫 {scheduleData.studentInfo.institucion}</Text>
            </View>

            {/* Schedule Statistics */}
            <View className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <View className="p-4">
                <Text className="text-lg font-bold text-gray-800 mb-3">Resumen del Horario</Text>
                <View className="flex-row flex-wrap">
                  <View className="w-1/2 mb-3">
                    <View className="bg-blue-50 p-3 rounded-lg">
                      <Text className="text-2xl font-bold text-blue-600 text-center">
                        {scheduleData.subjects.length}
                      </Text>
                      <Text className="text-blue-800 text-center text-sm font-medium">Materias</Text>
                    </View>
                  </View>
                  <View className="w-1/2 mb-3 pl-2">
                    <View className="bg-green-50 p-3 rounded-lg">
                      <Text className="text-2xl font-bold text-green-600 text-center">
                        {scheduleData.subjects.reduce((total, subject) => total + (subject.creditos || 0), 0)}
                      </Text>
                      <Text className="text-green-800 text-center text-sm font-medium">Créditos</Text>
                    </View>
                  </View>
                  <View className="w-1/2 pr-1">
                    <View className="bg-purple-50 p-3 rounded-lg">
                      <Text className="text-2xl font-bold text-purple-600 text-center">
                        {(() => {
                          const professors = new Set(scheduleData.subjects.map(s => s.profesor));
                          return professors.size;
                        })()}
                      </Text>
                      <Text className="text-purple-800 text-center text-sm font-medium">Profesores</Text>
                    </View>
                  </View>
                  <View className="w-1/2 pl-2">
                    <View className="bg-orange-50 p-3 rounded-lg">
                      <Text className="text-2xl font-bold text-orange-600 text-center">
                        {(() => {
                          const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
                          return days.filter(day => 
                            scheduleData.subjects.some(subject => 
                              subject.horarios[day] && subject.horarios[day].length > 0
                            )
                          ).length;
                        })()}
                      </Text>
                      <Text className="text-orange-800 text-center text-sm font-medium">Días Activos</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Schedule Table */}
            <View className="bg-white rounded-lg shadow-sm border border-gray-200">
              <View className="p-4 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg font-bold text-gray-800">Tabla de Horarios</Text>
                  {scheduleData.extractionInfo && (
                    <View className={`px-2 py-1 rounded-full ${
                      scheduleData.extractionInfo.method === 'text-extraction' 
                        ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        scheduleData.extractionInfo.method === 'text-extraction' 
                          ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {scheduleData.extractionInfo.method === 'text-extraction' ? 'Real' : 'Estimado'}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-600 text-sm">
                  {scheduleData.subjects.length} materias • {scheduleData.subjects.reduce((total, subject) => total + (subject.creditos || 0), 0)} créditos totales
                </Text>
                {selectedSchedule && (
                  <Text className="text-gray-500 text-xs mt-1">
                    Fuente: {selectedSchedule.pdfFile.name}
                  </Text>
                )}
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View className="min-w-full">
                  {/* Table Header */}
                  <View className="flex-row bg-gray-50 border-b border-gray-200">
                    <View className="w-32 p-3 border-r border-gray-200">
                      <Text className="font-bold text-gray-800 text-xs">Asignatura</Text>
                    </View>
                    <View className="w-24 p-3 border-r border-gray-200">
                      <Text className="font-bold text-gray-800 text-xs">Créditos</Text>
                    </View>
                    <View className="w-32 p-3 border-r border-gray-200">
                      <Text className="font-bold text-gray-800 text-xs">Profesor</Text>
                    </View>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(day => (
                      <View key={day} className="w-24 p-3 border-r border-gray-200">
                        <Text className="font-bold text-gray-800 text-xs text-center">{day}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Table Rows */}
                  {scheduleData.subjects.map((subject) => (
                    <View key={subject.id} className="flex-row border-b border-gray-100">
                      <View className="w-32 p-3 border-r border-gray-200">
                        <Text className="text-gray-800 text-xs" numberOfLines={2}>
                          {subject.asignatura}
                        </Text>
                      </View>
                      <View className="w-24 p-3 border-r border-gray-200">
                        <Text className="text-gray-800 text-xs text-center">
                          {subject.creditos}
                        </Text>
                      </View>
                      <View className="w-32 p-3 border-r border-gray-200">
                        <Text className="text-gray-800 text-xs" numberOfLines={2}>
                          {subject.profesor}
                        </Text>
                      </View>
                      {['lunes', 'martes', 'miércoles', 'jueves', 'viernes'].map(day => (
                        <View key={day} className="w-24 p-3 border-r border-gray-200">
                          {subject.horarios[day]?.map((horario, index) => (
                            <View key={index} className="mb-1">
                              <Text className="text-blue-600 text-xs font-medium">
                                {horario.hora}
                              </Text>
                              <Text className="text-gray-500 text-xs">
                                {horario.aula}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        )}

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
                Sube un PDF de tu horario académico para ver información extraída automáticamente
              </Text>
              <TouchableOpacity 
                className="bg-green-500 px-4 py-2 rounded-lg"
                onPress={() => navigation.navigate('Schedule')}
              >
                <Text className="text-white font-medium">Crear Horario con PDF</Text>
              </TouchableOpacity>
            </View>
          ) : (
            schedules.map(schedule => {
              const hasExtractedData = schedule.extractedData && schedule.extractedData.courses.length > 0;
              const isSelected = selectedSchedule && selectedSchedule.id === schedule.id;
              
              return (
                <TouchableOpacity
                  key={schedule.id}
                  className={`bg-white rounded-xl p-4 mb-3 shadow-sm border-2 ${
                    isSelected ? 'border-green-500' : 'border-gray-200'
                  }`}
                  onPress={() => processSchedulePDF(schedule)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-lg font-semibold text-gray-800 flex-1">{schedule.title}</Text>
                        {hasExtractedData && (
                          <View className="bg-blue-100 px-2 py-1 rounded-full mr-2">
                            <Text className="text-blue-600 text-xs font-medium">Datos Extraídos</Text>
                          </View>
                        )}
                      </View>
                      
                      <Text className="text-sm text-green-600 mt-1">🏫 {schedule.university}</Text>
                      <Text className="text-sm text-blue-600 mt-1">📄 {schedule.pdfFile.name}</Text>
                      
                      {hasExtractedData && (
                        <View className="mt-2">
                          <Text className="text-xs text-gray-600">
                            📊 {schedule.extractedData.courses.length} materias encontradas
                          </Text>
                          <Text className="text-xs text-gray-600">
                            👤 {schedule.extractedData.studentInfo.name}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            Método: {schedule.extractedData.extractionMethod === 'text-extraction' ? '✅ Datos reales' : 
                                   schedule.extractedData.extractionMethod === 'advanced' ? '🔬 Análisis avanzado' :
                                   schedule.extractedData.extractionMethod === 'pattern-analysis' ? '🔍 Análisis de patrones' :
                                   schedule.extractedData.extractionMethod === 'intelligent-fallback' ? '🧠 Fallback inteligente' :
                                   schedule.extractedData.extractionMethod === 'encoded-pdf-fallback' ? '⚠️ PDF complejo' : '⚠️ Datos simulados'}
                          </Text>
                          {schedule.extractedData.analysisResult && (
                            <Text className="text-xs text-blue-600 mt-1">
                              Análisis: {schedule.extractedData.analysisResult.pdfType} | Confianza: {schedule.extractedData.confidence}%
                            </Text>
                          )}
                        </View>
                      )}
                      
                      {!hasExtractedData && (
                        <Text className="text-xs text-yellow-600 mt-2">
                          ⚠️ Sin datos extraídos - se mostrará información de ejemplo
                        </Text>
                      )}
                    </View>
                    
                    <View className={`px-3 py-1 rounded-full ${
                      isSelected ? 'bg-green-500' : 'bg-green-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        isSelected ? 'text-white' : 'text-green-600'
                      }`}>
                        {isSelected ? 'Seleccionado' : 'Ver Tabla'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Schedule Table */}
        {renderScheduleTable()}
      </ScrollView>
    </View>
  );
}
