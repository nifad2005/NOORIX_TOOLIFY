
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Eraser } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'brainstormingPadContent';

export default function BrainstormingTool() {
  const [content, setContent] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const savedContent = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent(newContent);
    localStorage.setItem(LOCAL_STORAGE_KEY, newContent);
  };

  const handleClearContent = useCallback(() => {
    setContent('');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast({
      title: "Content Cleared",
      description: "Your brainstorming pad has been cleared.",
    });
  }, [toast]);

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
        <CardContent className="p-0 flex-grow flex">
          <Textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Start typing your ideas here..."
            className="w-full h-full flex-grow resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-t-lg text-base p-4 md:p-6"
            aria-label="Brainstorming Pad Content"
          />
        </CardContent>
        <CardFooter className="p-4 border-t flex justify-end">
          <Button variant="outline" onClick={handleClearContent}>
            <Eraser className="mr-2 h-4 w-4" />
            Clear Pad
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
