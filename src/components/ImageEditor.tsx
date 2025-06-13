
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { OutputFormat, TextAlign } from '@/lib/imageEditorTypes';
import ImageEditorToolbar from './ImageEditorToolbar';
import ImageEditorToolPanel from './ImageEditorToolPanel';
import ImageEditorCanvas from './ImageEditorCanvas';

export default function ImageEditor() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [currentImageElement, setCurrentImageElement] = useState<HTMLImageElement | null>(null);

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

  // Color Tune state
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;

    if (!canvas || !container) {
      return;
    }
    
    const newCanvasWidth = container.clientWidth;
    const newCanvasHeight = container.clientHeight;

    if (newCanvasWidth === 0 || newCanvasHeight === 0) {
        if (canvas.width > 0 || canvas.height > 0) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      return;
    }
    
    canvas.width = newCanvasWidth;
    canvas.height = newCanvasHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!currentImageElement || currentImageElement.naturalWidth === 0 || currentImageElement.naturalHeight === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply color tune filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%)`;

    const img = currentImageElement;

    // Optimization: If the image is already the size of the canvas and not rotated, draw directly.
    if (img.naturalWidth === canvas.width &&
        img.naturalHeight === canvas.height &&
        rotationAngle === 0) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.save();
      
      const canvasW = canvas.width;
      const canvasH = canvas.height;

      let imgNaturalWidth = img.naturalWidth;
      let imgNaturalHeight = img.naturalHeight;

      let fittingImgWidth = imgNaturalWidth;
      let fittingImgHeight = imgNaturalHeight;
      if (rotationAngle === 90 || rotationAngle === 270) {
          fittingImgWidth = imgNaturalHeight;
          fittingImgHeight = imgNaturalWidth;
      }
      
      const imgRatio = fittingImgWidth / fittingImgHeight;
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
      
      if (rotationAngle === 90 || rotationAngle === 270) {
          ctx.drawImage(img, -drawH / 2, -drawW / 2, drawH, drawW);
      } else {
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      }
      
      ctx.restore();
    }
    
    ctx.filter = 'none'; // Reset filter for any subsequent direct drawing

  }, [currentImageElement, rotationAngle, brightness, contrast, saturation, grayscale]); 

  useEffect(() => {
    if (!imageSrc) {
      setCurrentImageElement(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      setCurrentImageElement(img);
      setRotationAngle(0); 
    };
    img.onerror = () => {
        toast({ title: "Error", description: "Could not load image file.", variant: "destructive" });
        setCurrentImageElement(null);
    }
    img.src = imageSrc;
  }, [imageSrc, toast]);
 
  useEffect(() => {
    redrawCanvas();
    const handleResize = () => redrawCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawCanvas]);


  const resetEditorState = (showToast = true) => {
    setOriginalImageFile(null);
    setImageSrc(null);
    // currentImageElement will be reset by imageSrc effect
    setActiveTool(null);
    setRotationAngle(0);
    setOutputFormat('image/png');
    setTextInput('');
    setTextColor('#FFFFFF');
    setFontSize(48);
    setFontFamily('Arial');
    setTextAlign('left');
    setIsAddingText(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);

    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (showToast) {
        toast({ title: "Editor Reset", description: "Ready for a new image."});
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File Type", description: "Please upload an image.", variant: "destructive" });
        return;
      }
      resetEditorState(false); 
      setOriginalImageFile(file); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        // activeTool is reset in resetEditorState
        toast({ title: "Image Loaded", description: `${file.name} is ready for editing.`});
      };
      reader.readAsDataURL(file);
    }
  };

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event.target.files?.[0] || null);
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileChange(event.dataTransfer.files?.[0] || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []); 

  const handleToolClick = (toolName: string) => {
    if (!currentImageElement && !['upload', 'text', 'colors'].includes(toolName) ) { 
      toast({ title: "No Image", description: "Please upload an image first.", variant: "default" });
      return;
    }
    setActiveTool(prevTool => prevTool === toolName ? null : toolName);
    setIsAddingText(false); 

    if (toolName === "rotate") {
      if (!currentImageElement || !canvasRef.current) return;
      const newAngle = (rotationAngle + 90) % 360;
      setRotationAngle(newAngle); // This will trigger redrawCanvas via useEffect
      toast({ title: "Image Rotated", description: `Current angle: ${newAngle}°`});
    } else if (toolName === "text") {
       toast({ title: "Text Tool Active", description: "Configure text, click 'Prepare', then click on canvas."});
    } else if (toolName === "colors") {
        toast({ title: "Color Tune Active", description: "Adjust color properties using the sliders."});
    }
  };
  
  const handlePrepareText = () => {
    if (!currentImageElement) { 
        toast({ title: "No Image", description: "Upload an image before adding text.", variant: "default" });
        return;
    }
    if (!textInput.trim()) {
        toast({ title: "No Text", description: "Enter some text to add.", variant: "default" });
        return;
    }
    setIsAddingText(true);
  };

  const handleResetColorTune = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);
    // redrawCanvas will be triggered by state changes via useEffect
    toast({ title: "Color Tune Reset", description: "Color adjustments have been reset to default." });
  };


  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text' && isAddingText && canvasRef.current && textInput.trim() !== '' && currentImageElement) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      redrawCanvas(); // Ensure canvas is up-to-date with filters/rotation before adding text

      const rect = canvas.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      x *= scaleX;
      y *= scaleY;
      
      ctx.save(); 
      // Text is NOT filtered by canvas filter; it's drawn on top of the already filtered image.
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = textAlign; 
      ctx.textBaseline = 'middle'; 
      ctx.fillText(textInput, x, y);
      ctx.restore(); 

      try {
        const newImgDataUrl = canvas.toDataURL(outputFormat); 
        if (newImgDataUrl === "data:,") {
            toast({title: "Error", description: "Could not bake text. Canvas may be empty.", variant: "destructive"});
            setIsAddingText(false);
            return;
        }
        const newImg = new window.Image();
        newImg.onload = () => {
          if (newImg.naturalWidth === 0 || newImg.naturalHeight === 0) {
            toast({title: "Error", description: "Baked image is empty. Text not applied.", variant: "destructive"});
          } else {
            setCurrentImageElement(newImg); // This causes redrawCanvas via useEffect
            toast({ title: "Text Added", description: "Text drawn onto image." });
          }
        }
        newImg.onerror = () => toast({title: "Error", description: "Could not update image with text.", variant: "destructive"});
        newImg.src = newImgDataUrl;
      } catch (e) {
        toast({title: "Error", description: `Failed to bake text: ${e instanceof Error ? e.message : String(e)}`, variant: "destructive"});
      }
      setIsAddingText(false); 
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current || !currentImageElement || !originalImageFile) { 
        toast({ title: "No Image Data", description: "Upload and process an image first.", variant: "destructive" });
        return;
    }
    const canvas = canvasRef.current;
    // Ensure canvas is explicitly redrawn with latest state before download
    redrawCanvas();

    if (canvas.width <= 1 || canvas.height <= 1 || (currentImageElement && currentImageElement.naturalWidth === 0)) { 
         toast({ title: "Canvas Empty", description: "No image content to download.", variant: "destructive" });
        return;
    }
    
    let dataUrl;
    try {
        dataUrl = canvas.toDataURL(outputFormat);
        if (dataUrl === "data:,") throw new Error("Canvas is empty");
    } catch (e) {
        toast({ title: "Download Error", description: `Could not export image. Try PNG. ${e instanceof Error ? e.message : String(e)}`, variant: "destructive"});
        return;
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    const nameWithoutExtension = originalImageFile.name.split('.').slice(0, -1).join('.') || 'image';
    const newExtension = outputFormat.split('/')[1] || 'bin'; 
    link.download = `${nameWithoutExtension}_edited.${newExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download Started", description: `Downloading as ${newExtension.toUpperCase()}` });
  };

  return (
    <div className="h-full w-full flex flex-col bg-background dark:bg-neutral-900 text-foreground dark:text-neutral-100">
      <ImageEditorToolbar
        onNewImage={() => resetEditorState()}
        outputFormat={outputFormat}
        onOutputFormatChange={setOutputFormat}
        onDownload={handleDownload}
        isImageLoaded={!!currentImageElement}
      />

      <div className="flex flex-1 overflow-hidden h-full">
        <ImageEditorToolPanel
          activeTool={activeTool}
          onToolClick={handleToolClick}
          isImageLoaded={!!currentImageElement}
          // Text tool props
          textInput={textInput}
          onTextInput={setTextInput}
          textColor={textColor}
          onTextColorChange={setTextColor}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          textAlign={textAlign}
          onTextAlignChange={setTextAlign}
          onPrepareText={handlePrepareText}
          isAddingText={isAddingText}
          // Color Tune props
          brightness={brightness}
          onBrightnessChange={setBrightness}
          contrast={contrast}
          onContrastChange={setContrast}
          saturation={saturation}
          onSaturationChange={setSaturation}
          grayscale={grayscale}
          onGrayscaleChange={setGrayscale}
          onResetColorTune={handleResetColorTune}
        />
        <ImageEditorCanvas
          canvasRef={canvasRef}
          canvasContainerRef={canvasContainerRef}
          currentImageElement={currentImageElement}
          isDragging={isDragging}
          onDragOver={useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); }, [])}
          onDragLeave={useCallback(() => setIsDragging(false), [])}
          onDrop={onDrop}
          triggerFileInput={useCallback(() => fileInputRef.current?.click(), [])}
          onCanvasClick={handleCanvasClick}
          activeTool={activeTool}
          isAddingText={isAddingText}
          fileInputRef={fileInputRef}
          onFileSelected={onFileSelected}
        />
      </div>
    </div>
  );
}
