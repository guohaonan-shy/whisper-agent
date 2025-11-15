const PROJECT_ROOT = process.cwd();
import * as path from 'path';
import * as os from 'os';

// Audio configuration
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 16000,  // Whisper requires 16kHz
  CHANNELS: 1,         // Mono
  ENCODING: 'signed-integer',
  THRESHOLD: 0.5,
  SILENCE_DURATION: 1.5
};

// Shortcuts
export const SHORTCUTS = {
  START_RECORDING: 'CommandOrControl+Shift+Space',
  STOP_RECORDING: 'CommandOrControl+Shift+Space'
};

// Paths
export const DATA_DIR = path.join(PROJECT_ROOT, 'data');
export const AUDIO_DIR = path.join(DATA_DIR, 'audio');
export const MODELS_DIR = path.join(PROJECT_ROOT, 'models');
export const CONFIG_PATH = path.join(DATA_DIR, 'config.json');
export const DB_PATH = path.join(DATA_DIR, 'conversations.db');

// Whisper configuration
export const WHISPER_CONFIG = {
  // Provider selection
  PROVIDER: (process.env.WHISPER_PROVIDER || 'local') as 'local' | 'groq' | 'openai',
  
  // Common settings
  LANGUAGE: 'auto',    // auto-detect or specify language code
  
  // Local Whisper settings
  MODEL_NAME: 'base',  // tiny, base, small, medium, large, large-v3-turbo
  
  // Groq settings
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: 'whisper-large-v3', // Groq's Whisper model
  
  // OpenAI settings
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: 'whisper-1',
};

