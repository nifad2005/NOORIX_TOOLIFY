
"use client";

import Link from 'next/link';
// import { SidebarTrigger } from "@/components/ui/sidebar"; // No longer needed
import { Home } from 'lucide-react';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shrink-0">
      {/* <div className="md:hidden"> // SidebarTrigger removed
        <SidebarTrigger />
      </div> */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Home className="h-6 w-6 text-primary" />
          <span className="sr-only">Toolify Home</span>
        </Link>
        <h1 className="text-xl font-semibold text-primary">Toolify</h1>
      </div>
      {/* Future elements like user profile can go here */}
    </header>
  );
}
