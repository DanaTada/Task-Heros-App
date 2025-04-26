import axios from 'axios';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const API_URL = 'https://api.open5e.com/magicitems/';


export const generateItemForLevel = async (level) => {
  try {
    const response = await axios.get(API_URL);
    const items = response.data.results;

    console.log('API response:', items); 

    
    const randomItem = items[Math.floor(Math.random() * items.length)];

    
    const shortDescription = randomItem.desc 
      ? randomItem.desc.slice(0, 100) + (randomItem.desc.length > 100 ? '...' : '') 
      : 'No description available';

    return {
      name: randomItem.name,
      description: shortDescription,
      level,  
    };
  } catch (error) {
    console.error('Error fetching items:', error);
    return {
      name: 'Mystic Item',
      description: 'An unknown powerful item.',
      level,
    };
  }
};


export const handleLevelUp = async (userId) => {
  const userData = await getUserData(userId); 
  const currentLevel = userData.level;


  const items = [];

  for (let level = 2; level <= currentLevel; level++) {
    const item = await generateItemForLevel(level);
    items.push(item);

    
    const itemRef = collection(db, 'users', userId, 'items');
    await addDoc(itemRef, {
      name: item.name,
      description: item.description,
      level: item.level,  
    });
  }

  return items;
};
