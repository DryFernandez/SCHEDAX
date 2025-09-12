import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

// Importar datos externos
import { 
  institutionCategories, 
  careersByInstitution, 
  hasPreDefinedCareers 
} from '../data/institutionsData';
import { 
  requiredFields, 
  genderOptions, 
  validateRequiredFields 
} from '../data/validationRules';
import { 
  formSections, 
  fieldPlaceholders, 
  fieldLabels, 
  modalConfig, 
  buttonConfig, 
  systemMessages 
} from '../data/formConfig';
import { 
  months, 
  getDaysInMonth, 
  formatDate, 
  getYearRange, 
  formatPhoneNumber 
} from '../data/dateUtils';

// Componente para selector de fecha simple
const SimpleDatePicker = ({ onDateSelect }) => {
  const { theme } = useTheme();
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleConfirm = () => {
    const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    onDateSelect(selectedDate);
  };

  return (
    <View className="space-y-4">
      {/* Selector de día */}
      <View>
        <Text style={{ color: theme.colors.text }} className="text-sm font-medium mb-2">Día</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-2">
          <View className="flex-row space-x-2 px-2">
            {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1).map(day => (
              <TouchableOpacity
                key={day}
                className="w-12 h-12 rounded-lg items-center justify-center"
                style={{
                  backgroundColor: selectedDay === day ? theme.colors.primary : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={{ 
                  color: selectedDay === day ? theme.colors.textOnPrimary : theme.colors.text 
                }} className="font-medium">
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Selector de mes */}
      <View>
        <Text style={{ color: theme.colors.text }} className="text-sm font-medium mb-2">Mes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2 px-2">
            {months.map((month, index) => (
              <TouchableOpacity
                key={month}
                className="px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: selectedMonth === index + 1 ? theme.colors.primary : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                onPress={() => setSelectedMonth(index + 1)}
              >
                <Text style={{ 
                  color: selectedMonth === index + 1 ? theme.colors.textOnPrimary : theme.colors.text 
                }} className="font-medium">
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Selector de año */}
      <View>
        <Text style={{ color: theme.colors.text }} className="text-sm font-medium mb-2">Año</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2 px-2">
            {getYearRange().map(year => (
              <TouchableOpacity
                key={year}
                className="px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: selectedYear === year ? theme.colors.primary : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                onPress={() => setSelectedYear(year)}
              >
                <Text style={{ 
                  color: selectedYear === year ? theme.colors.textOnPrimary : theme.colors.text 
                }} className="font-medium">
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        className="py-4 px-6 rounded-xl mt-4"
        style={{ backgroundColor: theme.colors.primary }}
        onPress={handleConfirm}
      >
        <Text style={{ color: theme.colors.textOnPrimary }} className="text-center font-semibold">
          {buttonConfig.confirm.text}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function UserProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [showCustomInstitution, setShowCustomInstitution] = useState(false);
  const [customInstitutionText, setCustomInstitutionText] = useState('');
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showCustomCareer, setShowCustomCareer] = useState(false);
  const [customCareerText, setCustomCareerText] = useState('');

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
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
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
    },
    sectionHeader: {
      backgroundColor: theme.colors.backgroundSecondary,
    }
  });

  const [profileData, setProfileData] = useState({
    // Basic Personal Information
    nombre: '',
    apellidos: '',
    telefono: '',
    edad: '',
    genero: '',
    direccion: '',
    
    // Educational Information (Basic from onboarding)
    matricula: '',
    institucion: '',
    carrera: '',
    periodo: '',
    semestre: '',
    año: '',
  });

  useEffect(() => {
    loadExistingProfile();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { UserStorage } = require('../services/UserStorage');
      const currentUser = await UserStorage.getCurrentUser();
      if (currentUser) {
        // Pre-populate email-related data
        setProfileData(prev => ({
          ...prev,
          email: currentUser.email
        }));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadExistingProfile = async () => {
    try {
      const profileString = await AsyncStorage.getItem('@schedax_user_profile');
      if (profileString) {
        const profile = JSON.parse(profileString);
        setExistingProfile(profile);
        
        // Pre-populate profile data with existing information
        setProfileData(prev => ({
          ...prev,
          ...profile
        }));
      }
    } catch (error) {
      console.error('Error loading existing profile:', error);
    }
  };

  const extractAcademicInfoFromFile = (profile) => {
    // This function simulates extracting academic information from the PDF file
    // In a real implementation, you would parse the PDF content
    
    const extractedData = {};
    
    // If basic profile data exists, use it
    if (profile.matricula) extractedData.matricula = profile.matricula;
    if (profile.institucion) extractedData.institucion = profile.institucion;
    if (profile.carrera) extractedData.carrera = profile.carrera;
    if (profile.periodo) extractedData.periodo = profile.periodo;
    if (profile.semestre) extractedData.semestre = profile.semestre;
    if (profile.año) extractedData.año = profile.año;
    
    // Extract additional academic info from schedule file if available
    if (profile.scheduleFile && profile.scheduleFile.name) {
      const fileName = profile.scheduleFile.name.toLowerCase();
      
      // Try to extract academic period from filename
      if (!extractedData.periodo) {
        const periodMatch = fileName.match(/(2024|2025|2026)[_-]?([12])/);
        if (periodMatch) {
          extractedData.periodo = `${periodMatch[1]}-${periodMatch[2]}`;
        }
      }
      
      // Try to extract academic level from filename
      if (!extractedData.nivelEducativo) {
        if (fileName.includes('licenciatura') || fileName.includes('bachelor')) {
          extractedData.nivelEducativo = 'Licenciatura';
        } else if (fileName.includes('maestria') || fileName.includes('master')) {
          extractedData.nivelEducativo = 'Maestría';
        } else if (fileName.includes('doctorado') || fileName.includes('phd')) {
          extractedData.nivelEducativo = 'Doctorado';
        } else {
          extractedData.nivelEducativo = 'Licenciatura'; // Default
        }
      }
      
      // Try to extract entry year (assuming current students)
      if (!extractedData.añoIngreso) {
        const currentYear = new Date().getFullYear();
        const yearMatch = fileName.match(/(202[0-9])/);
        if (yearMatch) {
          // Estimate entry year based on current academic period
          extractedData.añoIngreso = String(parseInt(yearMatch[1]) - 2); // Assuming 3rd year student
        } else {
          extractedData.añoIngreso = String(currentYear - 2);
        }
      }
    }
    
    // Set default values for required fields if not extracted
    if (!extractedData.nivelEducativo) extractedData.nivelEducativo = 'Licenciatura';
    if (!extractedData.añoIngreso) extractedData.añoIngreso = '2022';
    
    return extractedData;
  };

  // Función para manejar cambios en el teléfono
  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text || '');
    handleInputChange('telefono', formatted);
  };

  // Función para formatear fecha
  const formatDate = (day, month, year) => {
    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = month.toString().padStart(2, '0');
    return `${formattedDay}/${formattedMonth}/${year}`;
  };

  // Función para manejar selección de fecha
  const handleDateSelect = (selectedDate) => {
    const day = selectedDate.getDate();
    const month = selectedDate.getMonth() + 1; // Los meses van de 0-11
    const year = selectedDate.getFullYear();
    const formattedDate = formatDate(day, month, year);
    handleInputChange('fechaNacimiento', formattedDate);
    setShowDatePicker(false);
  };

  const handleInputChange = (field, value, isNested = false, parentField = '') => {
    if (isNested) {
      setProfileData(prev => ({
        ...prev,
        [parentField]: {
          ...prev[parentField],
          [field]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const saveExtendedProfile = async () => {
    const validation = validateRequiredFields(profileData);
    if (!validation.isValid) {
      Alert.alert('Campos Requeridos', 'Por favor completa todos los campos obligatorios marcados con *');
      return;
    }

    setIsLoading(true);
    try {
      // Get existing profile data
      const existingProfileString = await AsyncStorage.getItem('@schedax_user_profile');
      const existingProfile = existingProfileString ? JSON.parse(existingProfileString) : {};
      
      // Merge with new profile data, preserving academic information from file
      const completeProfile = {
        ...existingProfile,
        ...profileData,
        // Preserve original academic data from onboarding if not overridden
        matricula: existingProfile?.matricula || profileData.matricula,
        institucion: existingProfile?.institucion || profileData.institucion,
        carrera: existingProfile?.carrera || profileData.carrera,
        periodo: existingProfile?.periodo || profileData.periodo,
        semestre: existingProfile?.semestre || profileData.semestre,
        año: existingProfile?.año || profileData.año,
        // Mark profile as completed
        profileCompleted: true,
        completedDate: new Date().toISOString(),
        // Keep track of data sources
        dataSources: {
          basicProfile: existingProfile?.createdAt || null,
          scheduleFile: existingProfile?.scheduleFile?.name || null,
          extendedProfile: new Date().toISOString()
        }
      };
      
      await AsyncStorage.setItem('@schedax_user_profile', JSON.stringify(completeProfile));
      
      Alert.alert(
        'Perfil Completado',
        'Tu información ha sido guardada exitosamente. Ahora configuremos tu sistema académico.',
        [{ text: 'Continuar', onPress: () => navigation.replace('Statistics') }]
      );
    } catch (error) {
      console.error('Error saving extended profile:', error);
      Alert.alert('Error', 'No se pudo guardar la información. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const skipExtendedProfile = () => {
    Alert.alert(
      'Omitir Información Adicional',
      '¿Estás seguro de que quieres continuar sin completar tu perfil? Puedes hacerlo más tarde desde la configuración.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Omitir', onPress: () => navigation.replace('Statistics') }
      ]
    );
  };

  const styles = createThemedStyles();

  return (
    <KeyboardAvoidingView 
      className="flex-1" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container]} className="flex-1">
        {/* Header */}
        <View style={[styles.header]} className="pt-12 pb-6 px-6">
          <View className="items-center mb-4">
            <View style={[styles.card]} className="w-20 h-20 rounded-full items-center justify-center mb-4">
              <Text className="text-purple-500 text-3xl">📋</Text>
            </View>
            <Text style={[styles.headerTitle]} className="text-2xl font-bold mb-2">Configuración de Perfil</Text>
            <Text style={[styles.headerSubtitle]} className="text-center text-base mb-3">
              Completa tu información personal y académica
            </Text>
            {existingProfile?.scheduleFile && (
              <View className="bg-white/20 rounded-lg p-3 mt-2">
                <Text style={[styles.headerTitle]} className="text-sm font-medium text-center">
                  📄 Información académica extraída de: {existingProfile.scheduleFile.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Form */}
        <ScrollView style={[styles.container]} className="flex-1 rounded-t-3xl px-6 pt-6">
          <View className="space-y-6 pb-8">
            
            {/* Email Display */}
            {profileData.email && (
              <View className="bg-blue-50 p-4 rounded-lg mb-4">
                <Text className="text-sm font-medium text-blue-700 mb-1">Email registrado:</Text>
                <Text className="text-blue-800 font-semibold">{profileData.email}</Text>
                <Text className="text-xs text-blue-600 mt-1">
                  Este email se utilizó durante el registro
                </Text>
              </View>
            )}

            {/* Basic Personal Information Section */}
            <View>
              <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4">Información Personal Básica</Text>
              
              <View className="space-y-3">
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Nombre(s) *</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder={fieldPlaceholders.nombre}
                    placeholderTextColor={theme.colors.textTertiary}
                    value={profileData.nombre}
                    onChangeText={(text) => handleInputChange('nombre', text)}
                  />
                </View>
                
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Apellidos *</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder={fieldPlaceholders.apellidos}
                    placeholderTextColor={theme.colors.textTertiary}
                    value={profileData.apellidos}
                    onChangeText={(text) => handleInputChange('apellidos', text)}
                  />
                </View>
                
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Teléfono *</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder={fieldPlaceholders.telefono}
                      placeholderTextColor={theme.colors.textTertiary}
                      keyboardType="phone-pad"
                      value={profileData.telefono}
                      onChangeText={handlePhoneChange}
                      maxLength={14}
                    />
                  </View>
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Edad *</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder={fieldPlaceholders.edad}
                      placeholderTextColor={theme.colors.textTertiary}
                      keyboardType="numeric"
                      value={profileData.edad}
                      onChangeText={(text) => handleInputChange('edad', text)}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Basic Educational Information Section */}
            <View style={[styles.card]}>
              <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4">Información Educativa Básica</Text>
              
              <View className="space-y-3">
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Matrícula *</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder={fieldPlaceholders.matricula}
                    placeholderTextColor={theme.colors.textTertiary}
                    value={profileData.matricula}
                    onChangeText={(text) => handleInputChange('matricula', text)}
                  />
                </View>
                
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Institución *</Text>
                  <TouchableOpacity
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base flex-row items-center justify-between"
                    onPress={() => setShowInstitutionModal(true)}
                  >
                    <Text style={profileData.institucion ? [styles.textPrimary] : { color: theme.colors.textTertiary }}>
                      {profileData.institucion || 'Seleccionar institución'}
                    </Text>
                    <Text style={[styles.textPrimary]}>▼</Text>
                  </TouchableOpacity>
                </View>
                
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Carrera *</Text>
                  <TouchableOpacity
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base flex-row items-center justify-between"
                    onPress={() => {
                      if (!profileData.institucion) {
                        Alert.alert('Información', 'Primero selecciona una institución para ver las carreras disponibles.');
                        return;
                      }
                      setShowCareerModal(true);
                    }}
                  >
                    <Text style={profileData.carrera ? [styles.textPrimary] : { color: theme.colors.textTertiary }}>
                      {profileData.carrera || (profileData.institucion ? 'Seleccionar carrera' : 'Primero selecciona una institución')}
                    </Text>
                    <Text style={[styles.textPrimary]}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Additional Personal Information */}
            <View style={[styles.card]}>
              <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4">Información Personal Adicional</Text>
              
              <View className="space-y-3">
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Fecha de Nacimiento *</Text>
                  <TouchableOpacity
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base flex-row items-center justify-between"
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={profileData.fechaNacimiento ? [styles.textPrimary] : { color: theme.colors.textTertiary }}>
                      {profileData.fechaNacimiento || 'DD/MM/YYYY'}
                    </Text>
                    <Text style={[styles.textPrimary]}>📅</Text>
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Género *</Text>
                    <TouchableOpacity
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base flex-row items-center justify-between"
                      onPress={() => setShowGenderModal(true)}
                    >
                      <Text style={profileData.genero ? [styles.textPrimary] : { color: theme.colors.textTertiary }}>
                        {profileData.genero || fieldPlaceholders.genero}
                      </Text>
                      <Text style={[styles.textPrimary]}>▼</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Dirección *</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder={fieldPlaceholders.direccion}
                      placeholderTextColor={theme.colors.textTertiary}
                      value={profileData.direccion}
                      onChangeText={(text) => handleInputChange('direccion', text)}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3 pt-4">
              <TouchableOpacity 
                className="py-4 px-6 rounded-xl items-center"
                style={isLoading ? { backgroundColor: '#9ca3af' } : { backgroundColor: theme.colors.primary }}
                onPress={saveExtendedProfile}
                disabled={isLoading}
              >
                <Text style={{ color: theme.colors.textOnPrimary }} className="text-lg font-semibold">
                  {isLoading ? 'Guardando información...' : 'Guardar y Continuar'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.textInput]}
                className="py-3 px-6 rounded-xl items-center border"
                onPress={skipExtendedProfile}
              >
                <Text style={[styles.textSecondary]} className="font-medium">Omitir por ahora</Text>
              </TouchableOpacity>
            </View>

            <View className="items-center mt-2 mb-6">
              <Text style={[styles.textTertiary]} className="text-sm text-center">
                * Campos obligatorios{'\n'}
                Puedes completar esta información más tarde desde tu perfil
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modal para seleccionar género */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View style={[styles.card]} className="rounded-t-3xl p-6">
            <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4 text-center">
              {modalConfig.gender.title}
            </Text>
            
            <View className="space-y-3">
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  className="py-4 px-6 rounded-xl border"
                  style={{ borderColor: theme.colors.border }}
                  onPress={() => {
                    handleInputChange('genero', option);
                    setShowGenderModal(false);
                  }}
                >
                  <Text style={[styles.textPrimary]} className="text-center font-medium">
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                className="py-3 px-6 rounded-xl mt-4"
                style={{ backgroundColor: theme.colors.textTertiary }}
                onPress={() => setShowGenderModal(false)}
              >
                <Text className="text-center font-medium text-white">
                  {buttonConfig.cancel.text}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar fecha */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View style={[styles.card]} className="rounded-t-3xl p-6">
            <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4 text-center">
              Seleccionar Fecha de Nacimiento
            </Text>
            
            <SimpleDatePicker onDateSelect={handleDateSelect} />
            
            <TouchableOpacity
              className="py-3 px-6 rounded-xl mt-4"
              style={{ backgroundColor: theme.colors.textTertiary }}
              onPress={() => setShowDatePicker(false)}
            >
              <Text className="text-center font-medium text-white">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar institución */}
      <Modal
        visible={showInstitutionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInstitutionModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]} className="rounded-t-3xl p-6">
            <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4 text-center">
              Seleccionar Institución Educativa
            </Text>
            
            <View style={{ height: 400 }}>
              <ScrollView showsVerticalScrollIndicator={true}>
                <View className="space-y-4">
                  {Object.entries(institutionCategories).map(([category, institutions]) => (
                    <View key={category} className="mb-4">
                      <Text style={[styles.textPrimary, { color: theme.colors.primary }]} className="text-sm font-bold mb-3 text-center">
                        {category}
                      </Text>
                      <View className="space-y-2">
                        {institutions.map((institution, index) => (
                          <TouchableOpacity
                            key={index}
                            style={{
                              backgroundColor: theme.colors.background,
                              borderColor: theme.colors.border,
                              borderWidth: 1,
                              padding: 12,
                              borderRadius: 8,
                              marginBottom: 8
                            }}
                            onPress={() => {
                              if (institution === 'Otra institución...') {
                                setShowInstitutionModal(false);
                                setCustomInstitutionText('');
                                setShowCustomInstitution(true);
                              } else {
                                handleInputChange('institucion', institution);
                                // Limpiar carrera cuando se cambia la institución
                                handleInputChange('carrera', '');
                                setShowInstitutionModal(false);
                              }
                            }}
                          >
                            <Text style={[styles.textPrimary]} className="font-medium text-sm">
                              {institution}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            <TouchableOpacity
              className="py-3 px-6 rounded-xl mt-4"
              style={{ backgroundColor: theme.colors.textTertiary }}
              onPress={() => setShowInstitutionModal(false)}
            >
              <Text className="text-center font-medium text-white">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para institución personalizada */}
      <Modal
        visible={showCustomInstitution}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomInstitution(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-6">
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]} className="w-full rounded-2xl p-6">
            <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4 text-center">
              Institución Personalizada
            </Text>
            
            <Text style={[styles.textSecondary]} className="text-sm mb-4 text-center">
              Ingresa el nombre de tu institución educativa:
            </Text>
            
            <TextInput
              style={[styles.textInput, {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                marginBottom: 20
              }]}
              placeholder={fieldPlaceholders.customInstitution}
              placeholderTextColor={theme.colors.textTertiary}
              value={customInstitutionText}
              onChangeText={setCustomInstitutionText}
              autoFocus={true}
              multiline={false}
            />
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 py-3 px-6 rounded-xl border"
                style={{ borderColor: theme.colors.border }}
                onPress={() => {
                  setShowCustomInstitution(false);
                  setCustomInstitutionText('');
                }}
              >
                <Text style={[styles.textSecondary]} className="text-center font-medium">
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 py-3 px-6 rounded-xl"
                style={{ 
                  backgroundColor: (customInstitutionText || '').trim() ? theme.colors.primary : theme.colors.textTertiary 
                }}
                onPress={() => {
                  if ((customInstitutionText || '').trim()) {
                    handleInputChange('institucion', (customInstitutionText || '').trim());
                    // Limpiar carrera cuando se cambia la institución
                    handleInputChange('carrera', '');
                    setShowCustomInstitution(false);
                    setCustomInstitutionText('');
                  }
                }}
                disabled={!(customInstitutionText || '').trim()}
              >
                <Text style={{ 
                  color: (customInstitutionText || '').trim() ? theme.colors.textOnPrimary : '#ffffff' 
                }} className="text-center font-medium">
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar carrera */}
      <Modal
        visible={showCareerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCareerModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]} className="rounded-t-3xl p-6">
            <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4 text-center">
              Carreras Disponibles
            </Text>
            <Text style={[styles.textSecondary]} className="text-sm mb-4 text-center">
              {profileData.institucion}
            </Text>
            
            <View style={{ height: 400 }}>
              <ScrollView showsVerticalScrollIndicator={true}>
                <View className="space-y-2">
                  {profileData.institucion && careersByInstitution[profileData.institucion] ? (
                    careersByInstitution[profileData.institucion].map((career, index) => (
                      <TouchableOpacity
                        key={index}
                        style={{
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                          borderWidth: 1,
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 8
                        }}
                        onPress={() => {
                          handleInputChange('carrera', career);
                          setShowCareerModal(false);
                        }}
                      >
                        <Text style={[styles.textPrimary]} className="font-medium text-sm">
                          {career}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    // Si es una institución personalizada, mostrar opción para escribir carrera
                    <TouchableOpacity
                      style={{
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.primary,
                        borderWidth: 2,
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 8
                      }}
                      onPress={() => {
                        setShowCareerModal(false);
                        setCustomCareerText('');
                        setShowCustomCareer(true);
                      }}
                    >
                      <Text style={[styles.textPrimary]} className="font-medium text-sm text-center">
                        ✏️ Escribir carrera personalizada
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </View>
            
            <TouchableOpacity
              className="py-3 px-6 rounded-xl mt-4"
              style={{ backgroundColor: theme.colors.textTertiary }}
              onPress={() => setShowCareerModal(false)}
            >
              <Text className="text-center font-medium text-white">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para carrera personalizada */}
      <Modal
        visible={showCustomCareer}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomCareer(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-6">
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]} className="w-full rounded-2xl p-6">
            <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4 text-center">
              Carrera Personalizada
            </Text>
            
            <Text style={[styles.textSecondary]} className="text-sm mb-4 text-center">
              Ingresa el nombre de tu carrera o programa académico:
            </Text>
            
            <TextInput
              style={[styles.textInput, {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                marginBottom: 20
              }]}
              placeholder={fieldPlaceholders.customCareer}
              placeholderTextColor={theme.colors.textTertiary}
              value={customCareerText}
              onChangeText={setCustomCareerText}
              autoFocus={true}
              multiline={false}
            />
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 py-3 px-6 rounded-xl border"
                style={{ borderColor: theme.colors.border }}
                onPress={() => {
                  setShowCustomCareer(false);
                  setCustomCareerText('');
                }}
              >
                <Text style={[styles.textSecondary]} className="text-center font-medium">
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 py-3 px-6 rounded-xl"
                style={{ 
                  backgroundColor: (customCareerText || '').trim() ? theme.colors.primary : theme.colors.textTertiary 
                }}
                onPress={() => {
                  if ((customCareerText || '').trim()) {
                    handleInputChange('carrera', (customCareerText || '').trim());
                    setShowCustomCareer(false);
                    setCustomCareerText('');
                  }
                }}
                disabled={!(customCareerText || '').trim()}
              >
                <Text style={{ 
                  color: (customCareerText || '').trim() ? theme.colors.textOnPrimary : '#ffffff' 
                }} className="text-center font-medium">
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
