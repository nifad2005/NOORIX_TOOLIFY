
"use client";

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    MinusSquare, // Using for generic filters
    Palette, 
    Eraser as EraserIcon, // Renamed to avoid conflict
    Type, 
    Square, 
    Smile 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp'; // SVG export is more complex, keeping simple for now

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
    setActiveTool(toolName);
    // For now, just a toast. Actual tool logic will be implemented later.
    toast({ title: "Tool Selected", description: `${toolName} selected. Functionality to be implemented.` });
  };

  const handleDownload = () => {
    if (!imageSrc || !originalImageFile) {
        toast({ title: "No Image", description: "Please upload an image first.", variant: "destructive" });
        return;
    }
    // This is a placeholder download for now. 
    // Actual export will depend on canvas data after edits.
    const link = document.createElement('a');
    link.href = imageSrc; // Should be the edited image data URL
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
    toast({ title: "Editor Reset", description: "Upload a new image to start editing." });
  };

  const ToolButton = ({ icon: Icon, label, toolName }: { icon: React.ElementType, label: string, toolName: string }) => (
    <Button
      variant={activeTool === toolName ? "secondary" : "ghost"}
      className="w-full justify-start text-sm h-9"
      onClick={() => handleToolClick(toolName)}
      title={label}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <div className="w-full max-w-6xl space-y-6">
      <header className="text-center py-6">
        <h1 className="text-5xl font-bold font-headline text-primary">Toolify</h1>
        <p className="text-xl text-muted-foreground mt-2">Online Image Editor</p>
      </header>

      <Card className="shadow-xl overflow-hidden">
        {!imageSrc ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Edit Your Image</CardTitle>
              <CardDescription>Upload an image to start using the editing tools.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={triggerFileInput}
                className={`flex flex-col items-center justify-center p-10 py-16 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                  ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/70'}`}
              >
                <UploadCloud className={`w-16 h-16 mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-lg font-medium text-center">
                  Drag & drop an image here, or click to select file
                </p>
                <p className="text-sm text-muted-foreground mt-1">Supports PNG, JPG, GIF, WEBP</p>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileSelected}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex flex-col md:flex-row min-h-[calc(100vh-250px)] md:min-h-[600px]">
            {/* Control Panel */}
            <div className="w-full md:w-72 bg-card border-b md:border-b-0 md:border-r p-4 space-y-3 shrink-0 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2 px-1">Tools</h3>
              
              <Separator />
              <div className="py-1 space-y-1">
                <ToolButton icon={Crop} label="Crop" toolName="crop" />
                <ToolButton icon={Scale} label="Resize" toolName="resize" />
                <ToolButton icon={RotateCw} label="Rotate/Flip" toolName="rotate" />
              </div>
              
              <Separator />
              <h4 className="text-md font-semibold pt-2 pb-1 px-1">Adjustments</h4>
              <div className="py-1 space-y-1">
                <ToolButton icon={Palette} label="Color Tune" toolName="colors" />
                <ToolButton icon={MinusSquare} label="Filters" toolName="filters" />
              </div>
              
              <Separator />
              <h4 className="text-md font-semibold pt-2 pb-1 px-1">Elements</h4>
              <div className="py-1 space-y-1">
                <ToolButton icon={Type} label="Add Text" toolName="text" />
                <ToolButton icon={Square} label="Add Shapes" toolName="shapes" />
                <ToolButton icon={Smile} label="Stickers" toolName="stickers" />
              </div>

              <Separator />
              <h4 className="text-md font-semibold pt-2 pb-1 px-1">Background</h4>
              <div className="py-1 space-y-1">
                 <ToolButton icon={EraserIcon} label="Remove BG" toolName="bg-remove" />
              </div>
              
              <Separator className="mt-4 mb-2"/>

              <div className="pt-2 space-y-2">
                <Label htmlFor="output-format" className="text-sm font-medium px-1">Export Format</Label>
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
                <RotateCcw className="mr-2 h-4 w-4" /> New Image
              </Button>
            </div>

            {/* Image Display Area */}
            <div className="flex-grow flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
              {imageSrc ? (
                <div className="relative max-w-full max-h-full">
                   <Image 
                    src={imageSrc} 
                    alt="Image for editing" 
                    width={0} 
                    height={0}
                    sizes="100vw"
                    style={{ 
                        width: 'auto', 
                        height: 'auto', 
                        maxHeight: 'calc(100vh - 300px)', // Adjust based on your layout
                        maxWidth: '100%',
                        objectFit: 'contain',
                        display: 'block'
                    }}
                    unoptimized // Important for editing to prevent Next.js optimization from interfering
                    data-ai-hint="uploaded image"
                    className="shadow-lg rounded"
                  />
                </div>
              ) : (
                // This part should not be reachable if imageSrc is required for this view
                <div className="text-center text-muted-foreground">
                  <ImageIconPlaceholder className="w-24 h-24 mx-auto mb-2" data-ai-hint="placeholder image" />
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
