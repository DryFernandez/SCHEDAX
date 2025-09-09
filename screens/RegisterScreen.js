import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { UserStorage } from '../services/UserStorage';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      // Save new user to storage
      const newUser = await UserStorage.saveUser(email, password);
      
      Alert.alert('Success', `Welcome to SCHEDAX, ${newUser.email}!`, [
        { 
          text: 'OK', 
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          })
        }
      ]);
      
    } catch (error) {
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-white">
      <Text className="text-4xl font-bold mb-6 text-gray-800">Register</Text>
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
      <TextInput 
        className="w-full h-12 border border-gray-300 rounded-lg px-3 mb-4 text-base"
        placeholder="Confirm Password" 
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!isLoading}
      />
      <TouchableOpacity 
        className={`w-full h-12 rounded-lg justify-center items-center mb-4 ${isLoading ? 'bg-green-300' : 'bg-green-500'}`}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text className="text-white text-base font-semibold">
          {isLoading ? "Creating Account..." : "Register"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
        <Text className="text-blue-500 mt-4 text-base">Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}
