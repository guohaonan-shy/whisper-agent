import * as path from 'path';
import * as fs from 'fs';
// @ts-ignore - no types available for whisper-node
import { whisper } from 'whisper-node';
import { WHISPER_CONFIG, MODELS_DIR } from '../../../shared/constants';
import { TranscriptionResult, ITranscriber } from '../../../shared/types';
import { ensureDir } from '../../utils/helpers';

export class LocalWhisperTranscriber implements ITranscriber {
  private modelPath: string;
  private modelName: string;
  private isInitialized: boolean = false;

  constructor(modelName: string = WHISPER_CONFIG.MODEL_NAME) {
    this.modelName = modelName;
    this.modelPath = path.join(MODELS_DIR, `ggml-${modelName}.bin`);
    
    // Ensure models directory exists
    ensureDir(MODELS_DIR);
  }

  getProviderName(): string {
    return 'local';
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('[LocalWhisperTranscriber] Initializing...');
    console.log(`[LocalWhisperTranscriber] Model path: ${this.modelPath}`);

    // Check if model exists
    if (!fs.existsSync(this.modelPath)) {
      const errorMsg = `Whisper model not found at: ${this.modelPath}\n` +
        `Please download the model first.\n` +
        `You can download models from: https://huggingface.co/ggerganov/whisper.cpp/tree/main\n` +
        `Example: wget https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin -O ${this.modelPath}`;
      
      console.error('[LocalWhisperTranscriber]', errorMsg);
      throw new Error(errorMsg);
    }

    this.isInitialized = true;
    console.log('[LocalWhisperTranscriber] Initialized successfully');
  }

  async transcribe(audioFilePath: string): Promise<TranscriptionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    console.log(`[LocalWhisperTranscriber] Transcribing: ${audioFilePath}`);
    
    try {
      const startTime = Date.now();

      // Configure whisper
      const options = {
        modelPath: this.modelPath,
        whisperOptions: {
          language: WHISPER_CONFIG.LANGUAGE,        
          gen_file_txt: false,
          gen_file_subtitle: false,
          gen_file_vtt: false,
          word_timestamps: false
        }
      };

      // Run transcription
      const output = await whisper(audioFilePath, options);
      
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

      console.log(`[LocalWhisperTranscriber] Transcription completed in ${duration.toFixed(2)}s`);
      console.log(`[LocalWhisperTranscriber] Result: "${text}"`);

      return {
        text,
        duration
      };
    } catch (error) {
      console.error('[LocalWhisperTranscriber] Transcription failed:', error);
      throw error;
    }
  }
}

