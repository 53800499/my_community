import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ConfirmationProvider } from "@/context/ConfirmationContext";
import { ToastProvider, ErrorBoundary } from "@/features/errors";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Community Bénin — Plateforme Citoyenne & Gestion Territoriale",
  description:
    "Écosystème unifié pour la vie citoyenne, la gestion des résidences & campus universitaires et la trésorerie associative en République du Bénin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans transition-colors">
        <ThemeProvider>
          <ConfirmationProvider>
            <ToastProvider>
              <ErrorBoundary>{children}</ErrorBoundary>
            </ToastProvider>
          </ConfirmationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
