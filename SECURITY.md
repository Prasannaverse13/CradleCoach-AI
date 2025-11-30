# Security Policy

## Overview

CradleCoach takes security seriously. This document outlines our security practices and how to safely set up and deploy the application.

## Important Security Checklist

Before pushing to GitHub or deploying:

- [ ] All API keys are in `.env` file (NOT in code)
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has no real secrets
- [ ] No hardcoded credentials in any file
- [ ] Supabase RLS policies are enabled on all tables
- [ ] Edge Functions use environment variables for secrets

---

## Environment Variables

### Never Commit These Files:
- `.env`
- `.env.local`
- `.env.production`
- Any file containing actual API keys or secrets

### Frontend Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**⚠️ IMPORTANT:**
- The `VITE_SUPABASE_ANON_KEY` is safe to expose in frontend code (it's public by design)
- Never use `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- The Gemini API key in frontend is visible to users - use rate limiting on Gemini side

### Backend (Edge Functions) Secrets

For Supabase Edge Functions, set secrets using the Supabase CLI:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
```

These secrets are automatically available as environment variables in Edge Functions via `Deno.env.get()`.

---

## API Keys Required

### 1. Supabase Keys

**Where to get them:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon/Public Key → `VITE_SUPABASE_ANON_KEY`

**Security Notes:**
- ✅ Anon key is safe for frontend (protected by RLS)
- ❌ NEVER use Service Role key in frontend
- ✅ Service Role key is auto-available in Edge Functions

### 2. Google Gemini API Key

**Where to get it:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy it to `VITE_GEMINI_API_KEY`

**Security Notes:**
- ⚠️ Frontend usage exposes key to users
- ✅ Use Google's built-in rate limiting
- ✅ For production, proxy through Edge Functions
- ✅ Set up billing alerts on Google Cloud

---

## Row Level Security (RLS)

All database tables have RLS enabled. This means:

- Users can ONLY see their own data
- Even with the anon key, cross-user access is impossible
- Parents can only access their children's data
- SQL injection is prevented by Supabase's parameterized queries

### RLS Policies Summary:

```sql
-- Example: Parents can only see their own children
CREATE POLICY "Parents can view own children"
  ON children FOR SELECT
  TO authenticated
  USING (parent_id = (select auth.uid()));
```

Every table has similar policies for SELECT, INSERT, UPDATE, DELETE.

---

## Secure Deployment

### Before Deploying:

1. **Check for secrets in code:**
   ```bash
   # Search for potential secrets
   grep -r "AIza" . --exclude-dir=node_modules
   grep -r "sk-" . --exclude-dir=node_modules
   grep -r "password" . --exclude-dir=node_modules
   ```

2. **Verify .gitignore:**
   ```bash
   git status
   # .env should NOT appear in the list
   ```

3. **Test with fake keys:**
   - Before committing, replace keys with `"YOUR_KEY_HERE"`
   - Test that app shows proper error messages
   - Restore real keys in local `.env`

### Production Environment Variables:

**For Vercel/Netlify:**
1. Go to project settings
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
3. Redeploy

**For Supabase Edge Functions:**
```bash
# Set secrets
supabase secrets set GEMINI_API_KEY=your_key

# Verify secrets are set
supabase secrets list

# Deploy functions
supabase functions deploy parenting-chat
supabase functions deploy generate-story
```

---

## Security Best Practices Implemented

### 1. Authentication
- ✅ JWT-based authentication via Supabase
- ✅ Password hashing with bcrypt
- ✅ Session management with secure cookies
- ✅ Email verification (optional)

### 2. Authorization
- ✅ Row Level Security on all tables
- ✅ User can only access their own data
- ✅ Foreign key constraints enforced
- ✅ Cascade deletes for data integrity

### 3. Input Validation
- ✅ SQL injection prevention (Supabase parameterized queries)
- ✅ XSS prevention (React escapes by default)
- ✅ CORS headers on Edge Functions
- ✅ Type validation with TypeScript

### 4. Data Protection
- ✅ Encrypted at rest (Supabase default)
- ✅ HTTPS everywhere
- ✅ No sensitive data in logs
- ✅ No PII in error messages

### 5. API Security
- ✅ Rate limiting (Gemini API built-in)
- ✅ API key rotation support
- ✅ Graceful degradation when API fails
- ✅ Medical disclaimers on AI responses

---

## What's Safe to Commit to GitHub

### ✅ Safe to commit:
- Source code (`.ts`, `.tsx`, `.js`, `.jsx`)
- Configuration files (`vite.config.ts`, `tailwind.config.js`)
- `.env.example` (with placeholder values)
- `.gitignore`
- Migration files
- Edge Function code (without hardcoded keys)
- `VITE_SUPABASE_ANON_KEY` in examples (it's designed to be public)

### ❌ NEVER commit:
- `.env` file
- Any file with actual API keys
- `SUPABASE_SERVICE_ROLE_KEY`
- Private keys (`.key`, `.pem`)
- User data or database backups
- Access tokens or session cookies

---

## Incident Response

If you accidentally commit a secret:

### 1. Rotate the secret immediately:
- **Gemini API Key:** Delete and create new key in Google AI Studio
- **Supabase Keys:** Reset in Supabase Dashboard → Settings → API

### 2. Remove from Git history:
```bash
# Remove file from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (if already pushed)
git push origin --force --all
```

### 3. Update all deployments:
- Update environment variables on hosting platform
- Redeploy application
- Test that old keys no longer work

---

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please email: security@cradlecoach.ai (example)

**Do NOT:**
- Open a public GitHub issue
- Share details publicly

**Do:**
- Email us privately
- Give us reasonable time to fix (90 days)
- We'll credit you in our security hall of fame

---

## Security Audit Checklist

Run this checklist before every major release:

- [ ] No hardcoded secrets in code
- [ ] `.env` in `.gitignore`
- [ ] All RLS policies tested
- [ ] Edge Functions use env vars for secrets
- [ ] CORS properly configured
- [ ] Rate limiting in place
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies updated (no known vulnerabilities)
- [ ] Medical disclaimers present on health advice
- [ ] Data export/deletion functionality works

---

## Secure Development Workflow

```
1. Clone repo
2. Copy .env.example to .env
3. Fill in your own API keys
4. NEVER git add .env
5. Code your feature
6. Check for secrets: grep -r "AIza" .
7. Commit (without .env)
8. Push to GitHub ✅
```

---

## Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google API Security](https://cloud.google.com/docs/security/best-practices)

---

**Remember:** Security is not a one-time task. Review and update security practices regularly.

Last Updated: 2024-11-30
