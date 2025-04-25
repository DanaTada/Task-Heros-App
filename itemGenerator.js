import axios from 'axios';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const API_URL = 'https://api.open5e.com/magicitems/';

// Function to generate item for a specific level
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
      level,  // Assign the level to the item
    };
  } catch (error) {
    console.error('Error fetching items:', error);
    return {
      name: 'Mystic Item',
      description: 'An unknown powerful item.',
      level,  // Default level in case of error
    };
  }
};

// Handle the level-up process and item rewards
export const handleLevelUp = async (userId) => {
  const userData = await getUserData(userId);  // Get user data (XP, level, etc.)
  const currentLevel = userData.level;

  // Level-up behavior: Add item for each level-up
  const items = [];

  // Get items for levels 2, 3, etc. (if level is greater than or equal to those)
  for (let level = 2; level <= currentLevel; level++) {
    const item = await generateItemForLevel(level);
    items.push(item);

    // Save the item to Firestore for the user's items collection
    const itemRef = collection(db, 'users', userId, 'items');
    await addDoc(itemRef, {
      name: item.name,
      description: item.description,
      level: item.level,  // Save the level for the item
    });
  }

  return items;
};
