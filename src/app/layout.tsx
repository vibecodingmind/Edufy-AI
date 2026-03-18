import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

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
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
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
