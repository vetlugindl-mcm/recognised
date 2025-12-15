import { useState, useEffect } from 'react';

/**
 * Automatically creates and revokes a Blob URL for a given File object.
 * Prevents memory leaks by cleaning up the URL when the component unmounts
 * or the file changes.
 */
export const useObjectUrl = (file: File | null | undefined): string | null => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    let objectUrl: string | null = null;

    try {
      objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
    } catch (e) {
      console.error("Failed to create Object URL", e);
      setUrl(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  return url;
};