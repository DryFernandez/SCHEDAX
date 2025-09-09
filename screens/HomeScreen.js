import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStorage } from '../services/UserStorage';

export default function HomeScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await UserStorage.getCurrentUser();
      setCurrentUser(user);
      
      // Load user profile
      const profileData = await AsyncStorage.getItem('@schedax_user_profile');
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-500 pt-12 pb-6 px-5">
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
            <Text className="text-white text-xl font-bold">
              Welcome, {userProfile?.nombre || 'Student'}!
            </Text>
            {userProfile && (
              <Text className="text-blue-100 text-sm mt-1">
                {userProfile.matricula} • {userProfile.institucion}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 p-5">
        {userProfile ? (
          <>
            {/* Student Profile Card */}
            <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-6">
              <View className="flex-row items-center mb-4">
                <View className="bg-blue-100 w-16 h-16 rounded-full items-center justify-center mr-4">
                  <Text className="text-blue-500 text-2xl font-bold">
                    {userProfile.nombre.charAt(0)}{userProfile.apellido.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-800">
                    {userProfile.nombre} {userProfile.apellido}
                  </Text>
                  <Text className="text-blue-600 font-medium">
                    {userProfile.matricula}
                  </Text>
                </View>
              </View>
              
              {/* Academic Information from Extracted File */}
              {userProfile.scheduleFile && (
                <View className="bg-blue-50 p-3 rounded-lg mb-4">
                  <Text className="text-blue-800 font-semibold text-sm mb-2">
                    📄 Información Extraída del Archivo
                  </Text>
                  <Text className="text-blue-600 text-xs">
                    Archivo: {userProfile.scheduleFile.name}
                  </Text>
                </View>
              )}

              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Text className="text-gray-600 w-20">🏫</Text>
                  <Text className="flex-1 text-gray-800">{userProfile.institucion}</Text>
                  {userProfile.dataSources?.scheduleFile && (
                    <Text className="text-blue-500 text-xs">📄</Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-600 w-20">🎓</Text>
                  <Text className="flex-1 text-gray-800">{userProfile.carrera}</Text>
                  {userProfile.dataSources?.scheduleFile && (
                    <Text className="text-blue-500 text-xs">📄</Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-600 w-20">📅</Text>
                  <Text className="flex-1 text-gray-800">
                    {userProfile.periodo} {userProfile.semestre ? `- ${userProfile.semestre}` : ''}
                  </Text>
                  {userProfile.dataSources?.scheduleFile && (
                    <Text className="text-blue-500 text-xs">📄</Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-600 w-20">🆔</Text>
                  <Text className="flex-1 text-gray-800">{userProfile.matricula}</Text>
                  {userProfile.dataSources?.scheduleFile && (
                    <Text className="text-blue-500 text-xs">📄</Text>
                  )}
                </View>
                {userProfile.scheduleFile && (
                  <View className="flex-row items-center">
                    <Text className="text-gray-600 w-20">📄</Text>
                    <Text className="flex-1 text-gray-800">{userProfile.scheduleFile.name}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Quick Actions */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-4">Quick Actions</Text>
              <View className="flex-row justify-between space-x-3">
                <TouchableOpacity 
                  className="bg-purple-500 flex-1 p-4 rounded-xl items-center"
                  onPress={() => navigation.navigate('Schedule')}
                >
                  <Text className="text-white text-3xl mb-2">📋</Text>
                  <Text className="text-white font-semibold">My Schedules</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-green-500 flex-1 p-4 rounded-xl items-center"
                  onPress={() => navigation.navigate('ScheduleTable')}
                >
                  <Text className="text-white text-3xl mb-2">📊</Text>
                  <Text className="text-white font-semibold">View Tables</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Schedule Summary */}
            <View className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
              <Text className="text-lg font-bold text-gray-800 mb-2">Current Academic Period</Text>
              <Text className="text-gray-600 mb-3">{userProfile.periodo}</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600">Ready to manage your academic schedule</Text>
                <TouchableOpacity 
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                  onPress={() => navigation.navigate('ScheduleTable')}
                >
                  <Text className="text-white font-medium text-sm">View Schedule</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          // Loading or no profile state
          <View className="flex-1 justify-center items-center py-20">
            <View className="bg-blue-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Text className="text-blue-500 text-3xl">⏳</Text>
            </View>
            <Text className="text-gray-500 text-center">Loading your profile...</Text>
          </View>
        )}
      </ScrollView>
    </ScrollView>
  );
}
