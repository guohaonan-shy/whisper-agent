import { app, BrowserWindow, globalShortcut } from 'electron';
import { ensureDir } from './utils/helpers';
import * as path from 'path';
import { AudioRecorder } from './audio/recorder';
import { WhisperTranscriber } from './audio/transcriber';
import { SHORTCUTS } from '../shared/constants';


class WhisperAgent {
  private mainWindow: BrowserWindow | null = null;
  private audioRecorder: AudioRecorder;
  private transcriber: WhisperTranscriber;
  private isRecording: boolean = false;

  constructor() {
    this.audioRecorder = new AudioRecorder();
    this.transcriber = new WhisperTranscriber("base");
    
    // Initialize data directories
    this.initializeDirectories();
  }

  private initializeDirectories(): void {
    ensureDir(path.join(process.cwd(), 'data'));
    ensureDir(path.join(process.cwd(), 'data', 'audio'));
  }

  /**
   * Create the main window
   */
  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    // For now, just show a simple message
    this.mainWindow.loadURL('data:text/html,<h1>Whisper Agent</h1><p>Press Cmd+Shift+Space to start/stop recording</p><p>Check the console for output</p>');

    // Open DevTools in development
    if (process.env.NODE_ENV !== 'production') {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  /**
   * Register global shortcuts
   */
  private registerShortcuts(): void {
    console.log('[WhisperAgent] Registering global shortcuts...');
    
    // Toggle recording shortcut
    const ret = globalShortcut.register(SHORTCUTS.START_RECORDING, () => {
      this.toggleRecording();
    });

    if (!ret) {
      console.error('[WhisperAgent] Failed to register shortcut');
    } else {
      console.log(`[WhisperAgent] Shortcut registered: ${SHORTCUTS.START_RECORDING}`);
    }

    // Check if shortcut is registered
    console.log(
      `[WhisperAgent] Shortcut ${SHORTCUTS.START_RECORDING} is registered:`,
      globalShortcut.isRegistered(SHORTCUTS.START_RECORDING)
    );
  }

  /**
   * Toggle recording on/off
   */
  private async toggleRecording(): Promise<void> {
    if (this.isRecording) {
      // Stop recording and transcribe
      console.log('\n========================================');
      console.log('[WhisperAgent] Stopping recording...');
      console.log('========================================\n');
      
      const audioFilePath = await this.audioRecorder.stopRecording();
      this.isRecording = false;

      if (audioFilePath) {
        await this.processAudio(audioFilePath);
      }
    } else {
      // Start recording
      console.log('\n========================================');
      console.log('[WhisperAgent] Starting recording...');
      console.log('Press Cmd+Shift+Space again to stop');
      console.log('========================================\n');
      
      this.audioRecorder.startRecording();
      this.isRecording = true;
    }
  }

  /**
   * Process recorded audio
   */
  private async processAudio(audioFilePath: string): Promise<void> {
    try {
      console.log('[WhisperAgent] Processing audio file...');
      
      // Initialize transcriber if needed
      await this.transcriber.initialize();
      
      // Transcribe audio
      const result = await this.transcriber.transcribe(audioFilePath);
      
      console.log('\n========================================');
      console.log('[WhisperAgent] TRANSCRIPTION RESULT:');
      console.log('========================================');
      console.log(`Text: ${result.text}`);
      console.log(`Duration: ${result.duration?.toFixed(2)}s`);
      console.log('========================================\n');

      // TODO: In next phase, this will be sent to LLM for processing

    } catch (error) {
      console.error('[WhisperAgent] Failed to process audio:', error);
    }
  }

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    try {
      console.log('[WhisperAgent] Initializing application...');
      
      // Initialize transcriber
      await this.transcriber.initialize();
      
      console.log('[WhisperAgent] Application initialized successfully');
    } catch (error) {
      console.error('[WhisperAgent] Initialization failed:', error);
      console.log('[WhisperAgent] Application will continue but transcription may not work');
    }
  }

  /**
   * Start the application
   */
  async start(): Promise<void> {
    await app.whenReady();
    
    console.log('[WhisperAgent] Electron app ready');
    
    this.createWindow();
    this.registerShortcuts();
    
    await this.initialize();

    console.log('\n========================================');
    console.log('[WhisperAgent] Application started!');
    console.log(`Press ${SHORTCUTS.START_RECORDING} to start recording`);
    console.log('========================================\n');
  }

  /**
   * Cleanup on quit
   */
  cleanup(): void {
    console.log('[WhisperAgent] Cleaning up...');
    globalShortcut.unregisterAll();
  }
}

// Create and start the application
const agent = new WhisperAgent();

// Handle app lifecycle
app.on('ready', () => {
  agent.start();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    agent.start();
  }
});

app.on('will-quit', () => {
  agent.cleanup();
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[WhisperAgent] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[WhisperAgent] Unhandled rejection at:', promise, 'reason:', reason);
});

