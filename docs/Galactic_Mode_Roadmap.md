# UI/UX & Systems Roadmap: Galactic Mode & Token Card Matrix

This document preserves the strategic roadmap for introducing "Galactic Mode"—a comprehensive multi-sport gamified layer—into the Goin' Yard HQ platform.

## 1. Visual Architecture: The 'Galactic Mode' Toggle

The transition from the professional research environment to the gamified layer is managed by the "Galactic Mode" toggle, a global state switch integrated into the Goin' Yard HQ Next.js application.

*   **UI Component Strategy:** The toggle is a high-order React component residing in the primary navigation header. Activating it triggers a site-wide CSS-in-JS transformation. The "Standard" view—grounded in the 2026 MLB, NBA, and NFL statistical rosters—utilizes a clean, high-density grid layout for research. Upon activation, a framer-motion transition injects cosmic overlays: neon-bordered containers, SVG celestial background animations, and localized "nebula" glows that highlight high-value players like Shohei Ohtani (LAD) or Luka Doncic (LAL).
*   **State Management & Persistence:** To ensure architectural stability, the `galacticModeEnabled` state is managed via the Context API. To prevent UI flickering and maintain the user's preference across sessions (e.g., if a user refreshes while analyzing Aaron Rodgers' 2026 PIT projections), state is persisted using a server-side cookie via Next.js Middleware. This allows for zero-layout-shift (ZLS) rendering, where the server knows the theme before the initial HTML is dispatched to the client.
*   **Performance Optimization:** We utilize asset pre-fetching and lazy-loading for the heavy "Galactic" canvas animations. This ensures that the "Standard" research mode maintains its Core Web Vitals, only loading the immersive cosmic assets when the toggle is engaged.

---

## 2. The Statcast-to-Planetary Mapping Matrix

The mapping system translates 2026 multi-sport performance metrics into cosmic unlocks. Thresholds are defined as provisional variables based on 2026 Razzball Rater quintiles.

| Sport / Metric | Planetary Domain | 2026 Player Example | Unlock Condition (Provisional Logic) |
| :--- | :--- | :--- | :--- |
| **MLB: xERA** | The Iron Core of Mars | Gerrit Cole (NYY) | 202Preseason Top 10% (xERA < 3.30) |
| **MLB: Bolts** | The Gas Rings of Saturn | Shohei Ohtani (LAD) | Sprint Speed > 90th Razzball Percentile |
| **NBA: True Shooting %** | The Clouds of Venus | Luka Doncic (LAL) | Top Quintile of 2026 NBA Player Rater |
| **NFL: Air Yards** | The Moons of Jupiter | Marvin Harrison Jr. (ARI) | Projected > 1,200 Yards (Razzball NFL Tool) |
| **MLB: Swords** | The Sun | Paul Skenes (PIT) | SwStr% exceeding Steamer 2026 Mean |

---

## 3. Token-Based Economy & Achievement Design

The "Galactic Economy" converts real-world predictive accuracy into digital currency. This system is architected to reward users of specific Razzball subscriber tools.

### Achievement Triggers

1.  **Streamonator Accuracy:** Selecting a "Winning" start (as defined by the 2026 Best 100 Pitching Starts list) earns *Pitching Precision Tokens*.
2.  **Hittertron Success:** Fielding a daily lineup that outperforms the 2026 Preseason Hittertron mean generates *Slugger Shards*.
3.  **War Room Utilization:** Active roster management and trade evaluation via the War Room tool unlocks *General’s Credits*.

### Conversion Engine: Fantasy Points to Galactic Tokens

The "Player Rater" serves as the ground-truth API for all conversions.

*   **Direct Exchange:** Every 10.0 points accumulated on the 2026 Season-to-Date Player Rater (MLB, NBA, or NFL) converts to 1 Galactic Token.
*   **The Prospect Multiplier:** Rostering a player found in the "Top 100 Prospects" list (e.g., Jackson Holliday or Walker Jenkins) grants a 1.5x Token Multiplier on all points earned while they are active on the roster.
*   **Scarcity Logic:** Achievement math is calculated server-side to prevent client-side manipulation, with the final balance synced to the user’s Subscriber Homepage wallet.

---

## 4. Digital Asset Hierarchy: Cyborgs & Holographic Parallels

Assets are tiered to reflect both current performance and long-term value as defined by the 2026 rankings.

*   **Tier 1: Standard Projections**
    *   Basic cards representing the "2026 Preseason Projections" for all active players (e.g., Saquon Barkley - PHI or Giannis Antetokounmpo - MIL).
*   **Tier 2: Cyborg Enhancements**
    *   Users spend Pitching Precision Tokens or Slugger Shards to "upgrade" a player. A Cyborg Mookie Betts (LAD) features real-time Statcast visualizations and enhanced metadata overlays derived from the Razzball/Steamer API.
*   **Tier 3: Rare Holographic Parallels**
    *   These are rare chase cards with scarcity logic strictly tied to the "Top 100 Prospects" and "Top 100 Starting Pitchers" categories.
    *   The mint count for these assets is inversely proportional to their rank (e.g., the #1 Prospect has a lower mint count than #50). These utilize the `next/image` component with custom shaders to create the "Holographic" visual effect.

---

## 5. Technical Implementation Roadmap (Next.js)

A phased integration plan for the development team.

*   [ ] **Data Pipeline Setup:** Develop Next.js API routes (`/api/stats/2026`) to fetch and normalize data from the 2026 MLB/NBA/NFL rosters and the Prospectonator feed.
*   [ ] **Persistent Theme Provider:** Implement the `GalacticThemeProvider` using the Context API, ensuring theme state is synced to a theme-preference cookie for server-side rendering (SSR) compatibility.
*   [ ] **Client-Side Token Wallet:** Deploy the Token Wallet as a Client Component (`'use client'`) on the Subscriber Homepage, enabling real-time hydration of token balances without full-page reloads.
*   [ ] **Visual Asset Optimization:** Integrate the `next/image` component for all "Cyborg" and "Holographic" cards, utilizing priority loading and AVIF formatting to ensure 2026 visuals don't degrade performance.
*   [ ] **Automated Unlock Engine:** Write a Cron job or serverless function to compare 2026 Season-to-Date Player Rater data against planetary thresholds to trigger automatic asset minting.

---

## 6. Glossary of Galactic Terms

*   **Hittertron-X:** The cosmic version of Hittertron, mapping 2026 exit velocity to orbital trajectories.
*   **The Oracle of Andromeda:** The Galactic Mode equivalent of The Razzbot, providing AI-driven trade advice.
*   **Pitching Precision Tokens:** Currency earned exclusively through accurate Streamonator pitcher streaming.
*   **SAGNOF Warp Drive:** The gamified implementation of "Saves and Gross Number of Fellows," used to hyper-accelerate the collection of relief pitcher assets.
*   **Slugger Shards:** Universal fragments earned through hitting milestones (MLB/NFL/NBA) used to construct Tier 2 Cyborg variants.
*   **War Room Command:** The administrative dashboard where General’s Credits are used to manage multi-sport planetary assets.
