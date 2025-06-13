
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import NextImage from 'next/image';
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
    Type as TypeIcon,
    Square as ShapeIcon,
    Smile,
    Save
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';
type TextAlign = 'left' | 'center' | 'right';

export default function ImageEditor() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png');
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Text tool state
  const [textInput, setTextInput] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [fontSize, setFontSize] = useState<number>(48);
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [textAlign, setTextAlign] = useState<TextAlign>('left');
  const [isAddingText, setIsAddingText] = useState<boolean>(false);

  const [currentImageElement, setCurrentImageElement] = useState<HTMLImageElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const resetEditorState = () => {
    setOriginalImageFile(null);
    setImageSrc(null); 
    setActiveTool(null);
    setRotationAngle(0);
    setOutputFormat('image/png');
    setTextInput('');
    // setTextColor('#FFFFFF'); // Keep user preference
    // setFontSize(48); // Keep user preference
    // setFontFamily('Arial'); // Keep user preference
    // setTextAlign('left'); // Keep user preference
    setIsAddingText(false);
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Optionally set canvas attributes to 0 to truly clear it visually if no image is loaded
            // canvas.width = 0; 
            // canvas.height = 0;
        }
    }
    setCurrentImageElement(null); 

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;

    if (!canvas || !container || !currentImageElement) {
      if (canvas && !currentImageElement) { // Clear canvas if no image
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.clearRect(0,0, canvas.width, canvas.height);
          }
      }
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas pixel dimensions to match its container's display size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    
    const img = currentImageElement;
    const canvasW = canvas.width;
    const canvasH = canvas.height;

    const imgNaturalWidth = img.naturalWidth;
    const imgNaturalHeight = img.naturalHeight;

    // Determine rotated dimensions for calculating fit
    let rotatedImgWidth = imgNaturalWidth;
    let rotatedImgHeight = imgNaturalHeight;
    if (rotationAngle === 90 || rotationAngle === 270) {
        rotatedImgWidth = imgNaturalHeight;
        rotatedImgHeight = imgNaturalWidth;
    }
    
    const imgRatio = rotatedImgWidth / rotatedImgHeight;
    const canvasRatio = canvasW / canvasH;

    let drawW, drawH;
    if (imgRatio > canvasRatio) { 
      drawW = canvasW;
      drawH = drawW / imgRatio;
    } else { 
      drawH = canvasH;
      drawW = drawH * imgRatio;
    }
    
    ctx.translate(canvasW / 2, canvasH / 2);
    ctx.rotate(rotationAngle * Math.PI / 180);
    
    // Draw the image. If rotated 90/270, use original w/h for drawImage, as rotation handles orientation.
    if (rotationAngle === 90 || rotationAngle === 270) {
        ctx.drawImage(img, -drawH / 2, -drawW / 2, drawH, drawW); // Swapped drawW/drawH due to rotation
    } else {
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    }
    
    ctx.restore();

  }, [currentImageElement, rotationAngle]);


  useEffect(() => {
    if (!imageSrc) {
      setCurrentImageElement(null); 
      redrawCanvas(); // Clear canvas if imageSrc is removed
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      setCurrentImageElement(img); 
      setRotationAngle(0); // Reset rotation for a new image
    };
    img.onerror = () => {
        toast({ title: "Error", description: "Could not load image file.", variant: "destructive" });
        setCurrentImageElement(null);
        redrawCanvas(); // Clear canvas on error
    }
    img.src = imageSrc;
  }, [imageSrc, toast, redrawCanvas]);

 
  useEffect(() => {
    redrawCanvas(); 

    const handleResize = () => {
        // Debounce this in a real app
        redrawCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
    };
  }, [redrawCanvas]); 


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
        setIsAddingText(false);
        // rotationAngle is reset in the image loading useEffect for currentImageElement
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
  }, []); // Removed handleFileChange from deps as it's defined outside or stable

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleToolClick = (toolName: string) => {
    if (!currentImageElement && !['upload', 'text'].includes(toolName) ) { 
      toast({ title: "No Image", description: "Please upload an image first to use editing tools.", variant: "default" });
      return;
    }
    setActiveTool(toolName);
    setIsAddingText(false); 

    if (toolName === "rotate") {
      if (!currentImageElement || !canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newAngle = (rotationAngle + 90) % 360;
      setRotationAngle(newAngle); 
      // redrawCanvas will be called by useEffect listening to rotationAngle
      toast({ title: "Image Rotated", description: `Rotated to ${newAngle}°`});

    } else if (toolName === "text") {
       toast({ title: "Text Tool Active", description: "Configure text, click 'Prepare', then click on canvas."});
    } else if (toolName) {
      // For other tools, ensure canvas is redrawn to reflect any state changes if necessary
      redrawCanvas(); 
      toast({ title: "Tool Selected", description: `${toolName} selected. Functionality to be implemented.` });
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text' && isAddingText && canvasRef.current && textInput.trim() !== '' && currentImageElement) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;

      // Scale click coordinates to canvas pixel coordinates
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      x *= scaleX;
      y *= scaleY;
      
      ctx.save(); // Save context state before drawing text

      // The redrawCanvas function already handles the base image and its rotation.
      // We are drawing text on top of whatever is currently on the canvas.
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = textAlign; 
      ctx.textBaseline = 'middle'; // Or 'top', 'bottom' as preferred
      ctx.fillText(textInput, x, y);
      
      ctx.restore(); // Restore context state

      // "Bake" the text into the currentImageElement by updating it with the canvas content
      const newImgDataUrl = canvas.toDataURL(outputFormat); // Use selected output format
      const newImg = new window.Image();
      newImg.onload = () => {
        setCurrentImageElement(newImg); // This will be used by redrawCanvas on next full redraw (e.g. rotation)
                                      // And also for download
      }
      newImg.onerror = () => {
        toast({title: "Error", description: "Could not update image with text.", variant: "destructive"});
      }
      newImg.src = newImgDataUrl;

      setIsAddingText(false); 
      toast({ title: "Text Added", description: "Text has been drawn onto the image." });
    }
  };


  const handleDownload = () => {
    if (!canvasRef.current || !currentImageElement || !originalImageFile) { 
        toast({ title: "No Image Data", description: "Please upload and process an image first.", variant: "destructive" });
        return;
    }
    const canvas = canvasRef.current;
     // Check if canvas is effectively empty (e.g. only transparent pixels or too small)
    if (canvas.width <= 1 || canvas.height <= 1) { 
         toast({ title: "Canvas Empty", description: "No image content to download.", variant: "destructive" });
        return;
    }

    // Ensure the canvas has the most up-to-date drawing before exporting
    // This is important if some operations don't immediately update currentImageElement
    // For now, redrawCanvas updates the visual canvas, and text/rotation updates currentImageElement through dataURL
    // redrawCanvas(); // Could be called here if there's doubt, but might be redundant if currentImageElement is source of truth

    let dataUrl;
    try {
        // Use the currentImageElement's source if it represents the latest state
        // OR directly from canvas if canvas is the most up-to-date visual representation
        // For simplicity with baking, using canvas.toDataURL is more direct for "what you see is what you get"
        dataUrl = canvas.toDataURL(outputFormat);
    } catch (e) {
        toast({ title: "Download Error", description: "Could not export canvas image. Try PNG format.", variant: "destructive"});
        console.error("Canvas toDataURL error:", e);
        return;
    }


    const link = document.createElement('a');
    link.href = dataUrl;
    const originalNameParts = originalImageFile.name.split('.');
    originalNameParts.pop(); // Remove original extension
    const nameWithoutExtension = originalNameParts.join('.');
    const newExtension = outputFormat.split('/')[1] || 'bin'; // Fallback to bin if split fails
    
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
      disabled={!currentImageElement && !['upload', 'text'].includes(toolName)} 
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
      <div className="h-14 w-full dark:border-neutral-700 p-2 flex items-center justify-between shrink-0 bg-card dark:bg-neutral-800">
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
          <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as OutputFormat)} disabled={!currentImageElement}>
            <SelectTrigger className="w-[100px] h-9 text-xs dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-300 dark:focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="dark:bg-neutral-700 dark:border-neutral-600">
              <SelectItem value="image/png" className="text-xs dark:text-neutral-300 dark:focus:bg-neutral-600">PNG</SelectItem>
              <SelectItem value="image/jpeg" className="text-xs dark:text-neutral-300 dark:focus:bg-neutral-600">JPEG</SelectItem>
              <SelectItem value="image/webp" className="text-xs dark:text-neutral-300 dark:focus:bg-neutral-600">WEBP</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownload} size="sm" className="bg-accent hover:bg-accent/90 dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-white" disabled={!currentImageElement}>
            <Save className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-full"> {/* Parent of Tool Panel & Image Canvas */}
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
          {activeTool === 'text' && (
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="font-size" className="text-xs dark:text-neutral-400">Size (px)</Label>
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
                    <Label htmlFor="text-align" className="text-xs dark:text-neutral-400">Align</Label>
                    <Select value={textAlign} onValueChange={(value) => setTextAlign(value as TextAlign)}>
                        <SelectTrigger id="text-align" className="mt-1 h-8 text-xs dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200">
                            <SelectValue placeholder="Align" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-neutral-700 dark:border-neutral-600">
                            <SelectItem value="left" className="text-xs dark:text-neutral-300 dark:hover:!bg-neutral-600 dark:focus:bg-neutral-600">Left</SelectItem>
                            <SelectItem value="center" className="text-xs dark:text-neutral-300 dark:hover:!bg-neutral-600 dark:focus:bg-neutral-600">Center</SelectItem>
                            <SelectItem value="right" className="text-xs dark:text-neutral-300 dark:hover:!bg-neutral-600 dark:focus:bg-neutral-600">Right</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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
                onClick={() => {
                  if (!currentImageElement) { 
                     toast({ title: "No Image", description: "Please upload an image before adding text.", variant: "default" });
                     return;
                  }
                  if (!textInput.trim()) {
                     toast({ title: "No Text", description: "Please enter some text to add.", variant: "default" });
                     return;
                  }
                  setIsAddingText(true)
                }} 
                disabled={isAddingText || !currentImageElement} 
                size="sm"
                className="w-full mt-2 h-8 text-xs bg-primary/80 hover:bg-primary dark:bg-sky-600 dark:hover:bg-sky-500"
              >
                {isAddingText ? "Click on Canvas..." : "Prepare to Add Text"}
              </Button>
              {isAddingText && currentImageElement && <p className="text-xs text-center text-sky-400 mt-1">Click on the canvas to place text.</p>}
            </div>
          )}
          <ToolButton icon={ShapeIcon} label="Shapes" toolName="shapes" />
          <ToolButton icon={Smile} label="Stickers" toolName="stickers" />
          
          <Separator className="my-2 dark:bg-neutral-700" />
          <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1">Background</h3>
          <ToolButton icon={EraserIcon} label="Remove BG" toolName="bg-remove" />
        </div>

        {/* Image Display Area (Canvas Container) */}
        <div ref={canvasContainerRef} className="flex-grow dark:bg-black p-4 relative overflow-auto h-full">
          {!currentImageElement ? ( 
             <div className="w-full h-full flex items-center justify-center"> {/* Placeholder wrapper */}
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
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              data-ai-hint="edited image content"
              className="block shadow-lg rounded" 
              style={{ 
                cursor: activeTool === 'text' && isAddingText ? 'crosshair' : 'default',
                maxWidth: '100%', 
                maxHeight: '100%',
                // Removed bg-white and border from here
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
