
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { toolsList, toolCategories, Tool, ToolCategory } from '@/lib/tools';
import { Home } from 'lucide-react';

interface ToolCategoryWithTools extends ToolCategory {
  tools: Tool[];
}

interface ToolCategoryDisplayProps {
  category: ToolCategoryWithTools;
  pathname: string;
}

const ToolCategoryDisplay: React.FC<ToolCategoryDisplayProps> = ({ category, pathname }) => {
  if (category.tools.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2 text-sidebar-primary font-semibold">
        <category.icon className="w-5 h-5" />
        <span className="group-data-[collapsible=icon]:hidden">{category.name}</span>
      </SidebarGroupLabel>
      {category.tools.map((tool) => (
        <SidebarMenuItem key={tool.id}>
          <Link href={tool.href} legacyBehavior passHref>
            <SidebarMenuButton
              asChild
              isActive={pathname === tool.href}
              tooltip={{ children: tool.name, side: 'right', align: 'center' }}
              className="group-data-[collapsible=icon]:justify-center"
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
  );
};

export default function SiteSidebar() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredToolsByCategories = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const categoriesWithTools: ToolCategoryWithTools[] = toolCategories.map(category => {
      const toolsInThisCategory = toolsList.filter(tool => 
        tool.category === category.id &&
        (
          !lowerSearchTerm || // if no search term, include all
          tool.name.toLowerCase().includes(lowerSearchTerm) ||
          tool.description.toLowerCase().includes(lowerSearchTerm) ||
          category.name.toLowerCase().includes(lowerSearchTerm) // also search category name
        )
      );
      return { ...category, tools: toolsInThisCategory };
    }).filter(category => category.tools.length > 0); // Only keep categories that have matching tools

    // If search term exists but no categories match directly,
    // check if any tool name/description matched and show its category
    if (lowerSearchTerm && categoriesWithTools.length === 0) {
        const anyToolMatched = toolsList.some(tool => 
            tool.name.toLowerCase().includes(lowerSearchTerm) ||
            tool.description.toLowerCase().includes(lowerSearchTerm)
        );
        if (anyToolMatched) {
            return toolCategories.map(category => {
                const toolsInThisCategory = toolsList.filter(tool =>
                    tool.category === category.id &&
                    (tool.name.toLowerCase().includes(lowerSearchTerm) ||
                     tool.description.toLowerCase().includes(lowerSearchTerm))
                );
                return { ...category, tools: toolsInThisCategory };
            }).filter(category => category.tools.length > 0);
        }
    }


    return categoriesWithTools;
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
            <ToolCategoryDisplay key={category.id} category={category} pathname={pathname} />
          ))}
          {filteredToolsByCategories.length === 0 && searchTerm && (
            <p className="p-2 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden text-center">No tools found for "{searchTerm}".</p>
          )}
           {filteredToolsByCategories.length === 0 && !searchTerm && toolsList.length > 0 && (
             <p className="p-2 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden text-center">No categories to display.</p>
           )}
           {toolsList.length === 0 && (
             <p className="p-2 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden text-center">No tools available yet.</p>
           )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
