import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, Animated, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VoiceRecognitionService } from '../services/VoiceRecognitionService';

interface GuideButtonProps {
  onSpeechResult: (text: string) => void;
}

export const GuideButton: React.FC<GuideButtonProps> = ({ onSpeechResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    const voiceService = VoiceRecognitionService.getInstance();
    
    if (!isListening) {
      try {
        await voiceService.startListening(onSpeechResult);
        setIsListening(true);
      } catch (error) {
        console.error('Error starting voice recognition:', error);
      }
    } else {
      try {
        await voiceService.stopListening();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
      }
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.button, isListening && styles.activeButton]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <MaterialIcons 
            name={isListening ? "mic" : "mic-none"} 
            size={24} 
            color={isListening ? "#fff" : "#4A90E2"} 
          />
          <Text style={[styles.buttonText, isListening && styles.activeText]}>
            {isListening ? "Listening..." : "Guide Me"}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeText: {
    color: '#fff',
  },
}); 