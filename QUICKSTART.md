# 快速开始指南 - 阶段1

## 🎉 代码实现已完成！

阶段1的所有代码已经实现完毕，现在需要完成以下步骤来运行项目。

## 📋 步骤清单

### 1. 安装系统依赖（sox - 用于音频录制）

**macOS:**
```bash
brew install sox
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install sox libsox-fmt-all
```

**验证安装:**
```bash
sox --version
```

### 2. 下载Whisper模型
手动下载：

```bash
# 创建模型目录
mkdir -p ~/.whisper-agent/models

# 下载模型
wget https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin \
  -O ~/.whisper-agent/models/ggml-base.bin
```

**验证下载:**
```bash
ls -lh ./models/ggml-base.bin
```

应该看到约140MB的文件。

### 3. 构建项目

```bash
npm run build
```

这会将TypeScript代码编译到`dist/`目录。

### 4. 运行应用

```bash
npm run dev
```

或者分两步：
```bash
npm run build
npm start
```

## 🎯 如何使用

1. **启动应用**后，会打开一个Electron窗口
2. **开始录音**：按 `Cmd+Shift+Space`（Mac）或 `Ctrl+Shift+Space`（Windows/Linux）
3. **说话**：对着麦克风说出你想记录的内容
4. **停止录音**：再次按相同快捷键
5. **查看结果**：在终端console中查看转录文本

## 🧪 测试示例

启动应用后，尝试：

1. 按快捷键开始录音
2. 说："你好，这是一个测试"
3. 按快捷键停止录音
4. 在console中应该看到类似输出：

```
========================================
[WhisperAgent] TRANSCRIPTION RESULT:
========================================
Text: 你好，这是一个测试
Duration: 2.34s
========================================
```

## 🔧 故障排查

### 问题：快捷键不响应

**解决方案：**
- 检查是否有其他应用占用了相同快捷键
- 查看终端console是否有错误日志
- 确保应用已经完全启动

### 问题：录音失败

**可能原因：**
1. sox未正确安装 → 运行 `which sox` 检查
2. 麦克风权限未授予 → macOS会弹出权限请求，需要允许
3. 录音设备问题 → 检查系统音频设置

### 问题：转录失败

**可能原因：**
1. Whisper模型未下载 → 检查 `~/.whisper-agent/models/ggml-base.bin` 是否存在
2. 模型文件损坏 → 重新下载模型
3. 音频文件为空 → 检查录音是否成功

**调试步骤：**
```bash
# 检查模型文件
ls -lh ~/.whisper-agent/models/

# 检查录音文件（运行后）
ls -lh data/audio/
```

## 📂 项目结构概览

```
whisper-agent/
├── src/
│   ├── main/
│   │   ├── index.ts           ← Electron主入口，快捷键注册
│   │   ├── audio/
│   │   │   ├── recorder.ts    ← 音频录制实现
│   │   │   └── transcriber.ts ← Whisper转录实现
│   │   └── utils/
│   │       └── helpers.ts     ← 工具函数
│   └── shared/
│       ├── constants.ts       ← 配置常量
│       └── types/
│           └── index.ts       ← 类型定义
├── data/
│   └── audio/                 ← 录音文件存储
└── scripts/
    └── download-model.sh      ← 模型下载脚本
```

## 🎓 代码说明

### AudioRecorder (`src/main/audio/recorder.ts`)

负责音频录制：
- 使用`node-record-lpcm16`录制16kHz单声道音频
- 保存为WAV格式（Whisper要求）
- 支持开始/停止控制

### WhisperTranscriber (`src/main/audio/transcriber.ts`)

负责语音转文本：
- 使用`whisper-node`调用本地Whisper模型
- 自动检测语言
- 返回转录文本和耗时

### Main Process (`src/main/index.ts`)

Electron主进程：
- 注册全局快捷键
- 协调录音和转录流程
- 在console输出结果

## 🚀 下一步

阶段1完成后，我们将实现：

**阶段2：** 应用内交互协议
- Message和Conversation类型系统
- 对话上下文管理
- 会话持久化

**阶段3：** LLM集成
- 多Provider支持（OpenAI、Claude、Gemini）
- 工具调用系统
- Agent核心逻辑

## 💡 提示

- 开发时可以打开Chrome DevTools查看详细日志
- 录音文件保存在`data/audio/`目录，可以手动播放验证
- 如果转录速度慢，可以尝试使用`tiny`模型（更快但准确度稍低）

---

有问题欢迎反馈！🎉

