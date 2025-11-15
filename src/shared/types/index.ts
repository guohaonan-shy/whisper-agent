// Message types
export type MessageRole = 'user' | 'assistant' | 'tool' | 'system';

export interface BaseMessage {
  id: string;
  role: MessageRole;
  timestamp: number;
  conversationId: string;
}

export interface UserMessage extends BaseMessage {
  role: 'user';
  content: string;
  audioPath?: string;
}

export interface AssistantMessage extends BaseMessage {
  role: 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  thinking?: string;
}

export interface ToolMessage extends BaseMessage {
  role: 'tool';
  toolCallId: string;
  toolName: string;
  content: string;
  error?: string;
}

export interface SystemMessage extends BaseMessage {
  role: 'system';
  content: string;
}

export type Message = UserMessage | AssistantMessage | ToolMessage | SystemMessage;

// Tool Call structure
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  metadata?: {
    model?: string;
    totalTokens?: number;
  };
}

export interface ChatContext {
  currentConversationId: string;
  conversations: Map<string, Conversation>;
}

// Tool Definition
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

// Audio types
export interface AudioConfig {
  sampleRate: number;
  channels: number;
  encoding: string;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

// Transcriber Provider types
export type TranscriberProvider = 'local' | 'groq' | 'openai';

export interface TranscriberConfig {
  provider: TranscriberProvider;
  language?: string;
  
  // Local config
  localModelName?: string;
  
  // API configs
  apiKey?: string;
  apiUrl?: string;
  model?: string;
}

// Transcriber interface - all providers must implement this
export interface ITranscriber {
  /**
   * Initialize the transcriber (download models, verify API keys, etc.)
   */
  initialize(): Promise<void>;
  
  /**
   * Transcribe an audio file to text
   * @param audioFilePath Path to the audio file
   * @returns Transcription result with text, language, and duration
   */
  transcribe(audioFilePath: string): Promise<TranscriptionResult>;
  
  /**
   * Check if the transcriber is ready to use
   */
  isReady(): boolean;
  
  /**
   * Get provider name
   */
  getProviderName(): string;
}

