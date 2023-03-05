import { Select, SelectProps } from 'antd';
import { useMemo } from 'react';
import { UpdateUserDtoLanguagesEnum } from 'api';

export function SelectLanguages({ placeholder = 'Select languages', ...props }: SelectProps) {
  const languages = useMemo(() => Object.values(UpdateUserDtoLanguagesEnum).sort(), []);

  return (
    <Select
      mode="multiple"
      placeholder={placeholder}
      options={languages.map(language => ({
        label: language,
        value: language,
      }))}
      {...props}
    />
  );
}
