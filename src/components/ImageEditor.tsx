
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
// Removed NextImage as we'll use a canvas for display and editing
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import {
    UploadCloud,
    RotateCcw, // Keep for "New Image"
    Crop,
    Scale,
    RotateCw, // Icon for Rotate Tool
    MinusSquare,
    Palette,
    Eraser as EraserIcon,
    Type,
    Square as ShapeIcon,
    Smile,
    Save
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export default function ImageEditor() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Original uploaded image data URL
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png');
  const [rotationAngle, setRotationAngle] = useState<number>(0); // In degrees

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
        setActiveTool(null);
        setRotationAngle(0); // Reset rotation for new image
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) {
      // If there's no image or canvas isn't ready, ensure canvas is blank or hidden
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Optionally set canvas display to none if no imageSrc
          // canvas.style.display = 'none';
        }
      }
      return;
    }
    // if (canvasRef.current) canvas.style.display = 'block';


    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      // Determine canvas dimensions based on rotation
      const rad = rotationAngle * Math.PI / 180;
      const absCos = Math.abs(Math.cos(rad));
      const absSin = Math.abs(Math.sin(rad));

      let newCanvasWidth = img.naturalWidth * absCos + img.naturalHeight * absSin;
      let newCanvasHeight = img.naturalWidth * absSin + img.naturalHeight * absCos;
      
      // Ensure dimensions are integers
      newCanvasWidth = Math.ceil(newCanvasWidth);
      newCanvasHeight = Math.ceil(newCanvasHeight);

      canvas.width = newCanvasWidth;
      canvas.height = newCanvasHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear before drawing

      ctx.save();
      // Translate to the center of the new canvas dimensions
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      // Draw the image centered around the 0,0 of the translated/rotated context
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();
    };
    img.onerror = () => {
        toast({ title: "Error", description: "Could not load image onto canvas.", variant: "destructive" });
    }
    img.src = imageSrc;

  }, [imageSrc, rotationAngle, toast]);


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

    if (toolName === "rotate") {
      setRotationAngle(prevAngle => (prevAngle + 90) % 360);
      toast({ title: "Image Rotated", description: `Rotated 90° clockwise. Angle: ${(rotationAngle + 90) % 360}°`});
    } else {
      toast({ title: "Tool Selected", description: `${toolName} selected. Functionality to be implemented.` });
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current || !imageSrc || !originalImageFile) {
        toast({ title: "No Image Data", description: "Please upload and process an image first.", variant: "destructive" });
        return;
    }
    const canvas = canvasRef.current;
    let dataUrl;
    try {
        dataUrl = canvas.toDataURL(outputFormat); // Use selected output format
    } catch (e) {
        toast({ title: "Download Error", description: "Could not export canvas image. Try PNG format.", variant: "destructive"});
        console.error("Canvas toDataURL error:", e);
        return;
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    const originalNameParts = originalImageFile.name.split('.');
    originalNameParts.pop();
    const nameWithoutExtension = originalNameParts.join('.');
    const newExtension = outputFormat.split('/')[1] || 'bin';
    link.download = `${nameWithoutExtension}_edited.${newExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download Started", description: `Downloading edited image as ${newExtension.toUpperCase()}` });
  };

  const handleNewImage = () => {
    setOriginalImageFile(null);
    setImageSrc(null); // This will trigger useEffect to clear canvas via logic
    setActiveTool(null);
    setRotationAngle(0);
    setOutputFormat('image/png');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const ToolButton = ({ icon: Icon, label, toolName }: { icon: React.ElementType, label: string, toolName: string }) => (
    <Button
      variant={activeTool === toolName && toolName === "rotate" ? "default" : (activeTool === toolName ? "secondary" : "ghost")}
      className="w-full justify-start text-sm h-9 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:data-[state=active]:bg-neutral-600"
      onClick={() => handleToolClick(toolName)}
      title={label}
      disabled={!imageSrc && toolName !== "upload"} // Keep upload always enabled from a logical PoV
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <div
      className="h-full w-full flex flex-col bg-background dark:bg-neutral-900 text-foreground dark:text-neutral-100"
    >
      {/* Top Toolbar */}
      <div className="h-14 border-b w-full dark:border-neutral-700 p-2 flex items-center justify-between shrink-0 bg-card dark:bg-neutral-800">
        <div className="flex items-center gap-2">
           <Button onClick={handleNewImage} variant="ghost" size="sm" className="dark:text-neutral-300 dark:hover:bg-neutral-700">
            <RotateCcw className="mr-2 h-4 w-4" />
            New Image
          </Button>
        </div>

        <div className="flex-1 text-center">
            <span className="text-lg font-semibold text-primary dark:text-sky-400 truncate px-2">Image Editor</span>
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

      <div className="flex flex-1 overflow-hidden"> {/* This flex-1 is for height distribution */}
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
          <ToolButton icon={ShapeIcon} label="Shapes" toolName="shapes" />
          <ToolButton icon={Smile} label="Stickers" toolName="stickers" />

          <Separator className="my-3 dark:bg-neutral-700" />
          <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1">Background</h3>
          <ToolButton icon={EraserIcon} label="Remove BG" toolName="bg-remove" />
        </div>

        {/* Image Display Area (Canvas) */}
        <div className="flex-grow dark:bg-black p-4 relative overflow-auto h-full">
          {!imageSrc ? (
            <div className="w-full h-full flex items-center justify-center"> {/* Placeholder wrapper - Full size */}
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
                <UploadCloud className={`w-16 h-16 mb-4 ${isDragging ? 'text-primary dark:text-sky-400' : 'text-muted-foreground dark:text-neutral-500'}`} data-ai-hint="upload interface" />
                <p className="text-lg font-medium text-center dark:text-neutral-400">
                    Drag & drop an image here
                </p>
                <p className="text-sm text-muted-foreground dark:text-neutral-500 mt-1">or click to select file</p>
                <Input type="file" ref={fileInputRef} onChange={onFileSelected} className="hidden" accept="image/*" />
                </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center"> {/* Wrapper to center canvas */}
               <canvas
                ref={canvasRef}
                data-ai-hint="edited image"
                // Style canvas to scale down, maintaining aspect ratio, within its container
                // The actual pixel dimensions are set by canvas.width/height in JS
                className="block max-w-full max-h-full shadow-lg rounded"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
