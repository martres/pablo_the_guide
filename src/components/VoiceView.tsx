import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VoiceRecognitionService } from '../services/VoiceRecognitionService';

interface VoiceViewProps {
  isActive: boolean;
}

export const VoiceView: React.FC<VoiceViewProps> = ({ isActive }) => {
  const [text, setText] = useState<string | null>(null);
  const voiceService = VoiceRecognitionService.getInstance();

  useEffect(() => {
    let mounted = true;

    const handleVoice = async () => {
      if (isActive) {
        try {
          await voiceService.startListening((newText) => {
            if (mounted) {
              setText(newText);
            }
          });
        } catch (error) {
          console.error('Voice recognition error:', error);
        }
      } else {
        await voiceService.stopListening();
      }
    };

    handleVoice();

    return () => {
      mounted = false;
      voiceService.stopListening();
    };
  }, [isActive]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons 
          name={isActive ? "mic" : "mic-none"} 
          size={20} 
          color="#3B82F6" 
        />
        <Text style={styles.title}>Voice Input</Text>
      </View>
      <Text style={styles.transcription}>
        {text || (isActive ? 'Listening...' : 'Voice recognition stopped')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1EFFE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  transcription: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '500',
  },
}); 