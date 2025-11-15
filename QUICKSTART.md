# Quick Start Guide - Phase 1

## 🎉 Implementation Complete!

All code for Phase 1 has been implemented. Follow these steps to get the project running.

## 📋 Setup Checklist

### 1. Install System Dependencies (sox - for audio recording)

**macOS:**
```bash
brew install sox
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install sox libsox-fmt-all
```

**Verify installation:**
```bash
sox --version
```

### 2. Install Node Dependencies

```bash
npm install
```

This will install all dependencies including the custom whisper-node fork.

### 3. Build whisper-node

After installing dependencies, you need to compile the whisper-node package:

```bash
cd node_modules/whisper-node

# Step 1: Compile TypeScript source
npm run build

# Step 2: Compile whisper.cpp using cmake
cd lib/whisper.cpp
mkdir -p build
cd build
cmake ..
make

# Step 3: Create symbolic links for the whisper-cli executable
cd /Users/guohaonan/projects/whisper-agent/node_modules/whisper-node/lib/whisper.cpp
ln -sf build/bin/whisper-cli whisper-cli

# Return to project root
cd /Users/guohaonan/projects/whisper-agent
```

**Note:** The newer versions of whisper.cpp use `whisper-cli` instead of `main`. The symbolic link ensures compatibility.

### 4. Download Whisper Models

Download the model manually:

```bash
# Download base model (recommended for balance of speed and accuracy)
wget https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin \
  -O ./models/ggml-base.bin

# Or download tiny model (faster but less accurate)
wget https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin \
  -O ./models/ggml-tiny.bin

# Or download large-v3-turbo model (slower but more accurate)
wget https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin \
  -O ./models/ggml-large-v3-turbo.bin
```

**Verify download:**
```bash
ls -lh ./models/
```

You should see the model file (base model is ~140MB).

**Note:** Models are only needed if you use the local transcriber. Skip this step if using API providers.

### 5. Configure Transcriber (Optional)

The application supports multiple transcription providers:

**Option A: Local Whisper (Default)**
- No configuration needed
- Requires model download (step 4)
- Slower but works offline

**Option B: Groq API (Recommended for speed)**
- Very fast transcription (0.5-2 seconds)
- Free tier available

Create a `.env` file in the project root:
```bash
WHISPER_PROVIDER=groq
GROQ_API_KEY=gsk_your_api_key_here
```

Get API key from: https://console.groq.com/keys

**Option C: OpenAI API**
- Fast and accurate
- Costs $0.006 per minute

```bash
WHISPER_PROVIDER=openai
OPENAI_API_KEY=sk_your_api_key_here
```

Get API key from: https://platform.openai.com/api-keys

📖 See [Transcriber Configuration Guide](docs/TRANSCRIBER_CONFIGURATION.md) for detailed information.

### 6. Build Project

```bash
npm run build
```

This compiles TypeScript code to the `dist/` directory.

### 7. Run the Application

```bash
npm start
```

Or in development mode:
```bash
npm run dev
```

## 🎯 How to Use

1. **Start the application** - An Electron window will open
2. **Start recording**: Press `Cmd+Shift+Space` (Mac) or `Ctrl+Shift+Space` (Windows/Linux)
3. **Speak**: Talk into your microphone
4. **Stop recording**: Press the same shortcut again
5. **View results**: Check the terminal console for transcribed text

## 🧪 Testing Example

After starting the application, try:

1. Press the shortcut to start recording
2. Say: "Hello, this is a test"
3. Press the shortcut to stop recording
4. You should see output in the console like:

```
========================================
[WhisperAgent] TRANSCRIPTION RESULT:
========================================
Text: Hello, this is a test
Duration: 2.34s
========================================
```

## 🔧 Troubleshooting

### Issue: Shortcut not responding

**Solutions:**
- Check if another application is using the same shortcut
- Look for error logs in the terminal console
- Ensure the application has fully started

### Issue: Recording fails

**Possible causes:**
1. sox not properly installed → Run `which sox` to check
2. Microphone permission not granted → macOS will prompt for permission, must allow
3. Recording device issues → Check system audio settings

### Issue: Transcription fails

**Possible causes:**
1. Whisper model not downloaded → Check if `./models/ggml-base.bin` exists
2. Model file corrupted → Re-download the model
3. Audio file is empty → Check if recording was successful
4. whisper.cpp not compiled → Follow step 3 to compile whisper.cpp
5. Symbolic link missing → Create the symbolic link as shown in step 3

**Debug steps:**
```bash
# Check model files
ls -lh ./models/

# Check recording files (after running)
ls -lh ./data/audio/

# Check if whisper-cli exists
ls -lh ./node_modules/whisper-node/lib/whisper.cpp/whisper-cli
ls -lh ./node_modules/whisper-node/lib/whisper.cpp/build/bin/whisper-cli

# Test whisper-cli directly
cd node_modules/whisper-node/lib/whisper.cpp
./whisper-cli --help
```

### Issue: whisper-node build errors

If you encounter issues during whisper-node compilation:

```bash
# Clean and rebuild
cd node_modules/whisper-node
rm -rf dist lib/whisper.cpp/build
npm run build

# Re-compile whisper.cpp
cd lib/whisper.cpp
mkdir -p build
cd build
cmake ..
make

# Recreate symbolic link
cd ..
ln -sf build/bin/whisper-cli whisper-cli
```

## 📂 Project Structure

```
whisper-agent/
├── src/
│   ├── main/
│   │   ├── index.ts           ← Electron main entry, shortcut registration
│   │   ├── audio/
│   │   │   ├── recorder.ts    ← Audio recording implementation
│   │   │   └── transcriber.ts ← Whisper transcription implementation
│   │   └── utils/
│   │       └── helpers.ts     ← Utility functions
│   └── shared/
│       ├── constants.ts       ← Configuration constants
│       └── types/
│           └── index.ts       ← Type definitions
├── data/
│   └── audio/                 ← Recorded audio files storage
├── models/                    ← Whisper model files
│   ├── ggml-base.bin
│   └── ggml-large-v3-turbo.bin
└── node_modules/
    └── whisper-node/          ← Custom fork with whisper.cpp integration
```

## 🎓 Code Explanation

### AudioRecorder (`src/main/audio/recorder.ts`)

Handles audio recording:
- Uses `node-record-lpcm16` to record 16kHz mono audio
- Saves as WAV format (required by Whisper)
- Supports start/stop control

### WhisperTranscriber (`src/main/audio/transcriber.ts`)

Handles speech-to-text:
- Uses `whisper-node` to call local Whisper model
- Auto-detects language
- Returns transcribed text and duration

### Main Process (`src/main/index.ts`)

Electron main process:
- Registers global shortcuts
- Coordinates recording and transcription workflow
- Outputs results to console

## 🚀 Next Steps

After completing Phase 1, we will implement:

**Phase 2:** In-App Interaction Protocol
- Message and Conversation type system
- Conversation context management
- Session persistence

**Phase 3:** LLM Integration
- Multi-provider support (OpenAI, Claude, Gemini)
- Tool calling system
- Agent core logic

## 💡 Tips

- Open Chrome DevTools during development to see detailed logs
- Recording files are saved in `data/audio/` directory, you can play them manually to verify
- If transcription is slow, try using the `tiny` model (faster but less accurate)
- The `base` model offers a good balance between speed and accuracy
- For best accuracy, use `large-v3-turbo` model (requires more processing time)

## 🔄 Model Switching

To use a different model, edit `src/shared/constants.ts`:

```typescript
export const WHISPER_CONFIG = {
  MODEL_NAME: 'base',  // Change to 'tiny', 'base', 'small', 'medium', or 'large-v3-turbo'
  LANGUAGE: 'auto',    // Auto-detect or specify language code
};
```

Then rebuild:
```bash
npm run build
npm start
```

---

Questions or issues? Feel free to reach out! 🎉
