# ⚾ Fantasy Baseball HQ - Project Architecture & Details

This document serves as the master record for the Fantasy Baseball SaaS application, preserving the critical information regarding the mathematical evaluation logic, our dynamic UI, and backend architecture.

## 1. Mathematical Evaluation Core (fantasyBrain.js)
The app is powered by an autonomous, multi-format evaluation engine built seamlessly into the backend.
- **Dynamic Valuation System:** The app reads the user's Yahoo league settings (`settings.scoring_type`) and instantly branches player evaluations in real-time.
- **Head-to-Head Points Format:** 
  - Generates a "Value Over Replacement" (VOR) score based on strict Yahoo defaults (HRs = 10.4, R = 1.9, SB = 4.2).
  - Rewards pure volume accumulators and heavily rewards Innings-Eating SPs.
- **Rotisserie / Categories Format:** 
  - Shifts entirely to a **Standings Gain Points (SGP)** algorithm.
  - Radically changes how it values players. For instance, a Speedster (60 SBs / 5 HRs) is considered Elite in Roto, but Mediocre in Points.
  - Actively protects pitching ratios by issuing `DO NOT ROSTER` flags to volume pitchers with high ERAs / WHIPs in categorical formats.

## 2. Infrastructure & Hosting
- **Application Deployment:** The app is actively deployed and hosted via **Railway**.
- **Backend Architecture:** Node.js processing logic combined with Express to serve up data.
- **Integrations:** Yahoo API for live fantasy data combined with Anthropic's Claude AI for dynamic sports analyst commentary.
- **Safety Measures:** We established a git rollback branch (`backup/pre-math-overhaul`) to preserve stability before massive architectural rewrites.

## 3. Recommended Branding & Domains
To give the app a premium, standalone feel, the following domain options were researched and confirmed officially available to attach to the Railway deployment.
- **batflip.app** (The undisputed top choice for a punchy, modern baseball app)
- **pennantpush.com**
- **fantasyhq.app**
- *Action item: Register via Namecheap or Porkbun to secure cheap long-term renewal rates without hosting baggage.*

## 4. UI / UX Design
The frontend uses a modern, responsive "Glassmorphism" aesthetic with strict CSS media queries to support deep functionality across devices.
- **Desktop Layout:** Features a beautifully stylized permanent left-hand navigation bar bridging users to the Matchups, Standings, Waiver Wire, Trade Analyzer, etc.
- **Mobile & Tablet Layout:** Automatically hides the sidebar to save screen real estate and generates a "Hamburger Menu" (☰) on the top navigation bar. Every feature, including the Baseball 101 guide, stays fully accessible via the sliding drawer on mobile. 
