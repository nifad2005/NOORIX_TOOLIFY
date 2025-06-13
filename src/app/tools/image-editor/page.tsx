
"use client";

import { useEffect } from 'react';
import ImageEditor from '@/components/ImageEditor';

export default function ImageEditorPage() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    // Cleanup function to remove the dark class when the component unmounts
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  return <ImageEditor />;
}
