
"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';

export interface BrainstormingSectionData {
  id: string;
  title: string;
  content: string;
}

interface BrainstormingSectionCardProps {
  section: BrainstormingSectionData;
  onTitleChange: (id: string, newTitle: string) => void;
  onContentChange: (id: string, newContent: string) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function BrainstormingSectionCard({
  section,
  onTitleChange,
  onContentChange,
  onCopy,
  onDelete,
}: BrainstormingSectionCardProps) {
  return (
    <Card className="shadow-lg flex flex-col bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 pt-4 px-4">
        <Input
          id={`title-${section.id}`}
          placeholder="Pad Title..."
          value={section.title}
          onChange={(e) => onTitleChange(section.id, e.target.value)}
          className="text-xl font-semibold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0 h-auto bg-transparent"
          aria-label="Pad Title"
        />
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4 flex-grow flex flex-col">
        <Textarea
          id={`content-${section.id}`}
          value={section.content}
          onChange={(e) => onContentChange(section.id, e.target.value)}
          placeholder="Start typing your ideas for this pad..."
          className="w-full flex-grow resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base p-0 h-48 bg-transparent"
          aria-label="Pad Content"
        />
      </CardContent>
      <CardFooter className="p-3 border-t flex justify-end gap-2 bg-muted/30">
        <Button variant="ghost" size="sm" onClick={() => onCopy(section.id)} className="text-muted-foreground hover:text-foreground">
          <Copy className="mr-2 h-4 w-4" />
          Copy Pad
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(section.id)} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Pad
        </Button>
      </CardFooter>
    </Card>
  );
}
