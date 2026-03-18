# EDUC.AI - AI-Powered Exam Generation Platform

🚀 **World-class exam generation platform powered by AI**

## 🌐 Live Demo

- **Vercel**: [Deploy your own](https://vercel.com/new/clone?repository-url=https://github.com/vibecodingmind/Edufy-AI)
- **Railway**: [Deploy on Railway](https://railway.app/new/template)

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: NextAuth.js (Google OAuth, Credentials)
- **Payments**: Stripe
- **AI**: z-ai-web-dev-sdk
- **Email**: Nodemailer

## 🔧 Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL="file:./db/custom.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="EDUC.AI <noreply@educ.ai>"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/vibecodingmind/Edufy-AI.git
cd Edufy-AI

# Install dependencies
bun install

# Setup database
bun run db:push

# Seed subscription plans
bun run prisma/seed-subscriptions.ts

# Create test users (optional)
bun run scripts/create-test-users.ts

# Start development server
bun run dev
```

## 📱 Features

### Core Features
- ✅ AI-Powered Exam Generation
- ✅ Question Bank Management
- ✅ Exam Templates
- ✅ Bulk Import/Export (CSV, Excel)
- ✅ PDF Export
- ✅ Version History
- ✅ Share & Collaborate

### AI Tools
- ✅ AI Answer Generator
- ✅ Difficulty Predictor
- ✅ Smart Question Suggestions
- ✅ Marking Rubric Generator

### User Management
- ✅ Google OAuth
- ✅ Email Verification
- ✅ Password Reset
- ✅ API Keys

### Subscriptions
- ✅ Stripe Integration
- ✅ 4 Subscription Plans (Free, Pro, School, District)
- ✅ Billing Portal

### Technical
- ✅ PWA Support
- ✅ Multi-language (English, Kiswahili)
- ✅ Dark/Light Mode
- ✅ Responsive Design

## 🧪 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Teacher | user@test.com | password123 |
| Admin | admin@test.com | admin123 |

## 📂 Project Structure

```
src/
├── app/
│   ├── api/           # API Routes
│   ├── components/    # React Components
│   └── page.tsx       # Main Application
├── lib/               # Utilities
├── i18n/              # Internationalization
└── components/ui/     # shadcn/ui Components
```

## 🚢 Deployment

### Vercel (Recommended)

1. Fork this repository
2. Go to [Vercel](https://vercel.com)
3. Import your forked repository
4. Add environment variables
5. Deploy!

### Railway

1. Fork this repository
2. Go to [Railway](https://railway.app)
3. New Project → Deploy from GitHub
4. Add environment variables
5. Deploy!

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

---

Built with ❤️ by EDUC.AI Team
