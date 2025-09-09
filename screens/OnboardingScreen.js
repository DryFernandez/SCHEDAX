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
        setScheduleFile({
          name: result.assets[0].name,
          uri: result.assets[0].uri,
          size: result.assets[0].size,
        });
      }
    } catch (error) {
      console.error('Error picking schedule file:', error);
      Alert.alert('Error', 'Failed to pick schedule file. Please try again.');
    }
  };

  const processFileAndContinue = async () => {
    if (!scheduleFile) {
      Alert.alert('Error', 'Please upload your schedule file first');
      return;
    }
    
    try {
      // Schedule file uploaded - continue with manual setup
      Alert.alert(
        'Archivo Cargado',
        `Horario PDF: ${scheduleFile.name}\n\nAhora puedes completar tu perfil manualmente.`,
        [{ text: 'Continuar' }]
      );
      
      // Continue to profile setup step
      setStep(2);
      
    } catch (error) {
      console.error('Error handling file:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al procesar el archivo. Puedes continuar configurando tu perfil manualmente.',
        [{ text: 'Continuar', onPress: () => setStep(2) }]
      );
    }
  };

  const validateProfileForm = () => {
    const required = ['nombre', 'apellido', 'edad', 'telefono'];
    const missing = required.filter(field => !userProfile[field].trim());
    
    if (missing.length > 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
    
    return true;
  };

  const saveProfile = async () => {
    if (!validateProfileForm()) return;
    
    setIsLoading(true);
    
    try {
      const currentUser = await UserStorage.getCurrentUser();
      
      if (!currentUser || !currentUser.id) {
        throw new Error('User not found. Please log in again.');
      }
      
      const profileData = {
        userId: currentUser.id,
        ...userProfile,
        scheduleFile: scheduleFile,
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profileData));
      
      Alert.alert(
        'Basic Profile Created!',
        `Welcome ${userProfile.nombre} ${userProfile.apellido}!\n\nLet's complete your profile with additional information.`,
        [
          { 
            text: 'Continue', 
            onPress: () => navigation.navigate('UserProfile')
          }
        ]
      );
      
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 1) {
    // Step 1: Upload Schedule File
    return (
      <View className="flex-1" style={[{ backgroundColor: colors.primary[500] }, Platform.OS === 'android' && getGradientBackground('blue-purple')]}>
        {/* Header */}
        <View className="pt-12 pb-6 px-6">
          <View className="items-center mb-6">
            <View className="bg-white w-20 h-20 rounded-full items-center justify-center mb-4">
              <Text className="text-blue-500 text-3xl">📄</Text>
            </View>
            <Text className="text-white text-2xl font-bold mb-2">Upload Your Schedule</Text>
            <Text className="text-blue-100 text-center text-base">
              First, upload your academic schedule PDF file
            </Text>
          </View>
        </View>

        {/* Upload Section */}
        <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8">
          <View className="flex-1 justify-center">
            <TouchableOpacity 
              className="border-2 border-dashed border-blue-300 rounded-2xl p-8 items-center bg-blue-50 mb-8"
              onPress={pickScheduleFile}
            >
              {scheduleFile ? (
                <View className="items-center">
                  <Text className="text-6xl mb-4">📄</Text>
                  <Text className="text-xl font-bold text-gray-800 text-center mb-2">
                    {scheduleFile.name}
                  </Text>
                  <Text className="text-base text-gray-600 mb-3">
                    {(scheduleFile.size / 1024).toFixed(1)} KB
                  </Text>
                  <View className="bg-green-100 px-4 py-2 rounded-full mb-4">
                    <Text className="text-green-600 font-medium">✓ File Uploaded Successfully</Text>
                  </View>
                  <Text className="text-blue-600 font-medium">Tap to change file</Text>
                </View>
              ) : (
                <View className="items-center">
                  <Text className="text-6xl mb-4">📋</Text>
                  <Text className="text-xl font-bold text-gray-800 mb-2">
                    Select Your Schedule PDF
                  </Text>
                  <Text className="text-base text-gray-600 text-center mb-4">
                    Upload your academic schedule to extract course information automatically
                  </Text>
                  <View className="bg-blue-500 px-6 py-3 rounded-full">
                    <Text className="text-white font-semibold">Choose PDF File</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {scheduleFile && (
              <TouchableOpacity 
                className="py-4 px-6 rounded-xl items-center"
                style={[{ backgroundColor: colors.primary[500] }, Platform.OS === 'android' && getGradientBackground('blue-purple')]}
                onPress={processFileAndContinue}
              >
                <Text className="text-white text-lg font-semibold">
                  Process File & Continue
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Step 2: Complete Profile Information
  return (
    <View className="flex-1" style={[{ backgroundColor: colors.success }, Platform.OS === 'android' && getGradientBackground('green-blue')]}>
      {/* Header */}
      <View className="pt-12 pb-6 px-6">
        <View className="items-center mb-6">
          <View className="bg-white w-20 h-20 rounded-full items-center justify-center mb-4">
            <Text className="text-green-500 text-3xl">👤</Text>
          </View>
          <Text className="text-white text-2xl font-bold mb-2">Complete Your Profile</Text>
          <Text className="text-green-100 text-center text-base">
            Now complete your personal information
          </Text>
        </View>
      </View>

      {/* Profile Form */}
      <ScrollView className="flex-1 bg-white rounded-t-3xl px-6 pt-6">
        <View className="space-y-4 pb-6">
          {/* Personal Information */}
          <View className="mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-3">Personal Information</Text>
            
            <View className="space-y-3">
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">Nombre *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                    placeholder="First name"
                    value={userProfile.nombre}
                    onChangeText={(text) => setUserProfile(prev => ({ ...prev, nombre: text }))}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">Apellido *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                    placeholder="Last name"
                    value={userProfile.apellido}
                    onChangeText={(text) => setUserProfile(prev => ({ ...prev, apellido: text }))}
                  />
                </View>
              </View>
              
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">Edad *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                    placeholder="Age"
                    keyboardType="numeric"
                    value={userProfile.edad}
                    onChangeText={(text) => setUserProfile(prev => ({ ...prev, edad: text }))}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1">Teléfono *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                    placeholder="Phone number"
                    keyboardType="phone-pad"
                    value={userProfile.telefono}
                    onChangeText={(text) => setUserProfile(prev => ({ ...prev, telefono: text }))}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                  placeholder="Email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={userProfile.email}
                  onChangeText={(text) => setUserProfile(prev => ({ ...prev, email: text }))}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Dirección</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                  placeholder="Address"
                  value={userProfile.direccion}
                  onChangeText={(text) => setUserProfile(prev => ({ ...prev, direccion: text }))}
                />
              </View>
            </View>
          </View>

          {/* Academic Information (Optional) */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">Academic Information (Optional)</Text>
            
            <View className="space-y-3">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Student ID / Matrícula</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                  placeholder="Enter your student ID"
                  value={userProfile.matricula}
                  onChangeText={(text) => setUserProfile(prev => ({ ...prev, matricula: text }))}
                />
              </View>
              
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Institution</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                  placeholder="University or Institution name"
                  value={userProfile.institucion}
                  onChangeText={(text) => setUserProfile(prev => ({ ...prev, institucion: text }))}
                />
              </View>
              
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Career / Program</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                  placeholder="e.g., Computer Engineering"
                  value={userProfile.carrera}
                  onChangeText={(text) => setUserProfile(prev => ({ ...prev, carrera: text }))}
                />
              </View>
              
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Current Period</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                  placeholder="e.g., 2025-1, Fall 2025"
                  value={userProfile.periodo}
                  onChangeText={(text) => setUserProfile(prev => ({ ...prev, periodo: text }))}
                />
              </View>
            </View>
          </View>

          {/* Navigation Buttons */}
          <View className="flex-row space-x-3 mb-4">
            <TouchableOpacity 
              className="flex-1 bg-gray-200 py-4 px-6 rounded-xl items-center"
              onPress={() => setStep(1)}
            >
              <Text className="text-gray-700 font-semibold">← Back to File</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 py-4 px-6 rounded-xl items-center"
              style={isLoading ? { backgroundColor: '#9ca3af' } : [{ backgroundColor: colors.success }, Platform.OS === 'android' && getGradientBackground('green-blue')]}
              onPress={saveProfile}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold">
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="items-center mb-4">
            <Text className="text-gray-400 text-sm">
              * Required fields
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
