
"use client";

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Image as ImageIcon, RotateCcw, Crop, Scale, RotateCw, Download, MinusSquare, Palette, EraserIcon, Type, Square, Smile } from 'lucide-react';
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
    setActiveTool(toolName);
    toast({ title: "Tool Selected", description: `${toolName} selected. Functionality coming soon!` });
  };

  const handleDownload = () => {
    if (!imageSrc || !originalImageFile) {
        toast({ title: "No Image", description: "Please upload an image first.", variant: "destructive" });
        return;
    }
    // This is a placeholder download for now.
    // Actual export will depend on canvas data.
    const link = document.createElement('a');
    link.href = imageSrc;
    const originalNameParts = originalImageFile.name.split('.');
    originalNameParts.pop(); 
    const nameWithoutExtension = originalNameParts.join('.');
    const newExtension = outputFormat.split('/')[1] || 'bin';
    link.download = `${nameWithoutExtension}_edited.${newExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download Started", description: `Downloading as ${newExtension.toUpperCase()}` });
  };
  
  const handleReset = () => {
    setOriginalImageFile(null);
    setImageSrc(null);
    setActiveTool(null);
    setOutputFormat('image/png');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({ title: "Editor Reset" });
  };

  const ToolButton = ({ icon: Icon, label, toolName }: { icon: React.ElementType, label: string, toolName: string }) => (
    <Button
      variant={activeTool === toolName ? "secondary" : "ghost"}
      className="w-full justify-start"
      onClick={() => handleToolClick(toolName)}
    >
      <Icon className="mr-2 h-5 w-5" />
      {label}
    </Button>
  );

  return (
    <div className="w-full max-w-6xl space-y-6">
      <header className="text-center py-6">
        <h1 className="text-5xl font-bold font-headline text-primary">Toolify</h1>
        <p className="text-xl text-muted-foreground mt-2">Online Image Editor</p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Edit Your Image</CardTitle>
          <CardDescription>Upload an image and use various tools to modify it. More features coming soon!</CardDescription>
        </CardHeader>

        {!imageSrc ? (
          <CardContent>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={triggerFileInput}
              className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/70'}`}
            >
              <UploadCloud className={`w-16 h-16 mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-lg font-medium text-center">
                Drag & drop an image here, or click to select file
              </p>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelected}
                className="hidden"
                accept="image/*"
              />
            </div>
          </CardContent>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 p-4">
            {/* Control Panel */}
            <Card className="w-full md:w-72 p-4 space-y-3 shrink-0">
              <h3 className="text-lg font-semibold mb-2">Tools</h3>
              <Separator />
              <ToolButton icon={Crop} label="Crop" toolName="crop" />
              <ToolButton icon={Scale} label="Resize" toolName="resize" />
              <ToolButton icon={RotateCw} label="Rotate/Flip" toolName="rotate" />
              
              <Separator />
              <h4 className="text-md font-medium pt-2">Color & Filters</h4>
              <ToolButton icon={Palette} label="Adjust Colors" toolName="colors" />
              <ToolButton icon={MinusSquare} label="Filters" toolName="filters" /> {/* Using MinusSquare as a generic filter icon */}
              
              <Separator />
              <h4 className="text-md font-medium pt-2">Text & Shapes</h4>
              <ToolButton icon={Type} label="Add Text" toolName="text" />
              <ToolButton icon={Square} label="Add Shapes" toolName="shapes" />
              <ToolButton icon={Smile} label="Stickers" toolName="stickers" />

              <Separator />
              <h4 className="text-md font-medium pt-2">Background</h4>
              <ToolButton icon={EraserIcon} label="Remove Background" toolName="bg-remove" />

              <div className="pt-4 space-y-2">
                <Label htmlFor="output-format">Export Format</Label>
                <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as OutputFormat)}>
                  <SelectTrigger id="output-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/png">PNG</SelectItem>
                    <SelectItem value="image/jpeg">JPEG</SelectItem>
                    <SelectItem value="image/webp">WEBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleDownload} className="w-full mt-4 bg-accent hover:bg-accent/90">
                <Download className="mr-2 h-4 w-4" /> Download Image
              </Button>
              <Button variant="outline" onClick={handleReset} className="w-full mt-2">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset / New Image
              </Button>
            </Card>

            {/* Image Display Area */}
            <div className="flex-grow flex items-center justify-center bg-muted/50 rounded-lg border p-4 min-h-[400px]">
              {imageSrc ? (
                <Image 
                  src={imageSrc} 
                  alt="Uploaded image for editing" 
                  width={800} 
                  height={600} 
                  style={{ objectFit: 'contain', maxHeight: '70vh', maxWidth: '100%' }}
                  unoptimized // Important for editing to prevent Next.js optimization from interfering
                  data-ai-hint="uploaded image"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="w-24 h-24 mx-auto mb-2" />
                  <p>Image preview will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
