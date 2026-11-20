import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RepairPassport",
    template: "%s · RepairPassport",
  },
  description:
    "A digital maintenance passport for household appliances: upload repair bills, let AI extract the details, and keep a shareable repair history.",
};

/**
 * Root layout: wraps every page in the app.
 * It only sets up <html>, <body>, fonts and global styles. Headers, footers
 * and navigation live in the route-group layouts, e.g. app/(marketing)/layout.tsx,
 * so the marketing site and the dashboard can look different.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {/*
          Hidden until focused with Tab: lets keyboard and screen-reader
          users jump past the navigation straight to the page content.
        */}
        <a
          href="#main-content"
          className="sr-only z-50 rounded-lg bg-brand px-4 py-2 font-medium text-background focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
