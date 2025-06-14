
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, PlusCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import BrainstormingSectionCard, { type BrainstormingSectionData } from './BrainstormingSectionCard';

const LOCAL_STORAGE_KEY = 'brainstormingToolSections_v1';

export default function BrainstormingTool() {
  const [sections, setSections] = useState<BrainstormingSectionData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDataString) {
      try {
        const savedSections: BrainstormingSectionData[] = JSON.parse(savedDataString);
        if (Array.isArray(savedSections)) {
          setSections(savedSections);
        } else {
           // Handle case where old single object data might exist, or invalid data
           localStorage.removeItem(LOCAL_STORAGE_KEY);
           setSections([{ id: Date.now().toString(), title: '', content: '' }]);
        }
      } catch (error) {
        console.error("Failed to parse brainstorming sections from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setSections([{ id: Date.now().toString(), title: '', content: '' }]); // Start with one empty section if parsing fails
      }
    } else {
      // Start with one empty section if no data found
      setSections([{ id: Date.now().toString(), title: '', content: '' }]);
    }
  }, []);

  const saveDataToLocalStorage = useCallback((updatedSections: BrainstormingSectionData[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSections));
  }, []);

  const handleAddNewSection = useCallback(() => {
    const newSection: BrainstormingSectionData = {
      id: Date.now().toString(), // Simple unique ID
      title: '',
      content: '',
    };
    const updatedSections = [...sections, newSection];
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

      {sections.length === 0 && !localStorage.getItem(LOCAL_STORAGE_KEY) && ( // Show only if truly empty initial state
         <div className="text-center py-10 flex-grow">
            <p className="text-xl text-muted-foreground">No brainstorming pads yet. Click "Add New Pad" to start!</p>
        </div>
      )}

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
    </div>
  );
}
