
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Crop, Scale, RotateCw, MinusSquare, Palette, Eraser as EraserIcon, Type as TypeIcon, Square as ShapeIcon, Smile, RefreshCcw, CheckCircle, XCircle } from 'lucide-react';
import type { TextAlign } from '@/lib/imageEditorTypes';

interface ImageEditorToolPanelProps {
  activeTool: string | null;
  onToolClick: (toolName: string) => void;
  isImageLoaded: boolean;
  // Text tool props
  textInput: string;
  onTextInput: (value: string) => void;
  textColor: string;
  onTextColorChange: (color: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  textAlign: TextAlign;
  onTextAlignChange: (align: TextAlign) => void;
  onPrepareText: () => void;
  isAddingText: boolean;
  // Color Tune props
  brightness: number;
  onBrightnessChange: (value: number) => void;
  contrast: number;
  onContrastChange: (value: number) => void;
  saturation: number;
  onSaturationChange: (value: number) => void;
  grayscale: number;
  onGrayscaleChange: (value: number) => void;
  hueRotate: number;
  onHueRotateChange: (value: number) => void;
  onResetColorTune: () => void;
  // Crop tool props
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  isCropAreaSelected: boolean;
}

const ToolButton = ({ icon: Icon, label, toolName, isActive, onClick, disabled }: { icon: React.ElementType, label: string, toolName: string, isActive: boolean, onClick: () => void, disabled?: boolean }) => (
  <Button
    variant={isActive ? "secondary" : "ghost"}
    className="w-full justify-start text-sm h-9 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:data-[state=active]:bg-neutral-600"
    onClick={onClick}
    title={label}
    disabled={disabled}
  >
    <Icon className="mr-2 h-4 w-4" />
    {label}
  </Button>
);

const ColorTuneSlider = ({ label, value, min, max, step, onChange, unit = "" }: { label: string, value: number, min: number, max: number, step: number, onChange: (value: number) => void, unit?: string }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <Label htmlFor={`slider-${label.toLowerCase().replace(/\s+/g, '-')}`} className="text-xs dark:text-neutral-400">{label}</Label>
            <span className="text-xs dark:text-neutral-300">{value}{unit}</span>
        </div>
        <Slider
            id={`slider-${label.toLowerCase().replace(/\s+/g, '-')}`}
            min={min}
            max={max}
            step={step}
            value={[value]}
            onValueChange={(vals) => onChange(vals[0])}
            className="w-full [&>span>span]:h-4 [&>span>span]:w-4 [&>span>span]:border-2 dark:[&>span>span]:bg-neutral-700 dark:[&>span>span]:border-sky-500"
        />
    </div>
);

export default function ImageEditorToolPanel({
  activeTool,
  onToolClick,
  isImageLoaded,
  // Text
  textInput,
  onTextInput,
  textColor,
  onTextColorChange,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  textAlign,
  onTextAlignChange,
  onPrepareText,
  isAddingText,
  // Color Tune
  brightness,
  onBrightnessChange,
  contrast,
  onContrastChange,
  saturation,
  onSaturationChange,
  grayscale,
  onGrayscaleChange,
  hueRotate,
  onHueRotateChange,
  onResetColorTune,
  // Crop
  onApplyCrop,
  onCancelCrop,
  isCropAreaSelected,
}: ImageEditorToolPanelProps) {
  
  const commonToolDisabled = !isImageLoaded;
  const isColorToolActive = activeTool === 'colors';
  const isCropToolActive = activeTool === 'crop';

  return (
    <div className="w-60 bg-card dark:bg-neutral-800 border-r dark:border-neutral-700 p-3 space-y-1 shrink-0 overflow-y-auto">
      <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1 pt-1">Transform</h3>
      <ToolButton icon={Crop} label="Crop" toolName="crop" isActive={isCropToolActive} onClick={() => onToolClick('crop')} disabled={commonToolDisabled} />
       {isCropToolActive && isImageLoaded && (
        <div className="p-2 space-y-2 border-t border-neutral-700 mt-1">
          <p className="text-xs text-center dark:text-neutral-400">Drag on image to select area.</p>
          <Button
            onClick={onApplyCrop}
            disabled={!isCropAreaSelected}
            size="sm"
            className="w-full h-8 text-xs bg-primary/80 hover:bg-primary dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Apply Crop
          </Button>
          <Button
            onClick={onCancelCrop}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:border-neutral-600 dark:text-neutral-300"
          >
            <XCircle className="mr-2 h-4 w-4" /> Cancel Crop
          </Button>
        </div>
      )}
      <ToolButton icon={Scale} label="Resize" toolName="resize" isActive={activeTool === 'resize'} onClick={() => onToolClick('resize')} disabled={commonToolDisabled} />
      <ToolButton icon={RotateCw} label="Rotate 90°" toolName="rotate" isActive={activeTool === 'rotate'} onClick={() => onToolClick('rotate')} disabled={commonToolDisabled} />

      <Separator className="my-2 dark:bg-neutral-700" />
      <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1">Adjust</h3>
      <ToolButton icon={Palette} label="Color Tune" toolName="colors" isActive={isColorToolActive} onClick={() => onToolClick('colors')} disabled={!isImageLoaded && !isColorToolActive} />
      {isColorToolActive && (
        <div className="p-2 space-y-3 border-t border-neutral-700 mt-1">
            <ColorTuneSlider label="Brightness" value={brightness} min={0} max={200} step={1} onChange={onBrightnessChange} unit="%"/>
            <ColorTuneSlider label="Contrast" value={contrast} min={0} max={200} step={1} onChange={onContrastChange} unit="%"/>
            <ColorTuneSlider label="Saturation" value={saturation} min={0} max={200} step={1} onChange={onSaturationChange} unit="%"/>
            <ColorTuneSlider label="Grayscale" value={grayscale} min={0} max={100} step={1} onChange={onGrayscaleChange} unit="%"/>
            <ColorTuneSlider label="Hue Rotate" value={hueRotate} min={0} max={360} step={1} onChange={onHueRotateChange} unit="deg"/>
            <Button
                onClick={onResetColorTune}
                variant="outline"
                size="sm"
                className="w-full mt-3 h-8 text-xs dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:border-neutral-600 dark:text-neutral-300"
            >
                <RefreshCcw className="mr-2 h-3 w-3" /> Reset Colors
            </Button>
        </div>
      )}
      <ToolButton icon={MinusSquare} label="Filters" toolName="filters" isActive={activeTool === 'filters'} onClick={() => onToolClick('filters')} disabled={commonToolDisabled} />

      <Separator className="my-2 dark:bg-neutral-700" />
      <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1">Elements</h3>
      <ToolButton icon={TypeIcon} label="Text" toolName="text" isActive={activeTool === 'text'} onClick={() => onToolClick('text')} disabled={!isImageLoaded && activeTool !== 'text'} />
      {activeTool === 'text' && (
        <div className="p-2 space-y-3 border-t border-neutral-700 mt-1">
          <div>
            <Label htmlFor="text-input" className="text-xs dark:text-neutral-400">Text Content</Label>
            <Input 
              id="text-input" 
              type="text" 
              value={textInput} 
              onChange={(e) => onTextInput(e.target.value)} 
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
              onChange={(e) => onTextColorChange(e.target.value)}
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
                onChange={(e) => onFontSizeChange(parseInt(e.target.value, 10) || 12)}
                min="8"
                max="256"
                className="mt-1 h-8 text-xs dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
              />
            </div>
            <div>
                <Label htmlFor="text-align" className="text-xs dark:text-neutral-400">Align</Label>
                <Select value={textAlign} onValueChange={(value) => onTextAlignChange(value as TextAlign)}>
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
            <Select value={fontFamily} onValueChange={onFontFamilyChange}>
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
            onClick={onPrepareText}
            disabled={isAddingText || !isImageLoaded} 
            size="sm"
            className="w-full mt-2 h-8 text-xs bg-primary/80 hover:bg-primary dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            {isAddingText ? "Click on Canvas..." : "Prepare to Add Text"}
          </Button>
          {isAddingText && isImageLoaded && <p className="text-xs text-center text-sky-400 mt-1">Click on the canvas to place text.</p>}
        </div>
      )}
      <ToolButton icon={ShapeIcon} label="Shapes" toolName="shapes" isActive={activeTool === 'shapes'} onClick={() => onToolClick('shapes')} disabled={commonToolDisabled} />
      <ToolButton icon={Smile} label="Stickers" toolName="stickers" isActive={activeTool === 'stickers'} onClick={() => onToolClick('stickers')} disabled={commonToolDisabled} />
      
      <Separator className="my-2 dark:bg-neutral-700" />
      <h3 className="text-xs font-semibold uppercase text-muted-foreground dark:text-neutral-500 px-1">Background</h3>
      <ToolButton icon={EraserIcon} label="Remove BG" toolName="bg-remove" isActive={activeTool === 'bg-remove'} onClick={() => onToolClick('bg-remove')} disabled={commonToolDisabled} />
    </div>
  );
}
    
