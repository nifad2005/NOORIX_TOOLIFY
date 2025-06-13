
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import SiteSidebar from '@/components/SiteSidebar'; // We will create this
import SiteHeader from '@/components/SiteHeader'; // We will create this

export const metadata: Metadata = {
  title: 'Toolify - Your Suite of Handy Online Utilities',
  description: 'Toolify provides a collection of easy-to-use online tools, including an image compressor, image converter, and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider defaultOpen>
          <div className="flex min-h-screen">
            <SiteSidebar />
            <SidebarInset className="flex-1 flex flex-col">
              <SiteHeader />
              <main className="flex-1 p-4 md:p-6 overflow-auto">
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
