import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStorage } from '../services/UserStorage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Authenticate user using stored data
      const user = await UserStorage.authenticateUser(email, password);
      
      // Check if user has completed profile setup
      const profileData = await AsyncStorage.getItem('@schedax_user_profile');
      const hasProfile = profileData !== null;
      const nextScreen = hasProfile ? 'MainApp' : 'Onboarding';
      
      Alert.alert('Success', `Welcome back, ${user.email}!`, [
        { text: 'OK', onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: nextScreen }],
          })
        }
      ]);
      
    } catch (error) {
      Alert.alert('Error', error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-white">
      <Text className="text-4xl font-bold mb-6 text-gray-800">Login</Text>
      <TextInput 
        className="w-full h-12 border border-gray-300 rounded-lg px-3 mb-4 text-base"
        placeholder="Email" 
        keyboardType="email-address" 
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={!isLoading}
      />
      <TextInput 
        className="w-full h-12 border border-gray-300 rounded-lg px-3 mb-4 text-base"
        placeholder="Password" 
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
      />
      <TouchableOpacity 
        className={`w-full h-12 rounded-lg justify-center items-center mb-4 ${isLoading ? 'bg-blue-300' : 'bg-blue-500'}`}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text className="text-white text-base font-semibold">
          {isLoading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading}>
        <Text className="text-blue-500 mt-4 text-base">Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}
