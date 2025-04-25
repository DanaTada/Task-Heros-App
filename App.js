import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { auth } from './firebase'; // Firebase authentication

// Import screens
import HomeScreen from './screens/HomeScreen';
import LietasScreens from './screens/LietasScreens';
import SpeleScreen from './screens/SpeleScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OpcijasScreen from './screens/OpcijasScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const App = () => {
  const [user, setUser] = useState(null);

  // Handle user authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  // Authentication stack (Login and Register screens)
  const AuthStackScreen = () => (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );

  // Main tabs for logged-in user
  const MainTabsScreen = () => (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Lietas" component={LietasScreens} />
      <Tab.Screen name="Spele" component={SpeleScreen} />
      <Tab.Screen name="Opcijas" component={OpcijasScreen} />
    </Tab.Navigator>
  );

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      {user ? <MainTabsScreen /> : <AuthStackScreen />}
    </NavigationContainer>
  );
};

export default App;
