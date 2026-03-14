---
description: How to rollback or switch between stable and feature branches for the fantasy baseball app
---

# Rollback / Branch Management

The stable working version is tagged as `v1.0-stable` on the `master` branch.

## Switch back to the stable working version
```
git -C c:\Users\supri\projects\fantasy-baseball checkout master
```

## Switch to the feature branch for experimental work
```
git -C c:\Users\supri\projects\fantasy-baseball checkout feature/stats-and-graphics
```

## Emergency rollback to the exact tagged stable version
```
git -C c:\Users\supri\projects\fantasy-baseball checkout v1.0-stable
```

## Discard all experimental changes and reset to stable
```
git -C c:\Users\supri\projects\fantasy-baseball checkout master
git -C c:\Users\supri\projects\fantasy-baseball reset --hard v1.0-stable
```

## Merge feature branch into master when ready to ship
```
git -C c:\Users\supri\projects\fantasy-baseball checkout master
git -C c:\Users\supri\projects\fantasy-baseball merge feature/stats-and-graphics
```

## Notes
- **Railway deploys from `master`** — feature branch changes won't go live until merged
- The `v1.0-stable` tag is pushed to GitHub and cannot be accidentally overwritten
- Always commit work on the feature branch before switching branches
