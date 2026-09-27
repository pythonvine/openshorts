# OpenShorts Local Setup Guide

<div align="center">

**Interactive web application for running [OpenShorts](https://github.com/mutonby/openshorts) AI video clip generator 100% locally**

[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-purple)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.1-38bdf8)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

</div>

---

## 📖 What Is This?

This is an **interactive web-based guide** that helps you set up and run [OpenShorts](https://github.com/mutonby/openshorts) — an open-source AI video clip generator — **entirely on your local hardware** without cloud APIs.

### Features

- 🎯 **Dashboard** — Interactive VRAM budget calculator with live model selection
- 🧠 **Models** — Compare 10+ local LLM models with filtering and sorting
- 🔌 **Live Test** — Connect to your Ollama instance and test models in real-time
- ⚙️ **Config Builder** — Generate `.env` and Docker files interactively
- 💻 **Server Code** — Complete Python server implementations (Ollama, vLLM, Unsloth, AirLLM)
- 🎬 **Pipeline** — Visual processing pipeline explorer
- 📖 **Setup Guide** — Step-by-step installation instructions

### Target Hardware

Optimized for:
- **GPU:** 16GB VRAM (NVIDIA)
- **RAM:** 32GB
- **CPU:** AMD Ryzen 7600X (or equivalent)

> Works with any hardware — the VRAM calculator adapts to your specs.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Git** ([download](https://git-scm.com/))

### Installation

```bash
# 1. Clone this repository
git clone <your-repo-url>
cd openshorts-local-guide

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will open at **http://localhost:3000**

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run typecheck` | Run TypeScript type checking |

### Development

```bash
npm run dev
```

Starts the Vite dev server at `http://localhost:3000` with:
- Hot Module Replacement (HMR)
- Fast refresh
- Source maps

### Production Build

```bash
npm run build
```

Creates an optimized production build in the `dist/` directory:
- Minified JavaScript and CSS
- Tree-shaken dependencies
- Optimized assets

### Preview Production Build

```bash
# After running npm run build
npm run preview
```

Serves the production build locally for testing.

---

## 🏗️ Project Structure

```
.
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.js             # Vite build configuration
│
├── src/
│   ├── main.tsx               # React entry point
│   ├── App.tsx                # Main app component with routing
│   ├── index.css              # Global styles (Tailwind)
│   ├── types.ts               # TypeScript type definitions
│   ├── data.ts                # Model database and constants
│   ├── hooks.ts               # Custom React hooks
│   ├── components.tsx         # Reusable UI components
│   │
│   └── tabs/                  # Tab components
│       ├── Dashboard.tsx      # VRAM calculator & overview
│       ├── Models.tsx         # Model comparison
│       ├── LiveTest.tsx       # Ollama live testing
│       ├── Config.tsx         # Config builder
│       ├── Server.tsx         # Server code examples
│       ├── Pipeline.tsx       # Pipeline visualization
│       └── Guide.tsx          # Setup instructions
│
└── dist/                      # Production build (generated)
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2 | UI framework |
| **TypeScript** | 5.7 | Type safety |
| **Vite** | 6.3 | Build tool & dev server |
| **Tailwind CSS** | 4.1 | Utility-first CSS |
| **Font Awesome** | 6.5 | Icons |

### Key Dependencies

- `react` / `react-dom` — UI rendering
- `@vitejs/plugin-react` — React Fast Refresh
- `@tailwindcss/vite` — Tailwind integration
- `typescript` — Type checking

---

## 📱 Application Tabs

### 1. Dashboard

**Interactive VRAM Budget Calculator**

- Adjust GPU VRAM with slider (4-24GB)
- Select LLM model and Whisper model
- Real-time VRAM usage visualization
- Pipeline overview with timing estimates
- Hardware specification display

### 2. Models

**Local LLM Model Database**

- 10+ models with detailed specs
- Filter by backend (Ollama, vLLM, Unsloth, AirLLM)
- Sort by quality, speed, or VRAM usage
- Model cards with key metrics
- Detailed comparison table

### 3. Live Test

**Real-Time Ollama Testing**

- Connect to local Ollama instance
- List available models
- Interactive chat interface
- Test prompts for video analysis
- Connection status indicator

**Usage:**
1. Make sure Ollama is running (`ollama serve`)
2. Enter Ollama URL (default: `http://localhost:11434`)
3. Click "Connect"
4. Select a model
5. Send test prompts

### 4. Config Builder

**Interactive Configuration Generator**

- Select LLM backend and model
- Choose Whisper model
- Adjust performance settings
- Generate `.env` file in real-time
- Generate `docker-compose.override.yml`
- Generate complete setup script

### 5. Server Code

**Python Server Implementations**

Complete, ready-to-use server code for:
- **Ollama** — Built-in OpenAI API (no code needed)
- **vLLM** — High-throughput inference
- **Unsloth** — Optimized CUDA kernels
- **AirLLM** — Low VRAM / large models
- **Systemd** — Auto-start service

### 6. Pipeline

**Visual Processing Pipeline**

- 8-step pipeline visualization
- Click steps for detailed info
- VRAM usage timeline
- Technology stack per step
- Duration estimates

### 7. Setup Guide

**Step-by-Step Installation**

- Prerequisites checklist
- Quick setup script (5 minutes)
- Verification commands
- Troubleshooting section
- Maintenance commands

---

## 🔧 Configuration

### Environment Variables

This app doesn't require environment variables to run. However, the **Config Builder** tab generates `.env` files for OpenShorts with these settings:

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_BASE_URL` | LLM API endpoint | `http://host.docker.internal:11434/v1` |
| `LLM_MODEL` | Model name | `openshorts-llm` |
| `WHISPER_MODEL` | Transcription model | `large-v3-turbo` |
| `MAX_CONCURRENT_JOBS` | Parallel jobs | `1` |
| `CLIP_WORKERS` | Clip processing workers | `3` |

### Customizing Models

Edit `src/data.ts` to add/modify models:

```typescript
export const MODELS: ModelDef[] = [
  {
    id: 'your-model:7b',
    name: 'Your Model 7B',
    provider: 'Provider',
    params: '7B',
    quantization: 'Q4_K_M',
    vramGB: 6,
    ramGB: 8,
    speedTokS: 35,
    quality: 4,
    jsonQuality: 'good',
    contextMax: 16384,
    bestFor: 'Your use case',
    backend: 'ollama',
  },
  // ...
]
```

---

## 🌐 Deployment

### Static Hosting

The production build (`dist/`) can be deployed to any static hosting service:

#### Vercel

```bash
npm install -g vercel
vercel
```

#### Netlify

```bash
npm run build
# Drag and drop dist/ folder to Netlify
```

#### GitHub Pages

```bash
npm run build
# Push dist/ to gh-pages branch
```

#### Docker

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t openshorts-guide .
docker run -p 8080:80 openshorts-guide
```

---

## 🔌 Live Ollama Integration

The **Live Test** tab connects directly to your local Ollama instance.

### Setup

1. Install Ollama:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. Pull a model:
   ```bash
   ollama pull qwen2.5:14b
   ```

3. Start Ollama (if not running as service):
   ```bash
   ollama serve
   ```

4. In the web app:
   - Go to **Live Test** tab
   - Enter URL: `http://localhost:11434`
   - Click **Connect**
   - Select model and test!

### CORS Configuration

If you encounter CORS errors, configure Ollama to allow cross-origin requests:

```bash
# Linux/macOS
OLLAMA_ORIGINS=http://localhost:3000 ollama serve

# Windows (PowerShell)
$env:OLLAMA_ORIGINS="http://localhost:3000"; ollama serve
```

---

## 🐛 Troubleshooting

### Build Errors

**TypeScript errors:**
```bash
npm run typecheck
```

**Missing dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Dev Server Issues

**Port 3000 already in use:**
```bash
# Edit vite.config.js and change port
# Or kill the process:
lsof -ti:3000 | xargs kill -9
```

**HMR not working:**
```bash
# Restart dev server
npm run dev
```

### Live Test Connection Issues

**Can't connect to Ollama:**
1. Verify Ollama is running: `curl http://localhost:11434/api/tags`
2. Check CORS settings (see above)
3. Ensure no firewall blocking port 11434

**No models showing:**
```bash
# Pull a model
ollama pull qwen2.5:14b

# Verify
ollama list
```

---

## 📚 Related Projects

- **[OpenShorts](https://github.com/mutonby/openshorts)** — The original AI video clip generator
- **[Ollama](https://ollama.com)** — Run LLMs locally
- **[vLLM](https://github.com/vllm-project/vllm)** — High-throughput LLM serving
- **[Unsloth](https://github.com/unslothai/unsloth)** — Optimized LLM inference
- **[AirLLM](https://github.com/lyogavin/airllm)** — Low-VRAM LLM inference

---

## 🤝 Contributing

Contributions welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run type checking: `npm run typecheck`
5. Build the project: `npm run build`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow existing code style
- Add comments for complex logic
- Test in both dev and production builds
- Ensure responsive design (mobile-friendly)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

**Note:** This guide is for [OpenShorts](https://github.com/mutonby/openshorts), which is also MIT licensed.

---

## 🙏 Acknowledgments

- **[OpenShorts](https://github.com/mutonby/openshorts)** team for the amazing AI video clip generator
- **[Ollama](https://ollama.com)** for making local LLMs accessible
- **[vLLM](https://github.com/vllm-project/vllm)** for production-grade inference
- **[Unsloth](https://github.com/unslothai/unsloth)** for optimized kernels
- **[AirLLM](https://github.com/lyogavin/airllm)** for low-VRAM solutions
- The local AI community

---

## 📞 Support

- **Issues:** [Open an issue](../../issues)
- **Discussions:** [Join the discussion](../../discussions)
- **OpenShorts Issues:** [OpenShorts GitHub](https://github.com/mutonby/openshorts/issues)

---

<div align="center">

**Made with ❤️ for the local AI community**

[⭐ Star this repo](../../stargazers) • [🐛 Report Bug](../../issues) • [💡 Request Feature](../../issues)

</div>
