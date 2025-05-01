import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AudioStreamService } from '../services/AudioStreamService';
import { WebSocketStreamService } from '../services/WebSocketStreamService';

interface AudioStreamContextType {
  isStreaming: boolean;
  startStreaming: () => Promise<void>;
  stopStreaming: () => Promise<void>;
  isConnected: boolean;
}

const AudioStreamContext = createContext<AudioStreamContextType | undefined>(undefined);

export const AudioStreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const audioStreamService = AudioStreamService.getInstance();
  const webSocketService = WebSocketStreamService.getInstance();

  useEffect(() => {
    // Set up WebSocket connection
    webSocketService.connect();
    setIsConnected(true);

    // Set up audio data callback
    audioStreamService.setAudioDataCallback((data) => {
      webSocketService.sendData({
        type: 'audio',
        data: Array.from(data), // Convert Uint8Array to regular array for JSON serialization
        timestamp: Date.now(),
      });
    });

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
      setIsConnected(false);
    };
  }, []);

  const startStreaming = useCallback(async () => {
    const success = await audioStreamService.startStreaming();
    if (success) {
      setIsStreaming(true);
    }
  }, []);

  const stopStreaming = useCallback(async () => {
    await audioStreamService.stopStreaming();
    setIsStreaming(false);
  }, []);

  return (
    <AudioStreamContext.Provider
      value={{
        isStreaming,
        startStreaming,
        stopStreaming,
        isConnected,
      }}
    >
      {children}
    </AudioStreamContext.Provider>
  );
};

export const useAudioStream = () => {
  const context = useContext(AudioStreamContext);
  if (context === undefined) {
    throw new Error('useAudioStream must be used within an AudioStreamProvider');
  }
  return context;
}; 