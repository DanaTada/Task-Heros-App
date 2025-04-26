import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, useColorScheme, Text, TextInput } from 'react-native';
import * as Font from 'expo-font';
import { auth } from './firebase';


import HomeScreen from './screens/HomeScreen';
import LietasScreens from './screens/LietasScreens';
import SpeleScreen from './screens/SpeleScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OpcijasScreen from './screens/OpcijasScreen';


import { ThemeProvider } from './ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const App = () => {
  const [user, setUser] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const scheme = useColorScheme();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'ByteBounce': require('./assets/fonts/ByteBounce.ttf'),
      });

   
      Text.defaultProps = Text.defaultProps || {};
      Text.defaultProps.style = [Text.defaultProps.style, { fontFamily: 'ByteBounce' }];

      TextInput.defaultProps = TextInput.defaultProps || {};
      TextInput.defaultProps.style = [TextInput.defaultProps.style, { fontFamily: 'ByteBounce' }];

      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) return null; 

  const AuthStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );

  const MainTabsScreen = () => (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Lietas" component={LietasScreens} />
      <Tab.Screen name="Spele" component={SpeleScreen} />
      <Tab.Screen name="Opcijas" component={OpcijasScreen} />
    </Tab.Navigator>
  );

  return (
    <ThemeProvider>
      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
        {user ? <MainTabsScreen /> : <AuthStackScreen />}
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
