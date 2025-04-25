import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, SafeAreaView } from 'react-native';

const tapImage = require('../assets/game.png');

export default function MinigameScreen() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

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
    Alert.alert('⏱ Time’s Up!', `You tapped ${score} times!`);
  };

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>🎮 Tap Challenge</Text>
      <Text>{timeLeft}s</Text>

      <TouchableOpacity onPress={handleTap} disabled={!isPlaying}>
        <Image
          source={tapImage}
          style={{ width: 300, height: 300, marginTop: -50, opacity: isPlaying ? 1 : 0.5 }}
        />
      </TouchableOpacity>

      <Text>Score: {score}</Text>

      <TouchableOpacity
        onPress={startGame}
        disabled={isPlaying}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 30,
          backgroundColor: isPlaying ? '#ccc' : '#34C759',
          borderRadius: 10,
        }}
      >
        <Text style={{ color: 'white' }}>Start</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
