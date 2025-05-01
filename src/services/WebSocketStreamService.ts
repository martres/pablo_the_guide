import { io, Socket } from 'socket.io-client';

export class WebSocketStreamService {
  private static instance: WebSocketStreamService;
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private serverUrl: string = 'ANTONIN_A_TOI'; // Replace with your actual backend URL
  private onMessage: ((data: any) => void) | null = null;

  private constructor() {}

  public static getInstance(): WebSocketStreamService {
    if (!WebSocketStreamService.instance) {
      WebSocketStreamService.instance = new WebSocketStreamService();
    }
    return WebSocketStreamService.instance;
  }

  /**
   * Set callback for incoming messages
   * @param callback - Function to call when a message is received
   */
  public setMessageCallback(callback: (data: any) => void) {
    this.onMessage = callback;
  }

  /**
   * Connect to the WebSocket server
   */
  public connect(): void {
    if (this.isConnected) return;

    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.socket.on('message', (data) => {
      if (this.onMessage) {
        this.onMessage(data);
      }
    });
  }

  /**
   * Send data to the server
   * @param data - Data to send
   */
  public sendData(data: any): void {
    if (!this.isConnected || !this.socket) {
      console.warn('Not connected to WebSocket server');
      return;
    }

    this.socket.emit('data', data);
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if connected to the server
   * @returns boolean
   */
  public isCurrentlyConnected(): boolean {
    return this.isConnected;
  }
} 