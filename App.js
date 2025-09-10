
import "./global.css";
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { createThemedStyles } from './utils/themeStyles';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import ScheduleTableScreen from './screens/ScheduleTableScreen';
import CalendarScreen from './screens/CalendarScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import { UserStorage } from './services/UserStorage';
import CustomDrawerContent from './components/CustomDrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator Component
function DrawerNavigator() {
  const { theme } = useTheme();
  
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 280,
          backgroundColor: theme.colors.navigationBackground,
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Schedule" component={ScheduleScreen} />
      <Drawer.Screen name="ScheduleTable" component={ScheduleTableScreen} />
      <Drawer.Screen name="Calendar" component={CalendarScreen} />
      <Drawer.Screen name="Analytics" component={AnalyticsScreen} />
      <Drawer.Screen name="Profile" component={UserProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

// Main App Component with Theme Support
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isLoggedIn = await UserStorage.isLoggedIn();
      
      if (!isLoggedIn) {
        setInitialRoute('Login');
      } else {
        // Check if user has completed profile
        const profileData = await AsyncStorage.getItem('@schedax_user_profile');
        
        if (!profileData) {
          // No profile, redirect to UserProfile for complete profile setup
          setInitialRoute('UserProfile');
        } else {
          const profile = JSON.parse(profileData);
          // Check if profile is completed
          if (profile.profileCompleted) {
            setInitialRoute('MainApp');
          } else {
            // Profile exists but not completed, continue with UserProfile
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
      <View style={styles.loadingContainer}>
        <Text style={[styles.textTitle, { color: theme.colors.primary }]}>Loading SCHEDAX...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="MainApp" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
