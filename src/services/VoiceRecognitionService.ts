import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';

export class VoiceRecognitionService {
  private static instance: VoiceRecognitionService;
  private isRecording: boolean = false;
  private recording: Recording | null = null;
  private onRecordingFinished?: (uri: string) => void;
  private onSpeechResult?: (text: string) => void;

  private constructor() {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    Voice.onSpeechResults = this.handleSpeechResults.bind(this);
    Voice.onSpeechError = this.handleSpeechError.bind(this);
  }

  private handleSpeechResults(e: SpeechResultsEvent) {
    if (e.value && e.value.length > 0 && this.onSpeechResult) {
      this.onSpeechResult(e.value[0]);
    }
  }

  private handleSpeechError(e: any) {
    console.error('Speech recognition error:', e);
  }

  public static getInstance(): VoiceRecognitionService {
    if (!VoiceRecognitionService.instance) {
      VoiceRecognitionService.instance = new VoiceRecognitionService();
    }
    return VoiceRecognitionService.instance;
  }

  public async startListening(callback: (text: string) => void): Promise<void> {
    try {
      this.onSpeechResult = callback;
      await Voice.start('fr-FR');
      this.isRecording = true;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      throw error;
    }
  }

  public async stopListening(): Promise<void> {
    if (this.isRecording) {
      try {
        await Voice.stop();
        this.isRecording = false;
        this.onSpeechResult = undefined;
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
        throw error;
      }
    }
  }

  public async startRecording(callback: (uri: string) => void): Promise<void> {
    if (this.isRecording) {
      await this.stopRecording();
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access microphone was denied');
      }

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      this.isRecording = true;
      this.onRecordingFinished = callback;
      await this.recording.startAsync();
      
      // Arrêt automatique après 10 secondes
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, 10000);

    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  }

  public async stopRecording(): Promise<void> {
    if (this.isRecording && this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        this.isRecording = false;
        
        if (uri && this.onRecordingFinished) {
          this.onRecordingFinished(uri);
        }
        
        this.recording = null;
        this.onRecordingFinished = undefined;
      } catch (error) {
        console.error('Error stopping audio recording:', error);
        throw error;
      }
    }
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  public async destroy(): Promise<void> {
    await this.stopRecording();
    await Voice.destroy();
  }
} 