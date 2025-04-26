import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Alert,
  TextInput, Modal, Image, SafeAreaView,
  StyleSheet, ImageBackground, TouchableOpacity, ScrollView
} from 'react-native';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { uzd_beigsana, jauns_uzd } from '../uzdFunkcijas';
import { generateItemForLevel } from '../itemGenerator';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import { RadioButton } from 'react-native-paper';
import { useAppTheme } from '../ThemeContext';

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
  const theme = useAppTheme();
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState({ name: '', level: 1, xp: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [urgency, setUrgency] = useState('low');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

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
        await jauns_uzd(title, description, deadline, urgency);
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

  const handleConfirmDate = (date) => {
    setDeadline(moment(date).format('DD.MM.YY'));
    setDatePickerVisible(false);
  };

  const handleCancelDate = () => {
    setDatePickerVisible(false);
  };

  const isPastDeadline = (deadlineStr) => {
    const [day, month, year] = deadlineStr.split('.');
    const deadlineDate = new Date(`20${year}-${month}-${day}`);
    return deadlineDate < new Date();
  };

  const renderTask = ({ item }) => {
    const containerStyle = [
      styles.taskContainer,
      { backgroundColor: theme.mode === 'dark' ? '#333' : '#f0f0f0' },
    ];

    return (
      <View style={containerStyle}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskText}>{item.description}</Text>
        <Text style={styles.taskText}>
          Urgency: <Text style={styles[`${item.urgency}Urgency`]}>{item.urgency}</Text>
        </Text>
        <Text style={styles.taskText}>Deadline: {item.deadline}</Text>
        {isPastDeadline(item.deadline) && <Text style={styles.missed}>Task Missed!</Text>}
        <TouchableOpacity style={styles.button} onPress={() => handleCompleteTask(item.id, item.urgency)}>
          <Text style={styles.buttonText}>✅ Complete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const levelImage = userData.level > 15 ? levelImages[15] : levelImages[userData.level] || levelImages[1];

  if (loading) return <Text style={styles.text}>Loading...</Text>;

  return (
    <ImageBackground source={theme.image} style={styles.container} resizeMode="cover">
      <SafeAreaView style={styles.inner}>
        <Text style={styles.header}>Welcome, {userData.name || auth.currentUser?.email}</Text>
        <Image source={levelImage} style={styles.levelImage} />
        <Text style={styles.levelText}>Level: {userData.level} | XP: {userData.xp}</Text>

        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ flexGrow: 1 }}
        />

        <TouchableOpacity style={styles.button} onPress={() => setShowModal(true)}>
          <Text style={styles.buttonText}>➕ Add Task</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>🚪 Logout</Text>
        </TouchableOpacity>

        <Modal visible={showModal} onRequestClose={() => setShowModal(false)}>
          <ScrollView style={[styles.modalContainer, { backgroundColor: theme.backgroundColor }]}>
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Task Description"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
            />
            <TouchableOpacity style={styles.button} onPress={() => setDatePickerVisible(true)}>
              <Text style={styles.buttonText}>📅 Select Date</Text>
            </TouchableOpacity>
            <Text style={styles.taskText}>Deadline: {deadline}</Text>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={handleCancelDate}
              date={new Date()}
            />

            <Text style={styles.taskText}>Urgency:</Text>
            <RadioButton.Group onValueChange={setUrgency} value={urgency}>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="low" />
                <Text style={styles.taskText}>Low</Text>
                <RadioButton value="medium" />
                <Text style={styles.taskText}>Medium</Text>
                <RadioButton value="high" />
                <Text style={styles.taskText}>High</Text>
              </View>
            </RadioButton.Group>

            <TouchableOpacity style={styles.button} onPress={handleAddTask}>
              <Text style={styles.buttonText}>✅ Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setShowModal(false)}>
              <Text style={styles.buttonText}>❌ Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  header: {
    fontSize: 40,
    fontFamily: 'ByteBounce',
    color: 'yellow',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  levelImage: {
    width: 190,
    height: 190,
    alignSelf: 'center',
    marginVertical: 10,
  },
  levelText: {
    fontSize: 35,
    fontFamily: 'ByteBounce',
    color: 'yellow',
    textAlign: 'center',
    margin: 20,
    
  },
  taskContainer: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    borderColor: 'orange',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 33,
    fontWeight: 'bold',
    color: 'darkorange',
    fontFamily: 'ByteBounce',
    textAlign: 'center',
  },
  taskText: {
    fontSize: 31,
    color: 'darkorange',
    fontFamily: 'ByteBounce',
    textAlign: 'center',
  },
  lowUrgency: {
    color: 'green',
  },
  mediumUrgency: {
    color: 'orange',
  },
  highUrgency: {
    color: 'red',
  },
  missed: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 20,
  },
  modalContainer: {
    padding: 20,
  },
  input: {
    borderWidth: 5,
    padding: 12,
    marginBottom: 15,
    marginTop:30,
    borderRadius: 8,
    borderColor: 'orange',
    color: 'grey',
    fontSize: 32,
    fontFamily: 'ByteBounce',
    
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'dark brown',
    marginVertical: 8,
    alignSelf: 'center',
    minWidth: 140,
  },
  buttonText: {
    color: 'grey',
    fontFamily: 'ByteBounce',
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
