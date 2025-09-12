import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStorage } from '../services/UserStorage';
import { useTheme } from '../contexts/ThemeContext';
import { createThemedStyles } from '../utils/themeStyles';

export default function HomeScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const styles = createThemedStyles(theme);
  
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
    <ScrollView style={styles.containerSecondary}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ marginRight: 16 }}
            onPress={() => navigation.openDrawer()}
          >
            <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: 24, height: 2, backgroundColor: theme.colors.textOnPrimary, marginBottom: 4 }}></View>
              <View style={{ width: 24, height: 2, backgroundColor: theme.colors.textOnPrimary, marginBottom: 4 }}></View>
              <View style={{ width: 24, height: 2, backgroundColor: theme.colors.textOnPrimary }}></View>
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>
              Welcome, {userProfile?.nombre || 'Student'}!
            </Text>
            {userProfile && (
              <Text style={styles.headerSubtitle}>
                {userProfile.matricula} • {userProfile.institucion}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {userProfile ? (
          <>
            {/* Student Profile Card */}
            <View style={[styles.card, { marginBottom: 24 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{
                  backgroundColor: theme.colors.primary + '20',
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Text style={{ color: theme.colors.primary, fontSize: 24, fontWeight: 'bold' }}>
                    {userProfile?.nombre?.charAt(0) || ''}{userProfile?.apellidos?.charAt(0) || ''}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.textTitle, { fontSize: 20 }]}>
                    {userProfile?.nombre || ''} {userProfile?.apellidos || ''}
                  </Text>
                  <Text style={{ color: theme.colors.primary, fontWeight: '500' }}>
                    {userProfile.matricula}
                  </Text>
                </View>
              </View>
              
              {/* Academic Information from Extracted File */}
              {userProfile.scheduleFile && (
                <View style={{
                  backgroundColor: theme.colors.primary + '10',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16
                }}>
                  <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 14, marginBottom: 8 }}>
                    📄 Información Extraída del Archivo
                  </Text>
                  <Text style={{ color: theme.colors.primary, fontSize: 12 }}>
                    Archivo: {userProfile.scheduleFile.name}
                  </Text>
                </View>
              )}

              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={[styles.textSecondary, { width: 80 }]}>🏫</Text>
                  <Text style={[styles.textPrimary, { flex: 1 }]}>{userProfile.institucion}</Text>
                  {userProfile.dataSources?.scheduleFile && (
                    <Text style={{ color: theme.colors.primary, fontSize: 12 }}>📄</Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={[styles.textSecondary, { width: 80 }]}>🎓</Text>
                  <Text style={[styles.textPrimary, { flex: 1 }]}>{userProfile.carrera}</Text>
                  {userProfile.dataSources?.scheduleFile && (
                    <Text style={{ color: theme.colors.primary, fontSize: 12 }}>📄</Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={[styles.textSecondary, { width: 80 }]}>📅</Text>
                  <Text style={[styles.textPrimary, { flex: 1 }]}>
                    {userProfile.periodo} {userProfile.semestre ? `- ${userProfile.semestre}` : ''}
                  </Text>
                  {userProfile.dataSources?.scheduleFile && (
                    <Text style={{ color: theme.colors.primary, fontSize: 12 }}>📄</Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={[styles.textSecondary, { width: 80 }]}>🆔</Text>
                  <Text style={[styles.textPrimary, { flex: 1 }]}>{userProfile.matricula}</Text>
                  {userProfile.dataSources?.scheduleFile && (
                    <Text style={{ color: theme.colors.primary, fontSize: 12 }}>📄</Text>
                  )}
                </View>
                {userProfile.fechaNacimiento && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={[styles.textSecondary, { width: 80 }]}>🎂</Text>
                    <Text style={[styles.textPrimary, { flex: 1 }]}>{userProfile.fechaNacimiento}</Text>
                  </View>
                )}
                {userProfile.edad && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={[styles.textSecondary, { width: 80 }]}>👤</Text>
                    <Text style={[styles.textPrimary, { flex: 1 }]}>{userProfile.edad} años</Text>
                  </View>
                )}
                {userProfile.scheduleFile && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.textSecondary, { width: 80 }]}>📄</Text>
                    <Text style={[styles.textPrimary, { flex: 1 }]}>{userProfile.scheduleFile.name}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[styles.textTitle, { marginBottom: 16 }]}>Quick Actions</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity 
                  style={{
                    backgroundColor: theme.colors.secondary,
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginRight: 8
                  }}
                  onPress={() => navigation.navigate('Schedule')}
                >
                  <Text style={{ color: theme.colors.textOnSecondary, fontSize: 32, marginBottom: 8 }}>📋</Text>
                  <Text style={{ color: theme.colors.textOnSecondary, fontWeight: '600' }}>My Schedules</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{
                    backgroundColor: theme.colors.success,
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginLeft: 8
                  }}
                  onPress={() => navigation.navigate('ScheduleTable')}
                >
                  <Text style={{ color: theme.colors.textOnSecondary, fontSize: 32, marginBottom: 8 }}>📊</Text>
                  <Text style={{ color: theme.colors.textOnSecondary, fontWeight: '600' }}>View Tables</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Schedule Summary */}
            <View style={[styles.cardSecondary, { borderColor: theme.colors.primary + '40' }]}>
              <Text style={[styles.textSubtitle, { marginBottom: 8 }]}>Current Academic Period</Text>
              <Text style={[styles.textSecondary, { marginBottom: 12 }]}>{userProfile.periodo}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.textSecondary}>Ready to manage your academic schedule</Text>
                <TouchableOpacity 
                  style={{
                    backgroundColor: theme.colors.primary,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8
                  }}
                  onPress={() => navigation.navigate('ScheduleTable')}
                >
                  <Text style={{ color: theme.colors.textOnPrimary, fontWeight: '500', fontSize: 14 }}>View Schedule</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          // Loading or no profile state
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
            <View style={{
              backgroundColor: theme.colors.primary + '20',
              width: 80,
              height: 80,
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Text style={{ color: theme.colors.primary, fontSize: 32 }}>⏳</Text>
            </View>
            <Text style={[styles.textSecondary, { textAlign: 'center' }]}>Loading your profile...</Text>
          </View>
        )}
      </ScrollView>
    </ScrollView>
  );
}
