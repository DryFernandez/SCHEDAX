import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStorage } from '../services/UserStorage';
import { androidStyles, colors, getGradientBackground } from '../utils/androidStyles';

const USER_PROFILE_KEY = '@schedax_user_profile';

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Upload file, 2: Profile info
  const [scheduleFile, setScheduleFile] = useState(null);
  const [userProfile, setUserProfile] = useState({
    matricula: '',
    nombre: '',
    apellido: '',
    edad: '',
    telefono: '',
    email: '',
    direccion: '',
    institucion: '',
    carrera: '',
    periodo: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const pickScheduleFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setScheduleFile(file);
        Alert.alert(
          'Archivo Seleccionado',
          `Archivo: ${file.name}\nTamaño: ${Math.round(file.size / 1024)} KB`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Error al seleccionar archivo');
    }
  };

  const processFileAndContinue = async () => {
    if (!scheduleFile) {
      Alert.alert('Error', 'Por favor selecciona tu archivo de horario primero');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulación de procesamiento de archivo
      // En una versión futura se puede implementar extracción real
      Alert.alert(
        '📄 Archivo Recibido',
        `Tu archivo "${scheduleFile.name}" ha sido recibido.\n\nPor ahora, completa tu perfil manualmente y las materias se podrán agregar desde la pantalla principal.`,
        [
          {
            text: 'Continuar',
            onPress: () => setStep(2)
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error', 
        'Hubo un problema procesando el archivo. Puedes continuar y agregar tus materias manualmente.',
        [
          {
            text: 'Continuar',
            onPress: () => setStep(2)
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateProfileForm = () => {
    const required = ['nombre', 'apellido', 'edad', 'telefono'];
    const missing = required.filter(field => !userProfile[field].trim());
    
    if (missing.length > 0) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return false;
    }
    
    return true;
  };

  const saveProfile = async () => {
    if (!validateProfileForm()) return;
    
    setIsLoading(true);
    
    try {
      const currentUser = await UserStorage.getCurrentUser();
      
      const profileData = {
        ...userProfile,
        id: currentUser?.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        scheduleFile: scheduleFile ? {
          name: scheduleFile.name,
          uri: scheduleFile.uri,
          uploadedAt: new Date().toISOString()
        } : null
      };

      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profileData));
      await UserStorage.saveUser(profileData);

      Alert.alert(
        'Perfil Guardado',
        '¡Tu perfil ha sido configurado exitosamente!',
        [
          {
            text: 'Continuar',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Error al guardar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const skipFileUpload = () => {
    Alert.alert(
      'Saltar Carga de Archivo',
      'Puedes agregar tu horario manualmente más tarde desde la pantalla principal.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: () => setStep(2) }
      ]
    );
  };

  if (step === 1) {
    return (
      <View style={[androidStyles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={androidStyles.scrollContainer}>
          <View style={androidStyles.header}>
            <Text style={androidStyles.title}>¡Bienvenido a SCHEDAX!</Text>
            <Text style={androidStyles.subtitle}>
              Comencemos configurando tu perfil académico
            </Text>
          </View>

          <View style={androidStyles.card}>
            <Text style={androidStyles.cardTitle}>Paso 1: Carga tu Horario</Text>
            <Text style={androidStyles.description}>
              Sube tu archivo PDF de horario para extraer automáticamente tus materias
            </Text>

            {scheduleFile ? (
              <View style={androidStyles.fileInfo}>
                <Text style={androidStyles.fileName}>📄 {scheduleFile.name}</Text>
                <Text style={androidStyles.fileSize}>
                  {Math.round(scheduleFile.size / 1024)} KB
                </Text>
              </View>
            ) : (
              <View style={androidStyles.uploadPlaceholder}>
                <Text style={androidStyles.uploadText}>
                  📤 Ningún archivo seleccionado
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={androidStyles.primaryButton}
              onPress={pickScheduleFile}
            >
              <Text style={androidStyles.primaryButtonText}>
                {scheduleFile ? 'Cambiar Archivo' : 'Seleccionar PDF'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={androidStyles.actionContainer}>
            {scheduleFile ? (
              <TouchableOpacity
                style={[androidStyles.primaryButton, isLoading && androidStyles.disabledButton]}
                onPress={processFileAndContinue}
                disabled={isLoading}
              >
                <Text style={androidStyles.primaryButtonText}>
                  {isLoading ? 'Procesando...' : 'Procesar y Continuar'}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[androidStyles.secondaryButton, { marginTop: 10 }]}
              onPress={skipFileUpload}
            >
              <Text style={androidStyles.secondaryButtonText}>
                Saltar por Ahora
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[androidStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={androidStyles.scrollContainer}>
        <View style={androidStyles.header}>
          <Text style={androidStyles.title}>Completa tu Perfil</Text>
          <Text style={androidStyles.subtitle}>
            Paso 2: Información Personal
          </Text>
        </View>

        <View style={androidStyles.card}>
          <Text style={androidStyles.cardTitle}>Información Básica</Text>
          
          <View style={androidStyles.inputGroup}>
            <Text style={androidStyles.inputLabel}>Matrícula *</Text>
            <TextInput
              style={androidStyles.input}
              value={userProfile.matricula}
              onChangeText={(text) => setUserProfile(prev => ({ ...prev, matricula: text }))}
              placeholder="Ej: 2021-0123"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={androidStyles.inputGroup}>
            <Text style={androidStyles.inputLabel}>Nombre *</Text>
            <TextInput
              style={androidStyles.input}
              value={userProfile.nombre}
              onChangeText={(text) => setUserProfile(prev => ({ ...prev, nombre: text }))}
              placeholder="Tu nombre"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={androidStyles.inputGroup}>
            <Text style={androidStyles.inputLabel}>Apellido *</Text>
            <TextInput
              style={androidStyles.input}
              value={userProfile.apellido}
              onChangeText={(text) => setUserProfile(prev => ({ ...prev, apellido: text }))}
              placeholder="Tu apellido"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={androidStyles.inputGroup}>
            <Text style={androidStyles.inputLabel}>Edad *</Text>
            <TextInput
              style={androidStyles.input}
              value={userProfile.edad}
              onChangeText={(text) => setUserProfile(prev => ({ ...prev, edad: text }))}
              placeholder="Ej: 20"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={androidStyles.inputGroup}>
            <Text style={androidStyles.inputLabel}>Teléfono *</Text>
            <TextInput
              style={androidStyles.input}
              value={userProfile.telefono}
              onChangeText={(text) => setUserProfile(prev => ({ ...prev, telefono: text }))}
              placeholder="Ej: 809-123-4567"
              keyboardType="phone-pad"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={androidStyles.inputGroup}>
            <Text style={androidStyles.inputLabel}>Email</Text>
            <TextInput
              style={androidStyles.input}
              value={userProfile.email}
              onChangeText={(text) => setUserProfile(prev => ({ ...prev, email: text }))}
              placeholder="tu@email.com"
              keyboardType="email-address"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={androidStyles.inputGroup}>
            <Text style={androidStyles.inputLabel}>Dirección</Text>
            <TextInput
              style={[androidStyles.input, { height: 80 }]}
              value={userProfile.direccion}
              onChangeText={(text) => setUserProfile(prev => ({ ...prev, direccion: text }))}
              placeholder="Tu dirección"
              multiline
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={androidStyles.card}>
          <Text style={androidStyles.cardTitle}>Información Académica</Text>
          
          <View style={androidStyles.inputGroup}>
            <Text style={androidStyles.inputLabel}>Institución</Text>
            <TextInput
              style={androidStyles.input}
              value={userProfile.institucion}
              onChangeText={(text) => setUserProfile(prev => ({ ...prev, institucion: text }))}
              placeholder="Universidad/Instituto"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={androidStyles.inputGroup}>
            <Text style={androidStyles.inputLabel}>Carrera</Text>
            <TextInput
              style={androidStyles.input}
              value={userProfile.carrera}
              onChangeText={(text) => setUserProfile(prev => ({ ...prev, carrera: text }))}
              placeholder="Tu carrera"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={androidStyles.inputGroup}>
            <Text style={androidStyles.inputLabel}>Período Actual</Text>
            <TextInput
              style={androidStyles.input}
              value={userProfile.periodo}
              onChangeText={(text) => setUserProfile(prev => ({ ...prev, periodo: text }))}
              placeholder="Ej: 2025-1"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={androidStyles.actionContainer}>
          <TouchableOpacity
            style={[androidStyles.primaryButton, isLoading && androidStyles.disabledButton]}
            onPress={saveProfile}
            disabled={isLoading}
          >
            <Text style={androidStyles.primaryButtonText}>
              {isLoading ? 'Guardando...' : 'Completar Configuración'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[androidStyles.secondaryButton, { marginTop: 10 }]}
            onPress={() => setStep(1)}
          >
            <Text style={androidStyles.secondaryButtonText}>
              Volver Atrás
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
