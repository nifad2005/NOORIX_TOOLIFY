
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

type CompressionLevel = 'low' | 'medium' | 'high';
type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export default function ImageCompressor() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [originalImageSize, setOriginalImageSize] = useState<number>(0);

  const [compressedImageSrc, setCompressedImageSrc] = useState<string | null>(null);
  const [compressedImageSize, setCompressedImageSize] = useState<number>(0);
  const [estimatedCompressedSize, setEstimatedCompressedSize] = useState<number>(0);

  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/jpeg');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (originalImageSize > 0 && originalImageSrc && originalImageFile) {
      let qualityFactor = 0.7; 
      let scaleFactor = 0.7;   

      if (compressionLevel === 'low') {
        qualityFactor = 0.9;
        scaleFactor = 0.85;
      } else if (compressionLevel === 'high') {
        qualityFactor = 0.5;
        scaleFactor = 0.5;
      }
      
      let estimate;
      if (outputFormat === 'image/jpeg' || outputFormat === 'image/webp') {
        estimate = Math.max(1024, Math.round(originalImageSize * qualityFactor * 0.8)); 
      } else { 
        estimate = Math.max(1024, Math.round(originalImageSize * scaleFactor * scaleFactor));
      }
      setEstimatedCompressedSize(estimate);
    } else {
      setEstimatedCompressedSize(0);
    }
  }, [originalImageSize, compressionLevel, outputFormat, originalImageSrc, originalImageFile]);

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

      if (file.type === 'image/png') {
        setOutputFormat('image/png');
      } else if (file.type === 'image/webp') {
        setOutputFormat('image/webp');
      } else {
        setOutputFormat('image/jpeg'); // Default for JPG and others like GIF
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageSrc(reader.result as string);
        setCompressedImageSrc(null);
        setCompressedImageSize(0);
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

  const handleCompressImage = async () => {
    if (!originalImageFile || !originalImageSrc) return;

    setIsCompressing(true);
    setCompressedImageSrc(null); 
    setCompressedImageSize(0);

    const image = new window.Image();
    image.src = originalImageSrc;

    image.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast({ title: "Error", description: "Could not process image.", variant: "destructive" });
        setIsCompressing(false);
        return;
      }

      let quality = 0.7; 
      let scaleFactor = 0.7; 

      switch (compressionLevel) {
        case 'low':
          quality = 0.9;
          scaleFactor = 0.85;
          break;
        case 'high':
          quality = 0.5;
          scaleFactor = 0.5;
          break;
        case 'medium':
        default:
          quality = 0.7;
          scaleFactor = 0.7;
          break;
      }
      
      canvas.width = image.width * scaleFactor;
      canvas.height = image.height * scaleFactor;

      // Fill background for formats that don't support transparency (like JPEG)
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF'; // White background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const qualityParam = (outputFormat === 'image/jpeg' || outputFormat === 'image/webp') ? quality : undefined;
      const compressedDataUrl = canvas.toDataURL(outputFormat, qualityParam);
      setCompressedImageSrc(compressedDataUrl);

      try {
        const response = await fetch(compressedDataUrl);
        const blob = await response.blob();
        setCompressedImageSize(blob.size);
         toast({
          title: "Compression Complete!",
          description: `Image compressed to ${outputFormat.split('/')[1].toUpperCase()} - ${formatBytes(blob.size)}.`,
        });
      } catch (error) {
        console.error("Error creating blob from compressed image:", error);
        setCompressedImageSize(0); 
         toast({
          title: "Compression Partially Complete",
          description: `Image data generated for ${outputFormat.split('/')[1].toUpperCase()}. Could not determine exact new size.`,
          variant: "default"
        });
      }
      setIsCompressing(false);
    };

    image.onerror = () => {
      toast({ title: "Error", description: "Could not load image for compression.", variant: "destructive" });
      setIsCompressing(false);
    };
  };

  const handleDownload = () => {
    if (!compressedImageSrc || !originalImageFile) return;
    const link = document.createElement('a');
    link.href = compressedImageSrc;
    const originalNameParts = originalImageFile.name.split('.');
    originalNameParts.pop(); // Remove original extension
    const nameWithoutExtension = originalNameParts.join('.');
    const newExtension = outputFormat.split('/')[1] || 'bin';
    
    link.download = `${nameWithoutExtension}_compressed.${newExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setOriginalImageFile(null);
    setOriginalImageSrc(null);
    setOriginalImageSize(0);
    setCompressedImageSrc(null);
    setCompressedImageSize(0);
    setEstimatedCompressedSize(0);
    setIsCompressing(false);
    setOutputFormat('image/jpeg'); // Reset to default
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <header className="text-center py-6">
        <h1 className="text-5xl font-bold font-headline text-primary">Toolify</h1>
        <p className="text-xl text-muted-foreground mt-2">Online Image Compressor</p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Compress Your Image</CardTitle>
          <CardDescription>Upload an image, choose compression options, and download the optimized version.</CardDescription>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-center">Original Image</h3>
                  <div className="relative w-full h-64 bg-muted/50 rounded-lg overflow-hidden border">
                    {originalImageSrc && <Image src={originalImageSrc} alt="Original" fill style={{ objectFit: 'contain' }} unoptimized data-ai-hint="uploaded content"/>}
                  </div>
                  <p className="text-center mt-2 text-sm text-muted-foreground">Size: {formatBytes(originalImageSize)}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-center">Compressed Image</h3>
                  {compressedImageSrc ? (
                    <>
                      <div className="relative w-full h-64 bg-muted/50 rounded-lg overflow-hidden border">
                        <Image src={compressedImageSrc} alt="Compressed" fill style={{ objectFit: 'contain' }} unoptimized data-ai-hint="processed content"/>
                      </div>
                      <p className="text-center mt-2 text-sm text-muted-foreground">
                        Actual size: {formatBytes(compressedImageSize)}
                        {originalImageSize > 0 && compressedImageSize > 0 && (
                          <span className="ml-1">
                            {originalImageSize > compressedImageSize ? 
                              `(Saved ${formatBytes(originalImageSize - compressedImageSize)}, ${(((originalImageSize - compressedImageSize) / originalImageSize) * 100).toFixed(1)}%)` :
                              `(No size reduction achieved or size increased)`
                            }
                          </span>
                        )}
                      </p>
                    </>
                  ) : isCompressing ? (
                     <div className="relative w-full h-64 flex flex-col items-center justify-center bg-muted/50 rounded-lg border">
                        <p className="text-muted-foreground mb-2">Compressing...</p>
                        <Progress value={undefined} className="w-3/4 animate-pulse" />
                     </div>
                  ) : (
                    <div className="relative w-full h-64 flex flex-col items-center justify-center bg-muted/50 rounded-lg border text-muted-foreground">
                      <ImageIcon className="w-16 h-16 mb-2" data-ai-hint="image placeholder"/>
                      <p>Preview will appear after compression</p>
                      {originalImageSrc && !isCompressing && estimatedCompressedSize > 0 && (
                        <p className="text-sm mt-1">Estimated compressed size: ~{formatBytes(estimatedCompressedSize)}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label htmlFor="compression-level" className="text-sm font-medium">Compression Level</Label>
                    <Select 
                        value={compressionLevel} 
                        onValueChange={(value: string) => {
                            setCompressionLevel(value as CompressionLevel);
                            setCompressedImageSrc(null); 
                            setCompressedImageSize(0);
                        }}
                        disabled={isCompressing || !originalImageSrc}
                    >
                      <SelectTrigger id="compression-level" className="w-full mt-1">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Better Quality)</SelectItem>
                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="high">High (Smaller Size)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="output-format" className="text-sm font-medium">Output Format</Label>
                    <Select 
                        value={outputFormat} 
                        onValueChange={(value: string) => {
                            setOutputFormat(value as OutputFormat);
                            setCompressedImageSrc(null); 
                            setCompressedImageSize(0);
                        }}
                        disabled={isCompressing || !originalImageSrc}
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
                   <Button onClick={handleCompressImage} disabled={isCompressing || !originalImageSrc} className="w-full lg:w-auto bg-primary hover:bg-primary/90">
                    {isCompressing ? 'Compressing...' : 'Compress Image'}
                  </Button>
                </div>
                {isCompressing && <Progress value={undefined} className="w-full transition-opacity duration-300 animate-pulse" />}
              </div>
            </div>
          )}
        </CardContent>
        {originalImageSrc && (
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
              <RotateCcw className="mr-2 h-4 w-4" /> Clear Image
            </Button>
            <Button onClick={handleDownload} disabled={!compressedImageSrc || isCompressing} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
              <Download className="mr-2 h-4 w-4" /> Download Compressed
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
    
