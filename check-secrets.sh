#!/bin/bash

echo "🔍 Checking for exposed secrets..."
echo ""

# Check for Gemini API keys
echo "1️⃣ Checking for Gemini API keys..."
if grep -r "AIza" . --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git --exclude=".env" --exclude="*.md" --exclude="check-secrets.sh" 2>/dev/null; then
    echo "❌ FOUND GEMINI API KEY IN CODE!"
    exit 1
else
    echo "✅ No Gemini API keys found in code"
fi

echo ""

# Check for Supabase JWT tokens
echo "2️⃣ Checking for Supabase keys..."
if grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" . --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git --exclude=".env" --exclude="*.md" --exclude="check-secrets.sh" 2>/dev/null; then
    echo "❌ FOUND SUPABASE KEY IN CODE!"
    exit 1
else
    echo "✅ No Supabase keys found in code"
fi

echo ""

# Check if .env is in git
echo "3️⃣ Checking if .env is tracked by git..."
if git ls-files --error-unmatch .env 2>/dev/null; then
    echo "❌ .env IS TRACKED BY GIT!"
    echo "Run: git rm --cached .env"
    exit 1
else
    echo "✅ .env is not tracked by git"
fi

echo ""

# Check if .env.example exists
echo "4️⃣ Checking for .env.example..."
if [ -f ".env.example" ]; then
    echo "✅ .env.example exists"
else
    echo "⚠️ .env.example not found (recommended)"
fi

echo ""
echo "✅ ALL CHECKS PASSED! Safe to push to GitHub!"
echo ""
echo "Next steps:"
echo "  git add ."
echo "  git commit -m 'Your message'"
echo "  git push origin main"
