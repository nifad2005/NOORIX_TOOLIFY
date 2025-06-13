
"use client";

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Image as ImageIcon, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export default function ImageConverter() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [originalImageSize, setOriginalImageSize] = useState<number>(0);
  const [originalImageType, setOriginalImageType] = useState<string | null>(null);

  const [convertedImageSrc, setConvertedImageSrc] = useState<string | null>(null);
  const [convertedImageSize, setConvertedImageSize] = useState<number>(0);

  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/jpeg');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
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
      setOriginalImageSize(file.size);
      setOriginalImageType(file.type);

      if (file.type === 'image/png') {
        setOutputFormat('image/jpeg');
      } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        setOutputFormat('image/png');
      } else if (file.type === 'image/webp') {
        setOutputFormat('image/jpeg');
      } else {
        setOutputFormat('image/png'); // Default for GIF or other types
      }


      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageSrc(reader.result as string);
        setConvertedImageSrc(null);
        setConvertedImageSize(0);
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
  }, [handleFileChange]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleConvertImage = async () => {
    if (!originalImageFile || !originalImageSrc) return;

    if (originalImageType === outputFormat) {
        toast({
            title: "Same Format",
            description: "The selected output format is the same as the original image format. Please choose a different format.",
            variant: "default",
        });
        return;
    }

    setIsConverting(true);
    setConvertedImageSrc(null); 
    setConvertedImageSize(0);

    const image = new window.Image();
    image.src = originalImageSrc;

    image.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast({ title: "Error", description: "Could not process image for conversion.", variant: "destructive" });
        setIsConverting(false);
        return;
      }
      
      canvas.width = image.naturalWidth; 
      canvas.height = image.naturalHeight;

      if (outputFormat === 'image/jpeg' && (originalImageType === 'image/png' || originalImageType === 'image/webp' || originalImageType === 'image/gif')) {
        ctx.fillStyle = '#FFFFFF'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      let qualityParam: number | undefined;
      if (outputFormat === 'image/jpeg' || outputFormat === 'image/webp') {
        qualityParam = 1.0; 
      }
      
      const convertedDataUrl = canvas.toDataURL(outputFormat, qualityParam);
      setConvertedImageSrc(convertedDataUrl);

      try {
        const response = await fetch(convertedDataUrl);
        const blob = await response.blob();
        setConvertedImageSize(blob.size);
         toast({
          title: "Conversion Complete!",
          description: `Image converted to ${outputFormat.split('/')[1].toUpperCase()} - ${formatBytes(blob.size)}.`,
        });
      } catch (error) {
        console.error("Error creating blob from converted image:", error);
        setConvertedImageSize(0); 
         toast({
          title: "Conversion Partially Complete",
          description: `Image data generated for ${outputFormat.split('/')[1].toUpperCase()}. Could not determine exact new size.`,
          variant: "default"
        });
      }
      setIsConverting(false);
    };

    image.onerror = () => {
      toast({ title: "Error", description: "Could not load image for conversion.", variant: "destructive" });
      setIsConverting(false);
    };
  };

  const handleDownload = () => {
    if (!convertedImageSrc || !originalImageFile) return;
    const link = document.createElement('a');
    link.href = convertedImageSrc;
    const originalNameParts = originalImageFile.name.split('.');
    originalNameParts.pop(); 
    const nameWithoutExtension = originalNameParts.join('.');
    const newExtension = outputFormat.split('/')[1] || 'bin';
    
    link.download = `${nameWithoutExtension}_converted.${newExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setOriginalImageFile(null);
    setOriginalImageSrc(null);
    setOriginalImageSize(0);
    setOriginalImageType(null);
    setConvertedImageSrc(null);
    setConvertedImageSize(0);
    setIsConverting(false);
    setOutputFormat('image/jpeg'); 
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-8 mx-auto">
      <header className="text-center py-6">
        <h1 className="text-5xl font-bold font-headline text-primary">Toolify</h1>
        <p className="text-xl text-muted-foreground mt-2">Online Image Format Converter</p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Convert Your Image Format</CardTitle>
          <CardDescription>Upload an image, choose a new format, and download the converted version.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!originalImageSrc ? (
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
              <p className="text-sm text-muted-foreground mt-1">Supports PNG, JPG, GIF, WEBP</p>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelected}
                className="hidden"
                accept="image/*"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-center">Original Image</h3>
                  <div className="relative w-full h-64 bg-muted/50 rounded-lg overflow-hidden border">
                    {originalImageSrc && <Image src={originalImageSrc} alt="Original" fill style={{ objectFit: 'contain' }} unoptimized data-ai-hint="uploaded content"/>}
                  </div>
                  <p className="text-center mt-2 text-sm text-muted-foreground">
                    Format: {originalImageType?.split('/')[1].toUpperCase() || 'N/A'} | Size: {formatBytes(originalImageSize)}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                    <ArrowRightLeft className="w-8 h-8 text-primary hidden md:block mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-center">Converted Image</h3>
                    {convertedImageSrc ? (
                        <>
                        <div className="relative w-full h-64 bg-muted/50 rounded-lg overflow-hidden border">
                            <Image src={convertedImageSrc} alt="Converted" fill style={{ objectFit: 'contain' }} unoptimized data-ai-hint="processed content"/>
                        </div>
                        <p className="text-center mt-2 text-sm text-muted-foreground">
                            Format: {outputFormat.split('/')[1].toUpperCase()} | Size: {formatBytes(convertedImageSize)}
                        </p>
                        </>
                    ) : isConverting ? (
                        <div className="relative w-full h-64 flex flex-col items-center justify-center bg-muted/50 rounded-lg border">
                            <p className="text-muted-foreground mb-2">Converting...</p>
                            <Progress value={undefined} className="w-3/4 animate-pulse" />
                        </div>
                    ) : (
                        <div className="relative w-full h-64 flex flex-col items-center justify-center bg-muted/50 rounded-lg border text-muted-foreground">
                        <ImageIcon className="w-16 h-16 mb-2" data-ai-hint="image placeholder"/>
                        <p>Preview will appear after conversion</p>
                        </div>
                    )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div>
                    <Label htmlFor="output-format" className="text-sm font-medium">Convert To Format</Label>
                    <Select 
                        value={outputFormat} 
                        onValueChange={(value: string) => {
                            setOutputFormat(value as OutputFormat);
                            setConvertedImageSrc(null); 
                            setConvertedImageSize(0);
                        }}
                        disabled={isConverting || !originalImageSrc}
                    >
                      <SelectTrigger id="output-format" className="w-full mt-1">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image/jpeg">JPEG</SelectItem>
                        <SelectItem value="image/png">PNG</SelectItem>
                        <SelectItem value="image/webp">WEBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <Button 
                    onClick={handleConvertImage} 
                    disabled={isConverting || !originalImageSrc || (originalImageType === outputFormat)} 
                    className="w-full bg-primary hover:bg-primary/90"
                   >
                    {isConverting ? 'Converting...' : 'Convert Image'}
                  </Button>
                </div>
                {isConverting && <Progress value={undefined} className="w-full transition-opacity duration-300 animate-pulse" />}
              </div>
            </div>
          )}
        </CardContent>
        {originalImageSrc && (
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
              <RotateCcw className="mr-2 h-4 w-4" /> Clear Image
            </Button>
            <Button onClick={handleDownload} disabled={!convertedImageSrc || isConverting} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
              <Download className="mr-2 h-4 w-4" /> Download Converted
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

    
