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

export default function UserProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);

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
    
    // Extended Personal Details
    fechaNacimiento: '',
    genero: '',
    estadoCivil: '',
    nacionalidad: '',
    ciudadResidencia: '',
    codigoPostal: '',
    
    // Educational Information (Basic)
    matricula: '',
    institucion: '',
    carrera: '',
    
    // Emergency Contact
    contactoEmergencia: {
      nombre: '',
      relacion: '',
      telefono: '',
    },
    
    // Academic Background
    nivelEducativo: '',
    promedioGeneral: '',
    añoIngreso: '',
    añoEgreso: '',
    becas: '',
    
    // Additional Information
    idiomas: '',
    habilidades: '',
    pasatiempos: '',
    objetivosAcademicos: '',
    
    // Work Experience (Optional)
    experienciaLaboral: '',
    trabajoActual: '',
    
    // Health Information (Optional)
    tipoSangre: '',
    alergias: '',
    medicamentos: '',
    
    // Social Media & Links
    linkedIn: '',
    github: '',
    portfolio: '',
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

  const validateRequiredFields = () => {
    const requiredFields = [
      'nombre', 'apellidos', 'telefono', 'edad',
      'matricula', 'institucion', 'carrera',
      'fechaNacimiento', 'genero', 'ciudadResidencia',
      'nivelEducativo', 'añoIngreso'
    ];
    
    for (let field of requiredFields) {
      if (!profileData[field].trim()) {
        return false;
      }
    }
    
    // Check emergency contact required fields
    if (!profileData.contactoEmergencia.nombre.trim() || 
        !profileData.contactoEmergencia.telefono.trim()) {
      return false;
    }
    
    return true;
  };

  const saveExtendedProfile = async () => {
    if (!validateRequiredFields()) {
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
        'Tu información ha sido guardada exitosamente',
        [{ text: 'Continuar', onPress: () => navigation.replace('MainApp') }]
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
        { text: 'Omitir', onPress: () => navigation.replace('MainApp') }
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
                    placeholder="Tu nombre"
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
                    placeholder="Tus apellidos"
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
                      placeholder="Número de teléfono"
                      placeholderTextColor={theme.colors.textTertiary}
                      keyboardType="phone-pad"
                      value={profileData.telefono}
                      onChangeText={(text) => handleInputChange('telefono', text)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Edad *</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder="Tu edad"
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
                    placeholder="Tu número de matrícula"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={profileData.matricula}
                    onChangeText={(text) => handleInputChange('matricula', text)}
                  />
                </View>
                
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Institución *</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="Nombre de tu universidad/institución"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={profileData.institucion}
                    onChangeText={(text) => handleInputChange('institucion', text)}
                  />
                </View>
                
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Carrera *</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="Tu carrera o programa académico"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={profileData.carrera}
                    onChangeText={(text) => handleInputChange('carrera', text)}
                  />
                </View>
              </View>
            </View>

            {/* Extended Personal Details Section */}
            <View style={[styles.card]}>
              <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4">Información Personal Adicional</Text>
              
              <View className="space-y-3">
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Fecha de Nacimiento *</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={profileData.fechaNacimiento}
                    onChangeText={(text) => handleInputChange('fechaNacimiento', text)}
                  />
                </View>
                
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Género *</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder="Masculino/Femenino/Otro"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={profileData.genero}
                      onChangeText={(text) => handleInputChange('genero', text)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Estado Civil</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder="Soltero/Casado/Otro"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={profileData.estadoCivil}
                      onChangeText={(text) => handleInputChange('estadoCivil', text)}
                    />
                  </View>
                </View>
                
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Nacionalidad</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholderTextColor={theme.colors.textTertiary}
                    placeholder="e.g., Mexicana, Colombiana"
                    value={profileData.nacionalidad}
                    onChangeText={(text) => handleInputChange('nacionalidad', text)}
                  />
                </View>
                
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Ciudad de Residencia *</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder="Ciudad donde vives"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={profileData.ciudadResidencia}
                      onChangeText={(text) => handleInputChange('ciudadResidencia', text)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Código Postal</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder="CP"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={profileData.codigoPostal}
                      onChangeText={(text) => handleInputChange('codigoPostal', text)}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Emergency Contact Section */}
            <View style={[styles.card]}>
              <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4">Contacto de Emergencia</Text>
              
              <View className="space-y-3">
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Nombre Completo *</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="Nombre del contacto de emergencia"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={profileData.contactoEmergencia.nombre}
                    onChangeText={(text) => handleInputChange('nombre', text, true, 'contactoEmergencia')}
                  />
                </View>
                
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Relación</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder="Padre/Madre/Hermano/etc"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={profileData.contactoEmergencia.relacion}
                      onChangeText={(text) => handleInputChange('relacion', text, true, 'contactoEmergencia')}
                    />
                  </View>
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Teléfono *</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder="Número de teléfono"
                      placeholderTextColor={theme.colors.textTertiary}
                      keyboardType="phone-pad"
                      value={profileData.contactoEmergencia.telefono}
                      onChangeText={(text) => handleInputChange('telefono', text, true, 'contactoEmergencia')}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Extracted Academic Information Display */}
            {existingProfile && (
              <View className="mb-6 bg-blue-50 p-4 rounded-lg">
                <Text className="text-lg font-bold text-blue-800 mb-3">
                  📄 Información Académica del Archivo
                </Text>
                <View className="space-y-2">
                  {existingProfile.matricula && (
                    <View className="flex-row">
                      <Text className="text-sm text-gray-600 font-medium w-24">Matrícula:</Text>
                      <Text className="text-sm text-gray-800 flex-1">{existingProfile.matricula}</Text>
                    </View>
                  )}
                  {existingProfile.institucion && (
                    <View className="flex-row">
                      <Text className="text-sm text-gray-600 font-medium w-24">Institución:</Text>
                      <Text className="text-sm text-gray-800 flex-1">{existingProfile.institucion}</Text>
                    </View>
                  )}
                  {existingProfile.carrera && (
                    <View className="flex-row">
                      <Text className="text-sm text-gray-600 font-medium w-24">Carrera:</Text>
                      <Text className="text-sm text-gray-800 flex-1">{existingProfile.carrera}</Text>
                    </View>
                  )}
                  {existingProfile.periodo && (
                    <View className="flex-row">
                      <Text className="text-sm text-gray-600 font-medium w-24">Período:</Text>
                      <Text className="text-sm text-gray-800 flex-1">{existingProfile.periodo}</Text>
                    </View>
                  )}
                  {existingProfile.scheduleFile && (
                    <View className="flex-row">
                      <Text className="text-sm text-gray-600 font-medium w-24">Archivo:</Text>
                      <Text className="text-sm text-gray-800 flex-1">{existingProfile.scheduleFile.name}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-blue-600 mt-3">
                  ℹ️ Esta información fue extraída de tu archivo de horario cargado
                </Text>
              </View>
            )}

            {/* Academic Background Section */}
            <View style={[styles.card]}>
              <View className="flex-row items-center mb-4">
                <Text style={[styles.textPrimary]} className="text-lg font-bold flex-1">Información Académica Detallada</Text>
                <View style={{ backgroundColor: theme.colors.primary + '20' }} className="px-2 py-1 rounded-full">
                  <Text style={{ color: theme.colors.primary }} className="text-xs font-medium">✏️ Editable</Text>
                </View>
              </View>
              
              <View className="space-y-3">
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Nivel Educativo *</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: theme.colors.primary + '10' }]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="Licenciatura/Maestría/Doctorado"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={profileData.nivelEducativo}
                    onChangeText={(text) => handleInputChange('nivelEducativo', text)}
                  />
                  {profileData.nivelEducativo && (
                    <Text style={{ color: theme.colors.primary }} className="text-xs mt-1">✓ Información extraída automáticamente</Text>
                  )}
                </View>
                
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Año de Ingreso *</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.colors.primary + '10' }]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder="2024"
                      placeholderTextColor={theme.colors.textTertiary}
                      keyboardType="numeric"
                      value={profileData.añoIngreso}
                      onChangeText={(text) => handleInputChange('añoIngreso', text)}
                    />
                    {profileData.añoIngreso && (
                      <Text style={{ color: theme.colors.primary }} className="text-xs mt-1">✓ Extraído del archivo</Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Año de Egreso Estimado</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder="2028"
                      keyboardType="numeric"
                      value={profileData.añoEgreso}
                      onChangeText={(text) => handleInputChange('añoEgreso', text)}
                    />
                  </View>
                </View>
                
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Promedio General</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder="9.5"
                      placeholderTextColor={theme.colors.textTertiary}
                      keyboardType="decimal-pad"
                      value={profileData.promedioGeneral}
                      onChangeText={(text) => handleInputChange('promedioGeneral', text)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Becas/Ayudas</Text>
                    <TextInput
                      style={[styles.textInput]}
                      className="border rounded-lg px-3 py-3 text-base"
                      placeholder="Beca de Excelencia"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={profileData.becas}
                      onChangeText={(text) => handleInputChange('becas', text)}
                    />
                  </View>
                </View>

                {/* Pre-populated fields from onboarding */}
                <View className="bg-gray-50 p-3 rounded-lg mt-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Información de tu Perfil Básico:</Text>
                  <View className="space-y-2">
                    {existingProfile?.matricula && (
                      <View className="flex-row">
                        <Text className="text-xs text-gray-600 w-20">Matrícula:</Text>
                        <Text className="text-xs text-gray-800 flex-1">{existingProfile.matricula}</Text>
                      </View>
                    )}
                    {existingProfile?.institucion && (
                      <View className="flex-row">
                        <Text className="text-xs text-gray-600 w-20">Institución:</Text>
                        <Text className="text-xs text-gray-800 flex-1">{existingProfile.institucion}</Text>
                      </View>
                    )}
                    {existingProfile?.carrera && (
                      <View className="flex-row">
                        <Text className="text-xs text-gray-600 w-20">Carrera:</Text>
                        <Text className="text-xs text-gray-800 flex-1">{existingProfile.carrera}</Text>
                      </View>
                    )}
                    {existingProfile?.periodo && (
                      <View className="flex-row">
                        <Text className="text-xs text-gray-600 w-20">Período:</Text>
                        <Text className="text-xs text-gray-800 flex-1">{existingProfile.periodo}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Skills and Interests Section */}
            <View style={[styles.card]}>
              <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4">Habilidades e Intereses</Text>
              
              <View className="space-y-3">
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Idiomas</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="Español (Nativo), Inglés (Intermedio)"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={profileData.idiomas}
                    onChangeText={(text) => handleInputChange('idiomas', text)}
                  />
                </View>
                
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Habilidades Técnicas</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="Programación, Diseño, Análisis de datos"
                    placeholderTextColor={theme.colors.textTertiary}
                    multiline
                    numberOfLines={3}
                    value={profileData.habilidades}
                    onChangeText={(text) => handleInputChange('habilidades', text)}
                  />
                </View>
                
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Pasatiempos</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="Lectura, deportes, música, videojuegos"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={profileData.pasatiempos}
                    onChangeText={(text) => handleInputChange('pasatiempos', text)}
                  />
                </View>
                
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Objetivos Académicos</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="Metas y objetivos para tu carrera académica"
                    multiline
                    numberOfLines={3}
                    value={profileData.objetivosAcademicos}
                    onChangeText={(text) => handleInputChange('objetivosAcademicos', text)}
                  />
                </View>
              </View>
            </View>

            {/* Professional Links Section */}
            <View style={[styles.card]}>
              <Text style={[styles.textPrimary]} className="text-lg font-bold mb-4">Enlaces Profesionales (Opcional)</Text>
              
              <View className="space-y-3">
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">LinkedIn</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="linkedin.com/in/tu-perfil"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                    value={profileData.linkedIn}
                    onChangeText={(text) => handleInputChange('linkedIn', text)}
                  />
                </View>
                
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">GitHub</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="github.com/tu-usuario"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                    value={profileData.github}
                    onChangeText={(text) => handleInputChange('github', text)}
                  />
                </View>
                
                <View>
                  <Text style={[styles.textPrimary]} className="text-sm font-medium mb-1">Portfolio/Website</Text>
                  <TextInput
                    style={[styles.textInput]}
                    className="border rounded-lg px-3 py-3 text-base"
                    placeholder="tu-portfolio.com"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                    value={profileData.portfolio}
                    onChangeText={(text) => handleInputChange('portfolio', text)}
                  />
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
    </KeyboardAvoidingView>
  );
}
