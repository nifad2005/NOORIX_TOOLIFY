
"use client";

import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Download, QrCode as QrCodeIcon, RefreshCcw } from 'lucide-react';
import Image from 'next/image';

export default function QrCodeGenerator() {
  const [inputText, setInputText] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  const handleGenerateQrCode = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text or a URL to generate a QR code.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setQrCodeDataUrl(null); 
    try {
      const dataUrl = await QRCode.toDataURL(inputText, {
        errorCorrectionLevel: 'H', // High error correction
        type: 'image/png',
        width: 300, // Fixed width for display
        margin: 2,
      });
      setQrCodeDataUrl(dataUrl);
      toast({
        title: "QR Code Generated!",
        description: "Your QR code is ready to be viewed or downloaded.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error Generating QR Code",
        description: "Could not generate QR code. Please try again.",
        variant: "destructive",
      });
      setQrCodeDataUrl(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setInputText('');
    setQrCodeDataUrl(null);
    setIsGenerating(false);
  };

  return (
    <div className="w-full max-w-xl space-y-8 mx-auto py-8 px-4 md:px-0">
      <header className="text-center">
        <h1 className="text-5xl font-bold font-headline text-primary">Toolify</h1>
        <p className="text-xl text-muted-foreground mt-2">QR Code Generator</p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Generate QR Code</CardTitle>
          <CardDescription>Enter any text or URL below to generate a QR code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="qr-input" className="text-base font-medium">Text or URL</Label>
            <Textarea
              id="qr-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., https://example.com or 'Hello World'"
              rows={4}
              className="resize-none text-base"
              disabled={isGenerating}
            />
          </div>

          <Button 
            onClick={handleGenerateQrCode} 
            disabled={isGenerating || !inputText.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
          >
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </Button>

          {qrCodeDataUrl && (
            <div className="mt-6 flex flex-col items-center space-y-4 p-4 border rounded-lg bg-muted/20">
              <h3 className="text-xl font-semibold text-center">Your QR Code:</h3>
              <div className="p-2 bg-white inline-block rounded-md shadow-md">
                <Image 
                    src={qrCodeDataUrl} 
                    alt="Generated QR Code" 
                    width={250} 
                    height={250} 
                    data-ai-hint="qr code"
                    className="rounded"
                />
              </div>
            </div>
          )}
           {isGenerating && (
             <div className="mt-6 flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/20">
                <QrCodeIcon className="w-16 h-16 text-primary animate-pulse mb-4" />
                <p className="text-muted-foreground">Generating QR Code...</p>
             </div>
           )}

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto text-base py-3" disabled={isGenerating}>
              <RefreshCcw className="mr-2 h-5 w-5" /> Clear
            </Button>
            <Button 
                onClick={handleDownload} 
                disabled={!qrCodeDataUrl || isGenerating} 
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-base py-3"
            >
              <Download className="mr-2 h-5 w-5" /> Download QR Code
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

