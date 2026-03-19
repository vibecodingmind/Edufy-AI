import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8faf5' },
    { media: '(prefers-color-scheme: dark)', color: '#1a2e1a' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "EDUC.AI - AI-Powered Exam Generation Platform",
    template: "%s | EDUC.AI"
  },
  description: "Generate professional school exams automatically using AI. Trusted by teachers across Africa for curriculum-aligned exam papers.",
  keywords: ["EDUC.AI", "Education", "Exam Generator", "AI", "Teachers", "Curriculum", "NECTA", "Tanzania", "Africa", "School Exams"],
  authors: [{ name: "EDUC.AI Team" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "EDUC.AI - AI-Powered Exam Generation",
    description: "Generate professional school exams automatically using AI. Trusted by teachers across Africa.",
    type: "website",
    siteName: "EDUC.AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "EDUC.AI - AI-Powered Exam Generation",
    description: "Generate professional school exams automatically using AI.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EDUC.AI',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
