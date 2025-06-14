
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, Eraser, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'brainstormingPadData';

interface BrainstormingData {
  title: string;
  content: string;
}

export default function BrainstormingTool() {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const savedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDataString) {
      try {
        const savedData: BrainstormingData = JSON.parse(savedDataString);
        setTitle(savedData.title || '');
        setContent(savedData.content || '');
      } catch (error) {
        console.error("Failed to parse brainstorming data from localStorage", error);
        // Fallback if parsing fails
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  const saveDataToLocalStorage = useCallback((newTitle: string, newContent: string) => {
    const data: BrainstormingData = { title: newTitle, content: newContent };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, []);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    saveDataToLocalStorage(newTitle, content);
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent(newContent);
    saveDataToLocalStorage(title, newContent);
  };

  const handleClearContent = useCallback(() => {
    setTitle('');
    setContent('');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast({
      title: "Content Cleared",
      description: "Your brainstorming pad has been cleared.",
    });
  }, [toast]);

  const handleCopyAll = useCallback(() => {
    if (!title && !content) {
      toast({
        title: "Nothing to Copy",
        description: "The title and content are empty.",
        variant: "default",
      });
      return;
    }
    const textToCopy = `${title}\n\n${content}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast({
          title: "Copied to Clipboard!",
          description: "Title and content have been copied.",
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy text to clipboard. See console for details.",
          variant: "destructive",
        });
      });
  }, [title, content, toast]);

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8">
      <header className="text-center mb-6 md:mb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary flex items-center justify-center">
          <Brain className="w-10 h-10 md:w-12 md:h-12 mr-3" />
          Brainstorming Pad
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2">
          Your digital scratchpad. Ideas are saved automatically to your browser.
        </p>
      </header>

      <Card className="shadow-xl flex-grow flex flex-col">
        <CardHeader>
          <div className="space-y-1">
            <Label htmlFor="brainstorm-title" className="text-sm font-medium">Title</Label>
            <Input
              id="brainstorm-title"
              placeholder="Enter a title for your session..."
              value={title}
              onChange={handleTitleChange}
              className="text-lg"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-grow flex flex-col">
          <Label htmlFor="brainstorm-content" className="sr-only">Content</Label>
          <Textarea
            id="brainstorm-content"
            value={content}
            onChange={handleContentChange}
            placeholder="Start typing your ideas here..."
            className="w-full h-full flex-grow resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-b-lg text-base p-4 md:p-6"
            aria-label="Brainstorming Pad Content"
          />
        </CardContent>
        <CardFooter className="p-4 border-t flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={handleCopyAll}>
            <Copy className="mr-2 h-4 w-4" />
            Copy All
          </Button>
          <Button variant="outline" onClick={handleClearContent}>
            <Eraser className="mr-2 h-4 w-4" />
            Clear Pad
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
