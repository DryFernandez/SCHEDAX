
import "./global.css";
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import ScheduleTableScreen from './screens/ScheduleTableScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import { UserStorage } from './services/UserStorage';
import CustomDrawerContent from './components/CustomDrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator Component
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Schedule" component={ScheduleScreen} />
      <Drawer.Screen name="ScheduleTable" component={ScheduleTableScreen} />
      <Drawer.Screen name="Profile" component={UserProfileScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isLoggedIn = await UserStorage.isLoggedIn();
      
      if (!isLoggedIn) {
        setInitialRoute('Login');
      } else {
        // Check if user has completed onboarding
        const profileData = await AsyncStorage.getItem('@schedax_user_profile');
        
        if (!profileData) {
          // No basic profile, start with onboarding
          setInitialRoute('Onboarding');
        } else {
          const profile = JSON.parse(profileData);
          // Check if extended profile is completed
          if (profile.profileCompleted) {
            setInitialRoute('MainApp');
          } else {
            // Basic profile exists but extended profile not completed
            setInitialRoute('UserProfile');
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl text-blue-500 font-semibold">Loading SCHEDAX...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="MainApp" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
