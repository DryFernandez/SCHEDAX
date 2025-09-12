import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  RefreshControl 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStorage } from '../services/UserStorage';
import { AcademicStatsStorage } from '../services/AcademicStatsStorage';
import { useTheme } from '../contexts/ThemeContext';
import { createThemedStyles } from '../utils/themeStyles';

export default function ProfileScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const styles = createThemedStyles(theme);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [academicStats, setAcademicStats] = useState(null);
  const [academicProgress, setAcademicProgress] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [completionStatus, setCompletionStatus] = useState({
    basicProfile: false,
    extendedProfile: false,
    academicSetup: false
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Cargar usuario actual
      const user = await UserStorage.getCurrentUser();
      setCurrentUser(user);

      // Cargar perfil del usuario
      const profileData = await AsyncStorage.getItem('@schedax_user_profile');
      const profile = profileData ? JSON.parse(profileData) : null;
      setUserProfile(profile);

      // Cargar estadísticas académicas
      const stats = await AcademicStatsStorage.getAcademicStats();
      setAcademicStats(stats);

      if (stats) {
        const progress = AcademicStatsStorage.calculateProgress(stats);
        setAcademicProgress(progress);
      }

      // Determinar estado de completitud
      checkCompletionStatus(profile, stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const checkCompletionStatus = (profile, stats) => {
    const status = {
      basicProfile: !!currentUser,
      extendedProfile: profile && profile.profileCompleted,
      academicSetup: profile && profile.academicSetupCompleted && stats
    };
    setCompletionStatus(status);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const getInitials = () => {
    if (userProfile && userProfile.nombre && userProfile.apellidos) {
      return `${userProfile.nombre.charAt(0)}${userProfile.apellidos.charAt(0)}`.toUpperCase();
    }
    return currentUser?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (userProfile && userProfile.nombre && userProfile.apellidos) {
      return `${userProfile.nombre} ${userProfile.apellidos}`;
    }
    return currentUser?.email || 'Usuario';
  };

  const InfoCard = ({ title, children, icon, status, onAction, actionText }) => (
    <View style={[styles.card, { marginBottom: 16 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, marginRight: 8 }}>{icon}</Text>
          <Text style={[styles.textTitle, { fontSize: 18 }]}>{title}</Text>
        </View>
        <View style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          backgroundColor: status === 'complete' 
            ? (isDark ? '#14532D' : '#F0FDF4') 
            : status === 'partial'
            ? (isDark ? '#451A03' : '#FFFBEB')
            : (isDark ? '#7F1D1D' : '#FEF2F2')
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: status === 'complete' 
              ? (isDark ? '#86EFAC' : '#065F46') 
              : status === 'partial'
              ? (isDark ? '#FDE68A' : '#92400E')
              : (isDark ? '#FCA5A5' : '#DC2626')
          }}>
            {status === 'complete' ? 'Completo' : status === 'partial' ? 'Parcial' : 'Pendiente'}
          </Text>
        </View>
      </View>
      
      {children}
      
      {onAction && (
        <TouchableOpacity 
          style={[
            styles.buttonPrimary,
            { 
              backgroundColor: status === 'complete' ? theme.colors.secondary : theme.colors.primary,
              marginTop: 12
            }
          ]}
          onPress={onAction}
        >
          <Text style={[styles.buttonText, { color: 'white' }]}>
            {actionText || (status === 'complete' ? 'Editar' : 'Completar')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const DataRow = ({ label, value, icon }) => (
    <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
      {icon && <Text style={{ fontSize: 16, marginRight: 8 }}>{icon}</Text>}
      <Text style={[styles.textSecondary, { flex: 1 }]}>{label}:</Text>
      <Text style={[styles.textPrimary, { fontWeight: '500', flex: 2, textAlign: 'right' }]}>
        {value || 'No especificado'}
      </Text>
    </View>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
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
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <Text style={styles.headerSubtitle}>Información personal y académica</Text>
          </View>
          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={onRefresh}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar y nombre principal */}
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}>
            <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>
              {getInitials()}
            </Text>
          </View>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
            {getDisplayName()}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
            {userProfile?.carrera || 'Estudiante'}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Información Básica */}
        <InfoCard
          title="Información Básica"
          icon="👤"
          status={completionStatus.basicProfile ? 'complete' : 'incomplete'}
          onAction={() => navigation.navigate('Login')}
          actionText="Ver Cuenta"
        >
          <DataRow label="Email" value={currentUser?.email} icon="📧" />
          <DataRow label="Registrado" value={formatDate(currentUser?.createdAt)} icon="📅" />
        </InfoCard>

        {/* Perfil Personal */}
        <InfoCard
          title="Perfil Personal"
          icon="📝"
          status={completionStatus.extendedProfile ? 'complete' : userProfile ? 'partial' : 'incomplete'}
          onAction={() => navigation.navigate('UserProfile')}
        >
          {userProfile ? (
            <>
              <DataRow label="Nombre" value={userProfile.nombre} icon="👤" />
              <DataRow label="Apellidos" value={userProfile.apellidos} icon="👥" />
              <DataRow label="Edad" value={userProfile.edad} icon="🎂" />
              <DataRow label="Teléfono" value={userProfile.telefono} icon="📱" />
              <DataRow label="Institución" value={userProfile.institucion} icon="🏫" />
              <DataRow label="Carrera" value={userProfile.carrera} icon="🎓" />
              <DataRow label="Matrícula" value={userProfile.matricula} icon="🆔" />
              {userProfile.periodo && <DataRow label="Período" value={userProfile.periodo} icon="📚" />}
              {userProfile.semestre && <DataRow label="Semestre" value={userProfile.semestre} icon="📖" />}
              {userProfile.año && <DataRow label="Año" value={userProfile.año} icon="📆" />}
            </>
          ) : (
            <Text style={[styles.textSecondary]}>No hay información de perfil disponible</Text>
          )}
        </InfoCard>

        {/* Configuración Académica */}
        <InfoCard
          title="Configuración Académica"
          icon="📊"
          status={completionStatus.academicSetup ? 'complete' : 'incomplete'}
          onAction={() => navigation.navigate('Statistics')}
        >
          {academicStats ? (
            <>
              <DataRow 
                label="Sistema" 
                value={academicStats.systemType === 'credits' ? 'Por Créditos' : 'Por Períodos'} 
                icon="⚙️" 
              />
              <DataRow 
                label="División" 
                value={academicStats.divisionType ? academicStats.divisionType.charAt(0).toUpperCase() + academicStats.divisionType.slice(1) : 'No especificado'} 
                icon="📅" 
              />
              <DataRow label="Total de Materias" value={academicStats.totalSubjects} icon="📚" />
              <DataRow label="Materias Completadas" value={academicStats.completedSubjects} icon="✅" />
              
              {academicStats.systemType === 'credits' && (
                <>
                  <DataRow label="Total de Créditos" value={academicStats.totalCredits} icon="⭐" />
                  <DataRow label="Créditos Completados" value={academicStats.completedCredits} icon="🏆" />
                </>
              )}
              
              {academicStats.systemType === 'periods' && (
                <>
                  <DataRow label={`Total de ${academicStats.divisionType || 'Períodos'}`} value={academicStats.totalPeriods} icon="📋" />
                  <DataRow label={`${academicStats.divisionType || 'Períodos'} Completados`} value={academicStats.completedPeriods} icon="✅" />
                  {academicStats.currentPeriod && <DataRow label="Período Actual" value={academicStats.currentPeriod} icon="📍" />}
                </>
              )}

              {academicProgress && (
                <View style={{ 
                  backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 12
                }}>
                  <Text style={{ 
                    color: isDark ? '#93C5FD' : '#1E40AF',
                    fontWeight: '600',
                    marginBottom: 8
                  }}>📈 Progreso General</Text>
                  <DataRow 
                    label="Completado" 
                    value={`${academicProgress.completionPercentage.toFixed(1)}%`}
                    icon="🎯"
                  />
                  <DataRow 
                    label="Materias Restantes" 
                    value={academicProgress.remainingSubjects}
                    icon="📖"
                  />
                  {academicStats.systemType === 'credits' && (
                    <DataRow 
                      label="Créditos Restantes" 
                      value={academicProgress.remainingCredits}
                      icon="⭐"
                    />
                  )}
                </View>
              )}
            </>
          ) : (
            <Text style={[styles.textSecondary]}>
              No hay configuración académica disponible. Configura tu información académica para ver estadísticas detalladas.
            </Text>
          )}
        </InfoCard>

        {/* Información Adicional */}
        {userProfile && userProfile.profileCompleted && (
          <InfoCard
            title="Información Adicional"
            icon="ℹ️"
            status="complete"
          >
            {userProfile.direccion && <DataRow label="Dirección" value={userProfile.direccion} icon="🏠" />}
            {userProfile.emergencyContact && <DataRow label="Contacto de Emergencia" value={userProfile.emergencyContact} icon="🚨" />}
            {userProfile.skills && <DataRow label="Habilidades" value={userProfile.skills} icon="💪" />}
            {userProfile.linkedin && <DataRow label="LinkedIn" value={userProfile.linkedin} icon="💼" />}
            {userProfile.github && <DataRow label="GitHub" value={userProfile.github} icon="💻" />}
            {userProfile.completedDate && (
              <DataRow label="Perfil Completado" value={formatDate(userProfile.completedDate)} icon="✅" />
            )}
          </InfoCard>
        )}

        {/* Estadísticas Rápidas */}
        {completionStatus.academicSetup && academicProgress && (
          <View style={[styles.card, { marginBottom: 16 }]}>
            <Text style={[styles.textTitle, { fontSize: 18, marginBottom: 16 }]}>
              🎯 Resumen Rápido
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.primary }}>
                  {academicProgress.completionPercentage.toFixed(0)}%
                </Text>
                <Text style={[styles.textSecondary, { fontSize: 12 }]}>Completado</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.warning }}>
                  {academicProgress.remainingSubjects}
                </Text>
                <Text style={[styles.textSecondary, { fontSize: 12 }]}>Materias Restantes</Text>
              </View>
              {academicStats.systemType === 'credits' && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.secondary }}>
                    {academicProgress.remainingCredits}
                  </Text>
                  <Text style={[styles.textSecondary, { fontSize: 12 }]}>Créditos Restantes</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
