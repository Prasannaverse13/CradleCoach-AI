# 🚀 Push to GitHub - Complete Guide

## Step 1: Initialize Git Repository

```bash
cd /path/to/your/project
git init
```

## Step 2: Run Security Check

**IMPORTANT:** Run this before your first commit!

```bash
./check-secrets.sh
```

This will verify:
- ✅ No API keys in code
- ✅ .env is not tracked
- ✅ .env.example exists

## Step 3: Configure Git

```bash
# Set your name and email
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 4: Stage Files

```bash
# Add all files (except those in .gitignore)
git add .

# Verify what will be committed
git status
```

**You should see:**
- ✅ .env.example
- ✅ .gitignore
- ✅ src/ files
- ✅ All other project files

**You should NOT see:**
- ❌ .env (should be ignored)
- ❌ node_modules/ (should be ignored)
- ❌ dist/ (should be ignored)

## Step 5: First Commit

```bash
git commit -m "Initial commit: CradleCoach AI parenting app"
```

## Step 6: Create GitHub Repository

1. Go to https://github.com
2. Click "New Repository" (+ icon in top right)
3. Name it: `cradlecoach-ai` (or your preferred name)
4. **DO NOT** initialize with README (we already have one)
5. Click "Create Repository"

## Step 7: Push to GitHub

GitHub will show you commands. Use these:

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 8: Set Up Secrets for Deployment

### For Vercel/Netlify:

1. Go to your deployment platform
2. Import your GitHub repository
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
4. Deploy!

### For Supabase Edge Functions:

```bash
# Link your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set GEMINI_API_KEY=your_gemini_api_key

# Deploy functions
supabase functions deploy parenting-chat
supabase functions deploy generate-story
supabase functions deploy send-welcome-email
```

## Step 9: Update README on GitHub

Your README.md is already comprehensive! But you may want to update:

1. Replace placeholder images/links
2. Add your actual GitHub repository URL
3. Add deployment status badges (optional)
4. Add your contact information

## Step 10: Protect Your Repository

On GitHub, go to Settings → Branches:

1. Add branch protection rules for `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

---

## 🔒 Security Reminders

### NEVER push these:
- ❌ `.env` file
- ❌ Any file with actual API keys
- ❌ Database backups
- ❌ Service role keys

### Safe to push:
- ✅ Source code
- ✅ `.env.example` (with placeholders)
- ✅ `.gitignore`
- ✅ Configuration files
- ✅ README, SECURITY.md

---

## 🆘 Troubleshooting

### "File .env is tracked by git"

```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

### "Found API key in code"

1. Remove the key from code
2. Move it to `.env`
3. Update code to use environment variable:
   ```typescript
   const key = import.meta.env.VITE_YOUR_KEY;
   ```
4. Commit the fixed code

### "Can't push to GitHub"

```bash
# Check remote
git remote -v

# If wrong, update it
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Try again
git push -u origin main
```

---

## 📝 Collaboration Setup

If you want others to contribute:

1. **Add collaborators** on GitHub: Settings → Collaborators
2. **Create .github/CONTRIBUTING.md** with guidelines
3. **Set up GitHub Actions** for CI/CD (optional)
4. **Enable Dependabot** for security updates

---

## ✅ Verification Checklist

After pushing, verify on GitHub:

- [ ] Can you see all your code?
- [ ] Is `.env` NOT visible in the repository?
- [ ] Does `.env.example` have only placeholders?
- [ ] Does README.md display correctly?
- [ ] Are no API keys visible in any file?

---

## 🎉 You're Done!

Your code is now safely on GitHub with no exposed secrets!

### Next Steps:
1. Deploy to Vercel/Netlify
2. Share the repository with your team
3. Start accepting contributions
4. Build amazing features!

**Remember:** Every time you commit, run `./check-secrets.sh` to verify no secrets leaked!
