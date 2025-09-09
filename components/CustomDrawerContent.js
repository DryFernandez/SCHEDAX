import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { UserStorage } from '../services/UserStorage';

export default function CustomDrawerContent(props) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await UserStorage.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await UserStorage.logout();
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <DrawerContentScrollView {...props} className="flex-1 bg-white">
      {/* Header Section */}
      <View className="bg-blue-500 p-6 mb-4">
        <View className="items-center">
          <View className="bg-white w-16 h-16 rounded-full items-center justify-center mb-3">
            <Text className="text-blue-500 text-2xl font-bold">
              {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text className="text-white text-lg font-semibold">
            {currentUser?.email || 'User'}
          </Text>
          <Text className="text-blue-100 text-sm">
            Welcome to SCHEDAX
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View className="flex-1 px-4">
        <TouchableOpacity 
          className="flex-row items-center py-4 px-2 border-b border-gray-100"
          onPress={() => props.navigation.navigate('Home')}
        >
          <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-blue-600 text-lg">🏠</Text>
          </View>
          <Text className="text-gray-800 text-base font-medium">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center py-4 px-2 border-b border-gray-100"
          onPress={() => props.navigation.navigate('Schedule')}
        >
          <View className="bg-purple-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-purple-600 text-lg">�</Text>
          </View>
          <Text className="text-gray-800 text-base font-medium">Schedules</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center py-4 px-2 border-b border-gray-100"
          onPress={() => props.navigation.navigate('ScheduleTable')}
        >
          <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-green-600 text-lg">📊</Text>
          </View>
          <Text className="text-gray-800 text-base font-medium">Academic Tables</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center py-4 px-2 border-b border-gray-100"
          onPress={() => props.navigation.navigate('Profile')}
        >
          <View className="bg-orange-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-orange-600 text-lg">👤</Text>
          </View>
          <Text className="text-gray-800 text-base font-medium">My Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center py-4 px-2 border-b border-gray-100"
          onPress={() => {/* Navigate to Calendar when implemented */}}
        >
          <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-green-600 text-lg">�</Text>
          </View>
          <Text className="text-gray-400 text-base font-medium">Calendar</Text>
          <Text className="text-gray-400 text-xs ml-auto">Coming Soon</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center py-4 px-2 border-b border-gray-100"
          onPress={() => props.navigation.navigate('Settings')}
        >
          <View className="bg-gray-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-gray-600 text-lg">⚙️</Text>
          </View>
          <Text className="text-gray-800 text-base font-medium">Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Section */}
      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity 
          className="flex-row items-center py-3 px-2"
          onPress={handleLogout}
        >
          <View className="bg-red-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-red-600 text-lg">🚪</Text>
          </View>
          <Text className="text-red-600 text-base font-medium">Logout</Text>
        </TouchableOpacity>
        
        <View className="mt-4 pt-4 border-t border-gray-100">
          <Text className="text-gray-400 text-xs text-center">SCHEDAX v1.0.0</Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}
