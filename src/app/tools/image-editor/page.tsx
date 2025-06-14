
"use client";

// import { useEffect } from 'react'; // No longer forcing dark mode
import ImageEditor from '@/components/ImageEditor';

export default function ImageEditorPage() {
  // useEffect(() => {
  //   document.documentElement.classList.add('dark');
  //   return () => {
  //     document.documentElement.classList.remove('dark');
  //   };
  // }, []);

  return <ImageEditor />;
}
