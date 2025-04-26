import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, SafeAreaView, StyleSheet } from 'react-native';
import { useAppTheme } from '../ThemeContext';

const tapImage = require('../assets/game.png');

export default function MinigameScreen() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const theme = useAppTheme();

  const handleTap = () => {
    if (isPlaying) {
      setScore(score + 1);
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setIsPlaying(true);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(intervalRef.current);
          endGame();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setIsPlaying(false);
    Alert.alert('⏱ Time’s Up!', 'Your time is up!');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={styles.title}>Tap Challenge</Text>
      <Text style={styles.timer}>{timeLeft}s</Text>

      <TouchableOpacity onPress={handleTap} disabled={!isPlaying}>
        <Image
          source={tapImage}
          style={[styles.image, { opacity: isPlaying ? 1 : 0.5 }]}
        />
      </TouchableOpacity>

      <Text style={styles.score}>Score: {score}</Text>

      <TouchableOpacity
        onPress={startGame}
        disabled={isPlaying}
        style={[
          styles.button,
          { backgroundColor: isPlaying ? '#555' : '#34C759' }
        ]}
      >
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 50,
    color: 'orange',
    fontFamily: 'ByteBounce',
    marginBottom: 20,
    marginTop:20,
  },
  timer: {
    fontSize: 40,
    color: 'orange',
    fontFamily: 'ByteBounce',
    marginBottom: 20,
  },
  image: {
    width: 330,
    height: 350,
    marginBottom: 20,
    marginTop:- 90,
  },
  score: {
    fontSize: 35,
    color: 'orange',
    fontFamily: 'ByteBounce',
    marginVertical: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 32,
    color: 'white',
    fontFamily: 'ByteBounce',
    textAlign: 'center',
  },
});
