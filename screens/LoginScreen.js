import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, Alert, SafeAreaView,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        Login
      </Text>

      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />
      <View style={{ marginTop: 10 }}>
        <Button title="Go to Register" onPress={() => navigation.navigate('Register')} />
      </View>
    </SafeAreaView>
  );
}
