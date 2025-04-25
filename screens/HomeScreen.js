import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, FlatList, Alert,
  TextInput, Modal, Image, SafeAreaView
} from 'react-native';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { uzd_beigsana, jauns_uzd } from '../uzdFunkcijas';
import { generateItemForLevel } from '../itemGenerator';

const levelImages = {
  1: require('../icons/1.png'),
  2: require('../icons/2.png'),
  3: require('../icons/3.png'),
  4: require('../icons/4.png'),
  5: require('../icons/5.png'),
  6: require('../icons/6.png'),
  7: require('../icons/7.png'),
  8: require('../icons/8.png'),
  9: require('../icons/9.png'),
  10: require('../icons/10.png'),
  11: require('../icons/11.png'),
  12: require('../icons/12.png'),
  13: require('../icons/13.png'),
  14: require('../icons/14.png'),
  15: require('../icons/15.png'),
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState({ name: '', level: 1, xp: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [urgency, setUrgency] = useState('low');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const taskRef = collection(db, 'users', user.uid, 'tasks');
    const unsubscribeTasks = onSnapshot(taskRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(data);
      setLoading(false);
    });

    const userRef = doc(db, 'users', user.uid);
    const fetchUserData = async () => {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData({
          name: data.name || '',
          level: data.level || 1,
          xp: data.xp || 0,
        });
      }
    };

    fetchUserData();
    return () => unsubscribeTasks();
  }, []);

  const handleCompleteTask = async (taskId, urgency) => {
    try {
      const result = await uzd_beigsana(taskId, urgency);

      if (result.levelUp) {
        Alert.alert('🎉 Level Up!', `You've reached level ${result.newLevel}!`);

        const user = auth.currentUser;
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          level: result.newLevel,
          xp: result.newXP,
        });

        const item = await generateItemForLevel(result.newLevel);
        const itemRef = collection(db, 'users', user.uid, 'items');
        await addDoc(itemRef, item);
      }

      setUserData({ ...userData, level: result.newLevel, xp: result.newXP });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleAddTask = async () => {
    if (title && description && deadline) {
      try {
        const [year, month, day] = deadline.split('-');
        const formattedDeadline = `${day}.${month}.${year.slice(-2)}`;

        await jauns_uzd(title, description, formattedDeadline, urgency);
        Alert.alert('Task Added', 'Your task has been added successfully!');
        setTimeout(() => setShowModal(false), 500);
        setTitle('');
        setDescription('');
        setDeadline('');
        setUrgency('low');
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    } else {
      Alert.alert('Error', 'Please fill in all the fields');
    }
  };

  const renderTask = ({ item }) => (
    <View>
      <Text>{item.title}</Text>
      <Text>{item.description}</Text>
      <Text>Urgency: {item.urgency}</Text>
      <Text>Deadline: {item.deadline}</Text>
      {isPastDeadline(item.deadline) && <Text>Task Missed!</Text>}
      <Button title="✅ Complete" onPress={() => handleCompleteTask(item.id, item.urgency)} />
    </View>
  );

  const isPastDeadline = (deadlineStr) => {
    const [day, month, year] = deadlineStr.split('.');
    const deadlineDate = new Date(`20${year}-${month}-${day}`);
    return deadlineDate < new Date();
  };

  const levelImage =
    userData.level > 15 ? levelImages[15] : levelImages[userData.level] || levelImages[1];

  if (loading) return <Text>Loading...</Text>;

  return (
    <SafeAreaView>
      <Text>Welcome, {userData.name || auth.currentUser?.email}</Text>
      <Image source={levelImage} style={{ width: 100, height: 100 }} />
      <Text>Level: {userData.level} | XP: {userData.xp}</Text>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
      />

      <Button title="Add Task" onPress={() => setShowModal(true)} />
      <Button title="Logout" onPress={handleLogout} />
    </SafeAreaView>
  );
}
