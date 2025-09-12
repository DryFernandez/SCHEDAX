import AsyncStorage from '@react-native-async-storage/async-storage';

const ACADEMIC_STATS_KEY = '@schedax_academic_statistics';

export class AcademicStatsStorage {
  
  // Save academic statistics
  static async saveAcademicStats(stats) {
    try {
      await AsyncStorage.setItem(ACADEMIC_STATS_KEY, JSON.stringify(stats));
      return true;
    } catch (error) {
      console.error('Error saving academic stats:', error);
      return false;
    }
  }

  // Get academic statistics
  static async getAcademicStats() {
    try {
      const stats = await AsyncStorage.getItem(ACADEMIC_STATS_KEY);
      return stats ? JSON.parse(stats) : null;
    } catch (error) {
      console.error('Error getting academic stats:', error);
      return null;
    }
  }

  // Update specific field in academic stats
  static async updateAcademicField(field, value) {
    try {
      const existingStats = await this.getAcademicStats();
      if (existingStats) {
        existingStats[field] = value;
        await this.saveAcademicStats(existingStats);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating academic field:', error);
      return false;
    }
  }

  // Calculate academic progress
  static calculateProgress(stats) {
    if (!stats) return null;

    const progress = {
      completionPercentage: 0,
      remainingCredits: 0,
      remainingSubjects: 0,
      remainingPeriods: 0,
      estimatedCompletion: null,
    };

    if (stats.systemType === 'credits') {
      const totalCredits = parseInt(stats.totalCredits) || 0;
      const completedCredits = parseInt(stats.completedCredits) || 0;
      
      progress.completionPercentage = totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0;
      progress.remainingCredits = Math.max(0, totalCredits - completedCredits);
      
    } else if (stats.systemType === 'periods') {
      const totalPeriods = parseInt(stats.totalPeriods) || 0;
      const completedPeriods = parseInt(stats.completedPeriods) || 0;
      
      progress.completionPercentage = totalPeriods > 0 ? (completedPeriods / totalPeriods) * 100 : 0;
      progress.remainingPeriods = Math.max(0, totalPeriods - completedPeriods);
    }

    // Calculate remaining subjects
    const totalSubjects = parseInt(stats.totalSubjects) || 0;
    const completedSubjects = parseInt(stats.completedSubjects) || 0;
    progress.remainingSubjects = Math.max(0, totalSubjects - completedSubjects);

    // Subject completion percentage
    progress.subjectCompletionPercentage = totalSubjects > 0 ? (completedSubjects / totalSubjects) * 100 : 0;

    return progress;
  }

  // Get academic insights
  static getAcademicInsights(stats) {
    const progress = this.calculateProgress(stats);
    if (!progress || !stats) return [];

    const insights = [];

    // Progress insights
    if (progress.completionPercentage >= 75) {
      insights.push({
        type: 'success',
        title: '¡Casi terminas!',
        message: `Has completado el ${progress.completionPercentage.toFixed(1)}% de tu carrera.`,
        icon: '🎓'
      });
    } else if (progress.completionPercentage >= 50) {
      insights.push({
        type: 'info',
        title: 'Buen progreso',
        message: `Has completado el ${progress.completionPercentage.toFixed(1)}% de tu carrera.`,
        icon: '📚'
      });
    } else if (progress.completionPercentage >= 25) {
      insights.push({
        type: 'warning',
        title: 'Sigue adelante',
        message: `Has completado el ${progress.completionPercentage.toFixed(1)}% de tu carrera.`,
        icon: '💪'
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Comenzando el viaje',
        message: `Has completado el ${progress.completionPercentage.toFixed(1)}% de tu carrera.`,
        icon: '🚀'
      });
    }

    // Remaining work insights
    if (stats.systemType === 'credits') {
      insights.push({
        type: 'info',
        title: 'Créditos restantes',
        message: `Te faltan ${progress.remainingCredits} créditos para completar tu carrera.`,
        icon: '⭐'
      });
    }

    insights.push({
      type: 'info',
      title: 'Materias restantes',
      message: `Te faltan ${progress.remainingSubjects} materias para completar tu carrera.`,
      icon: '📖'
    });

    // Only show time estimation for period-based systems
    if (stats.systemType === 'periods' && progress.remainingPeriods > 0) {
      const periodName = stats.divisionType?.slice(0, -1) || 'período';
      insights.push({
        type: 'info',
        title: 'Tiempo estimado',
        message: `Aproximadamente ${progress.remainingPeriods} ${periodName}${progress.remainingPeriods > 1 ? 's' : ''} para completar.`,
        icon: '⏰'
      });
    }

    return insights;
  }

  // Clear academic statistics
  static async clearAcademicStats() {
    try {
      await AsyncStorage.removeItem(ACADEMIC_STATS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing academic stats:', error);
      return false;
    }
  }

  // Check if academic setup is completed
  static async isAcademicSetupCompleted() {
    try {
      const stats = await this.getAcademicStats();
      return stats && stats.systemType && stats.divisionType && stats.totalSubjects;
    } catch (error) {
      console.error('Error checking academic setup:', error);
      return false;
    }
  }
}
