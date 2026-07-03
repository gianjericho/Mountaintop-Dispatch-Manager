import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DispatchProvider } from "@/context/DispatchContext";
import { ToastProvider } from "@/components/layout/ToastContainer";
import DevTools from "@/components/dev/DevTools";
import Script from "next/script";
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
  title: "Dispatch Manager",
  description: "Mountaintop Dispatch Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-100 pb-24 transition-colors duration-300">
        <AuthProvider>
          <DispatchProvider>
            <ToastProvider>
              {children}
              <DevTools />
            </ToastProvider>
          </DispatchProvider>
        </AuthProvider>
        <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
