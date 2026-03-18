# EDUC.AI Deployment Guide

## 🚀 Complete Deployment Instructions for Railway & Vercel

---

## PART 1: RAILWAY DEPLOYMENT

### Step 1: Create Railway Account
1. Open: **https://railway.app**
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (use the same account that has your repo)
4. Authorize Railway to access your repositories

### Step 2: Create New Project
1. After signing in, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select **"vibecodingmind/Edufy-AI"**
4. Click **"Deploy Now"**

### Step 3: Add PostgreSQL Database (IMPORTANT!)
1. In your project view, click **"+ Add Service"**
2. Select **"Database"**
3. Click **"Add PostgreSQL"**
4. Wait for PostgreSQL to be provisioned (takes ~30 seconds)

### Step 4: Connect Database to Your App
1. Click on your **PostgreSQL** service
2. Go to **"Variables"** tab
3. Copy the `DATABASE_URL` value
4. Go back to your **main web service**
5. Go to **"Variables"** tab
6. Add these variables:

```env
# Database (Copy from PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}
DIRECT_DATABASE_URL=${{Postgres.DATABASE_URL}}

# NextAuth (Generate your own secret)
NEXTAUTH_SECRET=CHANGE_THIS_TO_A_RANDOM_32_CHAR_STRING

# App URL (Railway provides this automatically)
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Google OAuth (Get from console.cloud.google.com)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe (Get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email SMTP (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI API Key
Z_AI_API_KEY=your-z-ai-api-key
```

### Step 5: Generate NEXTAUTH_SECRET
Run this command in your terminal to generate a secure secret:
```bash
openssl rand -base64 32
```
Copy the output and paste it as your `NEXTAUTH_SECRET`

### Step 6: Deploy
1. Railway will automatically deploy when you add variables
2. Click on your **web service** → **"Deployments"** tab
3. Wait for the deployment to complete (~2-5 minutes)
4. Click the generated URL to view your app!

### Step 7: Run Database Migrations
After first successful deployment:
1. Go to your **web service** → **"Settings"** tab
2. Find **"Deploy"** section
3. Add a **"Start Command"**:
   ```
   npx prisma migrate deploy && node server.js
   ```
4. Redeploy the service

---

## PART 2: VERCEL DEPLOYMENT

### Step 1: Create Vercel Account
1. Open: **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your repositories

### Step 2: Import Your Project
1. After signing in, click **"Add New..."** → **"Project"**
2. Find **"vibecodingmind/Edufy-AI"** in the list
3. Click **"Import"**

### Step 3: Configure Project Settings
- **Framework Preset:** Next.js (should auto-detect)
- **Root Directory:** ./ (leave as default)
- **Build Command:** `prisma generate && next build`
- **Install Command:** `bun install`
- **Output Directory:** (leave empty)

### Step 4: Add PostgreSQL Database
1. Before deploying, go to **"Storage"** tab at the top
2. Click **"Create Database"**
3. Select **"Neon"** (PostgreSQL)
4. Choose a database name (e.g., "educai-db")
5. Select a region close to you
6. Click **"Create"**

### Step 5: Connect Database
1. After database is created, click **"Connect to Project"**
2. Select your EDUC.AI project
3. The `DATABASE_URL` will be automatically added

### Step 6: Add Environment Variables
In the project import screen, expand **"Environment Variables"** and add:

```env
# Database (Auto-added by Vercel when you connect Neon)
DATABASE_URL=<auto-filled>
DIRECT_DATABASE_URL=<same-as-database-url>

# NextAuth Secret (Generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI API
Z_AI_API_KEY=your-api-key
```

### Step 7: Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (~3-5 minutes)
3. You'll see confetti when it's ready! 🎉
4. Click **"Visit"** to see your live app

### Step 8: Run Migrations (Vercel)
After first deployment:
1. Go to your project **"Settings"** → **"Environment Variables"**
2. Add a variable called `RUN_MIGRATIONS` with value `true`
3. Or use Vercel CLI:
   ```bash
   npx vercel env pull .env.local
   npx prisma migrate deploy
   ```

---

## PART 3: POST-DEPLOYMENT SETUP

### Update Google OAuth Callback URLs
Go to **Google Cloud Console** → **APIs & Services** → **Credentials**:
- Add authorized JavaScript origins:
  - `https://your-app.railway.app`
  - `https://your-app.vercel.app`
- Add authorized redirect URIs:
  - `https://your-app.railway.app/api/auth/callback/google`
  - `https://your-app.vercel.app/api/auth/callback/google`

### Update Stripe Webhooks
Go to **Stripe Dashboard** → **Developers** → **Webhooks**:
- Add endpoint: `https://your-app.railway.app/api/stripe/webhook`
- Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`

---

## 🔧 TROUBLESHOOTING

### Build Fails on Railway
- Check the build logs
- Ensure all environment variables are set
- Make sure `DATABASE_URL` is correctly referenced

### Database Connection Error
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure `DIRECT_DATABASE_URL` is also set

### Authentication Not Working
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your domain
- Check Google OAuth callback URLs

---

## 📝 MINIMUM REQUIRED VARIABLES

To get your app running, you need AT MINIMUM:

```env
DATABASE_URL=<postgresql-connection-string>
DIRECT_DATABASE_URL=<postgresql-connection-string>
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=<your-app-url>
Z_AI_API_KEY=<your-api-key>
```

Other variables can be added later for full functionality.

---

## 🎯 QUICK SUMMARY

| Platform | Steps | Time |
|----------|-------|------|
| Railway | 7 steps | ~10 min |
| Vercel | 8 steps | ~10 min |

Both platforms will auto-deploy when you push to GitHub!
