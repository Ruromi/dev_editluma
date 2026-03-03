# EditLuma — Landing Image Prompts

> Generated: 2026-03-03
> Status: **SVG self-generated** (IDEOGRAM_API_KEY unavailable at time of generation)
> When IDEOGRAM_API_KEY becomes available, use these prompts to replace the SVG placeholders.

---

## Assets Overview

| File | Type | Description |
|------|------|-------------|
| `hero-main.svg` | Hero | Before/after comparison — low-res vs 4K AI enhanced |
| `feature-enhance.svg` | Feature card | AI upscaling pixel grid → smooth photo |
| `feature-generate.svg` | Feature card | Neural network generating an image |
| `feature-music.svg` | Feature card | Waveform + music notes BGM auto-sync |
| `gallery-1.svg` | Gallery | Aurora mountain landscape, AI enhanced |
| `gallery-2.svg` | Gallery | Nighttime city silhouette, AI enhanced |
| `gallery-3.svg` | Gallery | Abstract space portal, AI generated |

---

## Ideogram Prompts (for future use)

### hero-main (1200×600)

```
A dramatic side-by-side comparison of AI image enhancement. Left half: blurry,
low-resolution, desaturated photo of a mountain lake at dusk. Right half: the same
scene crystal clear, vibrant colors, sharp details at 4K resolution. A glowing
purple-violet AI symbol in the center divides them. Dark cinematic tone,
professional photography, moody lighting.
Style: digital art, cinematic, dark theme
Aspect ratio: 2:1
```

### feature-enhance (400×280)

```
A close-up comparison card showing AI image upscaling. Left: a pixelated, noisy
low-quality image square with blocky artifacts. Right: the same image perfectly
sharp, crisp, and detailed. A glowing arrow labeled "AI" connects them.
Dark indigo and purple color palette, tech aesthetic, flat UI card style.
Style: UI illustration, dark mode, tech
Aspect ratio: 10:7
```

### feature-generate (400×280)

```
Abstract visualization of AI image generation. A glowing neural network with
interconnected nodes arranged in a circle, converging to a bright glowing center
point where an image materializes from energy. Sparkle particles, purple and cyan
colors, dark background. The word "Generating..." displayed below.
Style: digital art, tech UI illustration, dark mode, abstract
Aspect ratio: 10:7
```

### feature-music (400×280)

```
A digital audio editing interface showing two track timelines stacked vertically.
Top track: a muted grey video waveform. Bottom track: a vibrant green-to-cyan
equalizer with animated bars synchronized to music. Floating musical notes
surrounding the interface. Dark background, professional music studio aesthetic.
Style: UI illustration, dark mode, music tech
Aspect ratio: 10:7
```

### gallery-1 (400×300)

```
Stunning AI-enhanced photograph of a mountain landscape with aurora borealis
(northern lights) reflecting in a still mountain lake. Deep purple and green sky,
snow-capped peaks, crystal water. Ultra-high resolution detail. Cinematic
composition, cold atmosphere.
Style: photography, AI enhanced, cinematic
Aspect ratio: 4:3
```

### gallery-2 (400×300)

```
AI-enhanced nighttime cityscape silhouette. Dark building outlines against a deep
purple-indigo sky. Warm yellow and orange windows lit throughout. Rain-wet streets
reflecting city lights below. Moody, cinematic, high-contrast noir aesthetic.
Style: photography, AI enhanced, cinematic noir
Aspect ratio: 4:3
```

### gallery-3 (400×300)

```
AI-generated abstract digital art: a glowing cosmic portal or vortex in deep space.
Concentric rings of violet and magenta light. A bright white singularity at center
radiating energy beams. Stars and nebula in background. Otherworldly, epic,
ultra-detailed digital painting.
Style: digital art, AI generated, cosmic, abstract
Aspect ratio: 4:3
```

---

## How to regenerate with Ideogram API

Set `IDEOGRAM_API_KEY` in your environment, then run:

```bash
# Example using ideogram v2 API
curl -X POST https://api.ideogram.ai/generate \
  -H "Api-Key: $IDEOGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_request": {
      "prompt": "<paste prompt above>",
      "aspect_ratio": "ASPECT_2_1",
      "model": "V_2",
      "style_type": "REALISTIC"
    }
  }'
```

Save downloaded images to `web/public/landing/` with the filenames above.
