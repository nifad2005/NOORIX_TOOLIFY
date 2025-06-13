
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

  const [isDragging, setIsDragging] = useState<boolean>(false); // For file drag/drop
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
  const [hueRotate, setHueRotate] = useState<number>(0);

  // Crop tool state
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropDragStart, setCropDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentCropRect, setCurrentCropRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!currentImageElement || currentImageElement.naturalWidth <= 0 || currentImageElement.naturalHeight <= 0) {
      if (canvas.width > 0 && canvas.height > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const img = currentImageElement;
    let targetCanvasWidth = img.naturalWidth;
    let targetCanvasHeight = img.naturalHeight;

    if (rotationAngle === 90 || rotationAngle === 270) {
      targetCanvasWidth = img.naturalHeight;
      targetCanvasHeight = img.naturalWidth;
    }

    if (canvas.width !== targetCanvasWidth) canvas.width = targetCanvasWidth;
    if (canvas.height !== targetCanvasHeight) canvas.height = targetCanvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) hue-rotate(${hueRotate}deg)`;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotationAngle * Math.PI / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2, img.naturalWidth, img.naturalHeight);
    ctx.restore();
    ctx.filter = 'none';

    // Draw crop selection if active
    if (activeTool === 'crop' && currentCropRect && currentCropRect.width > 0 && currentCropRect.height > 0) {
      ctx.save();
      // Semi-transparent overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear the selected area from the overlay
      ctx.clearRect(currentCropRect.x, currentCropRect.y, currentCropRect.width, currentCropRect.height);
      
      // Draw dashed border for the crop rectangle
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(currentCropRect.x, currentCropRect.y, currentCropRect.width, currentCropRect.height);
      ctx.restore();
    }

  }, [currentImageElement, rotationAngle, brightness, contrast, saturation, grayscale, hueRotate, activeTool, currentCropRect]);

  useEffect(() => {
    redrawCanvas();
    const handleResize = () => redrawCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawCanvas]);


  const resetEditorState = (showToast = true) => {
    setOriginalImageFile(null);
    setImageSrc(null);
    setCurrentImageElement(null);
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
    setHueRotate(0);
    setIsCropping(false);
    setCropDragStart(null);
    setCurrentCropRect(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (showToast) {
      toast({ title: "Editor Reset", description: "Ready for a new image." });
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
        const newImageSrc = reader.result as string;
        const img = new window.Image();
        img.onload = () => {
          setRotationAngle(0);
          setBrightness(100);
          setContrast(100);
          setSaturation(100);
          setGrayscale(0);
          setHueRotate(0);
          setCurrentCropRect(null);
          setIsCropping(false);
          setCropDragStart(null);
          setCurrentImageElement(img);
          toast({ title: "Image Loaded", description: `${file.name} is ready for editing.` });
        };
        img.onerror = () => {
          toast({ title: "Error", description: "Could not load image file.", variant: "destructive" });
          setCurrentImageElement(null);
        };
        img.src = newImageSrc;
        setImageSrc(newImageSrc);
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
    if (!currentImageElement && !['upload', 'text', 'colors'].includes(toolName)) {
      toast({ title: "No Image", description: "Please upload an image first.", variant: "default" });
      return;
    }
    setActiveTool(prevTool => prevTool === toolName ? null : toolName);
    setIsAddingText(false);
    setCurrentCropRect(null); // Reset crop rect when changing tools
    setIsCropping(false);
    setCropDragStart(null);


    if (toolName === "rotate") {
      if (!currentImageElement || !canvasRef.current) return;
      setRotationAngle(prevAngle => (prevAngle + 90) % 360);
    } else if (toolName === "text") {
      toast({ title: "Text Tool Active", description: "Configure text, click 'Prepare', then click on canvas." });
    } else if (toolName === "colors") {
      toast({ title: "Color Tune Active", description: "Adjust color properties using the sliders." });
    } else if (toolName === "crop") {
      toast({ title: "Crop Tool Active", description: "Drag on the image to select an area, then click Apply Crop." });
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
    setHueRotate(0);
    toast({ title: "Color Tune Reset", description: "Color adjustments have been reset to default." });
  };

  const getScaledCoords = (event: React.MouseEvent<HTMLCanvasElement>): { x: number, y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'crop' && currentImageElement) {
      const coords = getScaledCoords(event);
      if (coords) {
        setIsCropping(true);
        setCropDragStart(coords);
        setCurrentCropRect({ x: coords.x, y: coords.y, width: 0, height: 0 }); // Start with a point
      }
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'crop' && isCropping && cropDragStart && currentImageElement) {
      const coords = getScaledCoords(event);
      if (coords) {
        const newRectX = Math.min(cropDragStart.x, coords.x);
        const newRectY = Math.min(cropDragStart.y, coords.y);
        const newRectWidth = Math.abs(coords.x - cropDragStart.x);
        const newRectHeight = Math.abs(coords.y - cropDragStart.y);
        setCurrentCropRect({ x: newRectX, y: newRectY, width: newRectWidth, height: newRectHeight });
      }
    }
  };

  const handleCanvasMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'crop' && isCropping) {
      setIsCropping(false);
      // Optional: if cropRect is too small, reset it
      if (currentCropRect && (currentCropRect.width < 5 || currentCropRect.height < 5)) {
        // setCurrentCropRect(null); // Keep it to allow apply/cancel
        // toast({ title: "Crop Area Too Small", description: "Please select a larger area.", variant: "default" });
      }
    }
  };
  
  const handleCanvasMouseLeave = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'crop' && isCropping) {
      setIsCropping(false);
      // If user drags out of canvas, consider the current selection as final for now or reset
      // For simplicity, let's keep currentCropRect
      // setCurrentCropRect(null); 
      // setCropDragStart(null);
    }
  };


  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'text' && isAddingText && canvasRef.current && textInput.trim() !== '' && currentImageElement) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const coords = getScaledCoords(event);
      if(!coords) return;
      
      ctx.save();
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'middle';
      ctx.fillText(textInput, coords.x, coords.y);
      ctx.restore();

      try {
        const newImgDataUrl = canvas.toDataURL(outputFormat);
        if (newImgDataUrl === "data:,") {
          toast({ title: "Error", description: "Could not bake text. Canvas may be empty.", variant: "destructive" });
          setIsAddingText(false);
          return;
        }
        const newImg = new window.Image();
        newImg.onload = () => {
          if (newImg.naturalWidth === 0 || newImg.naturalHeight === 0) {
            toast({ title: "Error", description: "Baked image is empty. Text not applied.", variant: "destructive" });
          } else {
            setRotationAngle(0);
            setBrightness(100);
            setContrast(100);
            setSaturation(100);
            setGrayscale(0);
            setHueRotate(0);
            setCurrentCropRect(null); // Reset crop after baking text
            setCurrentImageElement(newImg);
            toast({ title: "Text Added", description: "Text drawn onto image." });
          }
        }
        newImg.onerror = () => toast({ title: "Error", description: "Could not update image with text.", variant: "destructive" });
        newImg.src = newImgDataUrl;
      } catch (e) {
        toast({ title: "Error", description: `Failed to bake text: ${e instanceof Error ? e.message : String(e)}`, variant: "destructive" });
      }
      setIsAddingText(false);
    }
  };
  
  const handleApplyCrop = () => {
    const mainCanvas = canvasRef.current;
    if (!mainCanvas || !currentImageElement || !currentCropRect || currentCropRect.width <= 0 || currentCropRect.height <= 0) {
      toast({ title: "Invalid Crop Area", description: "Please select a valid area to crop.", variant: "destructive" });
      return;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = currentCropRect.width;
    tempCanvas.height = currentCropRect.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      toast({ title: "Error", description: "Could not prepare for crop.", variant: "destructive" });
      return;
    }

    // Draw the selected portion from the main canvas (which has all transformations) to the temp canvas
    tempCtx.drawImage(
      mainCanvas,
      currentCropRect.x,
      currentCropRect.y,
      currentCropRect.width,
      currentCropRect.height,
      0,
      0,
      currentCropRect.width,
      currentCropRect.height
    );

    try {
      const newImgDataUrl = tempCanvas.toDataURL(outputFormat);
      if (newImgDataUrl === "data:,") {
        toast({ title: "Crop Error", description: "Cropped area is empty.", variant: "destructive" });
        return;
      }
      const newImg = new window.Image();
      newImg.onload = () => {
        setCurrentImageElement(newImg);
        // Reset transformations as they are baked into the new cropped image
        setRotationAngle(0);
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setGrayscale(0);
        setHueRotate(0);
        // Reset crop state
        setCurrentCropRect(null);
        setCropDragStart(null);
        setIsCropping(false);
        setActiveTool(null); // Or to a default tool
        toast({ title: "Crop Applied", description: "Image has been cropped." });
      };
      newImg.onerror = () => toast({ title: "Error", description: "Could not load cropped image.", variant: "destructive" });
      newImg.src = newImgDataUrl;
    } catch (e) {
      toast({ title: "Crop Error", description: `Failed to apply crop: ${e instanceof Error ? e.message : String(e)}`, variant: "destructive" });
    }
  };

  const handleCancelCrop = () => {
    setCurrentCropRect(null);
    setCropDragStart(null);
    setIsCropping(false);
    // Optionally deactivate crop tool or redraw to remove selection
    redrawCanvas(); // Force redraw to remove selection visuals
    toast({ title: "Crop Canceled", description: "Crop selection has been removed." });
  };


  const handleDownload = () => {
    if (!canvasRef.current || !currentImageElement || !originalImageFile) {
      toast({ title: "No Image Data", description: "Upload and process an image first.", variant: "destructive" });
      return;
    }
    const canvas = canvasRef.current;
    redrawCanvas(); // Ensure final state is on canvas

    if (canvas.width <= 1 || canvas.height <= 1 || (currentImageElement && currentImageElement.naturalWidth === 0)) {
      toast({ title: "Canvas Empty", description: "No image content to download.", variant: "destructive" });
      return;
    }

    let dataUrl;
    try {
      dataUrl = canvas.toDataURL(outputFormat);
      if (dataUrl === "data:,") throw new Error("Canvas is empty");
    } catch (e) {
      toast({ title: "Download Error", description: `Could not export image. Try PNG. ${e instanceof Error ? e.message : String(e)}`, variant: "destructive" });
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

  const isCropAreaSelected = !!currentCropRect && currentCropRect.width > 0 && currentCropRect.height > 0;

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
          brightness={brightness}
          onBrightnessChange={setBrightness}
          contrast={contrast}
          onContrastChange={setContrast}
          saturation={saturation}
          onSaturationChange={setSaturation}
          grayscale={grayscale}
          onGrayscaleChange={setGrayscale}
          hueRotate={hueRotate}
          onHueRotateChange={setHueRotate}
          onResetColorTune={handleResetColorTune}
          onApplyCrop={handleApplyCrop}
          onCancelCrop={handleCancelCrop}
          isCropAreaSelected={isCropAreaSelected}
        />
        <ImageEditorCanvas
          canvasRef={canvasRef}
          canvasContainerRef={canvasContainerRef}
          currentImageElement={currentImageElement}
          isDragging={isDragging} // For file drag/drop
          onDragOver={useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); }, [])}
          onDragLeave={useCallback(() => setIsDragging(false), [])}
          onDrop={onDrop}
          triggerFileInput={useCallback(() => fileInputRef.current?.click(), [])}
          onCanvasClick={handleCanvasClick}
          onCanvasMouseDown={handleCanvasMouseDown}
          onCanvasMouseMove={handleCanvasMouseMove}
          onCanvasMouseUp={handleCanvasMouseUp}
          onCanvasMouseLeave={handleCanvasMouseLeave}
          activeTool={activeTool}
          isAddingText={isAddingText}
          isCropping={isCropping}
          fileInputRef={fileInputRef}
          onFileSelected={onFileSelected}
        />
      </div>
    </div>
  );
}
    
