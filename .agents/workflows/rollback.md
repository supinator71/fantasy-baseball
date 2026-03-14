---
description: How to rollback or switch between versions of the fantasy baseball app
---

# Version Management & Rollback

## Available Versions

| Tag / Branch | Description | Status |
|---|---|---|
| `v1.0-stable` | Original working app — basic AI, no historical stats | Safe fallback |
| `v2.0-pro-analytics` | **Pro analytics + MLB Stats API + clean prose + data trust** | ✅ **CURRENT BASELINE** |
| `master` branch | What Railway deploys (currently = v2.0) | Production |
| `feature/stats-and-graphics` | Synced with master, for future experiments | Development |

## Quick Commands

// turbo-all

### Use the current working version (v2.0 pro analytics)
```
git -C c:\Users\supri\projects\fantasy-baseball checkout master
```

### Rollback to v1.0 (pre-analytics, basic AI)
```
git -C c:\Users\supri\projects\fantasy-baseball checkout v1.0-stable
```

### Rollback to v2.0 (pro analytics baseline)
```
git -C c:\Users\supri\projects\fantasy-baseball checkout v2.0-pro-analytics
```

### Switch to feature branch for experiments
```
git -C c:\Users\supri\projects\fantasy-baseball checkout feature/stats-and-graphics
```

### Emergency: hard reset master to a specific tag
```
git -C c:\Users\supri\projects\fantasy-baseball checkout master
git -C c:\Users\supri\projects\fantasy-baseball reset --hard v2.0-pro-analytics
git -C c:\Users\supri\projects\fantasy-baseball push --force
```

### Merge feature branch into master when ready to ship
```
git -C c:\Users\supri\projects\fantasy-baseball checkout master
git -C c:\Users\supri\projects\fantasy-baseball merge feature/stats-and-graphics
git -C c:\Users\supri\projects\fantasy-baseball push
```

## Notes
- **Railway deploys from `master`** — other branches/tags won't go live until merged
- Both tags (`v1.0-stable`, `v2.0-pro-analytics`) are pushed to GitHub and cannot be accidentally overwritten
- Always commit work on the feature branch before switching
