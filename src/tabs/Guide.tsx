import { Card, SectionTitle, CodeBlock } from '../components'

export default function GuideTab({ copy, copiedId }: { copy: (t: string, i: string) => boolean; copiedId: string | null }) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle icon="fa-book" color="text-violet-400">
          Complete Setup Guide
        </SectionTitle>
        <p className="text-gray-400 text-sm">
          Step-by-step instructions to run OpenShorts 100% locally on your hardware (16GB VRAM, 32GB RAM, Ryzen 7600X).
        </p>
      </Card>

      {/* Prerequisites */}
      <Card>
        <SectionTitle icon="fa-check-double" color="text-emerald-400">
          Prerequisites
        </SectionTitle>
        <CodeBlock code={`# 1. Verify NVIDIA driver
nvidia-smi

# 2. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 3. Install NVIDIA Container Toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \\
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \\
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \\
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# 4. Verify GPU in Docker
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi`} id="guide-prereq" copy={copy} copiedId={copiedId} />
      </Card>

      {/* Quick Setup */}
      <Card>
        <SectionTitle icon="fa-rocket" color="text-violet-400">
          Quick Setup (5 Minutes)
        </SectionTitle>
        <CodeBlock code={`#!/bin/bash
# Complete OpenShorts Local Setup

# Step 1: Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Step 2: Pull model
ollama pull qwen2.5:14b

# Step 3: Create model with extended context
cat > Modelfile << 'EOF'
FROM qwen2.5:14b
PARAMETER num_ctx 16384
PARAMETER temperature 0.3
EOF
ollama create openshorts-llm -f Modelfile

# Step 4: Clone OpenShorts
git clone https://github.com/mutonby/openshorts.git
cd openshorts

# Step 5: Create .env
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

# Step 6: Create docker-compose.override.yml
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

# Step 7: Launch!
docker compose up --build -d

echo ""
echo "✓ OpenShorts is running at http://localhost:5175"
echo "✓ Ollama API at http://localhost:11434"
echo "✓ Model: openshorts-llm (qwen2.5:14b with 16k context)"`} id="guide-quick" copy={copy} copiedId={copiedId} />
      </Card>

      {/* Verification */}
      <Card>
        <SectionTitle icon="fa-vial" color="text-emerald-400">
          Verify Installation
        </SectionTitle>
        <CodeBlock code={`# Check Ollama is accessible from Docker
docker exec openshorts-backend curl -s http://host.docker.internal:11434/api/tags

# Check GPU is visible in container
docker exec openshorts-backend nvidia-smi -L

# Check NVENC encoder
docker exec openshorts-backend ffmpeg -hide_banner -f lavfi \\
  -i testsrc=size=256x256:rate=1 -frames:v 1 \\
  -c:v h264_nvenc -f null -

# Check backend logs
docker compose logs -f backend

# Test API
curl http://localhost:8000/api/config

# Test LLM
curl http://localhost:11434/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "openshorts-llm",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`} id="guide-verify" copy={copy} copiedId={copiedId} />
      </Card>

      {/* Troubleshooting */}
      <Card>
        <SectionTitle icon="fa-wrench" color="text-amber-400">
          Troubleshooting
        </SectionTitle>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <i className="fas fa-exclamation-circle text-red-400" aria-hidden="true" />
              CUDA Out of Memory
            </h4>
            <ul className="text-sm text-gray-400 space-y-1 ml-6 list-disc">
              <li>Reduce CLIP_WORKERS from 6 to 3</li>
              <li>Set MAX_CONCURRENT_JOBS=1</li>
              <li>Use qwen2.5:7b instead of 14b</li>
              <li>Set WHISPER_MODEL=medium instead of large-v3-turbo</li>
              <li>Increase GPU_MIN_FREE_MB to 4096</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <i className="fas fa-exclamation-circle text-red-400" aria-hidden="true" />
              Docker Can't Reach Ollama
            </h4>
            <ul className="text-sm text-gray-400 space-y-1 ml-6 list-disc">
              <li>Ensure extra_hosts is in docker-compose.override.yml</li>
              <li>On Linux: <code className="bg-gray-800 px-1 rounded text-xs">export OLLAMA_HOST=0.0.0.0</code></li>
              <li>Check firewall: <code className="bg-gray-800 px-1 rounded text-xs">sudo ufw allow 11434</code></li>
              <li>Test from host: <code className="bg-gray-800 px-1 rounded text-xs">curl http://localhost:11434/api/tags</code></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <i className="fas fa-exclamation-circle text-red-400" aria-hidden="true" />
              Model Returns Invalid JSON
            </h4>
            <ul className="text-sm text-gray-400 space-y-1 ml-6 list-disc">
              <li>Use qwen2.5:14b or llama3.1:8b (better JSON compliance)</li>
              <li>Set temperature to 0.3 in Modelfile</li>
              <li>Avoid models smaller than 7B parameters</li>
              <li>Ensure num_ctx is at least 16384</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <i className="fas fa-exclamation-circle text-red-400" aria-hidden="true" />
              NVENC Not Available
            </h4>
            <ul className="text-sm text-gray-400 space-y-1 ml-6 list-disc">
              <li>Ensure capabilities include 'video' in compose override</li>
              <li>Verify: <code className="bg-gray-800 px-1 rounded text-xs">docker exec openshorts-backend ffmpeg -encoders | grep nvenc</code></li>
              <li>NVIDIA driver must be on HOST (not in container)</li>
              <li>Check: <code className="bg-gray-800 px-1 rounded text-xs">docker exec openshorts-backend nvidia-smi</code></li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Maintenance */}
      <Card>
        <SectionTitle icon="fa-sync-alt" color="text-blue-400">
          Maintenance & Updates
        </SectionTitle>
        <CodeBlock code={`# Update OpenShorts
cd openshorts
git pull
docker compose up --build -d

# Update Ollama model
ollama pull qwen2.5:14b
ollama create openshorts-llm -f Modelfile

# View resource usage
docker stats
nvidia-smi

# Clean up old images
docker system prune -f

# Backup configuration
cp .env .env.backup
cp docker-compose.override.yml docker-compose.override.yml.backup`} id="guide-maint" copy={copy} copiedId={copiedId} />
      </Card>
    </div>
  )
}
