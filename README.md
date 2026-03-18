# EDUC.AI - AI-Powered Exam Generation Platform

<div align="center">
  
  ![EDUC.AI Banner](https://img.shields.io/badge/EDUC.AI-AI%20Exam%20Generator-059669?style=for-the-badge)
  
  **World-class AI-powered exam generation platform for teachers and educators**
  
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vibecodingmind/Edufy-AI&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL,NEXT_PUBLIC_APP_URL&envDescription=Environment%20variables%20needed%20for%20EDUC.AI&envLink=https://github.com/vibecodingmind/Edufy-AI#environment-variables)
  [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?templateUrl=https://github.com/vibecodingmind/Edufy-AI)
  
  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
  [![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)](https://stripe.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## ✨ Features

### 🎯 Core Features
- **AI-Powered Exam Generation** - Generate complete exams aligned with curriculum
- **Question Bank** - Save, organize, tag, and reuse questions
- **Exam Templates** - 8 pre-made templates for quick creation
- **Bulk Import/Export** - CSV and Excel support
- **Version History** - Track all changes to exams
- **Share & Collaborate** - Public links with expiration dates

### 🤖 AI Tools
- **AI Answer Generator** - Generate model answers automatically
- **Difficulty Predictor** - AI predicts question difficulty
- **Smart Suggestions** - Get AI-powered question suggestions
- **Marking Rubric Generator** - Create detailed rubrics instantly

### 👤 User Management
- **Google OAuth** - One-click login with Google
- **Email Verification** - Secure email confirmation
- **Password Reset** - Secure password recovery
- **API Keys** - Programmatic access for developers

### 💳 Subscriptions
- **Stripe Integration** - Secure payment processing
- **4 Subscription Plans** - Free, Pro, School, District
- **Billing Portal** - Self-service billing management

### 📊 Analytics
- **Usage Analytics** - Track exam generation and AI usage
- **Topic Coverage Map** - Visualize curriculum coverage
- **Export Reports** - PDF and Excel exports

### 🔧 Technical
- **PWA Support** - Install as app, works offline
- **Multi-language** - English, Kiswahili, French
- **Dark/Light Mode** - System preference support
- **Responsive Design** - Works on all devices

---

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vibecodingmind/Edufy-AI)

### Deploy to Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?templateUrl=https://github.com/vibecodingmind/Edufy-AI)

---

## 📦 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | SQLite with Prisma ORM |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Auth** | NextAuth.js (Google, Credentials) |
| **Payments** | Stripe |
| **AI** | z-ai-web-dev-sdk |
| **Email** | Nodemailer |

---

## 🔧 Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL="file:./db/custom.db"

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-characters"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe (Optional)
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"

# Email SMTP (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="EDUC.AI <noreply@educ.ai>"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🏃 Quick Start

```bash
# Clone the repository
git clone https://github.com/vibecodingmind/Edufy-AI.git
cd Edufy-AI

# Install dependencies
bun install

# Setup database
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Teacher | `user@test.com` | `password123` |
| Admin | `admin@test.com` | `admin123` |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── api/              # 30+ API Routes
│   │   ├── ai/           # AI Tools APIs
│   │   ├── auth/         # Authentication APIs
│   │   ├── stripe/       # Payment APIs
│   │   └── ...
│   ├── components/       # React Components
│   └── page.tsx          # Main Application
├── lib/                  # Utilities
│   ├── auth.ts           # Auth helpers
│   ├── stripe.ts         # Stripe config
│   ├── email.ts          # Email templates
│   └── db.ts             # Database client
├── i18n/                 # Internationalization
└── components/ui/        # shadcn/ui Components
```

---

## 🚢 Deployment Guides

### Vercel (Recommended)
1. Click "Deploy with Vercel" button above
2. Connect your GitHub
3. Add environment variables
4. Deploy!

### Railway
1. Click "Deploy on Railway" button above
2. Connect your GitHub
3. Add environment variables
4. Deploy!

---

## 📄 License

MIT License

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

<div align="center">
  
  Built with ❤️ by [EDUC.AI Team](https://github.com/vibecodingmind)
  
  
  ⭐ Star us on GitHub — it motivates us!
  
</div>
