
"use client";

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { Download, QrCode as QrCodeIcon, RefreshCcw, Wifi, Type, LinkIcon as UrlIcon } from 'lucide-react';
import Image from 'next/image';

type QrType = 'url' | 'text' | 'wifi';
type WifiEncryption = 'WPA' | 'WEP' | 'nopass';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const defaultDarkColor = '#3F51B5'; // Primary color
const defaultLightColor = '#FAFAFA'; // Background color

export default function QrCodeGenerator() {
  const [qrType, setQrType] = useState<QrType>('url');
  
  const [inputText, setInputText] = useState<string>(''); // For URL and Text
  const [wifiSsid, setWifiSsid] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [wifiEncryption, setWifiEncryption] = useState<WifiEncryption>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);

  const [qrColorDark, setQrColorDark] = useState<string>(defaultDarkColor);
  const [qrColorLight, setQrColorLight] = useState<string>(defaultLightColor);
  const [qrErrorCorrectionLevel, setQrErrorCorrectionLevel] = useState<ErrorCorrectionLevel>('H');
  
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Reset inputs when QR type changes, but not colors or error level
    setInputText('');
    setWifiSsid('');
    setWifiPassword('');
    setWifiEncryption('WPA');
    setWifiHidden(false);
    setQrCodeDataUrl(null); // Clear previous QR code
  }, [qrType]);

  const getQrDataString = (): string => {
    switch (qrType) {
      case 'url':
        return inputText;
      case 'text':
        return inputText;
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden};;`;
      default:
        return '';
    }
  };

  const isInputValid = (): boolean => {
    if (qrType === 'url' || qrType === 'text') {
      return inputText.trim() !== '';
    }
    if (qrType === 'wifi') {
      return wifiSsid.trim() !== ''; // Password can be empty for 'nopass'
    }
    return false;
  };

  const handleGenerateQrCode = async () => {
    if (!isInputValid()) {
      toast({
        title: "Input Required",
        description: `Please enter the required information for the ${qrType.toUpperCase()} QR code.`,
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setQrCodeDataUrl(null); 
    const dataString = getQrDataString();

    try {
      const dataUrl = await QRCode.toDataURL(dataString, {
        errorCorrectionLevel: qrErrorCorrectionLevel,
        type: 'image/png',
        width: 300, 
        margin: 2,
        color: {
          dark: qrColorDark,
          light: qrColorLight,
        },
      });
      setQrCodeDataUrl(dataUrl);
      toast({
        title: "QR Code Generated!",
        description: `Your ${qrType.toUpperCase()} QR code is ready.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error Generating QR Code",
        description: "Could not generate QR code. Please check your input and try again.",
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
    link.download = `${qrType}_qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setQrType('url'); // Resets other inputs via useEffect
    setQrColorDark(defaultDarkColor);
    setQrColorLight(defaultLightColor);
    setQrErrorCorrectionLevel('H');
    setQrCodeDataUrl(null);
    setIsGenerating(false);
  };

  return (
    <div className="w-full max-w-xl space-y-8 mx-auto py-8 px-4 md:px-0">
      <header className="text-center">
        <h1 className="text-5xl font-bold font-headline text-primary">Toolify</h1>
        <p className="text-xl text-muted-foreground mt-2">Advanced QR Code Generator</p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Create Your Custom QR Code</CardTitle>
          <CardDescription>Select type, enter data, customize, and generate your QR code for URLs, text, WiFi, and more.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div>
            <Label htmlFor="qr-type" className="text-base font-medium">QR Code Type</Label>
            <Select value={qrType} onValueChange={(value) => setQrType(value as QrType)} disabled={isGenerating}>
              <SelectTrigger id="qr-type" className="w-full mt-1 text-base">
                <SelectValue placeholder="Select QR Code Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url"><div className="flex items-center"><UrlIcon className="mr-2 h-5 w-5 text-primary" />URL</div></SelectItem>
                <SelectItem value="text"><div className="flex items-center"><Type className="mr-2 h-5 w-5 text-primary" />Text</div></SelectItem>
                <SelectItem value="wifi"><div className="flex items-center"><Wifi className="mr-2 h-5 w-5 text-primary" />WiFi Network</div></SelectItem>
              </SelectContent>
            </Select>
          </div>

          {qrType === 'url' && (
            <div className="space-y-2">
              <Label htmlFor="url-input" className="text-base font-medium">Website URL</Label>
              <Input
                id="url-input"
                type="url"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., https://example.com"
                className="text-base"
                disabled={isGenerating}
              />
            </div>
          )}

          {qrType === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="text-input" className="text-base font-medium">Your Text</Label>
              <Textarea
                id="text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter any text content here"
                rows={4}
                className="resize-none text-base"
                disabled={isGenerating}
              />
            </div>
          )}

          {qrType === 'wifi' && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/10">
              <h3 className="text-lg font-semibold text-primary mb-3">WiFi Network Details</h3>
              <div className="space-y-2">
                <Label htmlFor="wifi-ssid" className="text-base font-medium">Network Name (SSID)</Label>
                <Input
                  id="wifi-ssid"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="YourNetworkName"
                  className="text-base"
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wifi-password" className="text-base font-medium">Password</Label>
                <Input
                  id="wifi-password"
                  type="password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="YourPassword"
                  className="text-base"
                  disabled={isGenerating || wifiEncryption === 'nopass'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wifi-encryption" className="text-base font-medium">Encryption</Label>
                <Select value={wifiEncryption} onValueChange={(value) => setWifiEncryption(value as WifiEncryption)} disabled={isGenerating}>
                  <SelectTrigger id="wifi-encryption" className="w-full text-base">
                    <SelectValue placeholder="Select Encryption" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                    <SelectItem value="WEP">WEP</SelectItem>
                    <SelectItem value="nopass">None (Open Network)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="flex items-center space-x-2">
                 <input type="checkbox" id="wifi-hidden" checked={wifiHidden} onChange={(e) => setWifiHidden(e.target.checked)} disabled={isGenerating} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary border-gray-300"/>
                 <Label htmlFor="wifi-hidden" className="text-base font-normal text-muted-foreground">Network is Hidden</Label>
               </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-primary mb-1">Styling Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qr-color-dark" className="text-base font-medium">Dark Color (Dots)</Label>
                <Input
                  id="qr-color-dark"
                  type="color"
                  value={qrColorDark}
                  onChange={(e) => setQrColorDark(e.target.value)}
                  className="w-full h-10 p-1"
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qr-color-light" className="text-base font-medium">Light Color (Background)</Label>
                <Input
                  id="qr-color-light"
                  type="color"
                  value={qrColorLight}
                  onChange={(e) => setQrColorLight(e.target.value)}
                  className="w-full h-10 p-1"
                  disabled={isGenerating}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-error-correction" className="text-base font-medium">Error Correction Level</Label>
              <Select value={qrErrorCorrectionLevel} onValueChange={(value) => setQrErrorCorrectionLevel(value as ErrorCorrectionLevel)} disabled={isGenerating}>
                <SelectTrigger id="qr-error-correction" className="w-full text-base">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Low (Larger, less dense)</SelectItem>
                  <SelectItem value="M">Medium</SelectItem>
                  <SelectItem value="Q">Quartile</SelectItem>
                  <SelectItem value="H">High (Smaller, more dense)</SelectItem>
                </SelectContent>
              </Select>
               <p className="text-xs text-muted-foreground mt-1">Higher levels allow more of the QR code to be damaged/obscured and still be readable, but make the code denser.</p>
            </div>
          </div>
          

          <Button 
            onClick={handleGenerateQrCode} 
            disabled={isGenerating || !isInputValid()}
            className="w-full bg-primary hover:bg-primary/90 text-lg py-6 mt-6"
          >
            {isGenerating ? 'Generating...' : 'Generate QR Code'}
          </Button>

          {qrCodeDataUrl && (
            <div className="mt-6 flex flex-col items-center space-y-4 p-4 border rounded-lg bg-muted/20">
              <h3 className="text-xl font-semibold text-center">Your QR Code:</h3>
              <div className="p-2 bg-white inline-block rounded-md shadow-md" style={{ backgroundColor: qrColorLight }}>
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
              <RefreshCcw className="mr-2 h-5 w-5" /> Clear & Reset
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

    