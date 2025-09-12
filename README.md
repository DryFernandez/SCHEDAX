# SCHEDAX 📚

**SCHEDAX** is a comprehensive academic schedule management mobile application built with React Native and Expo. It allows students to upload their academic schedules, manage their personal profiles, and organize their academic information efficiently with advanced form controls and data validation.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login and registration system with persistent storage
- **PDF Schedule Upload**: Upload academic schedule PDF files with validation
- **Automatic Data Extraction**: Extract academic information from uploaded PDF files
- **Two-Step Onboarding**: File upload first, then profile completion
- **Comprehensive Profile Management**: Detailed student profile with academic and personal information
- **Academic Statistics**: Advanced analytics and time estimation system
- **Schedule Management**: Complete schedule creation and management system
- **Lateral Drawer Navigation**: Easy navigation between app sections

### Advanced Form Controls
- **Smart Phone Formatting**: Automatic phone number formatting (XXX) XXX-XXXX
- **Interactive Date Picker**: Custom scrollable date selector with day/month/year
- **Gender Selection Modal**: Clean modal interface for gender selection
- **Dynamic Institution Selection**: Comprehensive database of Dominican Republic educational institutions
- **Career Selection System**: Dynamic career options based on selected institution
- **Custom Institution Support**: Option to add institutions not in the database
- **Real-time Validation**: Instant form validation with user feedback

### Academic Information Management
- **Auto-populated Fields**: Academic information extracted from uploaded PDF files
- **Student Profile**: Name, age, phone, email, address with enhanced validation
- **Academic Details**: Institution, career, period, student ID (matricula)
- **Academic Statistics**: GPA tracking, time estimations, and progress analytics
- **Dominican Republic Database**: Complete database of 16+ institutions with 200+ career combinations
- **Data Architecture**: Modular external data files for maintainability

### Enhanced User Interface
- **Modern Design**: Clean, intuitive interface with Tailwind CSS styling (NativeWind)
- **Responsive Layout**: Optimized for mobile devices
- **Custom Modals**: Beautiful modal interfaces for all selection components
- **Visual Indicators**: Clear indication of auto-extracted vs. manually entered data
- **Step-by-step Process**: Guided user experience through onboarding
- **Theme Support**: Consistent theming throughout the application

## 🛠️ Technology Stack

- **Framework**: React Native with Expo SDK 54.0.0 (Upgraded from 53)
- **Navigation**: React Navigation v6 (Stack + Drawer)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Storage**: AsyncStorage for local data persistence
- **File Handling**: expo-document-picker for PDF uploads
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Gesture Handling**: react-native-gesture-handler v2.18.1
- **Theme Management**: Custom ThemeContext for consistent styling
- **Data Architecture**: Modular external data files for maintainability

## 📱 Screenshots

*(Add screenshots here when available)*

## 🔧 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development) or Xcode (for iOS development)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SCHEDAX
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Expo CLI (if not already installed)**
   ```bash
   npm install -g @expo/cli
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/emulator**
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

## 📂 Project Structure

```
SCHEDAX/
├── screens/
│   ├── LoginScreen.js          # User authentication
│   ├── RegisterScreen.js       # User registration
│   ├── OnboardingScreen.js     # Two-step onboarding process
│   ├── UserProfileScreen.js    # Extended profile management with enhanced forms
│   ├── HomeScreen.js           # Main dashboard
│   ├── ScheduleScreen.js       # Schedule management
│   ├── ScheduleTableScreen.js  # Academic table display
│   ├── AnalyticsScreen.js      # Academic statistics and analytics
│   ├── ProfileScreen.js        # Complete user profile display
│   ├── CalendarScreen.js       # Calendar view and management
│   └── SettingsScreen.js       # Application settings
├── components/
│   └── CustomDrawerContent.js  # Navigation drawer
├── contexts/
│   └── ThemeContext.js         # Global theme management
├── services/
│   ├── UserStorage.js          # User data management
│   └── AcademicStatsStorage.js # Academic statistics storage
├── data/                       # External data files (NEW)
│   ├── institutionsData.js     # Dominican Republic institutions database
│   ├── validationRules.js      # Form validation rules and logic
│   ├── formConfig.js           # UI configuration and text content
│   └── dateUtils.js            # Date manipulation utilities
├── utils/
│   ├── androidStyles.js        # Android-specific styles
│   └── themeStyles.js          # Theme styling utilities
├── assets/                     # Images and icons
├── App.js                      # Main navigation setup
├── package.json               # Dependencies
├── global.css                 # Tailwind CSS styles
└── README.md                  # This file
```

## 🎯 Usage Guide

### Getting Started

1. **Registration/Login**
   - Create a new account or login with existing credentials
   - Secure authentication with local storage

2. **Onboarding Process**
   - **Step 1**: Upload your academic schedule PDF file
   - **Step 2**: Complete your basic profile (name, age, phone, etc.)

3. **Extended Profile**
   - Complete additional academic and personal information
   - Academic data is automatically extracted from your uploaded PDF
   - Add emergency contacts, skills, and professional links

4. **Navigation**
   - Use the drawer menu to navigate between sections
   - Access Home, Schedule, Academic Tables, and Profile sections

### Key Features Explained

#### Advanced Form Controls
The app features sophisticated form controls for better user experience:
- **Phone Number Formatting**: Automatically formats input to (XXX) XXX-XXXX format
- **Custom Date Picker**: Interactive scrollable selectors for day, month, and year
- **Modal-based Selection**: Clean modal interfaces for gender, institution, and career selection
- **Real-time Validation**: Instant feedback on form inputs with error messaging
- **Dominican Republic Integration**: Complete database of educational institutions and careers

#### PDF Data Extraction
The app automatically extracts academic information from uploaded PDF files:
- **Institution name**
- **Student ID (Matricula)**
- **Academic program/career**
- **Academic period**
- **Course schedules**

#### Enhanced Profile Management
- **Personal Information**: Name, age, phone, email, address with validation
- **Academic Background**: Institution, career, matricula with dynamic selection
- **Academic Statistics**: GPA tracking, time estimations, academic analytics
- **Data Sources Tracking**: Clear indication of auto-extracted vs. manually entered data
- **Modular Data Architecture**: External data files for easy maintenance and updates

#### Data Persistence & Architecture
All user data is stored locally using AsyncStorage with improved architecture:
- **Secure user authentication**
- **Comprehensive profile information**
- **Academic statistics and analytics**
- **External data configuration files**
- **Modular validation and form logic**

## 🔐 Authentication Flow

1. **Initial Load**: Check for existing authentication
2. **Login/Register**: Secure credential management
3. **Profile Check**: Determine onboarding completion status
4. **Navigation**: Direct to appropriate screen based on profile status

## 📊 Data Management & Architecture

### External Data Files (NEW)
The application now uses a modular data architecture for better maintainability:

#### `/data/institutionsData.js`
- Complete database of Dominican Republic educational institutions
- 16+ institutions categorized by type (Public Universities, Private Universities, Technical Institutes)
- 200+ career combinations mapped to specific institutions
- Helper functions for data retrieval and validation

#### `/data/validationRules.js`
- Centralized form validation logic
- Field-specific validation rules and error messages
- Gender options and required fields configuration
- Reusable validation functions

#### `/data/formConfig.js`
- UI configuration and text content management
- Form sections, labels, and placeholders
- Modal configuration for consistent behavior
- Button text and system messages

#### `/data/dateUtils.js`
- Date manipulation utilities
- Phone number formatting functions
- Month arrays and date validation
- Year range generation

### Storage Structure
```javascript
// User Authentication
@schedax_current_user: {
  id: string,
  email: string,
  password: string (hashed),
  createdAt: string
}

// User Profile (Enhanced)
@schedax_user_profile: {
  // Basic Information
  nombre: string,
  apellidos: string,
  edad: string,
  telefono: string (formatted),
  email: string,
  genero: string,
  direccion: string,
  
  // Academic Information (extracted from PDF)
  matricula: string,
  institucion: string,
  carrera: string,
  periodo: string,
  
  // Uploaded File
  scheduleFile: {
    name: string,
    size: number,
    uri: string
  },
  
  // Academic Statistics
  academicStats: {
    gpa: number,
    totalSubjects: number,
    completedSubjects: number,
    divisionType: string,
    estimatedCompletion: string
  },
  
  // Metadata
  profileCompleted: boolean,
  createdAt: string,
  completedDate: string,
  dataSources: object
}
```

## 🎨 Styling

The app uses **NativeWind** (Tailwind CSS for React Native) for styling:
- Consistent design system
- Responsive layouts
- Modern color schemes
- Gradient backgrounds
- Clean typography

### Color Scheme
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Accent**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)

## 🔄 Navigation Structure

```
Stack Navigator (Authentication)
├── LoginScreen
├── RegisterScreen
├── OnboardingScreen
├── UserProfileScreen (Enhanced with custom forms)
└── MainApp (Drawer Navigator)
    ├── HomeScreen
    ├── ScheduleScreen
    ├── ScheduleTableScreen
    ├── AnalyticsScreen (NEW)
    ├── CalendarScreen (NEW)
    ├── ProfileScreen (NEW)
    └── SettingsScreen (NEW)
```

## 🧩 Component Architecture

### Custom Form Components
- **SimpleDatePicker**: Interactive date selection with scrollable day/month/year
- **GenderModal**: Clean modal interface for gender selection
- **InstitutionModal**: Dynamic institution selection with search capability
- **CareerModal**: Career selection based on chosen institution
- **PhoneFormatter**: Real-time phone number formatting component

### Enhanced Validation System
- **Real-time Validation**: Instant feedback on form inputs
- **Error Handling**: Comprehensive error messaging and user guidance
- **Defensive Programming**: Protection against undefined/null values
- **Modular Rules**: Centralized validation logic in external files

## 🚧 Development

### Running in Development

1. **Web Development**
   ```bash
   npm run web
   ```

2. **Android Development**
   ```bash
   npx expo start --android
   ```

3. **iOS Development**
   ```bash
   npx expo start --ios
   ```

### Building for Production

1. **Build for Android**
   ```bash
   npx expo build:android
   ```

2. **Build for iOS**
   ```bash
   npx expo build:ios
   ```

## 📋 Dependencies

### Core Dependencies
```json
{
  "expo": "~54.0.0",
  "react": "18.2.0",
  "react-native": "0.81.4",
  "@react-navigation/native": "^6.x.x",
  "@react-navigation/stack": "^6.x.x",
  "@react-navigation/drawer": "^6.x.x",
  "@react-native-async-storage/async-storage": "^1.x.x",
  "expo-document-picker": "~12.0.2",
  "react-native-gesture-handler": "~2.18.1",
  "nativewind": "^2.x.x"
}
```

### Development Dependencies
```json
{
  "tailwindcss": "3.3.2",
  "@babel/core": "^7.20.0"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please contact:
- **Email**: [your-email@example.com]
- **GitHub Issues**: [Create an issue](link-to-issues)

## 🔮 Future Enhancements

### Planned Features
- [ ] **Calendar Integration**: Visual calendar view of schedules with event management
- [ ] **Push Notifications**: Reminders for classes and assignments
- [ ] **Cloud Sync**: Backup data to cloud storage (Firebase/AWS)
- [ ] **Multi-language Support**: Spanish and English interface
- [ ] **Dark Mode**: Complete theme switching capability
- [ ] **Export Functionality**: Export schedules to PDF, CSV, and other formats
- [ ] **Social Features**: Share schedules with classmates and study groups
- [ ] **Advanced Analytics**: Study time tracking, productivity analytics, and insights
- [ ] **University Integration**: Connect with university systems and APIs
- [ ] **Offline Mode**: Enhanced offline functionality with sync capabilities
- [ ] **AI Features**: Smart schedule optimization and study recommendations

### Technical Improvements
- [ ] **Enhanced PDF Parsing**: AI-powered text extraction and data recognition
- [ ] **Performance Optimization**: Memory management and rendering improvements
- [ ] **Security Enhancements**: Biometric authentication and data encryption
- [ ] **Testing Suite**: Comprehensive unit, integration, and E2E tests
- [ ] **Accessibility**: WCAG compliance and screen reader support
- [ ] **Error Monitoring**: Sentry integration for production error tracking
- [ ] **CI/CD Pipeline**: Automated testing and deployment workflows
- [ ] **Micro-frontend Architecture**: Component library and design system

### Data & Integration
- [ ] **Real-time Sync**: Multi-device synchronization
- [ ] **Backup & Restore**: Cloud backup with version control
- [ ] **API Integration**: RESTful API for backend connectivity
- [ ] **Data Visualization**: Advanced charts and progress tracking
- [ ] **Machine Learning**: Predictive analytics for academic performance
- [ ] **External Integrations**: Google Calendar, Outlook, and other productivity tools

## 📈 Version History

### v2.0.0 (Current) - Major Architecture Upgrade
- ✅ **Expo SDK 54.0.0 Upgrade**: Updated from SDK 53 with full compatibility
- ✅ **Enhanced Form Controls**: Custom date picker, phone formatting, modal selections
- ✅ **Dominican Republic Database**: Complete educational institutions and careers database
- ✅ **Modular Data Architecture**: External data files for better maintainability
- ✅ **Advanced Validation System**: Real-time validation with defensive programming
- ✅ **Academic Analytics**: Statistics screen with time estimations and progress tracking
- ✅ **Profile Management**: Comprehensive profile screen with enhanced UI
- ✅ **Theme System**: Consistent theming with ThemeContext
- ✅ **Navigation Improvements**: Enhanced drawer navigation with new screens
- ✅ **Error Handling**: Robust error handling and validation across all components

### v1.0.0 (Previous)
- ✅ User authentication system
- ✅ PDF schedule upload
- ✅ Two-step onboarding process
- ✅ Academic data extraction
- ✅ Basic profile management
- ✅ Drawer navigation
- ✅ Local data persistence

### Recent Technical Improvements
- **Gesture Handler Migration**: Updated to react-native-gesture-handler v2.18.1
- **Babel Configuration**: Enhanced babel config for better compatibility
- **Form Validation**: Comprehensive validation with external configuration files
- **Data Separation**: Clean separation of concerns with specialized data files
- **UI Components**: Custom modal components for better user experience
- **Phone Formatting**: Real-time phone number formatting with (XXX) XXX-XXXX pattern
- **Institution System**: Dynamic institution/career selection with 200+ combinations

---

**Made with ❤️ for students by students**

*SCHEDAX - Simplifying Academic Life, One Schedule at a Time*
