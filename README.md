# ✦ Yuvi Stark — Cambia Visione

A bespoke real-time camera experience built exclusively for **Yuvi Stark**, a renowned contemporary artist known for his bold visual language and boundary-pushing creative work.

---

## About Yuvi Stark

Yuvi Stark is a celebrated artist whose practice spans painting, photography, and digital media. His work explores the tension between light and shadow, the familiar and the unseen — transforming ordinary moments into visceral visual experiences. This app is an extension of that artistic vision: a tool that lets viewers see the world the way Yuvi sees it.

*EphiphyllumPrize x Yuvi Stark*

---

## About the App

**Cambia Visione** ("Change Vision" in Italian) is a real-time photographic negative camera effect, purpose-built as a creative instrument for Yuvi Stark and his audience.

Point your camera at anything — a painting, a face, a room — and the app inverts reality. Dark becomes light, colours flip to their complements, and the world reveals a hidden layer that exists just beneath the surface.

The effect is not a simple CSS filter. It processes every pixel individually:

1. **Full inversion** — each RGB channel is flipped to its photographic negative
2. **Contrast at 200%** — values are pulled hard away from midtone grey, eliminating the washed-out look of standard invert filters
3. **Saturation at 180%** — colours are amplified in HSL space, making the negative rich and vivid rather than muted
4. **Zero threshold** — every pixel in the frame is transformed, with no areas left untouched

The result is the kind of negative that feels alive — the way a darkroom print looks when you first pull it from the developer.

---

## Features

- Real-time rear camera processing at up to 1280×720
- True pixel-level negative with contrast and saturation control
- **Cambia Visione** toggle to switch between normal and inverted view
- Direct link to Yuvi Stark's Instagram
- No dependencies, no framework — single HTML file, runs entirely in the browser
- Works on iOS and Android via any modern mobile browser

---

## Follow Yuvi Stark

Instagram: [@yuvistark](https://www.instagram.com/yuvistark)

---

## Tech

- Vanilla JS + HTML5 Canvas (`getImageData` / `putImageData`)
- `getUserMedia` rear camera stream
- Hosted on GitHub Pages — zero backend, zero build step

---

## Files

```
index.html          ← the full app (single self-contained file)
standalone.html     ← standalone reference copy
.github/workflows/  ← GitHub Pages deployment
src/                ← legacy React source (no longer used)
```

---

*Built with care for an artist who sees the world differently.*

MIT License · Developed for Yuvi Stark
