import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAppTheme } from '../ThemeContext';

export default function LietasScreens() {
  const [itemsByLevel, setItemsByLevel] = useState({});
  const theme = useAppTheme();

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <ScrollView>
        <Text style={[styles.title]}> Hero Items::</Text>
        <Text style={[styles.subtitle]}>
          In your journey you have earned these artifacts! (Level up to gain more):
        </Text>

        {Object.keys(itemsByLevel).length === 0 ? (
          <Text style={[styles.emptyText ]}>
            No items yet. Complete tasks to earn artifacts!
          </Text>
        ) : (
          Object.keys(itemsByLevel)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map((level) => (
              <View key={level} style={styles.levelBlock}>
                <Text style={[styles.levelTitle]}>
                  Level {level}:
                </Text>
                {itemsByLevel[level].map((item, index) => (
                  <Text key={index} style={[styles.itemText]}>
                    Level {level} - {item.name} - {item.xp} XP
                  </Text>
                ))}
              </View>
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 50,
    fontFamily: 'ByteBounce',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: 'orange',
  },
  subtitle: {
    fontSize: 30,
    fontFamily: 'ByteBounce',
    textAlign: 'center',
    marginBottom: 20,
    color: 'grey',
  },
  emptyText: {
    fontStyle: 'italic',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'ByteBounce',
  },
  levelBlock: {
    marginBottom: 30,
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 45,
    fontWeight: '600',
    fontFamily: 'ByteBounce',
    marginBottom: 5,
    textAlign: 'center',
    color: 'green',
  },
  itemText: {
    fontSize: 35,
    fontFamily: 'ByteBounce',
    textAlign: 'center',
    marginBottom: 3,
    color: 'grey',
  },
});
