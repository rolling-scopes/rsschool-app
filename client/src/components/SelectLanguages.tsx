import { Select, SelectProps } from 'antd';
import { useMemo } from 'react';
import { UpdateUserDtoLanguagesEnum } from 'api';

export function SelectLanguages({ placeholder = 'Select languages', ...props }: SelectProps) {
  const languages = useMemo(() => Object.values(UpdateUserDtoLanguagesEnum).sort(languagesSorter), []);

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

function languagesSorter(a: UpdateUserDtoLanguagesEnum, b: UpdateUserDtoLanguagesEnum) {
  const aName = getLanguageName(a);
  const bName = getLanguageName(b);

  if (!aName || !bName) {
    return 0;
  }

  return aName.localeCompare(bName, 'en');
}
