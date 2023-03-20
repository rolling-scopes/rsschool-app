import { Select, SelectProps } from 'antd';
import { UpdateUserDtoLanguagesEnum } from 'api';

const languages = Object.values(UpdateUserDtoLanguagesEnum).sort(languagesSorter);

export function SelectLanguages({ placeholder = 'Select languages', ...props }: SelectProps) {
  return (
    <Select
      mode="multiple"
      placeholder={placeholder}
      optionFilterProp="label"
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
