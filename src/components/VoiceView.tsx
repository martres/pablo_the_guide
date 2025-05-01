import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VoiceRecognitionService } from '../services/VoiceRecognitionService';

interface VoiceViewProps {
  isActive: boolean;
}

export const VoiceView: React.FC<VoiceViewProps> = ({ isActive }) => {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const voiceService = VoiceRecognitionService.getInstance();

  const handleVoiceResult = useCallback((result: string) => {
    setText(result);
    setError(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const handleVoice = async () => {
      try {
        if (isActive) {
          await voiceService.startListening((newText) => {
            if (mounted) {
              handleVoiceResult(newText);
            }
          });
        } else {
          await voiceService.stopListening();
        }
      } catch (error) {
        if (mounted) {
          console.error('Voice recognition error:', error);
          setError('Une erreur est survenue avec la reconnaissance vocale');
        }
      }
    };

    handleVoice();

    return () => {
      mounted = false;
      voiceService.stopListening().catch(console.error);
    };
  }, [isActive, handleVoiceResult]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons 
          name={isActive ? "mic" : "mic-none"} 
          size={20} 
          color={error ? "#EF4444" : "#3B82F6"} 
        />
        <Text style={[styles.title, error && styles.errorTitle]}>
          {error ? 'Erreur' : 'Entrée Vocale'}
        </Text>
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.transcription}>
          {text || (isActive ? 'Écoute en cours...' : 'Reconnaissance vocale arrêtée')}
        </Text>
      )}
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
  errorTitle: {
    color: '#EF4444',
  },
  transcription: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
}); 