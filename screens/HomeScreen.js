import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, FlatList, Alert,
  TextInput, Modal, Image, SafeAreaView, StyleSheet
} from 'react-native';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { uzd_beigsana, jauns_uzd } from '../uzdFunkcijas';
import { generateItemForLevel } from '../itemGenerator';
import DateTimePickerModal from "react-native-modal-datetime-picker";  // Import the new date picker
import moment from 'moment';  // For date formatting
import { RadioButton } from 'react-native-paper';  // For urgency selection

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
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);  // Date picker state

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

  // Function to handle date selection from the picker
  const handleConfirmDate = (date) => {
    setDeadline(moment(date).format('DD.MM.YY'));  // Format date as dd.mm.yy
    setDatePickerVisible(false);
  };

  const handleCancelDate = () => {
    setDatePickerVisible(false);  // Close the picker without saving any date
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskContainer}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Text>Urgency: <Text style={styles[`${item.urgency}Urgency`]}>{item.urgency}</Text></Text>
      <Text>Deadline: {item.deadline}</Text>
      {isPastDeadline(item.deadline) && <Text style={styles.missed}>Task Missed!</Text>}
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Welcome, {userData.name || auth.currentUser?.email}</Text>
      <Image source={levelImage} style={styles.levelImage} />
      <Text>Level: {userData.level} | XP: {userData.xp}</Text>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
      />

      <Button title="Add Task" onPress={() => setShowModal(true)} />
      <Button title="Logout" onPress={handleLogout} />

      {/* Modal for adding new task */}
      <Modal visible={showModal} onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Task Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Task Description"
            value={description}
            onChangeText={setDescription}
          />
          <Button title="Select Date" onPress={() => setDatePickerVisible(true)} />

          <Text>Deadline: {deadline}</Text>
          
          {/* DateTimePickerModal for selecting date */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={handleCancelDate}
            date={new Date()}
            headerTextIOS="Select a Date"
          />

          <Text>Urgency:</Text>
          <RadioButton.Group onValueChange={setUrgency} value={urgency}>
            <View style={styles.radioButtonContainer}>
              <RadioButton value="low" />
              <Text>Low</Text>

              <RadioButton value="medium" />
              <Text>Medium</Text>

              <RadioButton value="high" />
              <Text>High</Text>
            </View>
          </RadioButton.Group>

          <Button title="Add Task" onPress={handleAddTask} />
          <Button title="Cancel" onPress={() => setShowModal(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  levelImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 10,
  },
  taskContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

