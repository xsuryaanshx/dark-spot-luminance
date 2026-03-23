# ✨ Dark Spot Luminance

> Real-time camera effect that inverts dark areas into glowing light sources and emits twinkling sparkle particles from the shadows.

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/Canvas-2D-FF6B6B?style=flat-square" />
  <img src="https://img.shields.io/badge/Mobile-First-000?style=flat-square" />
</p>

---

## 🎥 What It Does

Point your phone's rear camera at any scene — **dark spots become light emitters**:

- **Inverted Luminance** — Pixels below a darkness threshold get their brightness flipped, turning shadows into glowing regions with soft radial bloom
- **Sparkle Particle System** — Twinkling star-cross particles spawn from dark areas and float upward with colored glow trails
- **Real-time Processing** — All effects computed per-frame on a `<canvas>` overlay at 60fps

## 🔧 How It Works

### Luminance Inversion

Each frame is captured from the camera feed. Every pixel's luminance is calculated using the standard perceptual formula:

```
L = 0.299R + 0.587G + 0.114B
```

Pixels below the configurable darkness threshold get their RGB values inverted proportionally:

```
newR = R + (255 - R) × intensity
```

A 40px blend range creates smooth transitions at the boundary between dark and normal areas, avoiding harsh edges.

### Radial Glow

Dark regions detected on a 10px sample grid emit radial gradients using the inverted color of the original pixel. This creates a natural "light emission" effect where the glow color complements the original shadow.

### Particle System

Up to 150 particles are managed per frame:

- **Spawn**: Particles emerge from randomly selected dark spots with jittered positions
- **Physics**: Each particle has velocity, upward drift (negative gravity), and gradual life decay
- **Rendering**: Three-layer draw — outer colored glow → white core → 8-arm star cross with twinkling opacity modulation
- **Color**: Hue is derived from the inverted color of the source dark spot

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/dark-spot-luminance.git
cd dark-spot-luminance

# Install & run
npm install
npm run dev
```

Open on your phone (same network) via the local IP shown in terminal.

### Standalone Version

No build step needed — just open `standalone.html` in any browser. Perfect for quick demos.

## 📱 Controls

| Control | What it does |
|---------|-------------|
| **⚡ Invert** | Toggle luminance inversion on dark areas |
| **✨ Sparkles** | Toggle particle emission from shadows |
| **Intensity** | How strongly dark areas glow (10%–100%) |
| **Threshold** | Darkness cutoff — higher = more areas affected (20–120) |

## 🏗️ Tech Stack

- **React 18** — Component architecture & state management
- **Vite 6** — Dev server + production build
- **Canvas 2D API** — Real-time pixel manipulation + particle rendering
- **MediaDevices API** — Rear camera access with environment-facing preference
- **GitHub Actions** — Auto-deploy to GitHub Pages on push

## 📂 Project Structure

```
dark-spot-luminance/
├── src/
│   ├── App.jsx          # Main component — camera, effects, particle system
│   └── main.jsx         # React entry point
├── standalone.html      # Zero-dependency single-file version
├── index.html           # Vite entry
├── vite.config.js       # Build config with GitHub Pages base path
├── .github/
│   └── workflows/
│       └── deploy.yml   # Auto-deploy to GitHub Pages
└── package.json
```

## 🌐 Deployment

Push to `main` and GitHub Actions will auto-build and deploy to Pages.

**Manual setup:**
1. Go to repo → Settings → Pages
2. Source: **GitHub Actions**
3. Push any commit to `main`

Your live demo will be at `https://YOUR_USERNAME.github.io/dark-spot-luminance/`

## 📄 License

MIT — do whatever you want with it.
