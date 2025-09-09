# SCHEDAX 📚

**SCHEDAX** is a comprehensive academic schedule management mobile application built with React Native and Expo. It allows students to upload their academic schedules, manage their personal profiles, and organize their academic information efficiently.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login and registration system
- **PDF Schedule Upload**: Upload academic schedule PDF files
- **Automatic Data Extraction**: Extract academic information from uploaded PDF files
- **Two-Step Onboarding**: File upload first, then profile completion
- **Comprehensive Profile Management**: Detailed student profile with academic and personal information
- **Academic Table Display**: View schedule information in organized tables
- **Lateral Drawer Navigation**: Easy navigation between app sections

### Academic Information Management
- **Auto-populated Fields**: Academic information extracted from uploaded PDF files
- **Student Profile**: Name, age, phone, email, address
- **Academic Details**: Institution, career, period, student ID (matricula)
- **Emergency Contact**: Emergency contact information
- **Skills & Interests**: Languages, technical skills, hobbies, academic goals
- **Professional Links**: LinkedIn, GitHub, portfolio integration

### User Interface
- **Modern Design**: Clean, intuitive interface with Tailwind CSS styling (NativeWind)
- **Responsive Layout**: Optimized for mobile devices
- **Visual Indicators**: Clear indication of auto-extracted vs. manually entered data
- **Step-by-step Process**: Guided user experience through onboarding

## 🛠️ Technology Stack

- **Framework**: React Native with Expo SDK 53.0.0
- **Navigation**: React Navigation (Stack + Drawer)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Storage**: AsyncStorage for local data persistence
- **File Handling**: expo-document-picker for PDF uploads
- **State Management**: React Hooks (useState, useEffect)

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
│   ├── UserProfileScreen.js    # Extended profile management
│   ├── HomeScreen.js           # Main dashboard
│   ├── ScheduleScreen.js       # Schedule management
│   └── ScheduleTableScreen.js  # Academic table display
├── components/
│   └── CustomDrawerContent.js  # Navigation drawer
├── services/
│   └── UserStorage.js          # User data management
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

#### PDF Data Extraction
The app automatically extracts academic information from uploaded PDF files:
- **Institution name**
- **Student ID (Matricula)**
- **Academic program/career**
- **Academic period**
- **Course schedules**

#### Profile Management
- **Personal Information**: Name, age, phone, email, address
- **Academic Background**: Education level, GPA, scholarships
- **Emergency Contacts**: Required safety information
- **Skills & Interests**: Languages, technical skills, hobbies
- **Professional Links**: Social media and portfolio integration

#### Data Persistence
All user data is stored locally using AsyncStorage:
- Secure user authentication
- Profile information
- Uploaded file metadata
- Academic schedule data

## 🔐 Authentication Flow

1. **Initial Load**: Check for existing authentication
2. **Login/Register**: Secure credential management
3. **Profile Check**: Determine onboarding completion status
4. **Navigation**: Direct to appropriate screen based on profile status

## 📊 Data Management

### Storage Structure
```javascript
// User Authentication
@schedax_current_user: {
  id: string,
  email: string,
  password: string (hashed),
  createdAt: string
}

// User Profile
@schedax_user_profile: {
  // Basic Information
  nombre: string,
  apellido: string,
  edad: string,
  telefono: string,
  email: string,
  
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
  
  // Extended Profile
  fechaNacimiento: string,
  genero: string,
  ciudadResidencia: string,
  contactoEmergencia: object,
  nivelEducativo: string,
  // ... other fields
  
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
├── UserProfileScreen
└── MainApp (Drawer Navigator)
    ├── HomeScreen
    ├── ScheduleScreen
    ├── ScheduleTableScreen
    └── ProfileScreen
```

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
  "expo": "~53.0.0",
  "react": "18.2.0",
  "react-native": "0.74.5",
  "@react-navigation/native": "^6.x.x",
  "@react-navigation/stack": "^6.x.x",
  "@react-navigation/drawer": "^6.x.x",
  "@react-native-async-storage/async-storage": "^1.x.x",
  "expo-document-picker": "~12.0.2",
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
- [ ] **Calendar Integration**: Visual calendar view of schedules
- [ ] **Notifications**: Reminders for classes and assignments
- [ ] **Cloud Sync**: Backup data to cloud storage
- [ ] **Multi-language Support**: Spanish and English interface
- [ ] **Dark Mode**: Theme switching capability
- [ ] **Export Functionality**: Export schedules to different formats
- [ ] **Social Features**: Share schedules with classmates
- [ ] **Analytics**: Study time tracking and analytics
- [ ] **Integration**: Connect with university systems
- [ ] **Offline Mode**: Enhanced offline functionality

### Technical Improvements
- [ ] **Enhanced PDF Parsing**: Better text extraction algorithms
- [ ] **Performance Optimization**: Improved app performance
- [ ] **Security Enhancements**: Advanced authentication methods
- [ ] **Testing**: Comprehensive unit and integration tests
- [ ] **Accessibility**: Better accessibility support
- [ ] **Error Handling**: Improved error handling and logging

## 📈 Version History

### v1.0.0 (Current)
- ✅ User authentication system
- ✅ PDF schedule upload
- ✅ Two-step onboarding process
- ✅ Academic data extraction
- ✅ Comprehensive profile management
- ✅ Drawer navigation
- ✅ Local data persistence

---

**Made with ❤️ for students by students**

*SCHEDAX - Simplifying Academic Life, One Schedule at a Time*
