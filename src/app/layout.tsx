
"use client"; // Required for usePathname

// import type { Metadata } from 'next'; // Metadata type is no longer needed here
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import SiteSidebar from '@/components/SiteSidebar';
import SiteHeader from '@/components/SiteHeader';
import { usePathname } from 'next/navigation';

// Metadata needs to be exported from a server component or statically.
// Since RootLayout is now a client component, we can't export metadata directly from here.
// For a dynamic title/description, you'd typically use the `generateMetadata` function in page.tsx files.
// For a static one, you could define it here but it's better practice to keep RootLayout as server if possible,
// or move this to a template.tsx if that remains server.
// The metadata export has been removed to resolve the build error.
// export const metadata: Metadata = {
//   title: 'Toolify - Your Suite of Handy Online Utilities',
//   description: 'Toolify provides a collection of easy-to-use online tools, including an image compressor, image converter, and more.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isToolPage = pathname.startsWith('/tools/');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Toolify - Your Online Utilities</title> {/* Basic fallback title */}
        <meta name="description" content="A suite of handy online tools." /> {/* Basic fallback description */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider defaultOpen={!isToolPage}> {/* Collapse sidebar on tool pages */}
          <div className="flex min-h-screen">
            <SiteSidebar />
            <SidebarInset className="flex-1 flex flex-col">
              <SiteHeader />
              <main className="flex-1 overflow-auto flex flex-col items-center">
                {children}
              </main>
              <Toaster />
            </SidebarInset>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
