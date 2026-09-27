# OpenShorts Local — 100% Local AI Video Clips

> Turn long videos into viral 9:16 shorts using **local AI models**. No cloud APIs, no API keys, no data leaves your machine. Works fully offline.

<div align="center">

![Local AI](https://img.shields.io/badge/AI-100%25_Local-8b5cf6)
![License](https://img.shields.io/badge/License-MIT-10b981)
![Hardware](https://img.shields.io/badge/GPU-16GB_VRAM-f59e0b)
![RAM](https://img.shields.io/badge/RAM-32GB-3b82f6)
![CPU](https://img.shields.io/badge/CPU-Ryzen_7600X-ef4444)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Hardware Requirements](#hardware-requirements)
- [Quick Start (5 Minutes)](#quick-start-5-minutes)
- [Web App Installation](#web-app-installation)
- [LLM Backend Setup](#llm-backend-setup)
  - [Option 1: Ollama (Recommended)](#option-1-ollama-recommended)
  - [Option 2: vLLM (Fastest)](#option-2-vllm-fastest)
  - [Option 3: Unsloth (Optimized)](#option-3-unsloth-optimized)
  - [Option 4: AirLLM (Low VRAM)](#option-4-airllm-low-vram)
- [OpenShorts Docker Setup](#openshorts-docker-setup)
- [Configuration Reference](#configuration-reference)
- [Recommended Models](#recommended-models)
- [VRAM Budget](#vram-budget)
- [Pipeline Overview](#pipeline-overview)
- [Troubleshooting](#troubleshooting)
- [Performance Tips](#performance-tips)
- [Maintenance](#maintenance)
- [License](#license)

---

## Overview

This project provides a **complete web-based guide and toolkit** for running [OpenShorts](https://github.com/mutonby/openshorts) — an open-source AI video clip generator — **entirely on local hardware**. It replaces cloud AI APIs (Google Gemini, fal.ai, ElevenLabs) with local LLMs via Ollama, vLLM, Unsloth, or AirLLM.

**What runs locally:**
- ✅ Moment detection / clip selection (LLM)
- ✅ Transcription (faster-whisper / Parakeet)
- ✅ Scene detection (TransNetV2)
- ✅ Face tracking (MediaPipe + YOLOv8)
- ✅ Video reframing & cropping
- ✅ Subtitle generation & burning
- ✅ Hook text overlays
- ✅ Video encoding (NVENC)

**Optional cloud services (not required):**
- ⚠️ Layout picker (needs Gemini vision for multi-speaker videos)
- ⚠️ AI Shorts / UGC videos (fal.ai)
- ⚠️ Voice dubbing (ElevenLabs)
- ⚠️ Social publishing (Upload-Post)

---

## Hardware Requirements

### Tested Configuration

| Component | Specification |
|-----------|---------------|
| **CPU** | AMD Ryzen 7600X (6 cores / 12 threads) |
| **RAM** | 32GB DDR5 |
| **GPU** | NVIDIA GPU with 16GB VRAM |
| **Storage** | 100GB+ free space |
| **OS** | Ubuntu 22.04+ / Windows 11 with WSL2 |

### Minimum Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **GPU VRAM** | 8GB | 16GB+ |
| **System RAM** | 16GB | 32GB+ |
| **CPU** | 4 cores | 6+ cores |
| **Storage** | 50GB | 100GB+ |

> **Note:** With 8GB VRAM, use smaller models (7B) and reduce `CLIP_WORKERS` to 2.

---

## Quick Start (5 Minutes)

The fastest way to get everything running:

```bash
#!/bin/bash
# Complete OpenShorts Local Setup

# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull recommended model
ollama pull qwen2.5:14b

# 3. Create model with extended context
cat > Modelfile << 'EOF'
FROM qwen2.5:14b
PARAMETER num_ctx 16384
PARAMETER temperature 0.3
EOF
ollama create openshorts-llm -f Modelfile

# 4. Clone OpenShorts
git clone https://github.com/mutonby/openshorts.git
cd openshorts

# 5. Create .env
cat > .env << 'EOF'
LLM_BASE_URL=http://host.docker.internal:11434/v1
LLM_MODEL=openshorts-llm
LLM_SCORE_BATCH=3
WHISPER_MODEL=large-v3-turbo
WHISPER_DEVICE=cuda
WHISPER_COMPUTE=float16
TRANSCRIBE_BACKEND=parakeet
FFMPEG_ENCODER=auto
MAX_CONCURRENT_JOBS=1
CLIP_WORKERS=3
GPU_MIN_FREE_MB=2048
ASR_HOST_SLOTS=1
BILLING_ENABLED=0
EOF

# 6. Create docker-compose.override.yml
cat > docker-compose.override.yml << 'EOF'
services:
  backend:
    build:
      context: .
      args:
        GPU: "1"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu, video]
    extra_hosts:
      - "host.docker.internal:host-gateway"
EOF

# 7. Launch!
docker compose up --build -d

echo "✓ OpenShorts: http://localhost:5175"
echo "✓ Ollama API: http://localhost:11434"
```

---

## Web App Installation

This repository includes an **interactive web application** with a live Ollama tester, VRAM calculator, and config builder.

### Prerequisites

```bash
# Node.js 18+ and npm
node --version  # Should be v18+
npm --version
```

### Install & Run

```bash
# Clone this repository
git clone <this-repo-url>
cd openshorts-local-guide

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The web app will be available at `http://localhost:5173`.

### Features

- 🎯 **Dashboard** — Interactive VRAM budget calculator
- 🧠 **Models** — Compare 10+ local LLM models
- 🔌 **Live Test** — Connect to Ollama and test models in real-time
- ⚙️ **Config Builder** — Generate `.env` and Docker files interactively
- 💻 **Server Code** — Complete Python server implementations
- 🎬 **Pipeline** — Visual processing pipeline explorer
- 📖 **Setup Guide** — Step-by-step installation instructions

---

## LLM Backend Setup

Choose one of four backends based on your needs:

| Backend | Speed | VRAM | Setup | Best For |
|---------|-------|------|-------|----------|
| **Ollama** | ~25 tok/s | ~10GB | Easiest | Simplicity |
| **vLLM** | ~40 tok/s | ~8GB | Medium | Maximum speed |
| **Unsloth** | ~35 tok/s | ~7GB | Medium | Best VRAM efficiency |
| **AirLLM** | ~5 tok/s | ~3GB | Complex | Running 30B+ models |

### Option 1: Ollama (Recommended)

**Best for:** Most users. Easiest setup, built-in OpenAI-compatible API.

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull qwen2.5:14b

# Create Modelfile with extended context
cat > Modelfile << 'EOF'
FROM qwen2.5:14b
PARAMETER num_ctx 16384
PARAMETER temperature 0.3
SYSTEM """You are a video content analyzer. Score transcript
windows for viral potential. Always respond with valid JSON."""
EOF

# Create custom model
ollama create openshorts-llm -f Modelfile

# Configure Ollama for GPU (systemd)
sudo mkdir -p /etc/systemd/system/ollama.service.d
sudo tee /etc/systemd/system/ollama.service.d/override.conf << 'EOF'
[Service]
Environment="OLLAMA_NUM_PARALLEL=2"
Environment="OLLAMA_MAX_LOADED_MODELS=1"
Environment="OLLAMA_GPU_OVERHEAD=512"
Environment="OLLAMA_KEEP_ALIVE=10m"
EOF

sudo systemctl daemon-reload
sudo systemctl restart ollama

# Test
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openshorts-llm",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**Set in `.env`:**
```bash
LLM_BASE_URL=http://host.docker.internal:11434/v1
LLM_MODEL=openshorts-llm
```

### Option 2: vLLM (Fastest)

**Best for:** Maximum throughput. Production-grade inference.

```bash
# Create virtual environment
python -m venv vllm-env
source vllm-env/bin/activate

# Install vLLM
pip install vllm

# Start server
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-14B-Instruct-AWQ \
  --max-model-len 16384 \
  --gpu-memory-utilization 0.75 \
  --quantization awq \
  --dtype float16 \
  --port 8080 \
  --host 0.0.0.0
```

**Set in `.env`:**
```bash
LLM_BASE_URL=http://host.docker.internal:8080/v1
LLM_MODEL=Qwen/Qwen2.5-14B-Instruct-AWQ
```

### Option 3: Unsloth (Optimized)

**Best for:** Best VRAM efficiency. Custom CUDA kernels.

Create `unsloth_server.py`:

```python
from unsloth import FastLanguageModel
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# Load model with Unsloth optimizations
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen2.5-14B-Instruct",
    max_seq_length=16384,
    dtype=None,
    load_in_4bit=True,  # 4-bit = ~7GB VRAM
)

class ChatRequest(BaseModel):
    model: str
    messages: list[dict]
    temperature: float = 0.3
    max_tokens: int = 4096

@app.post("/v1/chat/completions")
async def chat(request: ChatRequest):
    prompt = tokenizer.apply_chat_template(
        request.messages,
        tokenize=False,
        add_generation_prompt=True
    )
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    
    outputs = model.generate(
        **inputs,
        max_new_tokens=request.max_tokens,
        temperature=request.temperature,
        use_cache=True,
    )
    response = tokenizer.decode(
        outputs[0][inputs.input_ids.shape[1]:],
        skip_special_tokens=True
    )
    
    return {
        "model": request.model,
        "choices": [{
            "message": {"role": "assistant", "content": response},
            "finish_reason": "stop"
        }]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

```bash
# Install dependencies
pip install unsloth fastapi uvicorn

# Run server
python unsloth_server.py
```

**Set in `.env`:**
```bash
LLM_BASE_URL=http://host.docker.internal:8080/v1
LLM_MODEL=qwen2.5-14b-unsloth
```

### Option 4: AirLLM (Low VRAM)

**Best for:** Running 30B+ models on limited VRAM. Splits layers between GPU and CPU RAM.

Create `server_airllm.py`:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from airllm import AutoModel
import uvicorn

app = FastAPI()
model = None

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str
    messages: list[Message]
    temperature: float = 0.3
    max_tokens: int = 4096

@app.on_event("startup")
async def load_model():
    global model
    model = AutoModel.from_pretrained(
        "Qwen/Qwen2.5-32B-Instruct",  # Can run 32B on 16GB VRAM!
        device_map="auto"
    )

@app.post("/v1/chat/completions")
async def chat(request: ChatRequest):
    prompt = "\n".join([f"{m.role}: {m.content}" for m in request.messages])
    output = model.generate(
        prompt,
        max_new_tokens=request.max_tokens,
        temperature=request.temperature
    )
    return {
        "model": request.model,
        "choices": [{
            "message": {"role": "assistant", "content": output},
            "finish_reason": "stop"
        }]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

```bash
# Install dependencies
pip install airllm fastapi uvicorn transformers torch

# Run server
python server_airllm.py
```

**Set in `.env`:**
```bash
LLM_BASE_URL=http://host.docker.internal:8080/v1
LLM_MODEL=qwen2.5-32b-airllm
```

> **Note:** AirLLM is slower (~5 tok/s) but uses only ~3GB VRAM, allowing you to run much larger models.

---

## OpenShorts Docker Setup

### Prerequisites

```bash
# 1. Verify NVIDIA driver
nvidia-smi

# 2. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 3. Install NVIDIA Container Toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# 4. Verify GPU in Docker
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
```

### Clone & Configure

```bash
# Clone OpenShorts
git clone https://github.com/mutonby/openshorts.git
cd openshorts

# Create .env (see Configuration Reference below)
cp .env.example .env
# Edit .env with your settings

# Create docker-compose.override.yml
cat > docker-compose.override.yml << 'EOF'
services:
  backend:
    build:
      context: .
      args:
        GPU: "1"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu, video]
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - NVIDIA_DRIVER_CAPABILITIES=compute,utility,video
EOF
```

### Launch

```bash
# Build and start
docker compose up --build -d

# View logs
docker compose logs -f backend

# Open dashboard
echo "OpenShorts: http://localhost:5175"
```

### Verify Installation

```bash
# Check Ollama from Docker
docker exec openshorts-backend curl -s http://host.docker.internal:11434/api/tags

# Check GPU in container
docker exec openshorts-backend nvidia-smi -L

# Check NVENC encoder
docker exec openshorts-backend ffmpeg -hide_banner -f lavfi \
  -i testsrc=size=256x256:rate=1 -frames:v 1 \
  -c:v h264_nvenc -f null -

# Test API
curl http://localhost:8000/api/config
```

---

## Configuration Reference

### Complete `.env` for Local Setup

```bash
# ═══════════════════════════════════════════════════════
# OpenShorts - 100% Local Configuration
# Hardware: 16GB VRAM GPU | 32GB RAM | Ryzen 7600X
# ═══════════════════════════════════════════════════════

# ─── Local LLM (replaces Google Gemini) ───
LLM_BASE_URL=http://host.docker.internal:11434/v1
LLM_MODEL=openshorts-llm
# LLM_API_KEY=  # Not needed for local Ollama
LLM_SCORE_BATCH=3  # Reduced from 8 for local (context limits)

# ─── Whisper / Transcription (GPU) ───
WHISPER_MODEL=large-v3-turbo
WHISPER_DEVICE=cuda
WHISPER_COMPUTE=float16
TRANSCRIBE_BACKEND=parakeet  # 2x faster than whisper
ASR_GPU_CONCURRENCY=1

# ─── FFmpeg / Encoding ───
FFMPEG_ENCODER=auto  # Probes h264_nvenc, falls back to x264

# ─── Scene Detection ───
SCENE_ENGINE=transnetv2  # Neural scene detection

# ─── Performance Tuning for 16GB VRAM ───
MAX_CONCURRENT_JOBS=1  # Only 1 job at a time
CLIP_WORKERS=3  # Reduced from 6 for 16GB VRAM
GPU_MIN_FREE_MB=2048  # Minimum free VRAM before starting
ASR_HOST_SLOTS=1  # Only 1 transcription at a time

# ─── Billing (disable for self-hosted) ───
BILLING_ENABLED=0

# ─── Optional: AI Shorts (needs fal.ai + ElevenLabs) ───
# FAL_KEY=  # Only for AI Shorts feature
# ELEVENLABS_API_KEY=  # Only for voice dubbing

# ─── Optional: Social Publishing ───
# UPLOAD_POST_API_KEY=  # Only for auto-publishing
```

### Minimal `.env` (Clip Generator Only)

```bash
LLM_BASE_URL=http://host.docker.internal:11434/v1
LLM_MODEL=openshorts-llm
LLM_SCORE_BATCH=3

WHISPER_MODEL=large-v3-turbo
WHISPER_DEVICE=cuda
WHISPER_COMPUTE=float16

FFMPEG_ENCODER=auto
MAX_CONCURRENT_JOBS=1
CLIP_WORKERS=3
GPU_MIN_FREE_MB=2048

BILLING_ENABLED=0
```

---

## Recommended Models

### For 16GB VRAM

| Model | Size | VRAM | Quality | JSON | Speed | Best For |
|-------|------|------|---------|------|-------|----------|
| **qwen2.5:14b** ★ | ~9GB Q4 | ~10GB | ★★★★★ | Excellent | ~25 t/s | Best overall |
| qwen2.5:7b | ~4.5GB Q4 | ~6GB | ★★★★☆ | Good | ~40 t/s | Fast + good |
| llama3.1:8b | ~4.7GB Q4 | ~6GB | ★★★★☆ | Excellent | ~35 t/s | Reliable JSON |
| mistral:7b | ~4.1GB Q4 | ~5GB | ★★★☆☆ | Good | ~45 t/s | Fastest |
| gemma2:9b | ~5.5GB Q4 | ~7GB | ★★★★☆ | Good | ~30 t/s | Google's model |
| qwen2.5-coder:7b | ~4.5GB Q4 | ~6GB | ★★★★☆ | Excellent | ~38 t/s | Structured output |
| phi3:14b | ~9GB Q4 | ~9GB | ★★★★☆ | Good | ~22 t/s | Strong reasoning |

### For Low VRAM (AirLLM)

| Model | Params | VRAM | RAM | Speed | Notes |
|-------|--------|------|-----|-------|-------|
| Qwen2.5-14B-Instruct | 14B | ~3GB | ~12GB | ~5 t/s | Good balance |
| Qwen2.5-32B-Instruct | 32B | ~3GB | ~20GB | ~2 t/s | Maximum quality |
| Llama-3.1-8B-Instruct | 8B | ~2GB | ~8GB | ~8 t/s | Fast for AirLLM |

> ★ = Recommended for your hardware

---

## VRAM Budget

### Typical Usage (16GB GPU)

| Component | VRAM | Percentage |
|-----------|------|------------|
| LLM Model (qwen2.5:14b) | ~10 GB | 62.5% |
| faster-whisper (large-v3-turbo) | ~3 GB | 18.8% |
| Scene detection (TransNetV2) | ~0.8 GB | 5.0% |
| Face tracking (YOLOv8) | ~0.7 GB | 4.4% |
| NVENC Encoder | ~0.5 GB | 3.1% |
| Safety headroom | ~1 GB | 6.2% |
| **Total** | **~16 GB** | **100%** |

### Optimizing VRAM

If you run out of VRAM:

1. **Use smaller model:** `qwen2.5:7b` instead of `14b`
2. **Reduce workers:** Set `CLIP_WORKERS=2`
3. **Smaller whisper:** Use `medium` instead of `large-v3-turbo`
4. **Increase headroom:** Set `GPU_MIN_FREE_MB=4096`
5. **Sequential processing:** Set `MAX_CONCURRENT_JOBS=1`

---

## Pipeline Overview

The complete processing pipeline runs 100% locally:

```
┌─────────────┐
│   Ingest    │  Load video file or URL (yt-dlp)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Transcribe  │  faster-whisper GPU transcription (~30s/min)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Scene Detect│  TransNetV2 neural scene boundaries (~5s/min)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ AI Analyze  │  Local LLM scores viral moments (~10s)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Extract     │  FFmpeg precise clip cutting (~2s/clip)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Reframe    │  AI vertical crop + face tracking (~15s/clip)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Subtitles   │  Word-level ASS subtitle burn (~5s/clip)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Encode    │  NVENC h264 GPU encoding (~10s/clip)
└─────────────┘
```

**Total time:** ~2-3 minutes for an 8-minute video

---

## Troubleshooting

### CUDA Out of Memory

**Symptoms:** Job fails with "CUDA out of memory" error

**Solutions:**
- Reduce `CLIP_WORKERS` from 6 to 3
- Set `MAX_CONCURRENT_JOBS=1`
- Use `qwen2.5:7b` instead of `14b`
- Set `WHISPER_MODEL=medium` instead of `large-v3-turbo`
- Increase `GPU_MIN_FREE_MB` to 4096

### Ollama Context Truncation

**Symptoms:** Model returns garbage or incomplete JSON

**Solutions:**
- Ensure Modelfile has `PARAMETER num_ctx 16384`
- Verify: `ollama show openshorts-llm --modelfile`
- Set `LLM_SCORE_BATCH=3` (not higher)
- Check Ollama logs: `journalctl -u ollama -f`

### Docker Can't Reach Ollama

**Symptoms:** Connection refused to `host.docker.internal:11434`

**Solutions:**
- Ensure `extra_hosts` is in `docker-compose.override.yml`
- On Linux: `export OLLAMA_HOST=0.0.0.0`
- Check firewall: `sudo ufw allow 11434`
- Test from host: `curl http://localhost:11434/api/tags`

### NVENC Not Available

**Symptoms:** FFmpeg falls back to x264 (slow CPU encoding)

**Solutions:**
- Ensure capabilities include `video` in compose override
- Verify: `docker exec openshorts-backend ffmpeg -encoders | grep nvenc`
- Check GPU: `docker exec openshorts-backend nvidia-smi`
- NVIDIA driver must be on HOST (not in container)

### Slow Transcription

**Symptoms:** Transcription takes too long

**Solutions:**
- Use `TRANSCRIBE_BACKEND=parakeet` (2x faster)
- Ensure `WHISPER_DEVICE=cuda` (not cpu)
- Check: `docker exec openshorts-backend nvidia-smi` during transcription
- Set `ASR_GPU_CONCURRENCY=1` to avoid VRAM contention

### Model Returns Invalid JSON

**Symptoms:** Pipeline fails with JSON parse error

**Solutions:**
- Use `qwen2.5:14b` or `llama3.1:8b` (better JSON compliance)
- Set temperature to 0.3 in Modelfile
- Avoid models smaller than 7B parameters
- Test: `ollama run qwen2.5:14b 'Return {"test": true}'`

---

## Performance Tips

### For Maximum Speed

1. **Use vLLM backend** — Fastest inference (~40 tok/s)
2. **Use Parakeet** — 2x faster than whisper for transcription
3. **Enable NVENC** — GPU-accelerated video encoding
4. **Increase workers** — If VRAM allows, set `CLIP_WORKERS=6`

### For Maximum Quality

1. **Use qwen2.5:14b** — Best moment detection quality
2. **Use large-v3-turbo** — Best transcription accuracy
3. **Increase context** — Set `num_ctx 32768` in Modelfile
4. **Enable layout picker** — Add Gemini key for multi-speaker videos

### For Low VRAM (8GB)

1. **Use qwen2.5:7b** — Fits in 6GB VRAM
2. **Use medium whisper** — Only 1.6GB VRAM
3. **Reduce workers** — Set `CLIP_WORKERS=2`
4. **Sequential jobs** — Set `MAX_CONCURRENT_JOBS=1`

---

## Maintenance

### Update OpenShorts

```bash
cd openshorts
git pull
docker compose up --build -d
```

### Update Ollama Model

```bash
ollama pull qwen2.5:14b
ollama create openshorts-llm -f Modelfile
```

### Monitor Resources

```bash
# GPU usage
nvidia-smi

# Docker containers
docker stats

# Backend logs
docker compose logs -f backend

# Ollama status
ollama ps
```

### Cleanup

```bash
# Remove old Docker images
docker system prune -f

# Remove unused volumes
docker volume prune -f

# Backup configuration
cp .env .env.backup
cp docker-compose.override.yml docker-compose.override.yml.backup
```

### Systemd Service (Auto-start LLM)

Create `/etc/systemd/system/openshorts-llm.service`:

```ini
[Unit]
Description=OpenShorts LLM Server (vLLM)
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/openshorts-llm
ExecStart=/home/$USER/openshorts-llm/venv/bin/python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-14B-Instruct-AWQ \
  --max-model-len 16384 \
  --gpu-memory-utilization 0.75 \
  --quantization awq \
  --port 8080
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable openshorts-llm
sudo systemctl start openshorts-llm
sudo systemctl status openshorts-llm
```

---

## License

This guide is provided under the MIT License.

OpenShorts itself is licensed under the [MIT License](https://github.com/mutonby/openshorts/blob/main/LICENSE).

---

## Contributing

Contributions welcome! Please open an issue or pull request.

---

## Acknowledgments

- [OpenShorts](https://github.com/mutonby/openshorts) — The original open-source AI clip generator
- [Ollama](https://ollama.com) — Local LLM runtime
- [vLLM](https://github.com/vllm-project/vllm) — High-throughput LLM serving
- [Unsloth](https://github.com/unslothai/unsloth) — Optimized LLM inference
- [AirLLM](https://github.com/lyogavin/airllm) — Low-VRAM LLM inference

---

<div align="center">

**Made with ❤️ for the local AI community**

[Report Issue](https://github.com/mutonby/openshorts/issues) • [OpenShorts Repo](https://github.com/mutonby/openshorts) • [Documentation](https://github.com/mutonby/openshorts#readme)

</div>
