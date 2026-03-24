# ✦ Dark Spot Luminance

Real-time camera effect that inverts your scene into a vivid photographic negative — with deep contrast and rich colour.

---

## What it does

Points your rear camera at anything and applies a true pixel-level negative effect in real time. Dark areas become bright, colours flip to their complements, and the result is punchy and saturated — not the washed-out CSS invert you see elsewhere.

---

## Controls

| Control | Default | Description |
|---|---|---|
| ⚡ Invert | On | Toggle the full negative effect on/off |
| Intensity | 100% | How strongly the invert blends over the original |
| Threshold | 0 | Minimum brightness to invert (0 = invert every pixel) |
| Contrast | 200% | Pulls inverted values away from midtone grey for extra punch |
| Saturation | 180% | Boosts colour richness in the negative |

---

## How the invert works

Unlike a basic CSS `filter: invert()`, this does per-pixel processing on the canvas:

1. **Invert** — each RGB channel is flipped (`255 - value`)
2. **Contrast** — values are pulled away from 50% grey using a parametric curve
3. **Saturation** — colour is boosted in HSL space before writing back
4. **Intensity** — final result is blended with the original frame at the chosen strength

This gives a result that looks like a true photographic negative rather than a faded overlay.

---

## Tech

- Vanilla JS + HTML5 Canvas (`getImageData` / `putImageData`)
- `getUserMedia` rear camera stream
- No dependencies, no framework — single HTML file
- Hosted on GitHub Pages

---

## Usage

Open [suryaanshx.github.io](https://suryaanshx.github.io) on mobile, tap **Start Camera**, allow camera access, and hit **⚡ Invert**.

Works best on mobile with the rear camera. Sliders update the effect in real time.

---

## Files

```
standalone.html   ← the full app (single file)
index.html        ← entry point / redirect
src/              ← source assets
```

---

MIT License · Made by Suryansh Sharma
