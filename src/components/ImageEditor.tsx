
"use client";

import React, { useState, useCallback, useRef } from 'react';
import NextImage from 'next/image'; // Renamed to avoid conflict with window.Image
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import {
    UploadCloud,
    Image as ImageIconPlaceholder,
    RotateCcw,
    Crop,
    Scale,
    RotateCw,
    Download,
    MinusSquare,
    Palette,
    Eraser as EraserIcon,
    Type,
    Square,
    Smile,
    FileImage,
    Save
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export default function ImageEditor() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (e.g., PNG, JPG, GIF, WEBP).",
          variant: "destructive",
        });
        return;
      }
      setOriginalImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setActiveTool(null); // Reset active tool on new image
      };
      reader.readAsDataURL(file);
    }
  };

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFileChange(file || null);
  };

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    handleFileChange(file || null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleToolClick = (toolName: string) => {
    if (!imageSrc) {
      toast({ title: "No Image", description: "Please upload an image first to use editing tools.", variant: "default" });
      return;
    }
    setActiveTool(toolName);
    toast({ title: "Tool Selected", description: `${toolName} selected. Functionality to be implemented.` });
  };

  const handleDownload = () => {
    if (!imageSrc || !originalImageFile) {
        toast({ title: "No Image", description: "Please upload an image first.", variant: "destructive" });
        return;
    }
    const link = document.createElement('a');
    link.href = imageSrc; // In a real app, this would be the edited image data URL
    const originalNameParts = originalImageFile.name.split('.');
    originalNameParts.pop();
    const nameWithoutExtension = originalNameParts.join('.');
    const newExtension = outputFormat.split('/')[1] || 'bin';
    link.download = `${nameWithoutExtension}_edited.${newExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download Started", description: `Downloading as ${newExtension.toUpperCase()} (current preview)` });
  };

  const handleReset = () => {
    setOriginalImageFile(null);
    setImageSrc(null);
    setActiveTool(null);
    setOutputFormat('image/png');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // No toast needed here, the UI change is feedback enough
  };

  const ToolButton = ({ icon: Icon, label, toolName }: { icon: React.ElementType, label: string, toolName: string }) => (
    <Button
      variant={activeTool === toolName ? "secondary" : "ghost"}
      className="w-full justify-start text-sm h-9 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:data-[state=active]:bg-neutral-600"
      onClick={() => handleToolClick(toolName)}
      title={label}
      disabled={!imageSrc && toolName !== "upload"}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <div
      className="h-full w-full flex flex-col bg-background dark:bg-neutral-900 text-foreground dark:text-neutral-100" // Takes full height of its parent
    >
      {/* Top Toolbar */}
      <div className="h-14 border-b dark:border-neutral-700 p-2 flex items-center justify-between shrink-0 bg-card dark:bg-neutral-800">
        <div className="flex items-center gap-2">
           <Button onClick={imageSrc ? handleReset : triggerFileInput} variant="ghost" size="sm" className="dark:text-neutral-300 dark:hover:bg-neutral-700">
            {imageSrc ? <FileImage className="mr-2 h-4 w-4" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            {imageSrc ? "New Image" : "Upload Image"}
          </Button>
        </div>

        <div className="flex-1 text-center text-lg font-semibold text-primary dark:text-sky-400 truncate px-2">
          Image Editor
        </div>

        <div className="flex items-center gap-2">
          <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as OutputFormat)} disabled={!imageSrc}>
            <SelectTrigger className="w-[100px] h-9 text-xs dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-300 dark:focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="dark:bg-neutral-700 dark:border-neutral-600">
              <SelectItem value="image/png" className="text-xs dark:text-neutral-300 dark:focus:bg-neutral-600">PNG</SelectItem>
              <SelectItem value="image/jpeg" className="text-xs dark:text-neutral-300 dark:focus:bg-neutral-600">JPEG</SelectItem>
              <SelectItem value="image/webp" className="text-xs dark:text-neutral-300 dark:focus:bg-neutral-600">WEBP</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownload} size="sm" className="bg-accent hover:bg-accent/90 dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-white" disabled={!imageSrc}>
            <Save className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden"> {/* Main content area takes remaining space and allows internal scroll if needed */}
        {/* Left Tool Panel */}
        <div className="w-60 bg-card dark:bg-neutral-800 border-r dark:border-neutral-700 p-3 space-y-2 shrink-0 overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1 pt-1">Transform</h3>
          <ToolButton icon={Crop} label="Crop" toolName="crop" />
          <ToolButton icon={Scale} label="Resize" toolName="resize" />
          <ToolButton icon={RotateCw} label="Rotate & Flip" toolName="rotate" />

          <Separator className="my-3 dark:bg-neutral-700" />
          <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1">Adjust</h3>
          <ToolButton icon={Palette} label="Color Tune" toolName="colors" />
          <ToolButton icon={MinusSquare} label="Filters" toolName="filters" />

          <Separator className="my-3 dark:bg-neutral-700" />
          <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1">Elements</h3>
          <ToolButton icon={Type} label="Text" toolName="text" />
          <ToolButton icon={Square} label="Shapes" toolName="shapes" />
          <ToolButton icon={Smile} label="Stickers" toolName="stickers" />

          <Separator className="my-3 dark:bg-neutral-700" />
          <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1">Background</h3>
          <ToolButton icon={EraserIcon} label="Remove BG" toolName="bg-remove" />
        </div>

        {/* Image Display Area (Canvas) */}
        <div className="flex-grow flex items-center justify-center dark:bg-black p-4 relative overflow-auto">
          {!imageSrc ? (
            <div
              onClick={triggerFileInput}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center p-10 w-full h-full max-w-lg max-h-lg border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${isDragging
                  ? 'border-primary bg-primary/10 dark:border-sky-500 dark:bg-gradient-to-br dark:from-sky-700/40 dark:to-sky-900/60'
                  : 'border-border dark:border-neutral-600 bg-muted/30 dark:bg-neutral-800/20 hover:border-primary/70 dark:hover:border-sky-500/70'
                }`}
            >
              <UploadCloud className={`w-16 h-16 mb-4 ${isDragging ? 'text-primary dark:text-sky-400' : 'text-muted-foreground dark:text-neutral-500'}`} />
              <p className="text-lg font-medium text-center dark:text-neutral-400">
                Drag & drop an image here
              </p>
              <p className="text-sm text-muted-foreground dark:text-neutral-500 mt-1">or click to select file</p>
              <Input type="file" ref={fileInputRef} onChange={onFileSelected} className="hidden" accept="image/*" />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
               <NextImage
                src={imageSrc}
                alt="Image for editing"
                fill
                style={{ objectFit: 'contain' }}
                unoptimized
                data-ai-hint="uploaded image"
                className="shadow-lg rounded"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

