import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SpeechService } from '../services/SpeechService';
import { LocationObject } from 'expo-location';
import { useLocation } from './LocationContext';

interface SpeechContextType {
  isRecording: boolean;
  isSpeaking: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => Promise<void>;
  recognizedText: string;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export const SpeechProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const speechService = SpeechService.getInstance();
  const { location } = useLocation();

  useEffect(() => {
    // Set up speech recognition callback
    speechService.setSpeechResultCallback((text) => {
      setRecognizedText(text);
    });

    // Cleanup on unmount
    return () => {
      speechService.cleanup();
    };
  }, []);

  useEffect(() => {
    // Update current location in speech service
    if (location) {
      speechService.setCurrentLocation(location);
    }
  }, [location]);

  const startRecording = useCallback(async () => {
    const success = await speechService.startRecording();
    if (success) {
      setIsRecording(true);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const uri = await speechService.stopRecording();
    setIsRecording(false);
    return uri;
  }, []);

  const speak = useCallback(async (text: string) => {
    await speechService.speak(text, () => {
      setIsSpeaking(false);
    });
    setIsSpeaking(true);
  }, []);

  const stopSpeaking = useCallback(async () => {
    await speechService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return (
    <SpeechContext.Provider
      value={{
        isRecording,
        isSpeaking,
        startRecording,
        stopRecording,
        speak,
        stopSpeaking,
        recognizedText,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (context === undefined) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
}; 