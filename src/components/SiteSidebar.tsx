
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { toolsList, toolCategories, Tool, ToolCategory } from '@/lib/tools';
import { Home, Settings, LogOut } from 'lucide-react'; // Assuming you might add settings/logout later

export default function SiteSidebar() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredToolsByCategories = useMemo(() => {
    if (!searchTerm) {
      const grouped: { [key: string]: Tool[] } = {};
      toolsList.forEach(tool => {
        if (!grouped[tool.category]) {
          grouped[tool.category] = [];
        }
        grouped[tool.category].push(tool);
      });
      return toolCategories
        .map(category => ({
          ...category,
          tools: grouped[category.id] || []
        }))
        .filter(category => category.tools.length > 0);
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filteredGrouped: { [key: string]: Tool[] } = {};
    
    toolsList
      .filter(tool =>
        tool.name.toLowerCase().includes(lowerSearchTerm) ||
        tool.description.toLowerCase().includes(lowerSearchTerm)
      )
      .forEach(tool => {
        if (!filteredGrouped[tool.category]) {
          filteredGrouped[tool.category] = [];
        }
        filteredGrouped[tool.category].push(tool);
      });

    return toolCategories
      .map(category => ({
        ...category,
        tools: filteredGrouped[category.id] || []
      }))
      .filter(category => category.tools.length > 0);
  }, [searchTerm]);

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader className="p-2">
        <Link href="/" className="flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent">
            <Home className="w-7 h-7 text-primary" />
            <span className="font-semibold text-lg text-primary group-data-[collapsible=icon]:hidden">Toolify</span>
        </Link>
        <SidebarInput 
          placeholder="Search tools..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="group-data-[collapsible=icon]:hidden mt-2"
        />
      </SidebarHeader>
      <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />
      <SidebarContent className="p-2">
        <SidebarMenu>
          {filteredToolsByCategories.map((category) => (
            <SidebarGroup key={category.id}>
              <SidebarGroupLabel className="flex items-center gap-2">
                <category.icon className="w-4 h-4" />
                <span className="group-data-[collapsible=icon]:hidden">{category.name}</span>
              </SidebarGroupLabel>
              {category.tools.map((tool) => (
                <SidebarMenuItem key={tool.id}>
                  <Link href={tool.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === tool.href}
                      tooltip={{ children: tool.name, side: 'right', align: 'center' }}
                    >
                      <a>
                        <tool.icon className="w-4 h-4" />
                        <span className="group-data-[collapsible=icon]:hidden">{tool.name}</span>
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarGroup>
          ))}
          {filteredToolsByCategories.length === 0 && searchTerm && (
            <p className="p-2 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden text-center">No tools found.</p>
          )}
        </SidebarMenu>
      </SidebarContent>
      {/* <SidebarSeparator />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton tooltip={{ children: 'Settings', side: 'right', align: 'center' }}>
              <Settings className="w-4 h-4" />
              <span className="group-data-[collapsible=icon]:hidden">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: 'Log out', side: 'right', align: 'center' }}>
              <LogOut className="w-4 h-4" />
              <span className="group-data-[collapsible=icon]:hidden">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  );
}
