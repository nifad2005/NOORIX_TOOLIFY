
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, Save } from 'lucide-react';
import type { OutputFormat } from '@/lib/imageEditorTypes';

interface ImageEditorToolbarProps {
  onNewImage: () => void;
  outputFormat: OutputFormat;
  onOutputFormatChange: (format: OutputFormat) => void;
  onDownload: () => void;
  isImageLoaded: boolean;
}

export default function ImageEditorToolbar({
  onNewImage,
  outputFormat,
  onOutputFormatChange,
  onDownload,
  isImageLoaded,
}: ImageEditorToolbarProps) {
  return (
    <div className="h-14 w-full dark:border-neutral-700 p-2 flex items-center justify-between shrink-0 bg-card dark:bg-neutral-800 border-b">
      <div className="flex items-center gap-2">
        <Button onClick={onNewImage} variant="ghost" size="sm" className="dark:text-neutral-300 dark:hover:bg-neutral-700">
          <RotateCcw className="mr-2 h-4 w-4" />
          New Image
        </Button>
      </div>
      <div className="flex-1 text-center">
        <span className="text-lg font-semibold text-primary dark:text-sky-400 truncate px-2">Image Editor</span>
      </div>
      <div className="flex items-center gap-2">
        <Select value={outputFormat} onValueChange={(value) => onOutputFormatChange(value as OutputFormat)} disabled={!isImageLoaded}>
          <SelectTrigger className="w-[100px] h-9 text-xs dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-300 dark:focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent className="dark:bg-neutral-700 dark:border-neutral-600">
            <SelectItem value="image/png" className="text-xs dark:text-neutral-300 dark:focus:bg-neutral-600">PNG</SelectItem>
            <SelectItem value="image/jpeg" className="text-xs dark:text-neutral-300 dark:focus:bg-neutral-600">JPEG</SelectItem>
            <SelectItem value="image/webp" className="text-xs dark:text-neutral-300 dark:focus:bg-neutral-600">WEBP</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onDownload} size="sm" className="bg-accent hover:bg-accent/90 dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-white" disabled={!isImageLoaded}>
          <Save className="mr-2 h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
}
