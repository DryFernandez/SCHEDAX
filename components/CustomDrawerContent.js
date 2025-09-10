import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStorage } from '../services/UserStorage';
import { useTheme } from '../contexts/ThemeContext';

export default function CustomDrawerContent(props) {
  const { theme } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

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
    avatarContainer: {
      backgroundColor: theme.colors.textOnPrimary,
    },
    avatarText: {
      color: theme.colors.primary,
    },
    menuItemBorder: {
      borderBottomColor: theme.colors.border,
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
    footerBorder: {
      borderTopColor: theme.colors.border,
    }
  });

  useEffect(() => {
    loadUserData();
    loadUserProfile();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await UserStorage.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem('@schedax_user_profile');
      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const getDisplayName = () => {
    if (userProfile && userProfile.nombre && userProfile.apellidos) {
      return `${userProfile.nombre} ${userProfile.apellidos}`;
    }
    return currentUser?.email || 'User';
  };

  const getInitials = () => {
    if (userProfile && userProfile.nombre && userProfile.apellidos) {
      return `${userProfile.nombre.charAt(0)}${userProfile.apellidos.charAt(0)}`.toUpperCase();
    }
    return currentUser?.email?.charAt(0).toUpperCase() || 'U';
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

  const styles = createThemedStyles();

  return (
    <DrawerContentScrollView {...props} style={[styles.container]} className="flex-1">
      {/* Header Section */}
      <View style={[styles.header]} className="p-6 mb-4 rounded-lg">
        <View className="items-center ">
          <View style={[styles.avatarContainer]} className="w-16 h-16 rounded-full items-center justify-center mb-3">
            <Text style={[styles.avatarText]} className="text-xl font-bold">
              {getInitials()}
            </Text>
          </View>
          <Text style={[styles.headerTitle]} className="text-base font-semibold">
            {getDisplayName()}
          </Text>
          <Text style={[styles.headerSubtitle]} className="text-sm">
            {userProfile ? `${userProfile.carrera || 'Estudiante'}` : 'Welcome to SCHEDAX'}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View className="flex-1 px-4">
        <TouchableOpacity 
          style={[styles.menuItemBorder]}
          className="flex-row items-center py-4 px-2 border-b"
          onPress={() => props.navigation.navigate('Home')}
        >
          <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-blue-600 text-lg">🏠</Text>
          </View>
          <Text style={[styles.textPrimary]} className="text-base font-medium">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItemBorder]}
          className="flex-row items-center py-4 px-2 border-b"
          onPress={() => props.navigation.navigate('Schedule')}
        >
          <View className="bg-purple-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-purple-600 text-lg">📅</Text>
          </View>
          <Text style={[styles.textPrimary]} className="text-base font-medium">Schedules</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItemBorder]}
          className="flex-row items-center py-4 px-2 border-b"
          onPress={() => props.navigation.navigate('ScheduleTable')}
        >
          <View className="bg-green-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-green-600 text-lg">📊</Text>
          </View>
          <Text style={[styles.textPrimary]} className="text-base font-medium">Academic Tables</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItemBorder]}
          className="flex-row items-center py-4 px-2 border-b"
          onPress={() => props.navigation.navigate('Calendar')}
        >
          <View className="bg-indigo-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-indigo-600 text-lg">📅</Text>
          </View>
          <Text style={[styles.textPrimary]} className="text-base font-medium">Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItemBorder]}
          className="flex-row items-center py-4 px-2 border-b"
          onPress={() => props.navigation.navigate('Analytics')}
        >
          <View className="bg-pink-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-pink-600 text-lg">📊</Text>
          </View>
          <Text style={[styles.textPrimary]} className="text-base font-medium">Estadísticas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItemBorder]}
          className="flex-row items-center py-4 px-2 border-b"
          onPress={() => props.navigation.navigate('Profile')}
        >
          <View className="bg-orange-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-orange-600 text-lg">👤</Text>
          </View>
          <Text style={[styles.textPrimary]} className="text-base font-medium">My Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItemBorder]}
          className="flex-row items-center py-4 px-2 border-b"
          onPress={() => props.navigation.navigate('Settings')}
        >
          <View className="bg-gray-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-gray-600 text-lg">⚙️</Text>
          </View>
          <Text style={[styles.textPrimary]} className="text-base font-medium">Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Section */}
      <View style={[styles.footerBorder]} className="p-4 border-t">
        <TouchableOpacity 
          className="flex-row items-center py-3 px-2"
          onPress={handleLogout}
        >
          <View className="bg-red-100 w-10 h-10 rounded-lg items-center justify-center mr-3">
            <Text className="text-red-600 text-lg">🚪</Text>
          </View>
          <Text className="text-red-600 text-base font-medium">Logout</Text>
        </TouchableOpacity>
        
        <View style={{borderTopColor: theme.colors.border}} className="mt-4 pt-4 border-t">
          <Text style={[styles.textTertiary]} className="text-xs text-center">SCHEDAX v1.0.0</Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}
