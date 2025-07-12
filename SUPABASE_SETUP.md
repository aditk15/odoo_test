# 🚀 Complete Supabase Setup Guide

This guide will help you set up Supabase authentication and database for your Q&A application.

## 📋 Prerequisites

1. Supabase account (free tier works fine)
2. Your Next.js project with the provided code

## 🛠️ Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project:
   - **Organization**: Choose or create one
   - **Name**: `qa-app` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait 2-3 minutes for the database to initialize

### 2. Get Project Credentials

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (starts with `https://...supabase.co`)
   - **Project API keys** > **anon** **public** (starts with `eyJ...`)

### 3. Update Environment Variables

Update your `.env.local` file with your actual credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Configure Authentication Settings

1. Go to **Authentication** > **Settings** in Supabase dashboard
2. Configure these settings:

#### Site URL Settings
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: Add `http://localhost:3000/**`

#### Email Settings (for development)
- ✅ **Enable email confirmations**: `OFF` (for easier testing)
- ✅ **Enable secure email change**: `OFF`
- ✅ **Double confirm email changes**: `OFF`

#### Password Requirements
- **Minimum password length**: `6`
- Other requirements: Leave unchecked for development

### 5. Run Database Setup

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the entire content from `scripts/complete-setup.sql`
4. Run the query

This will create:
- ✅ User profiles table
- ✅ Questions table  
- ✅ Answers table
- ✅ Votes table
- ✅ Row Level Security policies
- ✅ Automatic profile creation on user signup
- ✅ Database structure ready for your app

### 6. Add Sample Data (Optional)

After you register your first user account:
1. Go to **SQL Editor** in Supabase
2. Use the queries in `scripts/add-sample-data.sql`
3. Replace placeholder user IDs with real ones
4. Run to add sample questions

### 6. Test the Setup

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Test authentication:
   - Go to `/auth/register` and create an account
   - Check that you can login/logout
   - Verify you can ask questions when logged in
   - Questions list may be empty initially (that's normal)

3. Add sample data (optional):
   - Use `scripts/add-sample-data.sql` after registering users

## 🔒 Security Features Implemented

### Row Level Security (RLS)
- ✅ Questions are viewable by everyone
- ✅ Only authenticated users can create questions
- ✅ Users can only edit their own questions
- ✅ Same rules apply to answers and votes

### Automatic Profile Creation
- ✅ User profile is automatically created when someone signs up
- ✅ Profile includes username, email, and metadata

### Authentication Flow
- ✅ Questions visible to everyone (no login required)
- ✅ Question creation requires authentication
- ✅ Proper login/logout functionality
- ✅ Protected routes for authenticated actions

## 🎯 Testing Checklist

Test these scenarios to ensure everything works:

### Authentication
- [ ] Register a new account
- [ ] Login with existing account
- [ ] Logout successfully
- [ ] Try accessing protected pages without login

### Questions
- [ ] View questions without being logged in
- [ ] Create a question while logged in
- [ ] Try to create a question while logged out (should redirect to login)
- [ ] Edit your own questions
- [ ] Cannot edit other users' questions

### Navigation
- [ ] Navigation shows different options for logged in/out users
- [ ] Proper redirects after login/logout

## 🚀 Production Setup

When ready for production:

1. **Enable email confirmations** in Authentication settings
2. **Update site URLs** to your production domain
3. **Set stronger password requirements**
4. **Configure email templates** for branded emails
5. **Add additional auth providers** (Google, GitHub, etc.)
6. **Set up custom SMTP** for emails
7. **Configure proper CORS** settings

## 🔧 Troubleshooting

### Common Issues

**"Cannot find module '@supabase/supabase-js'"**
- Run: `pnpm install`

**Authentication not working**
- Check environment variables are correct
- Verify Supabase URL and anon key
- Check browser network tab for errors

**Database errors**
- Ensure you ran the complete-setup.sql script
- Check Supabase logs in dashboard
- Verify RLS policies are enabled

**Questions not showing**
- Check if sample data was inserted
- Verify the questions table exists
- Check browser console for errors

### Need Help?

1. Check Supabase logs in the dashboard
2. Look at browser console for JavaScript errors
3. Verify network requests in browser dev tools
4. Check that environment variables are loaded

## 📝 Sample User Accounts

After running the setup script:
- The database structure will be ready
- No sample data is included initially
- Create your first account through the registration page
- Use `scripts/add-sample-data.sql` to add sample questions after registration

Enjoy building your Q&A platform! 🎉
