import { useState } from 'react';

export const useModalForm = <T,>() => {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<T>();

  const toggle = (data?: T): void => {
    if (data) {
      setMode('edit');
      setFormData(data);
    } else {
      setMode('create');
      setFormData(undefined);
    }
    setOpen(prev => !prev);
  };

  return { mode, open, formData, toggle };
};
