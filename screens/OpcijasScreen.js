import React from 'react';
import { View, Text, SafeAreaView, Button, StyleSheet } from 'react-native';
import { useAppTheme, useToggleTheme } from '../ThemeContext';

export default function OpcijasScreen() {
  const theme = useAppTheme();
  const toggleTheme = useToggleTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundColor,
         
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: theme.textColor,
            fontFamily: 'ByteBounce',
            fontSize: 70,
           
          },
        ]}
      >
        (Opcijas)
      </Text>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10, 
    fontFamily: 'ByteBounce',
  },
  text: {
    fontSize: 24, 
    marginBottom: 20,
    textAlign: 'center', 
    fontFamily: 'ByteBounce',
  },
});
