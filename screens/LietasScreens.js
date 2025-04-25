import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function LietasScreens() {
  const [itemsByLevel, setItemsByLevel] = useState({});

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const itemRef = collection(db, 'users', user.uid, 'items');
    const unsubscribe = onSnapshot(itemRef, (snapshot) => {
      const grouped = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        const level = data.level || 1;
        if (!grouped[level]) grouped[level] = [];
        grouped[level].push(data);
      });
      setItemsByLevel(grouped);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <ScrollView>
        <Text style={{ fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>
          🛡️ Hero Items
        </Text>
        <Text style={{ marginBottom: 20 }}>
          In your journey you have earned these artifacts! (Level up to gain more):
        </Text>

        {Object.keys(itemsByLevel).length === 0 && (
          <Text style={{ fontStyle: 'italic' }}>
            No items yet. Complete tasks to earn artifacts!
          </Text>
        )}

        {Object.keys(itemsByLevel)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((level) => (
            <View key={level} style={{ marginBottom: 15 }}>
              <Text style={{ fontWeight: '600', marginBottom: 5 }}>
                Level {level}:
              </Text>
              {itemsByLevel[level].map((item, index) => (
                <Text key={index}>
                  Level {level} - {item.name} - {item.xp} XP
                </Text>
              ))}
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}
