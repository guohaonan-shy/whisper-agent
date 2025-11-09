import * as path from 'path';
import * as fs from 'fs';
// @ts-ignore - no types available for whisper-node
import { whisper } from 'whisper-node';
import { WHISPER_CONFIG, MODELS_DIR } from '../../shared/constants';
import { TranscriptionResult } from '../../shared/types';
import { ensureDir } from '../utils/helpers';

export class WhisperTranscriber {
  private modelPath: string;
  private modelName: string;
  private isInitialized: boolean = false;

  constructor(modelName: string = WHISPER_CONFIG.MODEL_NAME) {
    this.modelName = modelName;
    this.modelPath = path.join(MODELS_DIR, `ggml-${modelName}.bin`);
    
    // Ensure models directory exists
    ensureDir(MODELS_DIR);
  }

  /**
   * Initialize the transcriber and check model availability
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('[WhisperTranscriber] Initializing...');
    console.log(`[WhisperTranscriber] Model path: ${this.modelPath}`);

    // Check if model exists
    if (!fs.existsSync(this.modelPath)) {
      const errorMsg = `Whisper model not found at: ${this.modelPath}\n` +
        `Please download the model first.\n` +
        `You can download models from: https://huggingface.co/ggerganov/whisper.cpp/tree/main\n` +
        `Example: wget https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin -O ${this.modelPath}`;
      
      console.error('[WhisperTranscriber]', errorMsg);
      throw new Error(errorMsg);
    }

    this.isInitialized = true;
    console.log('[WhisperTranscriber] Initialized successfully');
  }

  /**
   * Transcribe audio file to text
   */
  async transcribe(audioFilePath: string): Promise<TranscriptionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    console.log(`[WhisperTranscriber] Transcribing: ${audioFilePath}`);
    
    try {
      const startTime = Date.now();

      // Configure whisper
      const options = {
        modelPath: this.modelPath,
        whisperOptions: {
          language: 'auto',        
          gen_file_txt: false,      // Don't generate text file
          gen_file_subtitle: false,  // Don't generate subtitle
          gen_file_vtt: false,       // Don't generate vtt
          word_timestamps: false     // Don't need word-level timestamps for now
        }
      };

      console.log('[WhisperTranscriber] Options:', JSON.stringify(options, null, 2));
      console.log('[WhisperTranscriber] Starting transcription...');
      console.log('[WhisperTranscriber] Audio file path:', audioFilePath);
      
      // Run transcription
      const output = await whisper(audioFilePath, options);
      
      console.log('[WhisperTranscriber] Transcription raw output:', output);
      
      const duration = (Date.now() - startTime) / 1000;
      
      // Extract text from output
      let text = '';
      if (Array.isArray(output)) {
        text = output.map((item: any) => item.speech || '').join(' ').trim();
      } else if (typeof output === 'object' && output.speech) {
        text = output.speech;
      } else if (typeof output === 'string') {
        text = output;
      }

      console.log(`[WhisperTranscriber] Transcription completed in ${duration.toFixed(2)}s`);
      console.log(`[WhisperTranscriber] Result: "${text}"`);

      return {
        text,
        duration
      };
    } catch (error) {
      console.error('[WhisperTranscriber] Transcription failed:', error);
      throw error;
    }
  }

  /**
   * Get model info
   */
  getModelInfo(): { name: string; path: string; exists: boolean } {
    return {
      name: this.modelName,
      path: this.modelPath,
      exists: fs.existsSync(this.modelPath)
    };
  }
}

