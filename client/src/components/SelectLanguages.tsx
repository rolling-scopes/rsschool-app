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
        label: getLanguageName(language),
        value: language,
      }))}
      {...props}
    />
  );
}

export function getLanguageName(language: UpdateUserDtoLanguagesEnum) {
  const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

  return languageNames.of(language);
}
