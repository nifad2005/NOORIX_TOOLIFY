
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import SiteHeader from '@/components/SiteHeader';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-body">
      <head>
        <title>Toolify - Your Online Utilities</title> 
        <meta name="description" content="A suite of handy online tools." /> 
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col w-full bg-background">
        <SiteHeader />

        <main className="flex-1 flex flex-col overflow-auto px-4 md:px-10 py-6">
          {children}
        </main>

        <footer className="text-center text-sm text-gray-400 py-6 border-t border-border">
          A product by <a href="https://noorix.vercel.app/" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer"> NOORIX </a>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
