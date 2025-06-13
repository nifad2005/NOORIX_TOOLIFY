
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import {
    UploadCloud,
    RotateCcw,
    Crop,
    Scale,
    RotateCw,
    MinusSquare,
    Palette,
    Eraser as EraserIcon,
    Type as TypeIcon, // Renamed to avoid conflict
    Square as ShapeIcon,
    Smile,
    Save
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label'; // For text tool UI

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export default function ImageEditor() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png');
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Text tool state
  const [textInput, setTextInput] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#FFFFFF'); // Default white for dark canvas
  const [fontSize, setFontSize] = useState<number>(48);
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [isAddingText, setIsAddingText] = useState<boolean>(false);

  const [currentImageElement, setCurrentImageElement] = useState<HTMLImageElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const resetEditorState = () => {
    setOriginalImageFile(null);
    setImageSrc(null);
    setActiveTool(null);
    setRotationAngle(0);
    setOutputFormat('image/png');
    setTextInput('');
    // setTextColor('#FFFFFF'); // Keep color preference
    // setFontSize(48); // Keep size preference
    // setFontFamily('Arial'); // Keep font preference
    setIsAddingText(false);
    setCurrentImageElement(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Ensure canvas is small or hidden if no image
        canvas.width = 1; 
        canvas.height = 1;
      }
    }
  };

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
      setOriginalImageFile(file); // Store original file info
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        // Reset relevant states for a new image
        setActiveTool(null);
        setRotationAngle(0); 
        setIsAddingText(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Effect for loading the initial image onto the canvas
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Optional: set canvas to a minimal size if you want it to "disappear"
            // canvas.width = 1; canvas.height = 1;
        }
      }
      setCurrentImageElement(null);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      setRotationAngle(0); // Ensure rotation is reset for a new image
      setIsAddingText(false); // Ensure text mode is off

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear for new image
      ctx.drawImage(img, 0, 0);
      setCurrentImageElement(img); // Store the image element for potential reuse
    };
    img.onerror = () => {
        toast({ title: "Error", description: "Could not load image file onto canvas.", variant: "destructive" });
        setCurrentImageElement(null);
    }
    img.src = imageSrc;
  }, [imageSrc, toast]);


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
  }, [handleFileChange]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleToolClick = (toolName: string) => {
    if (!imageSrc && toolName !== "upload") { // "upload" is implicit via placeholder
      toast({ title: "No Image", description: "Please upload an image first to use editing tools.", variant: "default" });
      return;
    }
    setActiveTool(toolName);
    setIsAddingText(false); // Deactivate text adding mode when switching tools

    if (toolName === "rotate") {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Create a temporary canvas to hold the current image data
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx.drawImage(canvas, 0, 0);

      // Perform the rotation (90 degrees clockwise)
      // New width is old height, new height is old width
      canvas.width = tempCanvas.height;
      canvas.height = tempCanvas.width;
      
      ctx.clearRect(0,0,canvas.width,canvas.height); // Clear the main canvas
      ctx.save();
      // Translate to the new center and rotate
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(90 * Math.PI / 180); // Rotate 90 degrees
      // Draw the image from the temporary canvas, centered
      ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
      ctx.restore(); // Restore context to default (removes translations/rotations)
      
      const newAngle = (rotationAngle + 90) % 360;
      setRotationAngle(newAngle); // Update the angle state for informational purposes
      toast({ title: "Image Rotated", description: `Rotated 90° clockwise. Angle: ${newAngle}°`});

    } else if (toolName === "text") {
      // Specific logic for text tool handled by its own UI and handleCanvasClick
       toast({ title: "Text Tool Active", description: "Configure text and click 'Prepare', then click on canvas."});
    } else if (toolName) {
      toast({ title: "Tool Selected", description: `${toolName} selected. Functionality to be implemented.` });
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text' && isAddingText && canvasRef.current && textInput.trim() !== '') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const canvasX = (event.clientX - rect.left) * scaleX;
      const canvasY = (event.clientY - rect.top) * scaleY;

      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left'; 
      ctx.textBaseline = 'top'; 
      ctx.fillText(textInput, canvasX, canvasY);

      setIsAddingText(false);
      toast({ title: "Text Added", description: "Text has been drawn onto the canvas." });
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
        dataUrl = canvas.toDataURL(outputFormat);
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

  const ToolButton = ({ icon: Icon, label, toolName }: { icon: React.ElementType, label: string, toolName: string }) => (
    <Button
      variant={activeTool === toolName ? "secondary" : "ghost"}
      className="w-full justify-start text-sm h-9 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:data-[state=active]:bg-neutral-600"
      onClick={() => handleToolClick(toolName)}
      title={label}
      disabled={!imageSrc && toolName !== "upload" && toolName !== "text"} // Allow text tool to be selected to show inputs
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
           <Button onClick={resetEditorState} variant="ghost" size="sm" className="dark:text-neutral-300 dark:hover:bg-neutral-700">
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

      <div className="flex flex-1 overflow-hidden">
        {/* Left Tool Panel */}
        <div className="w-60 bg-card dark:bg-neutral-800 border-r dark:border-neutral-700 p-3 space-y-1 shrink-0 overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1 pt-1">Transform</h3>
          <ToolButton icon={Crop} label="Crop" toolName="crop" />
          <ToolButton icon={Scale} label="Resize" toolName="resize" />
          <ToolButton icon={RotateCw} label="Rotate 90°" toolName="rotate" />

          <Separator className="my-2 dark:bg-neutral-700" />
          <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1">Adjust</h3>
          <ToolButton icon={Palette} label="Color Tune" toolName="colors" />
          <ToolButton icon={MinusSquare} label="Filters" toolName="filters" />

          <Separator className="my-2 dark:bg-neutral-700" />
          <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1">Elements</h3>
          <ToolButton icon={TypeIcon} label="Text" toolName="text" />
          {activeTool === 'text' && imageSrc && (
            <div className="p-2 space-y-3 border-t border-neutral-700 mt-1">
              <div>
                <Label htmlFor="text-input" className="text-xs dark:text-neutral-400">Text Content</Label>
                <Input 
                  id="text-input" 
                  type="text" 
                  value={textInput} 
                  onChange={(e) => setTextInput(e.target.value)} 
                  placeholder="Enter text"
                  className="mt-1 h-8 text-xs dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                />
              </div>
              <div>
                <Label htmlFor="text-color" className="text-xs dark:text-neutral-400">Color</Label>
                <Input 
                  id="text-color" 
                  type="color" 
                  value={textColor} 
                  onChange={(e) => setTextColor(e.target.value)}
                  className="mt-1 h-8 w-full p-0.5 dark:bg-neutral-700 dark:border-neutral-600"
                />
              </div>
              <div>
                <Label htmlFor="font-size" className="text-xs dark:text-neutral-400">Font Size (px)</Label>
                <Input 
                  id="font-size" 
                  type="number" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 12)}
                  min="8"
                  max="256"
                  className="mt-1 h-8 text-xs dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                />
              </div>
              <div>
                <Label htmlFor="font-family" className="text-xs dark:text-neutral-400">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger id="font-family" className="mt-1 h-8 text-xs dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-neutral-700 dark:border-neutral-600">
                    {['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Impact', 'Georgia', 'Comic Sans MS'].map(font => (
                       <SelectItem key={font} value={font} className="text-xs dark:text-neutral-300 dark:hover:!bg-neutral-600 dark:focus:bg-neutral-600">{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => setIsAddingText(true)} 
                disabled={!textInput.trim() || isAddingText}
                size="sm"
                className="w-full mt-2 h-8 text-xs bg-primary/80 hover:bg-primary dark:bg-sky-600 dark:hover:bg-sky-500"
              >
                {isAddingText ? "Click on Canvas..." : "Prepare to Add Text"}
              </Button>
              {isAddingText && <p className="text-xs text-center text-sky-400 mt-1">Click on the canvas to place text.</p>}
            </div>
          )}
          <ToolButton icon={ShapeIcon} label="Shapes" toolName="shapes" />
          <ToolButton icon={Smile} label="Stickers" toolName="stickers" />
          
          <Separator className="my-2 dark:bg-neutral-700" />
          <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1">Background</h3>
          <ToolButton icon={EraserIcon} label="Remove BG" toolName="bg-remove" />
        </div>

        {/* Image Display Area (Canvas) */}
        <div className="flex-grow dark:bg-black p-4 relative overflow-auto h-full">
          {!imageSrc ? (
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
                <UploadCloud className={`w-16 h-16 mb-4 ${isDragging ? 'text-primary dark:text-sky-400' : 'text-muted-foreground dark:text-neutral-500'}`} data-ai-hint="upload interface" />
                <p className="text-lg font-medium text-center dark:text-neutral-400">
                    Drag & drop an image here
                </p>
                <p className="text-sm text-muted-foreground dark:text-neutral-500 mt-1">or click to select file</p>
                <Input type="file" ref={fileInputRef} onChange={onFileSelected} className="hidden" accept="image/*" />
                </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
               <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                data-ai-hint="edited image"
                className="block max-w-full max-h-full shadow-lg rounded"
                style={{ cursor: activeTool === 'text' && isAddingText ? 'crosshair' : 'default' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

