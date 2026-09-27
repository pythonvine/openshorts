import { Card, SectionTitle, CodeBlock, Badge } from '../components'

export default function ServerTab({ copy, copiedId }: { copy: (t: string, i: string) => boolean; copiedId: string | null }) {
  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle icon="fa-code" color="text-violet-400">
          Python Server Implementations
        </SectionTitle>
        <p className="text-gray-400 text-sm mb-4">
          Complete server code for running local LLMs with OpenAI-compatible APIs. Choose your preferred backend.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge color="violet">Ollama (Easiest)</Badge>
          <Badge color="emerald">vLLM (Fastest)</Badge>
          <Badge color="amber">Unsloth (Optimized)</Badge>
          <Badge color="blue">AirLLM (Low VRAM)</Badge>
        </div>
      </Card>

      {/* Ollama Server */}
      <Card>
        <SectionTitle icon="fa-server" color="text-violet-400">
          Option 1: Ollama (Recommended)
        </SectionTitle>
        <p className="text-sm text-gray-400 mb-3">
          Ollama provides a built-in OpenAI-compatible API. No custom server needed — just configure and run.
        </p>
        <CodeBlock code={`# No server code needed! Ollama has built-in OpenAI API.
# Just install and run:

curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:14b

# Create model with extended context
cat > Modelfile << 'EOF'
FROM qwen2.5:14b
PARAMETER num_ctx 16384
PARAMETER temperature 0.3
EOF
ollama create openshorts-llm -f Modelfile

# Start Ollama (runs as service)
sudo systemctl start ollama

# Test the API
curl http://localhost:11434/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "openshorts-llm",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Set in OpenShorts .env:
# LLM_BASE_URL=http://host.docker.internal:11434/v1
# LLM_MODEL=openshorts-llm`} id="srv-ollama" copy={copy} copiedId={copiedId} language="bash" />
      </Card>

      {/* vLLM Server */}
      <Card>
        <SectionTitle icon="fa-rocket" color="text-emerald-400">
          Option 2: vLLM (Fastest Inference)
        </SectionTitle>
        <p className="text-sm text-gray-400 mb-3">
          vLLM provides production-grade inference with PagedAttention. Best for high throughput.
        </p>
        <CodeBlock code={`# Install vLLM
pip install vllm

# Start vLLM server with optimized settings
python -m vllm.entrypoints.openai.api_server \\
  --model Qwen/Qwen2.5-14B-Instruct-AWQ \\
  --max-model-len 16384 \\
  --gpu-memory-utilization 0.75 \\
  --quantization awq \\
  --dtype float16 \\
  --port 8080 \\
  --host 0.0.0.0

# Test
curl http://localhost:8080/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "Qwen/Qwen2.5-14B-Instruct-AWQ",
    "messages": [{"role": "user", "content": "Score this transcript"}]
  }'

# Set in OpenShorts .env:
# LLM_BASE_URL=http://host.docker.internal:8080/v1
# LLM_MODEL=Qwen/Qwen2.5-14B-Instruct-AWQ`} id="srv-vllm" copy={copy} copiedId={copiedId} language="bash" />
      </Card>

      {/* Unsloth Server */}
      <Card>
        <SectionTitle icon="fa-bolt" color="text-amber-400">
          Option 3: Unsloth (Optimized Kernels)
        </SectionTitle>
        <p className="text-sm text-gray-400 mb-3">
          Unsloth provides 2x faster inference with custom CUDA kernels. Best VRAM efficiency.
        </p>
        <CodeBlock code={`# unsloth_server.py - Maximum performance server
from unsloth import FastLanguageModel
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# Load model with Unsloth optimizations
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen2.5-14B-Instruct",
    max_seq_length=16384,
    dtype=None,  # Auto-detect
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

@app.get("/v1/models")
async def models():
    return {"data": [{"id": "qwen2.5-14b-unsloth"}]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)

# Run:
# pip install unsloth fastapi uvicorn
# python unsloth_server.py

# Set in OpenShorts .env:
# LLM_BASE_URL=http://host.docker.internal:8080/v1
# LLM_MODEL=qwen2.5-14b-unsloth`} id="srv-unsloth" copy={copy} copiedId={copiedId} language="python" />
      </Card>

      {/* AirLLM Server */}
      <Card>
        <SectionTitle icon="fa-cloud" color="text-blue-400">
          Option 4: AirLLM (Low VRAM / Large Models)
        </SectionTitle>
        <p className="text-sm text-gray-400 mb-3">
          AirLLM splits model layers between GPU and CPU RAM. Run 30B+ models on 16GB VRAM.
        </p>
        <CodeBlock code={`# server_airllm.py - Run large models with minimal VRAM
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
    # AirLLM loads model layer-by-layer
    model = AutoModel.from_pretrained(
        "Qwen/Qwen2.5-32B-Instruct",  # Can run 32B on 16GB VRAM!
        device_map="auto"
    )

@app.post("/v1/chat/completions")
async def chat(request: ChatRequest):
    prompt = "\\n".join([f"{m.role}: {m.content}" for m in request.messages])
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

@app.get("/v1/models")
async def models():
    return {"data": [{"id": "qwen2.5-32b-airllm"}]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)

# Run:
# pip install airllm fastapi uvicorn transformers torch
# python server_airllm.py

# Set in OpenShorts .env:
# LLM_BASE_URL=http://host.docker.internal:8080/v1
# LLM_MODEL=qwen2.5-32b-airllm

# Note: Slower (~5 tok/s) but uses only ~3GB VRAM`} id="srv-airllm" copy={copy} copiedId={copiedId} language="python" />
      </Card>

      {/* Systemd Service */}
      <Card>
        <SectionTitle icon="fa-cogs" color="text-gray-400">
          Systemd Service (Auto-start on Boot)
        </SectionTitle>
        <p className="text-sm text-gray-400 mb-3">
          Create a systemd service to auto-start your LLM server on boot.
        </p>
        <CodeBlock code={`# /etc/systemd/system/openshorts-llm.service
[Unit]
Description=OpenShorts LLM Server (vLLM)
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/openshorts-llm
ExecStart=/home/$USER/openshorts-llm/venv/bin/python -m vllm.entrypoints.openai.api_server \\
  --model Qwen/Qwen2.5-14B-Instruct-AWQ \\
  --max-model-len 16384 \\
  --gpu-memory-utilization 0.75 \\
  --quantization awq \\
  --port 8080
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable and start:
sudo systemctl daemon-reload
sudo systemctl enable openshorts-llm
sudo systemctl start openshorts-llm

# Check status:
sudo systemctl status openshorts-llm`} id="srv-systemd" copy={copy} copiedId={copiedId} language="ini" />
      </Card>
    </div>
  )
}
