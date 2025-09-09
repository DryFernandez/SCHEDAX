import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = '@schedax_users';
const CURRENT_USER_KEY = '@schedax_current_user';

export const UserStorage = {
  // Get all registered users
  async getUsers() {
    try {
      const usersJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  // Save a new user
  async saveUser(email, password) {
    try {
      const users = await this.getUsers();
      
      // Check if user already exists
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Add new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password, // In production, you should hash this!
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      
      return newUser;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  // Authenticate user
  async authenticateUser(email, password) {
    try {
      const users = await this.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Save current logged in user
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
      }
      
      throw new Error('Invalid email or password');
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  },

  // Get current logged in user
  async getCurrentUser() {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Logout user
  async logout() {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  // Check if user is logged in
  async isLoggedIn() {
    const user = await this.getCurrentUser();
    return user !== null;
  }
};
