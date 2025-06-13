
"use client"; // Required for potential client-side hooks in SiteHeader or children, though not directly used here for sidebar logic anymore

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import SiteHeader from '@/components/SiteHeader';
// import { usePathname } from 'next/navigation'; // No longer needed for sidebar logic

// Metadata needs to be exported from a server component or statically.
// For a dynamic title/description, you'd typically use the `generateMetadata` function in page.tsx files.
// Basic fallback meta tags are included directly in the <head> below.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const pathname = usePathname(); // No longer needed
  // const isToolPage = pathname.startsWith('/tools/'); // No longer needed

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Toolify - Your Online Utilities</title> {/* Basic fallback title */}
        <meta name="description" content="A suite of handy online tools." /> {/* Basic fallback description */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased w-screen flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 flex flex-col w-full overflow-auto"> {/* Ensure main content area can grow and scroll if needed */}
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
