import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { UserStorage } from '../services/UserStorage';

const SCHEDULES_STORAGE_KEY = '@schedax_schedules';

export default function ScheduleScreen({ navigation }) {
  const [schedules, setSchedules] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    university: '',
    pdfFile: null,
  });

  useEffect(() => {
    loadUserData();
    loadSchedules();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await UserStorage.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const schedulesJson = await AsyncStorage.getItem(SCHEDULES_STORAGE_KEY);
      const allSchedules = schedulesJson ? JSON.parse(schedulesJson) : [];
      const user = await UserStorage.getCurrentUser();
      if (user) {
        const userSchedules = allSchedules.filter(schedule => schedule.userId === user.id);
        setSchedules(userSchedules);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const pickPDFFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewSchedule(prev => ({ 
          ...prev, 
          pdfFile: {
            name: result.assets[0].name,
            uri: result.assets[0].uri,
            size: result.assets[0].size,
          }
        }));
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
      Alert.alert('Error', 'Failed to pick PDF file. Please try again.');
    }
  };

  const saveSchedule = async () => {
    if (!newSchedule.title.trim()) {
      Alert.alert('Error', 'Please enter a title for your schedule');
      return;
    }

    if (!newSchedule.university.trim()) {
      Alert.alert('Error', 'Please enter your university or institution');
      return;
    }

    try {
      const schedulesJson = await AsyncStorage.getItem(SCHEDULES_STORAGE_KEY);
      const allSchedules = schedulesJson ? JSON.parse(schedulesJson) : [];
      
      const schedule = {
        id: Date.now().toString(),
        userId: currentUser.id,
        title: newSchedule.title.trim(),
        description: newSchedule.description.trim(),
        date: newSchedule.date.trim() || new Date().toISOString().split('T')[0],
        time: newSchedule.time.trim() || '12:00',
        university: newSchedule.university.trim(),
        pdfFile: newSchedule.pdfFile,
        createdAt: new Date().toISOString(),
        completed: false,
      };

      allSchedules.push(schedule);
      await AsyncStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(allSchedules));
      
      setSchedules(prev => [...prev, schedule]);
      setNewSchedule({ title: '', description: '', date: '', time: '', university: '', pdfFile: null });
      setIsModalVisible(false);
      
      Alert.alert('Success', 'Schedule created successfully!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'Failed to save schedule. Please try again.');
    }
  };

  const toggleScheduleComplete = async (scheduleId) => {
    try {
      const schedulesJson = await AsyncStorage.getItem(SCHEDULES_STORAGE_KEY);
      const allSchedules = schedulesJson ? JSON.parse(schedulesJson) : [];
      
      const updatedSchedules = allSchedules.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, completed: !schedule.completed }
          : schedule
      );
      
      await AsyncStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(updatedSchedules));
      
      setSchedules(prev => 
        prev.map(schedule => 
          schedule.id === scheduleId 
            ? { ...schedule, completed: !schedule.completed }
            : schedule
        )
      );
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const deleteSchedule = async (scheduleId) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const schedulesJson = await AsyncStorage.getItem(SCHEDULES_STORAGE_KEY);
              const allSchedules = schedulesJson ? JSON.parse(schedulesJson) : [];
              
              const updatedSchedules = allSchedules.filter(schedule => schedule.id !== scheduleId);
              await AsyncStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(updatedSchedules));
              
              setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
            } catch (error) {
              console.error('Error deleting schedule:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-purple-500 pt-12 pb-6 px-5">
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
            <Text className="text-white text-2xl font-bold">My Schedules</Text>
            <Text className="text-purple-100 text-sm mt-1">Manage your tasks and events</Text>
          </View>
          <TouchableOpacity 
            className="bg-purple-600 px-4 py-2 rounded-lg"
            onPress={() => setIsModalVisible(true)}
          >
            <Text className="text-white font-medium">+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Schedules List */}
      <ScrollView className="flex-1 p-5">
        {schedules.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="bg-purple-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Text className="text-purple-500 text-3xl">📋</Text>
            </View>
            <Text className="text-gray-500 text-lg mb-2">No schedules yet</Text>
            <Text className="text-gray-400 text-center mb-6">
              Create your first schedule to get started
            </Text>
            <TouchableOpacity 
              className="bg-purple-500 px-6 py-3 rounded-lg"
              onPress={() => setIsModalVisible(true)}
            >
              <Text className="text-white font-semibold">Create Schedule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-3">
            {schedules.map((schedule) => (
              <View key={schedule.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className={`text-lg font-semibold ${schedule.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {schedule.title}
                    </Text>
                    {schedule.university ? (
                      <Text className={`text-sm mt-1 font-medium ${schedule.completed ? 'text-gray-400' : 'text-purple-600'}`}>
                        🏫 {schedule.university}
                      </Text>
                    ) : null}
                    {schedule.description ? (
                      <Text className={`text-sm mt-1 ${schedule.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {schedule.description}
                      </Text>
                    ) : null}
                    {schedule.pdfFile ? (
                      <Text className={`text-sm mt-1 ${schedule.completed ? 'text-gray-400' : 'text-blue-600'}`}>
                        📄 {schedule.pdfFile.name}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity 
                    className="ml-3"
                    onPress={() => deleteSchedule(schedule.id)}
                  >
                    <Text className="text-red-500 text-lg">🗑️</Text>
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className={`text-sm ${schedule.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                      📅 {schedule.date} • ⏰ {schedule.time}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    className={`px-3 py-1 rounded-full ${schedule.completed ? 'bg-green-100' : 'bg-gray-100'}`}
                    onPress={() => toggleScheduleComplete(schedule.id)}
                  >
                    <Text className={`text-sm font-medium ${schedule.completed ? 'text-green-600' : 'text-gray-600'}`}>
                      {schedule.completed ? 'Completed' : 'Mark Done'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Schedule Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">New Schedule</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text className="text-gray-500 text-2xl">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96">
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Title *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                    placeholder="Enter schedule title"
                    value={newSchedule.title}
                    onChangeText={(text) => setNewSchedule(prev => ({ ...prev, title: text }))}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">University/Institution *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                    placeholder="Enter your university or institution"
                    value={newSchedule.university}
                    onChangeText={(text) => setNewSchedule(prev => ({ ...prev, university: text }))}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                    placeholder="Enter description (optional)"
                    multiline
                    numberOfLines={2}
                    value={newSchedule.description}
                    onChangeText={(text) => setNewSchedule(prev => ({ ...prev, description: text }))}
                  />
                </View>

                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Date</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                      placeholder="YYYY-MM-DD"
                      value={newSchedule.date}
                      onChangeText={(text) => setNewSchedule(prev => ({ ...prev, date: text }))}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Time</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                      placeholder="HH:MM"
                      value={newSchedule.time}
                      onChangeText={(text) => setNewSchedule(prev => ({ ...prev, time: text }))}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Schedule PDF</Text>
                  <TouchableOpacity 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center"
                    onPress={pickPDFFile}
                  >
                    {newSchedule.pdfFile ? (
                      <View className="items-center">
                        <Text className="text-lg mb-2">📄</Text>
                        <Text className="text-sm font-medium text-gray-800 text-center">
                          {newSchedule.pdfFile.name}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1">
                          {(newSchedule.pdfFile.size / 1024).toFixed(1)} KB
                        </Text>
                        <Text className="text-xs text-blue-600 mt-2">Tap to change</Text>
                      </View>
                    ) : (
                      <View className="items-center">
                        <Text className="text-lg mb-2">📄</Text>
                        <Text className="text-sm font-medium text-gray-600">
                          Upload Schedule PDF
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1">
                          Tap to select PDF file
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View className="flex-row space-x-3 mt-6">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-3 rounded-lg"
                onPress={() => setIsModalVisible(false)}
              >
                <Text className="text-center text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-purple-500 py-3 rounded-lg"
                onPress={saveSchedule}
              >
                <Text className="text-center text-white font-semibold">Save Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
