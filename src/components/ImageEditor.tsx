
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
// import NextImage from 'next/image'; // Canvas is used instead
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
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Data URL of the original uploaded image
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

  const [currentImageElement, setCurrentImageElement] = useState<HTMLImageElement | null>(null); // Holds the current state of image (original or with baked edits)

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null); // Ref for the div wrapping the canvas
  const { toast } = useToast();

  const resetEditorState = () => {
    setOriginalImageFile(null);
    setImageSrc(null);
    setActiveTool(null);
    setRotationAngle(0);
    setOutputFormat('image/png');
    setTextInput('');
    // Keep user preferences for text styling
    // setTextColor('#FFFFFF');
    // setFontSize(48);
    // setFontFamily('Arial');
    // setTextAlign('left');
    setIsAddingText(false);
    setCurrentImageElement(null);

    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Ensure canvas bitmap is also cleared if it had dimensions
            // canvas.width = 0;
            // canvas.height = 0;
        }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;

    if (!canvas || !container) {
      return;
    }

    // Set canvas bitmap size to match its display container's client size
    const newCanvasWidth = container.clientWidth;
    const newCanvasHeight = container.clientHeight;

    if (newCanvasWidth === 0 || newCanvasHeight === 0) {
      // If container has no dimensions, don't attempt to draw. Clear if previously drawn.
      if (canvas.width > 0 || canvas.height > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      // canvas.width = 0; // Avoid setting to 0 if not necessary, could hide it.
      // canvas.height = 0;
      return;
    }
    
    canvas.width = newCanvasWidth;
    canvas.height = newCanvasHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If no valid image element (e.g., not loaded, or baked image failed), just clear
    if (!currentImageElement || currentImageElement.naturalWidth === 0 || currentImageElement.naturalHeight === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear before drawing
    
    ctx.save();
    
    const img = currentImageElement;
    const canvasW = canvas.width;
    const canvasH = canvas.height;

    // Determine the dimensions the image should be drawn at to fit "contain"
    let imgNaturalWidth = img.naturalWidth;
    let imgNaturalHeight = img.naturalHeight;

    // Dimensions of the image *as it would be oriented after rotation*
    // These are used to calculate the scaling factor to fit into the canvas.
    let fittingImgWidth = imgNaturalWidth;
    let fittingImgHeight = imgNaturalHeight;
    if (rotationAngle === 90 || rotationAngle === 270) {
        fittingImgWidth = imgNaturalHeight;
        fittingImgHeight = imgNaturalWidth;
    }
    
    const imgRatio = fittingImgWidth / fittingImgHeight;
    const canvasRatio = canvasW / canvasH;

    let drawW, drawH; // These are the dimensions of the *image content* on the canvas
    if (imgRatio > canvasRatio) { 
      drawW = canvasW; // Image content will fill canvas width
      drawH = drawW / imgRatio;
    } else { 
      drawH = canvasH; // Image content will fill canvas height
      drawW = drawH * imgRatio;
    }
    
    ctx.translate(canvasW / 2, canvasH / 2);
    ctx.rotate(rotationAngle * Math.PI / 180);
    
    // Draw the image. `drawW` and `drawH` represent the size of the *content box* for the image.
    // If rotated by 90/270, the roles of drawW/drawH are effectively swapped because
    // `fittingImgWidth/Height` were swapped.
    if (rotationAngle === 90 || rotationAngle === 270) {
        ctx.drawImage(img, -drawH / 2, -drawW / 2, drawH, drawW);
    } else {
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    }
    
    ctx.restore();

  }, [currentImageElement, rotationAngle]);


  // Effect to load image from imageSrc into an HTMLImageElement
  useEffect(() => {
    if (!imageSrc) {
      setCurrentImageElement(null); // Clear current image if src is removed
      // redrawCanvas will be called by the effect below if currentImageElement changes
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      setCurrentImageElement(img); // This becomes the base for drawing
      setRotationAngle(0); // Reset rotation for a new image
    };
    img.onerror = () => {
        toast({ title: "Error", description: "Could not load image file.", variant: "destructive" });
        setCurrentImageElement(null);
    }
    img.src = imageSrc;
  }, [imageSrc, toast]); // Removed redrawCanvas from here, it depends on currentImageElement

 
  // Effect to redraw canvas when currentImageElement or rotationAngle changes, or on resize
  useEffect(() => {
    redrawCanvas(); 

    const handleResize = () => {
        // Debounce this in a real app for performance
        redrawCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
    };
  }, [redrawCanvas]); // redrawCanvas is memoized and changes if its deps (currentImageElement, rotationAngle) change


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
        setImageSrc(reader.result as string); // This triggers image loading effect
        setActiveTool(null);
        setIsAddingText(false);
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
    if (!currentImageElement && !['upload', 'text'].includes(toolName) ) { 
      toast({ title: "No Image", description: "Please upload an image first to use editing tools.", variant: "default" });
      return;
    }
    setActiveTool(toolName);
    setIsAddingText(false); 

    if (toolName === "rotate") {
      if (!currentImageElement || !canvasRef.current) return;
      setRotationAngle(prevAngle => (prevAngle + 90) % 360);
      toast({ title: "Image Rotated", description: `Rotated by 90°. Current: ${(rotationAngle + 90) % 360}°`});
    } else if (toolName === "text") {
       toast({ title: "Text Tool Active", description: "Configure text, click 'Prepare', then click on canvas."});
    } else if (toolName) {
      redrawCanvas(); 
      toast({ title: "Tool Selected", description: `${toolName} selected. Functionality to be implemented.` });
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text' && isAddingText && canvasRef.current && textInput.trim() !== '' && currentImageElement) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Redraw the current state (image with rotation) before adding text
      // This ensures text is added on top of the correctly oriented image
      redrawCanvas(); 

      const rect = canvas.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;

      // Scale click coordinates to canvas pixel coordinates
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      x *= scaleX;
      y *= scaleY;
      
      ctx.save(); 

      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = textAlign; 
      ctx.textBaseline = 'middle'; 
      ctx.fillText(textInput, x, y);
      
      ctx.restore(); 

      // "Bake" the text into the currentImageElement by updating it with the new canvas content
      try {
        const newImgDataUrl = canvas.toDataURL(outputFormat); 
        if (newImgDataUrl === "data:,") { // Check for empty data URL
            toast({title: "Error", description: "Could not bake text. Canvas may be empty.", variant: "destructive"});
            setIsAddingText(false);
            return;
        }
        const newImg = new window.Image();
        newImg.onload = () => {
          if (newImg.naturalWidth === 0 || newImg.naturalHeight === 0) {
            toast({title: "Error", description: "Baked image is empty. Text not applied.", variant: "destructive"});
          } else {
            setCurrentImageElement(newImg); 
            toast({ title: "Text Added", description: "Text has been drawn onto the image." });
          }
        }
        newImg.onerror = () => {
          toast({title: "Error", description: "Could not update image with text.", variant: "destructive"});
        }
        newImg.src = newImgDataUrl;
      } catch (e) {
        toast({title: "Error", description: `Failed to bake text: ${e instanceof Error ? e.message : String(e)}`, variant: "destructive"});
      }

      setIsAddingText(false); 
    }
  };


  const handleDownload = () => {
    if (!canvasRef.current || !currentImageElement || !originalImageFile) { 
        toast({ title: "No Image Data", description: "Please upload and process an image first.", variant: "destructive" });
        return;
    }
    const canvas = canvasRef.current;
    if (canvas.width <= 1 || canvas.height <= 1 || (currentImageElement && currentImageElement.naturalWidth === 0)) { 
         toast({ title: "Canvas Empty", description: "No image content to download.", variant: "destructive" });
        return;
    }

    // Ensure the canvas has the most up-to-date drawing before exporting.
    // Calling redrawCanvas here ensures any pending state update (like rotationAngle) is rendered.
    redrawCanvas();


    let dataUrl;
    try {
        dataUrl = canvas.toDataURL(outputFormat);
        if (dataUrl === "data:,") {
            toast({ title: "Download Error", description: "Canvas is empty or invalid. Cannot download.", variant: "destructive"});
            return;
        }
    } catch (e) {
        toast({ title: "Download Error", description: `Could not export canvas image. Try PNG format. ${e instanceof Error ? e.message : String(e)}`, variant: "destructive"});
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

      <div className="flex flex-1 overflow-hidden h-full"> 
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
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              data-ai-hint="edited image content"
              className="block shadow-lg rounded" 
              style={{ 
                cursor: activeTool === 'text' && isAddingText ? 'crosshair' : 'default',
                maxWidth: '100%', 
                maxHeight: '100%',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

