'use client';

import { useState } from 'react';
import { deriveImageUrls, emptyGameForm } from '../utils/formUtils';

export function useGameForm(initialData?: any) {
  const [form, setForm] = useState(initialData || emptyGameForm);

  const autoFillFromName = (name: string, isEditing: boolean) => {
      if (!form.fileName && !isEditing) {
          setForm((f: any) => ({ ...f, name, fileName: name }));
      } else {
          setForm((f: any) => ({ ...f, name }));
      }
  };

  const applyImageBaseUrl = (base: string) => {
      const derived = deriveImageUrls(base);
      setForm((f: any) => ({ ...f, imageBaseUrl: base, ...derived }));
  };

  const onRomUploaded = (fileName: string, path: string) => {
      setForm((f: any) => ({ ...f, fileName, path }));
  };

  const applyRAWGImages = (imgUrl: string, imgSnap: string, imgTitle: string) => {
      setForm((f: any) => ({
          ...f,
          imageBaseUrl: '',
          imageUrl: imgUrl || f.imageUrl,
          imageSnap: imgSnap || f.imageSnap,
          imageTitle: imgTitle || f.imageTitle,
      }));
  };

  const resetForm = (data?: any) => setForm(data || emptyGameForm);

  return {
      form,
      setForm,
      autoFillFromName,
      applyImageBaseUrl,
      onRomUploaded,
      applyRAWGImages,
      resetForm,
  };
}
