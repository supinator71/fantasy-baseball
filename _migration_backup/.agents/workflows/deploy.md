---
description: Deploy fantasy baseball app changes to Railway via git push
---

# Deploy to Railway

After making code changes to the fantasy baseball app, deploy them with these steps:

// turbo-all

1. Stage all changes:
```
git -C c:\Users\supri\projects\fantasy-baseball add -A
```

2. Commit with a descriptive message:
```
git -C c:\Users\supri\projects\fantasy-baseball commit -m "<descriptive commit message>"
```

3. Push to trigger Railway auto-deploy:
```
git -C c:\Users\supri\projects\fantasy-baseball push
```

4. Railway will automatically build and deploy. The build takes ~1-2 minutes. You can check status at https://railway.app.

**Notes:**
- All commands use `-C` flag to target the project directory since the workspace root may differ.
- Use PowerShell-compatible syntax (no `&&` chaining — run commands separately).
- If `npm install` is needed first, use: `npm install --prefix c:\Users\supri\projects\fantasy-baseball`
