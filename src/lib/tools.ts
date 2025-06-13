
import type { LucideIcon } from 'lucide-react';
import { ImageIcon, Replace, Music, Video, Code2, FileText, Sparkles, ImageUp, Shrink } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const toolCategories: ToolCategory[] = [
  { id: 'image', name: 'Image Tools', icon: ImageIcon },
  { id: 'document', name: 'Document Tools', icon: FileText },
  { id: 'audio', name: 'Audio Tools', icon: Music },
  { id: 'video', name: 'Video Tools', icon: Video },
  { id: 'coding', name: 'Coding Tools', icon: Code2 },
  { id: 'others', name: 'Other Tools', icon: Sparkles },
];

export const toolsList: Tool[] = [
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce file sizes of your PNG, JPG, or WEBP images.',
    href: '/tools/image-compressor',
    icon: ImageUp,
    category: 'image',
  },
  {
    id: 'image-converter',
    name: 'Image Format Converter',
    description: 'Change image types (e.g., JPG to PNG, WEBP).',
    href: '/tools/image-converter',
    icon: Replace,
    category: 'image',
  },
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    description: 'Reduce the file size of your PDF documents (simulated).',
    href: '/tools/pdf-compressor',
    icon: Shrink,
    category: 'document',
  }
  // Placeholder for future tools
  // {
  //   id: 'audio-trimmer',
  //   name: 'Audio Trimmer',
  //   description: 'Trim your audio files quickly.',
  //   href: '/tools/audio-trimmer',
  //   icon: Scissors,
  //   category: 'audio',
  // },
  // {
  //   id: 'json-formatter',
  //   name: 'JSON Formatter',
  //   description: 'Format and validate your JSON data.',
  //   href: '/tools/json-formatter',
  //   icon: Code2,
  //   category: 'coding',
  // },
];
