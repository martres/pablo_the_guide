import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';

export class VoiceRecognitionService {
  private static instance: VoiceRecognitionService;
  private isRecording: boolean = false;
  private recording: Recording | null = null;
  private onSpeechResult?: (text: string) => void;
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initAudio();
  }

  private async initAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  public static getInstance(): VoiceRecognitionService {
    if (!VoiceRecognitionService.instance) {
      VoiceRecognitionService.instance = new VoiceRecognitionService();
    }
    return VoiceRecognitionService.instance;
  }

  private async ensureRecorderStopped() {
    try {
      if (this.recording) {
        const status = await this.recording.getStatusAsync();
        if (status.isRecording) {
          await this.recording.stopAndUnloadAsync();
        }
        this.recording = null;
      }
    } catch (error) {
      console.log('Error stopping existing recording:', error);
      this.recording = null;
    }
  }

  public async startListening(callback: (text: string) => void): Promise<void> {
    try {
      await this.ensureRecorderStopped();
      
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access microphone was denied');
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

      this.recording = recording;
      this.onSpeechResult = callback;

      await this.recording.startAsync();
      this.isRecording = true;

      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
      
      this.updateInterval = setInterval(() => {
        if (this.isRecording && this.onSpeechResult) {
          this.onSpeechResult("Enregistrement en cours...");
        }
      }, 500);

      setTimeout(async () => {
        if (this.isRecording) {
          await this.stopListening().catch(console.error);
        }
      }, 10000);

    } catch (error) {
      await this.cleanup();
      console.error('Error starting voice recognition:', error);
      throw error;
    }
  }

  private async cleanup() {
    try {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }

      if (this.recording) {
        const status = await this.recording.getStatusAsync();
        if (status.isRecording) {
          await this.recording.stopAndUnloadAsync();
        }
      }
    } catch (error) {
      console.log('Error during cleanup:', error);
    } finally {
      this.isRecording = false;
      this.recording = null;
      this.onSpeechResult = undefined;
    }
  }

  public async stopListening(): Promise<void> {
    try {
      if (!this.recording || !this.isRecording) {
        return;
      }

      const status = await this.recording.getStatusAsync();
      if (status.isRecording) {
        await this.recording.stopAndUnloadAsync();
        if (this.onSpeechResult) {
          this.onSpeechResult("Enregistrement terminé");
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    } finally {
      await this.cleanup();
    }
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  public async destroy(): Promise<void> {
    await this.cleanup();
  }
} 