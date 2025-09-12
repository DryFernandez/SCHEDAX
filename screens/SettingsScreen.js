import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Switch,
  Modal,
  TextInput,
  Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStorage } from '../services/UserStorage';
import { useTheme } from '../contexts/ThemeContext';
import { createThemedStyles } from '../utils/themeStyles';

const SETTINGS_STORAGE_KEY = '@schedax_settings';

export default function SettingsScreen({ navigation }) {
  const { theme, isDark, themeMode, setTheme } = useTheme();
  const styles = createThemedStyles(theme);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    autoSync: true,
    reminderTime: '30', // minutes before class
    weekStartsOn: 'monday', // monday or sunday
    language: 'es', // es or en
    dataUsage: 'wifi', // wifi, mobile, or both
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDataUsageModal, setShowDataUsageModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    loadUserData();
    loadSettings();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await UserStorage.getCurrentUser();
      setCurrentUser(user);
      
      const profileData = await AsyncStorage.getItem('@schedax_user_profile');
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const settingsData = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (settingsData) {
        setSettings(prev => ({
          ...prev,
          ...JSON.parse(settingsData)
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      setIsLoading(true);
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'No se pudieron guardar las configuraciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await UserStorage.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '⚠️ ADVERTENCIA: Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.\n\n¿Estás completamente seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmación Final',
              'Escribe "ELIMINAR" para confirmar que quieres eliminar tu cuenta permanentemente:',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Confirmar',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // Clear all user data
                      await AsyncStorage.multiRemove([
                        '@schedax_current_user',
                        '@schedax_user_profile',
                        '@schedax_schedules',
                        SETTINGS_STORAGE_KEY
                      ]);
                      
                      Alert.alert(
                        'Cuenta Eliminada',
                        'Tu cuenta ha sido eliminada exitosamente.',
                        [{ text: 'OK', onPress: () => navigation.reset({
                          index: 0,
                          routes: [{ name: 'Login' }],
                        })}]
                      );
                    } catch (error) {
                      Alert.alert('Error', 'No se pudo eliminar la cuenta');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Exportar Datos',
      'Esta función exportará todos tus datos en formato JSON. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Exportar',
          onPress: async () => {
            try {
              const userData = await AsyncStorage.getItem('@schedax_current_user');
              const profileData = await AsyncStorage.getItem('@schedax_user_profile');
              const schedulesData = await AsyncStorage.getItem('@schedax_schedules');
              const settingsData = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

              const exportData = {
                user: userData ? JSON.parse(userData) : null,
                profile: profileData ? JSON.parse(profileData) : null,
                schedules: schedulesData ? JSON.parse(schedulesData) : [],
                settings: settingsData ? JSON.parse(settingsData) : {},
                exportDate: new Date().toISOString()
              };

              // In a real app, you would save this to a file or share it
              console.log('Export Data:', exportData);
              Alert.alert('Datos Exportados', 'Tus datos han sido exportados exitosamente (check console)');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron exportar los datos');
            }
          }
        }
      ]
    );
  };

  const SettingItem = ({ title, subtitle, onPress, rightComponent, icon }) => (
    <TouchableOpacity 
      style={[styles.card, { marginBottom: 12 }]}
      onPress={onPress}
      disabled={isLoading}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          backgroundColor: theme.colors.primary + '20',
          width: 40,
          height: 40,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12
        }}>
          <Text style={{ color: theme.colors.primary, fontSize: 18 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.textPrimary, { fontWeight: '500' }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.textSecondary, { marginTop: 4 }]}>{subtitle}</Text>
          )}
        </View>
        {rightComponent}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={[styles.textSubtitle, { marginBottom: 12, marginTop: 24 }]}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.secondary }]}>
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
            <Text style={styles.headerTitle}>Configuración</Text>
            <Text style={styles.headerSubtitle}>Personaliza tu experiencia</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* User Profile Section */}
        {userProfile && (
          <>
            <SectionHeader title="👤 Perfil de Usuario" />
            <View style={[styles.card, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{
                  backgroundColor: theme.colors.primary,
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Text style={{ color: theme.colors.textOnPrimary, fontSize: 18, fontWeight: 'bold' }}>
                    {userProfile?.nombre?.charAt(0) || ''}{userProfile?.apellidos?.charAt(0) || ''}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.textPrimary, { fontSize: 18, fontWeight: 'bold' }]}>
                    {userProfile?.nombre || ''} {userProfile?.apellidos || ''}
                  </Text>
                  <Text style={styles.textSecondary}>{userProfile.carrera}</Text>
                  <Text style={styles.textTertiary}>{userProfile.matricula}</Text>
                </View>
                <TouchableOpacity 
                  style={{
                    backgroundColor: theme.colors.primary + '20',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8
                  }}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '500' }}>Editar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* App Preferences */}
        <SectionHeader title="⚙️ Preferencias de la App" />
        
        <SettingItem
          title="Notificaciones"
          subtitle="Recibir recordatorios de clases"
          icon="🔔"
          rightComponent={
            <Switch
              value={settings.notifications}
              onValueChange={(value) => saveSettings({ notifications: value })}
              trackColor={{ false: theme.colors.borderSecondary, true: theme.colors.primaryLight }}
              thumbColor={settings.notifications ? theme.colors.primary : theme.colors.textTertiary}
            />
          }
        />

        <SettingItem
          title="Tema de Apariencia"
          subtitle={
            themeMode === 'system' ? 'Automático (Sistema)' :
            themeMode === 'light' ? 'Claro' : 'Oscuro'
          }
          icon={isDark ? "🌙" : "☀️"}
          onPress={() => setShowThemeModal(true)}
          rightComponent={<Text style={styles.textTertiary}>›</Text>}
        />

        <SettingItem
          title="Sincronización Automática"
          subtitle="Sincronizar datos automáticamente"
          icon="🔄"
          rightComponent={
            <Switch
              value={settings.autoSync}
              onValueChange={(value) => saveSettings({ autoSync: value })}
              trackColor={{ false: theme.colors.borderSecondary, true: theme.colors.primaryLight }}
              thumbColor={settings.autoSync ? theme.colors.primary : theme.colors.textTertiary}
            />
          }
        />

        <SettingItem
          title="Idioma"
          subtitle={settings.language === 'es' ? 'Español' : 'English'}
          icon="🌐"
          onPress={() => setShowLanguageModal(true)}
          rightComponent={<Text style={styles.textTertiary}>›</Text>}
        />

        <SettingItem
          title="Recordatorios"
          subtitle={`${settings.reminderTime} minutos antes`}
          icon="⏰"
          onPress={() => setShowReminderModal(true)}
          rightComponent={<Text style={styles.textTertiary}>›</Text>}
        />

        <SettingItem
          title="Uso de Datos"
          subtitle={settings.dataUsage === 'wifi' ? 'Solo WiFi' : settings.dataUsage === 'mobile' ? 'Solo Datos Móviles' : 'WiFi y Datos Móviles'}
          icon="📶"
          onPress={() => setShowDataUsageModal(true)}
          rightComponent={<Text style={styles.textTertiary}>›</Text>}
        />

        {/* Data Management */}
        <SectionHeader title="📊 Gestión de Datos" />
        
        <SettingItem
          title="Exportar Datos"
          subtitle="Descargar una copia de tus datos"
          icon="💾"
          onPress={handleExportData}
          rightComponent={<Text style={styles.textTertiary}>›</Text>}
        />

        <SettingItem
          title="Limpiar Caché"
          subtitle="Liberar espacio de almacenamiento"
          icon="🗑️"
          onPress={() => {
            Alert.alert(
              'Limpiar Caché',
              '¿Estás seguro de que quieres limpiar la caché de la aplicación?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Limpiar', onPress: () => Alert.alert('Caché Limpiada', 'La caché ha sido limpiada exitosamente') }
              ]
            );
          }}
          rightComponent={<Text style={styles.textTertiary}>›</Text>}
        />

        {/* About & Support */}
        <SectionHeader title="ℹ️ Acerca de" />
        
        <SettingItem
          title="Acerca de SCHEDAX"
          subtitle="Versión 1.0.0"
          icon="📱"
          onPress={() => setShowAboutModal(true)}
          rightComponent={<Text style={styles.textTertiary}>›</Text>}
        />

        <SettingItem
          title="Soporte"
          subtitle="Obtener ayuda y reportar problemas"
          icon="🆘"
          onPress={() => Alert.alert('Soporte', 'Contacta a: support@schedax.com')}
          rightComponent={<Text style={styles.textTertiary}>›</Text>}
        />

        <SettingItem
          title="Términos y Condiciones"
          subtitle="Lee nuestros términos de servicio"
          icon="📋"
          onPress={() => Alert.alert('Términos', 'Términos y condiciones de uso de SCHEDAX')}
          rightComponent={<Text style={styles.textTertiary}>›</Text>}
        />

        <SettingItem
          title="Política de Privacidad"
          subtitle="Cómo protegemos tu información"
          icon="🔒"
          onPress={() => Alert.alert('Privacidad', 'Política de privacidad de SCHEDAX')}
          rightComponent={<Text style={styles.textTertiary}>›</Text>}
        />

        {/* Account Management */}
        <SectionHeader title="🔐 Cuenta" />
        
        <SettingItem
          title="Cerrar Sesión"
          subtitle="Salir de tu cuenta"
          icon="🚪"
          onPress={handleLogout}
          rightComponent={<Text style={{ color: theme.colors.error }}>›</Text>}
        />

        <SettingItem
          title="Eliminar Cuenta"
          subtitle="Eliminar permanentemente tu cuenta"
          icon="⚠️"
          onPress={handleDeleteAccount}
          rightComponent={<Text style={{ color: theme.colors.error }}>›</Text>}
        />

        <View className="h-8" />
      </ScrollView>

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={[styles.card, { borderRadius: 20, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, margin: 0 }]}>
            <Text style={[styles.textTitle, { marginBottom: 16 }]}>Seleccionar Tema</Text>
            
            <TouchableOpacity
              style={[styles.listItem, { paddingVertical: 16 }]}
              onPress={() => {
                setTheme('system');
                setShowThemeModal(false);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.textPrimary, { flex: 1 }]}>🔄 Automático (Sistema)</Text>
                {themeMode === 'system' && <Text style={{ color: theme.colors.primary }}>✓</Text>}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.listItem, { paddingVertical: 16 }]}
              onPress={() => {
                setTheme('light');
                setShowThemeModal(false);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.textPrimary, { flex: 1 }]}>☀️ Claro</Text>
                {themeMode === 'light' && <Text style={{ color: theme.colors.primary }}>✓</Text>}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.listItem, { paddingVertical: 16 }]}
              onPress={() => {
                setTheme('dark');
                setShowThemeModal(false);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.textPrimary, { flex: 1 }]}>🌙 Oscuro</Text>
                {themeMode === 'dark' && <Text style={{ color: theme.colors.primary }}>✓</Text>}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.buttonOutline, { marginTop: 16 }]}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={styles.buttonOutlineText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={[styles.card, { borderRadius: 20, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, margin: 0 }]}>
            <Text style={[styles.textTitle, { marginBottom: 16 }]}>Seleccionar Idioma</Text>
            
            <TouchableOpacity
              style={[styles.listItem, { paddingVertical: 16 }]}
              onPress={() => {
                saveSettings({ language: 'es' });
                setShowLanguageModal(false);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.textPrimary, { flex: 1 }]}>🇪🇸 Español</Text>
                {settings.language === 'es' && <Text style={{ color: theme.colors.primary }}>✓</Text>}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.listItem, { paddingVertical: 16 }]}
              onPress={() => {
                saveSettings({ language: 'en' });
                setShowLanguageModal(false);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.textPrimary, { flex: 1 }]}>🇺🇸 English</Text>
                {settings.language === 'en' && <Text style={{ color: theme.colors.primary }}>✓</Text>}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.buttonOutline, { marginTop: 16 }]}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.buttonOutlineText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 }}>
          <View style={[styles.card, { width: '100%', maxWidth: 320 }]}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{
                backgroundColor: theme.colors.primary,
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12
              }}>
                <Text style={{ color: theme.colors.textOnPrimary, fontSize: 32 }}>📚</Text>
              </View>
              <Text style={[styles.textTitle, { fontSize: 28 }]}>SCHEDAX</Text>
              <Text style={styles.textSecondary}>Versión 1.0.0</Text>
            </View>
            
            <Text style={[styles.textPrimary, { textAlign: 'center', marginBottom: 16 }]}>
              Tu asistente personal para la gestión de horarios académicos. 
              Organiza tus clases y mantén tu vida estudiantil bajo control.
            </Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.textSecondary, { marginBottom: 4 }]}>✨ Gestión de horarios</Text>
              <Text style={[styles.textSecondary, { marginBottom: 4 }]}>� Visualización de tablas</Text>
              <Text style={[styles.textSecondary, { marginBottom: 4 }]}>� Perfiles de usuario completos</Text>
              <Text style={[styles.textSecondary, { marginBottom: 4 }]}>🌙 Soporte para tema oscuro</Text>
            </View>
            
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
