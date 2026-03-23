import { useState, useEffect, useRef, useCallback } from "react";

const PARTICLE_COUNT = 150;
const DARK_THRESHOLD = 60;
const SAMPLE_GRID = 10;

function createParticle(x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.5 + Math.random() * 2.8;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 1.4,
    life: 1.0,
    decay: 0.006 + Math.random() * 0.016,
    size: 1.5 + Math.random() * 4.5,
    color,
    glow: 0.4 + Math.random() * 0.6,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.05 + Math.random() * 0.15,
  };
}

const styles = {
  container: {
    minHeight: "100vh",
    minHeight: "100dvh",
    background: "#000",
    color: "#fff",
    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    touchAction: "none",
  },
  startScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    minHeight: "100dvh",
    gap: 24,
    padding: 32,
    textAlign: "center",
  },
  icon: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, #a78bfa, #7c3aed, #4c1d95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 60px rgba(167, 139, 250, 0.4), 0 0 120px rgba(124, 58, 237, 0.15)",
    animation: "pulse 2.5s ease-in-out infinite",
  },
  title: {
    fontSize: 30,
    fontWeight: 700,
    background: "linear-gradient(135deg, #c4b5fd, #a78bfa, #8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.02em",
    margin: 0,
  },
  subtitle: {
    color: "#a1a1aa",
    fontSize: 14,
    lineHeight: 1.7,
    maxWidth: 300,
    margin: 0,
  },
  startBtn: {
    padding: "16px 48px",
    borderRadius: 50,
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    fontSize: 17,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.02em",
    boxShadow: "0 4px 30px rgba(139, 92, 246, 0.45)",
    transition: "all 0.2s",
    marginTop: 8,
  },
  canvasWrap: {
    position: "relative",
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  canvas: {
    width: "100%",
    height: "100vh",
    objectFit: "cover",
  },
  particleCanvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    pointerEvents: "none",
  },
  controls: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "20px 20px 32px",
    background: "linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.6), transparent)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    alignItems: "center",
    zIndex: 10,
  },
  btnRow: {
    display: "flex",
    gap: 10,
    width: "100%",
    maxWidth: 380,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  sliderRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 380,
  },
};

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [error, setError] = useState(null);
  const [intensity, setIntensity] = useState(0.75);
  const [showInvert, setShowInvert] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [threshold, setThreshold] = useState(DARK_THRESHOLD);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStarted(true);
      }
    } catch (e) {
      console.error(e);
      setError(
        "Camera access denied. Please allow camera permissions in your browser settings and reload."
      );
    }
  }, []);

  useEffect(() => {
    if (!started) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const pCanvas = particleCanvasRef.current;
    if (!video || !canvas || !pCanvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const pCtx = pCanvas.getContext("2d");
    let running = true;

    const loop = () => {
      if (!running) return;

      const w = video.videoWidth || 360;
      const h = video.videoHeight || 640;

      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      if (pCanvas.width !== w) pCanvas.width = w;
      if (pCanvas.height !== h) pCanvas.height = h;

      ctx.drawImage(video, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const darkSpots = [];
      const thr = threshold;

      // Collect dark spots from sample grid
      for (let y = 0; y < h; y += SAMPLE_GRID) {
        for (let x = 0; x < w; x += SAMPLE_GRID) {
          const i = (y * w + x) * 4;
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          if (lum < thr) {
            darkSpots.push({
              x, y, luminance: lum,
              r: 255 - data[i],
              g: 255 - data[i + 1],
              b: 255 - data[i + 2],
            });
          }
        }
      }

      // Invert dark pixels
      if (showInvert) {
        const blend_range = 40;
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          let t = 0;
          if (lum < thr) {
            t = intensity;
          } else if (lum < thr + blend_range) {
            t = ((thr + blend_range - lum) / blend_range) * intensity;
          }
          if (t > 0) {
            data[i] = Math.round(data[i] + (255 - data[i]) * t);
            data[i + 1] = Math.round(data[i + 1] + (255 - data[i + 1]) * t);
            data[i + 2] = Math.round(data[i + 2] + (255 - data[i + 2]) * t);
          }
        }
        ctx.putImageData(imageData, 0, 0);

        // Glow overlay on dark regions
        for (const spot of darkSpots) {
          const glowSize = 22 + (1 - spot.luminance / thr) * 35;
          const alpha = 0.18 * intensity;
          const gradient = ctx.createRadialGradient(
            spot.x, spot.y, 0, spot.x, spot.y, glowSize
          );
          gradient.addColorStop(0, `rgba(${spot.r},${spot.g},${spot.b},${alpha})`);
          gradient.addColorStop(0.4, `rgba(${spot.r},${spot.g},${spot.b},${alpha * 0.35})`);
          gradient.addColorStop(1, `rgba(${spot.r},${spot.g},${spot.b},0)`);
          ctx.fillStyle = gradient;
          ctx.fillRect(
            spot.x - glowSize, spot.y - glowSize,
            glowSize * 2, glowSize * 2
          );
        }
      }

      // Spawn particles
      if (showParticles && darkSpots.length > 0) {
        const spawnCount = Math.min(Math.floor(4 * intensity), 6);
        for (let s = 0; s < spawnCount; s++) {
          if (particlesRef.current.length < PARTICLE_COUNT) {
            const spot = darkSpots[Math.floor(Math.random() * darkSpots.length)];
            const jx = spot.x + (Math.random() - 0.5) * SAMPLE_GRID * 2;
            const jy = spot.y + (Math.random() - 0.5) * SAMPLE_GRID * 2;
            const hue =
              spot.r > spot.g && spot.r > spot.b ? 330
              : spot.g > spot.b ? 160 : 240;
            const color = `hsl(${hue + Math.random() * 60 - 30}, 100%, ${68 + Math.random() * 28}%)`;
            particlesRef.current.push(createParticle(jx, jy, color));
          }
        }
      }

      // Draw particles
      pCtx.clearRect(0, 0, w, h);
      const alive = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.015;
        p.life -= p.decay;
        p.twinkle += p.twinkleSpeed;

        if (p.life <= 0) continue;
        alive.push(p);

        const twinkle = 0.5 + 0.5 * Math.sin(p.twinkle);
        const alpha = p.life * p.glow * twinkle;
        const size = p.size * (0.5 + 0.5 * p.life);

        // Outer glow
        pCtx.save();
        pCtx.globalAlpha = alpha * 0.25;
        pCtx.shadowColor = p.color;
        pCtx.shadowBlur = size * 5;
        pCtx.fillStyle = p.color;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, size * 1.8, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();

        // Core
        pCtx.save();
        pCtx.globalAlpha = alpha;
        pCtx.fillStyle = "#fff";
        pCtx.shadowColor = p.color;
        pCtx.shadowBlur = size * 2.5;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, size * 0.5, 0, Math.PI * 2);
        pCtx.fill();

        // Star cross
        pCtx.strokeStyle = p.color;
        pCtx.lineWidth = 0.6;
        pCtx.globalAlpha = alpha * 0.55;
        const arm = size * 2.2 * twinkle;
        pCtx.beginPath();
        pCtx.moveTo(p.x - arm, p.y);
        pCtx.lineTo(p.x + arm, p.y);
        pCtx.moveTo(p.x, p.y - arm);
        pCtx.lineTo(p.x, p.y + arm);
        pCtx.stroke();

        // Diagonal arms
        pCtx.globalAlpha = alpha * 0.25;
        const dArm = arm * 0.6;
        pCtx.beginPath();
        pCtx.moveTo(p.x - dArm, p.y - dArm);
        pCtx.lineTo(p.x + dArm, p.y + dArm);
        pCtx.moveTo(p.x + dArm, p.y - dArm);
        pCtx.lineTo(p.x - dArm, p.y + dArm);
        pCtx.stroke();
        pCtx.restore();
      }
      particlesRef.current = alive;

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [started, intensity, showInvert, showParticles, threshold]);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggleBtn = (active, activeColor, activeBg, label, onClick) => (
    <button
      onClick={onClick}
      style={{
        padding: "9px 18px",
        borderRadius: 22,
        border: active ? `1.5px solid ${activeColor}` : "1.5px solid #333",
        background: active ? activeBg : "rgba(255,255,255,0.04)",
        color: active ? activeColor : "#555",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        letterSpacing: "0.01em",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={styles.container}>
      <video ref={videoRef} playsInline muted style={{ display: "none" }} />

      {!started && !error && (
        <div style={styles.startScreen}>
          <div style={styles.icon}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
          <h1 style={styles.title}>Dark Spot Luminance</h1>
          <p style={styles.subtitle}>
            Inverts dark areas into glowing light sources and emits twinkling sparkle particles from the shadows — in real time through your rear camera.
          </p>
          <button onClick={startCamera} style={styles.startBtn}>
            Start Camera
          </button>
          <p style={{ color: "#52525b", fontSize: 11, marginTop: 4 }}>
            Uses rear camera · Works best on mobile
          </p>
        </div>
      )}

      {error && (
        <div style={styles.startScreen}>
          <p style={{ color: "#f87171", fontSize: 15, lineHeight: 1.6 }}>{error}</p>
        </div>
      )}

      {started && (
        <>
          <div style={styles.canvasWrap}>
            <canvas ref={canvasRef} style={styles.canvas} />
            <canvas ref={particleCanvasRef} style={styles.particleCanvas} />
          </div>

          <div style={styles.controls}>
            <div style={styles.btnRow}>
              {toggleBtn(showInvert, "#c4b5fd", "rgba(139,92,246,0.18)", "⚡ Invert", () => setShowInvert(!showInvert))}
              {toggleBtn(showParticles, "#fcd34d", "rgba(245,158,11,0.18)", "✨ Sparkles", () => setShowParticles(!showParticles))}
            </div>

            <div style={styles.sliderRow}>
              <span style={{ fontSize: 11, color: "#71717a", minWidth: 55 }}>Intensity</span>
              <input
                type="range" min="0.1" max="1" step="0.05"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="slider"
              />
              <span style={{ fontSize: 11, color: "#a1a1aa", minWidth: 34, textAlign: "right" }}>
                {Math.round(intensity * 100)}%
              </span>
            </div>

            <div style={styles.sliderRow}>
              <span style={{ fontSize: 11, color: "#71717a", minWidth: 55 }}>Threshold</span>
              <input
                type="range" min="20" max="120" step="5"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="slider"
              />
              <span style={{ fontSize: 11, color: "#a1a1aa", minWidth: 34, textAlign: "right" }}>
                {threshold}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Persistent YuviStark watermark */}
      <div style={{
        position: "fixed",
        bottom: started ? 140 : 32,
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 20,
        pointerEvents: "none",
        transition: "bottom 0.4s ease",
      }}>
        <span style={{
          fontFamily: "'DrukWideBold', sans-serif",
          fontSize: 14,
          letterSpacing: "0.15em",
          color: "rgba(255, 255, 255, 0.55)",
          textTransform: "uppercase",
          textShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
        }}>
          YuviStark
        </span>
      </div>

      <style>{`
        @font-face {
          font-family: 'DrukWideBold';
          src: url('https://liketekvzrazheolmfnj.supabase.co/storage/v1/object/public/Fonts/DrukWideBold.ttf') format('truetype');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }
        .slider {
          flex: 1;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: #333;
          border-radius: 2px;
          outline: none;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          border: 2px solid #c4b5fd;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
