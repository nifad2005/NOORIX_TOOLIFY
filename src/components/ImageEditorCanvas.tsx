
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { UploadCloud } from 'lucide-react';

interface ImageEditorCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  currentImageElement: HTMLImageElement | null;
  isDragging: boolean;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  triggerFileInput: () => void;
  onCanvasClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  activeTool: string | null; // Needed for cursor style
  isAddingText: boolean; // Needed for cursor style
  fileInputRef: React.RefObject<HTMLInputElement>; // For the hidden file input
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void; // For the hidden file input
}

export default function ImageEditorCanvas({
  canvasRef,
  canvasContainerRef,
  currentImageElement,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  triggerFileInput,
  onCanvasClick,
  activeTool,
  isAddingText,
  fileInputRef,
  onFileSelected,
}: ImageEditorCanvasProps) {
  return (
    <div ref={canvasContainerRef} className="flex-grow dark:bg-black p-4 relative overflow-auto h-full">
      {!currentImageElement ? ( 
         <div className="w-full h-full flex items-center justify-center"> 
            <div
            onClick={triggerFileInput}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center p-10 max-w-2xl max-h-xl border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${isDragging
                ? 'border-primary bg-primary/10 dark:border-sky-500 dark:bg-gradient-to-br dark:from-sky-700/40 dark:to-sky-900/60'
                : 'border-border dark:border-neutral-600 bg-muted/30 dark:bg-neutral-800/20 hover:border-primary/70 dark:hover:border-sky-500/70'
                }`}
            >
              <UploadCloud 
                className={`w-16 h-16 mb-4 ${isDragging ? 'text-primary dark:text-sky-400' : 'text-muted-foreground dark:text-neutral-500'}`} 
                data-ai-hint="upload interface"
              />
              <p className="text-lg font-medium text-center dark:text-neutral-400">
                  Drag & drop an image here
              </p>
              <p className="text-sm text-muted-foreground dark:text-neutral-500 mt-1">or click to select file</p>
              <Input type="file" ref={fileInputRef} onChange={onFileSelected} className="hidden" accept="image/*" />
            </div>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          data-ai-hint="edited image content"
          className="block shadow-lg rounded"
          style={{ 
            cursor: activeTool === 'text' && isAddingText ? 'crosshair' : 'default',
            maxWidth: '100%', 
            maxHeight: '100%',
            // width and height attributes are set by redrawCanvas
          }}
        />
      )}
    </div>
  );
}
