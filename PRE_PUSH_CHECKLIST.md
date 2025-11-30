# 🚨 Pre-Push Checklist - READ BEFORE PUSHING TO GITHUB! 🚨

## ✅ Complete this checklist BEFORE `git push`:

### 1. Environment Files
- [ ] `.env` file exists locally (with your real keys)
- [ ] `.env` is listed in `.gitignore`
- [ ] `.env.example` has NO real secrets (only placeholders)
- [ ] Run: `git status` - `.env` should NOT appear

### 2. Search for Hardcoded Secrets
Run these commands to check for leaked secrets:

```bash
# Check for Gemini API keys
grep -r "AIza" . --exclude-dir=node_modules --exclude-dir=dist --exclude=.env

# Check for Supabase keys
grep -r "eyJ" . --exclude-dir=node_modules --exclude-dir=dist --exclude=.env

# Check for "password" strings
grep -r "password.*=" . --exclude-dir=node_modules --exclude-dir=dist --exclude=.env
```

All commands should return NO results (or only matches in .env.example, SECURITY.md, or this file).

### 3. Verify Code Changes
- [ ] All API keys use environment variables:
  - `import.meta.env.VITE_GEMINI_API_KEY` in frontend
  - `Deno.env.get("GEMINI_API_KEY")` in Edge Functions
- [ ] No hardcoded URLs with credentials
- [ ] No commented-out code with secrets

### 4. Test Build
```bash
npm run build
```
- [ ] Build completes successfully
- [ ] No errors or warnings about missing env vars

### 5. Review Git Status
```bash
git status
```

**Files that SHOULD appear:**
- ✅ Source code files (.ts, .tsx, .js, .jsx)
- ✅ .gitignore
- ✅ .env.example
- ✅ README.md, SECURITY.md
- ✅ package.json, package-lock.json
- ✅ Configuration files (vite.config.ts, etc.)

**Files that should NOT appear:**
- ❌ .env
- ❌ .env.local
- ❌ .env.production
- ❌ Any file with "secret" or "key" in name
- ❌ node_modules
- ❌ dist folder

### 6. Final Security Check
```bash
# Check what will be committed
git diff --cached

# Look for these patterns:
# - AIza... (Gemini API keys)
# - eyJ... (JWT tokens)
# - sk-... (Secret keys)
# - Any long random strings
```

### 7. Safe to Push!
If all checks pass:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

---

## 🆘 If You Find a Secret in Your Code:

### Immediate Actions:

1. **DO NOT push to GitHub!**
2. Remove the secret from the code
3. Move it to `.env` file
4. Update code to use environment variable
5. Verify: `grep -r "THE_SECRET" .` returns no results
6. Test the app still works
7. Then commit and push

### If You Already Pushed a Secret:

1. **ROTATE THE SECRET IMMEDIATELY:**
   - Gemini: Generate new key at https://aistudio.google.com/app/apikey
   - Supabase: Reset keys in Dashboard → Settings → API

2. **Remove from Git history:**
   ```bash
   # This will rewrite history - use with caution!
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file/with/secret" \
     --prune-empty --tag-name-filter cat -- --all

   git push origin --force --all
   ```

3. **Update all deployments** with new secrets

---

## 📋 Quick Reference

### Where secrets should be:

**Frontend (.env file):**
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_GEMINI_API_KEY=your_key
```

**Edge Functions (Supabase secrets):**
```bash
supabase secrets set GEMINI_API_KEY=your_key
```

### How to use secrets in code:

**Frontend:**
```typescript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

**Edge Functions:**
```typescript
const apiKey = Deno.env.get("GEMINI_API_KEY");
```

---

## ✨ You're Ready to Push!

Once all checkboxes are ✅, you're safe to push to GitHub!

Remember: It's always better to double-check than to leak secrets! 🔐
