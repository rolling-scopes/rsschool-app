import { useState } from 'react';

export type ModalFormMode = 'create' | 'edit';

export const useModalForm = <T,>() => {
  const [mode, setMode] = useState<ModalFormMode>('create');
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
