
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, FileText as PdfIcon, RotateCcw, Loader2 } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

type CompressionLevel = 'low' | 'medium' | 'high';

export default function PdfCompressor() {
  const [originalPdfFile, setOriginalPdfFile] = useState<File | null>(null);
  const [originalPdfName, setOriginalPdfName] = useState<string | null>(null);
  const [originalPdfSize, setOriginalPdfSize] = useState<number>(0);

  const [simulatedCompressedPdfSize, setSimulatedCompressedPdfSize] = useState<number>(0);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetCompressionState = () => {
    setSimulatedCompressedPdfSize(0);
  };

  useEffect(() => {
    if (originalPdfFile) {
        // When a new file is uploaded or compression level changes, reset simulated size
        resetCompressionState();
    }
  }, [originalPdfFile, compressionLevel]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
        return;
      }

      setOriginalPdfFile(file);
      setOriginalPdfName(file.name);
      setOriginalPdfSize(file.size);
      resetCompressionState(); // Reset on new file
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

  const handleCompressPdf = async () => {
    if (!originalPdfFile) return;

    setIsCompressing(true);
    setSimulatedCompressedPdfSize(0);

    // Simulate delay for compression
    await new Promise(resolve => setTimeout(resolve, 1500));

    let reductionFactor = 0.7; // Medium
    if (compressionLevel === 'low') reductionFactor = 0.9; // Less reduction
    if (compressionLevel === 'high') reductionFactor = 0.5; // More reduction

    const estimatedSize = Math.max(1024, Math.round(originalPdfSize * reductionFactor));
    setSimulatedCompressedPdfSize(estimatedSize);
    
    setIsCompressing(false);
    toast({
      title: "PDF Compression Simulated!",
      description: `Estimated new size: ${formatBytes(estimatedSize)}. Download will provide the original file renamed.`,
    });
  };

  const handleDownload = () => {
    if (!originalPdfFile) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(originalPdfFile); // Use the original file for download
    
    const nameParts = originalPdfFile.name.split('.');
    const extension = nameParts.pop();
    const nameWithoutExtension = nameParts.join('.');
    
    link.download = `${nameWithoutExtension}_compressed.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleReset = () => {
    setOriginalPdfFile(null);
    setOriginalPdfName(null);
    setOriginalPdfSize(0);
    resetCompressionState();
    setIsCompressing(false);
    setCompressionLevel('medium');
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getEstimatedSizeBeforeCompression = () => {
    if (!originalPdfFile) return 0;
    let reductionFactor = 0.7; // Medium
    if (compressionLevel === 'low') reductionFactor = 0.9;
    if (compressionLevel === 'high') reductionFactor = 0.5;
    return Math.max(1024, Math.round(originalPdfSize * reductionFactor));
  };


  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <header className="text-center py-6">
        <h1 className="text-5xl font-bold font-headline text-primary">Toolify</h1>
        <p className="text-xl text-muted-foreground mt-2">Online PDF Compressor (Simulated)</p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Compress Your PDF</CardTitle>
          <CardDescription>Upload a PDF, choose a simulated compression level, and download.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!originalPdfFile ? (
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
                Drag & drop a PDF here, or click to select file
              </p>
              <p className="text-sm text-muted-foreground mt-1">Supports .PDF files</p>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelected}
                className="hidden"
                accept=".pdf"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                    <PdfIcon className="w-10 h-10 text-destructive" />
                    <div>
                        <p className="font-semibold text-lg">{originalPdfName}</p>
                        <p className="text-sm text-muted-foreground">Original size: {formatBytes(originalPdfSize)}</p>
                    </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                        <Label htmlFor="compression-level" className="text-sm font-medium">Compression Level (Simulated)</Label>
                        <Select 
                            value={compressionLevel} 
                            onValueChange={(value: string) => {
                                setCompressionLevel(value as CompressionLevel);
                                resetCompressionState(); // Reset on change
                            }}
                            disabled={isCompressing}
                        >
                        <SelectTrigger id="compression-level" className="w-full mt-1">
                            <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low (Smaller Reduction)</SelectItem>
                            <SelectItem value="medium">Medium (Balanced)</SelectItem>
                            <SelectItem value="high">High (Larger Reduction)</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleCompressPdf} disabled={isCompressing || !originalPdfFile} className="w-full bg-primary hover:bg-primary/90">
                        {isCompressing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Simulating...
                            </>
                        ) : 'Compress PDF'}
                    </Button>
                </div>

                {isCompressing && <Progress value={undefined} className="w-full transition-opacity duration-300 animate-pulse" />}
                
                {simulatedCompressedPdfSize > 0 && !isCompressing && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-center">
                    <p className="font-medium text-green-700">Simulated Compressed Size: {formatBytes(simulatedCompressedPdfSize)}</p>
                    <p className="text-xs text-green-600">(Original: {formatBytes(originalPdfSize)} - Saved approx. {formatBytes(originalPdfSize - simulatedCompressedPdfSize)})</p>
                  </div>
                )}
                 {!simulatedCompressedPdfSize && !isCompressing && originalPdfFile && (
                    <p className="text-sm text-muted-foreground text-center">
                        Estimated size after compression: ~{formatBytes(getEstimatedSizeBeforeCompression())}
                    </p>
                 )}
              </div>
            </div>
          )}
        </CardContent>
        {originalPdfFile && (
          <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
              <RotateCcw className="mr-2 h-4 w-4" /> Clear PDF
            </Button>
            <Button onClick={handleDownload} disabled={isCompressing || !originalPdfFile} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </CardFooter>
        )}
      </Card>
       <p className="text-xs text-muted-foreground text-center">
        Note: PDF compression is simulated. The downloaded file will be the original PDF renamed. For actual compression, advanced processing is typically required.
      </p>
    </div>
  );
}
