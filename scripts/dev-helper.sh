# Quick Development Helper Commands

echo "🚀 Supabase Q&A App Development Helper"
echo "======================================"
echo ""

# Check if environment variables are set
if [ -f .env.local ]; then
    echo "✅ .env.local file exists"
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "✅ Supabase environment variables are set"
    else
        echo "❌ Missing Supabase environment variables in .env.local"
        echo "   Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    fi
else
    echo "❌ .env.local file not found"
    echo "   Create .env.local with your Supabase credentials"
fi

echo ""
echo "📋 Setup Checklist:"
echo "1. ✅ Created Supabase project"
echo "2. ✅ Updated .env.local with credentials"
echo "3. ⬜ Ran scripts/complete-setup.sql in Supabase SQL Editor"
echo "4. ⬜ Configured authentication settings"
echo "5. ⬜ Tested registration and login"
echo ""

echo "🛠️ Development Commands:"
echo "Start development server:"
echo "  pnpm dev"
echo ""
echo "Build for production:"
echo "  pnpm build"
echo ""
echo "📊 Quick Test URLs (after starting dev server):"
echo "  Home (view questions): http://localhost:3000"
echo "  Register: http://localhost:3000/auth/register"
echo "  Login: http://localhost:3000/auth/login"
echo "  Ask Question: http://localhost:3000/ask"
echo ""

echo "🔍 Debugging Tips:"
echo "- Check browser console for JavaScript errors"
echo "- Check Supabase logs in dashboard"
echo "- Verify network requests in browser dev tools"
echo "- Run verify-setup.sql to check database"
echo ""

echo "📚 Files to review:"
echo "  - SUPABASE_SETUP.md (complete setup guide)"
echo "  - scripts/complete-setup.sql (database schema)"
echo "  - scripts/verify-setup.sql (verification queries)"
