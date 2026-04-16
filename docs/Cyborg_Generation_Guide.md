# Goin' Yard: Cyborg Generation Guide

This document preserves the exact mathematical prompt formula and reference files required to consistently generate illustrations of the "Goin' Yard" cyborg mascot.

By using this guide, any future AI agent or generation tool can maintain the exact same cyberpunk face, armor geometry, and gritty neon aesthetic without hallucinating different cyborg variations.

## Core Reference Images (The "DNA")
To force the AI to maintain the exact character design, you must pass these specific images as **Style References** to the image generator:
1. `client/public/cyborg_mascot_bat.png`
2. `client/public/cyborg_batter_ready.png`

*These two images combined provide the generator with the front-facing helmet geometry, the glowing eye slit, the heavy armor pads, and the gritty gradient lighting expected for the project.*

## The Master Prompt Formula

When generating a new image, use this foundational prompt structure:

> "A stylized neon cyberpunk vector art character of a tough-looking cyborg baseball player in the exact same art style, character design, and aesthetic as the provided reference images. **[INSERT ACTION/POSE HERE]**. **[INSERT BACKGROUND HERE]**. Match the specific cyborg helmet, armor geometry, and dark/neon pink and blue lighting perfectly from the reference images. Clean, high-quality, without anatomical errors."

### Example 1: Changing the Pose
If you want the exact same cyborg and background, but just want him catching a pop-fly:

> "A stylized neon cyberpunk vector art character of a tough-looking cyborg baseball player in the exact same art style, character design, and aesthetic as the provided reference images. **He is looking up and catching a pop-fly baseball in his glowing glove.** **The background is a futuristic neon baseball stadium**. Match the specific cyborg helmet, armor geometry, and dark/neon pink and blue lighting perfectly from the reference images. Clean, high-quality, without extra baseballs or anatomical errors."

### Example 2: Changing the Background
If you want the exact same cyborg character, but want him jogging through a futuristic city for a unique trading card:

> "A stylized neon cyberpunk vector art character of a tough-looking cyborg baseball player in the exact same art style and character design as the provided reference images. **He is jogging forward with a baseball bat resting on his shoulder**. **The background is completely different: a sprawling, rainy, neon-lit cyberpunk city street at midnight.** Match the specific cyborg helmet and armor geometry perfectly from the reference images, but adapt the neon pink and blue lighting to fit the city environment."

---

## Technical Considerations for Generating Trading Cards
If you are generating horizontal trading cards (like the sliding "Pro" cards) instead of square icons, be sure to append:
> "Horizontal aspect ratio. Include an ornate, glowing holographic card border around the character. If text is included, use arcane, unrecognizable alien hieroglyphics instead of English letters."
