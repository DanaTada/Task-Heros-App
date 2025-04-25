import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, Alert, SafeAreaView,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        name,
        level: 1,
        xp: 0,
      });

      Alert.alert('Success', 'User registered successfully!');
    } catch (error) {
      Alert.alert('Registration Error', error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        Register
      </Text>

      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
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

      <Button title="Register" onPress={handleRegister} />
      <View style={{ marginTop: 10 }}>
        <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
      </View>
    </SafeAreaView>
  );
}
