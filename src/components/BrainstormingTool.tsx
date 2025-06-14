
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import BrainstormingSectionCard, { type BrainstormingSectionData } from './BrainstormingSectionCard';

const LOCAL_STORAGE_KEY = 'brainstormingToolSections_v1';

export default function BrainstormingTool() {
  // Start with a default state that doesn't rely on localStorage
  const [sections, setSections] = useState<BrainstormingSectionData[]>([{ id: 'initial-pad', title: '', content: '' }]);
  const { toast } = useToast();

  // useEffect to load data from localStorage only on the client-side after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDataString) {
        try {
          const savedSections: BrainstormingSectionData[] = JSON.parse(savedDataString);
          if (Array.isArray(savedSections) && savedSections.length > 0) {
            setSections(savedSections);
          } else {
             // Handle case where old single object data might exist, or invalid data
             localStorage.removeItem(LOCAL_STORAGE_KEY);
             // Keep the initial default pad if localStorage is empty or invalid after parsing
             if (sections.length === 1 && sections[0].id === 'initial-pad' && !sections[0].title && !sections[0].content) {
                // If it's still the default, don't overwrite with a new default unless localStorage was truly empty
             } else {
                setSections([{ id: Date.now().toString(), title: '', content: '' }]);
             }
          }
        } catch (error) {
          console.error("Failed to parse brainstorming sections from localStorage", error);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          // Fallback to a single empty section if parsing fails, but preserve if current is just the default initial
           if (!(sections.length === 1 && sections[0].id === 'initial-pad' && !sections[0].title && !sections[0].content)) {
            setSections([{ id: Date.now().toString(), title: '', content: '' }]);
          }
        }
      } else {
         // If no data in localStorage, and current state is the initial-pad, keep it.
         // Otherwise, if sections were somehow cleared or different, initialize a new default pad.
         if (sections.length === 0 || (sections.length > 0 && sections[0].id !== 'initial-pad')) {
            setSections([{ id: Date.now().toString(), title: '', content: '' }]);
         }
      }
    }
  }, []); // Empty dependency array ensures this runs once on mount (client-side)

  const saveDataToLocalStorage = useCallback((updatedSections: BrainstormingSectionData[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSections));
    }
  }, []);

  const handleAddNewSection = useCallback(() => {
    const newSection: BrainstormingSectionData = {
      id: Date.now().toString(), // Simple unique ID
      title: '',
      content: '',
    };
    // If the only section is the 'initial-pad' and it's empty, replace it. Otherwise, add.
    const updatedSections = sections.length === 1 && sections[0].id === 'initial-pad' && !sections[0].title && !sections[0].content
      ? [newSection]
      : [...sections, newSection];
      
    setSections(updatedSections);
    saveDataToLocalStorage(updatedSections);
    toast({
      title: "New Pad Added",
      description: "A new brainstorming pad has been created.",
    });
  }, [sections, saveDataToLocalStorage, toast]);

  const handleTitleChange = useCallback((id: string, newTitle: string) => {
    const updatedSections = sections.map(section =>
      section.id === id ? { ...section, title: newTitle } : section
    );
    setSections(updatedSections);
    saveDataToLocalStorage(updatedSections);
  }, [sections, saveDataToLocalStorage]);

  const handleContentChange = useCallback((id: string, newContent: string) => {
    const updatedSections = sections.map(section =>
      section.id === id ? { ...section, content: newContent } : section
    );
    setSections(updatedSections);
    saveDataToLocalStorage(updatedSections);
  }, [sections, saveDataToLocalStorage]);

  const handleDeleteSection = useCallback((id: string) => {
    if (sections.length <= 1) {
        toast({
            title: "Cannot Delete Last Pad",
            description: "You must have at least one brainstorming pad.",
            variant: "default"
        });
        return;
    }
    const updatedSections = sections.filter(section => section.id !== id);
    setSections(updatedSections);
    saveDataToLocalStorage(updatedSections);
    toast({
      title: "Pad Deleted",
      description: "The brainstorming pad has been removed.",
    });
  }, [sections, saveDataToLocalStorage, toast]);

  const handleCopySection = useCallback((id: string) => {
    const sectionToCopy = sections.find(section => section.id === id);
    if (sectionToCopy) {
      if (!sectionToCopy.title && !sectionToCopy.content) {
        toast({
          title: "Nothing to Copy",
          description: "The pad title and content are empty.",
          variant: "default",
        });
        return;
      }
      const textToCopy = `Title: ${sectionToCopy.title}\n\nContent:\n${sectionToCopy.content}`;
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          toast({
            title: "Pad Copied!",
            description: "Pad title and content copied to clipboard.",
          });
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          toast({
            title: "Copy Failed",
            description: "Could not copy pad content. See console for details.",
            variant: "destructive",
          });
        });
    }
  }, [sections, toast]);
  
  // Conditional rendering for the "no pads yet" message
  // Show if sections array is empty OR if it only contains the placeholder 'initial-pad' and it's untouched.
  const showNoPadsMessage = sections.length === 0 || 
                           (sections.length === 1 && sections[0].id === 'initial-pad' && !sections[0].title && !sections[0].content && typeof window !== 'undefined' && !localStorage.getItem(LOCAL_STORAGE_KEY));


  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 pb-4 border-b">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary flex items-center">
            <Brain className="w-8 h-8 md:w-10 md:h-10 mr-3" />
            Multi-Pad Brainstorming
          </h1>
          <p className="text-md text-muted-foreground mt-1">
            Create and manage multiple brainstorming pads. Your work is saved automatically.
          </p>
        </div>
        <Button onClick={handleAddNewSection} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Pad
        </Button>
      </header>

      {showNoPadsMessage && (
         <div className="text-center py-10 flex-grow">
            <p className="text-xl text-muted-foreground">No brainstorming pads yet. Click "Add New Pad" to start!</p>
        </div>
      )}

      {!showNoPadsMessage && (
        <div className="space-y-6 flex-grow overflow-y-auto pb-8">
          {sections.map(section => (
            <BrainstormingSectionCard
              key={section.id}
              section={section}
              onTitleChange={handleTitleChange}
              onContentChange={handleContentChange}
              onCopy={handleCopySection}
              onDelete={handleDeleteSection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
