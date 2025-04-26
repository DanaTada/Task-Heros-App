import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import axios from 'axios';

const API_URL = 'https://api.open5e.com/magicitems/';

// Helper function to fetch user data
const getUserData = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  }
  return { xp: 0, level: 1 }; // Default values if user data not found
};

// Validate deadline format: dd.mm.yy
const isValidDate = (dateStr) => {
  const regex = /^\d{2}\.\d{2}\.\d{2}$/;
  return regex.test(dateStr);
};

// Function to create a new task
export const jauns_uzd = async (title, description, deadline, urgency) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User is not authenticated');

  if (!['low', 'medium', 'high'].includes(urgency)) {
    throw new Error('Invalid urgency level');
  }

  if (!isValidDate(deadline)) {
    throw new Error('Deadline must be in dd.mm.yy format');
  }

  const taskRef = collection(db, 'users', user.uid, 'tasks');
  try {
    await addDoc(taskRef, {
      title,
      description,
      deadline,
      urgency,
      createdAt: new Date(),
    });
    console.log("Task created successfully!");
  } catch (error) {
    console.error('Error adding task: ', error);
    throw new Error('Failed to add task');
  }
};

// XP Reward based on urgency
const getXPReward = (urgency) => {
  switch (urgency) {
    case 'low': return 5;
    case 'medium': return 10;
    case 'high': return 50;
    default: return 0;
  }
};

// XP threshold calculation
const getLevelThreshold = (level) => level * 10;

// Check if deadline is missed
const isDeadlineMissed = (deadline) => {
  const [day, month, year] = deadline.split('.').map(Number);
  
  // Create a new Date object with the parsed values
  const deadlineDate = new Date(2000 + year, month - 1, day); // Note: month is zero-indexed in JavaScript Date

  // Get the current date
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Normalize current date to midnight

  // Compare the dates
  return deadlineDate < currentDate;
};

// Complete task and manage XP
export const uzd_beigsana = async (taskId) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User is not authenticated');

  const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
  const taskSnap = await getDoc(taskRef);
  if (!taskSnap.exists()) throw new Error('Task not found');
  const taskData = taskSnap.data();

  const missed = isDeadlineMissed(taskData.deadline);

  const userData = await getUserData(user.uid);
  let currentXP = userData.xp || 0;
  let currentLevel = userData.level || 1;

  let gainedXP = 0;
  if (!missed) {
    gainedXP = getXPReward(taskData.urgency);
  }

  let updatedXP = currentXP + gainedXP;
  let levelUp = false;

  while (updatedXP >= getLevelThreshold(currentLevel)) {
    updatedXP -= getLevelThreshold(currentLevel);
    currentLevel += 1;
    levelUp = true;
  }

  await setDoc(
    doc(db, 'users', user.uid),
    {
      xp: updatedXP,
      level: currentLevel,
    },
    { merge: true }
  );

  await deleteDoc(taskRef);

  return { levelUp, newLevel: currentLevel, newXP: updatedXP, missed };
};

// Generate item for the given level
export const generateItemForLevel = async (level) => {
  try {
    const response = await axios.get(API_URL);
    const items = response.data.results;

    console.log('API response:', items); // Log the API response

    // Select a random item from the list
    const randomItem = items[Math.floor(Math.random() * items.length)];

    // Shorten the description to a max of 100 characters for brevity
    const shortDescription = randomItem.desc 
      ? randomItem.desc.slice(0, 100) + (randomItem.desc.length > 100 ? '...' : '') 
      : 'No description available';

    return {
      name: randomItem.name,
      description: shortDescription,
    };
  } catch (error) {
    console.error('Error fetching items:', error);
    return {
      name: 'Mystic Item',
      description: 'An unknown powerful item.',
    };
  }
};

// Handle the level-up process and item rewards
export const handleLevelUp = async (userId) => {
  const userData = await getUserData(userId);
  const currentLevel = userData.level;

  // Level-up behavior: Add item for each level-up
  const items = [];

  // Get items for levels 2, 3, etc. (if level is greater than or equal to those)
  if (currentLevel >= 2) {
    const item2 = await generateItemForLevel(2);
    items.push(item2);
  }
  if (currentLevel >= 3) {
    const item3 = await generateItemForLevel(3);
    items.push(item3);
  }

  return items;
};
