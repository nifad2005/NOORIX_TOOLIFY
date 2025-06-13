
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { UploadCloud } from 'lucide-react';

interface ImageEditorCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  currentImageElement: HTMLImageElement | null;
  isDragging: boolean; // For file drag/drop
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  triggerFileInput: () => void;
  onCanvasClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseLeave: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  activeTool: string | null;
  isAddingText: boolean; // For text tool cursor
  isCropping?: boolean; // For crop tool cursor
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasMouseLeave,
  activeTool,
  isAddingText,
  isCropping,
  fileInputRef,
  onFileSelected,
}: ImageEditorCanvasProps) {
  
  let cursorStyle = 'default';
  if (activeTool === 'text' && isAddingText) {
    cursorStyle = 'crosshair';
  } else if (activeTool === 'crop') {
    cursorStyle = 'crosshair';
  }


  return (
    <div
      ref={canvasContainerRef}
      className="flex-grow dark:bg-black p-4 relative overflow-auto h-full flex items-center justify-center" 
      onDragOver={onDragOver} // Moved from placeholder to container for broader drop target
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {!currentImageElement ? (
        <div 
          onClick={triggerFileInput}
          // Drag events are now on the parent for a larger drop zone
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
      ) : (
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          onMouseDown={onCanvasMouseDown}
          onMouseMove={onCanvasMouseMove}
          onMouseUp={onCanvasMouseUp}
          onMouseLeave={onCanvasMouseLeave}
          data-ai-hint="edited image content"
          className="block shadow-lg rounded" 
          style={{
            cursor: cursorStyle,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        />
      )}
    </div>
  );
}

