import { Form, Select } from 'antd';
import { UpdateUserDtoLanguagesEnum } from 'api';
import { LABELS, PLACEHOLDERS, VALIDATION_RULES, WIDE_FORM_ITEM_LAYOUT } from 'modules/Registry/constants';

type Props = {
  isStudentForm?: boolean;
};

const languages = Object.values(UpdateUserDtoLanguagesEnum).sort();

export function LanguagesMentoring({ isStudentForm }: Props) {
  return (
    <Form.Item
      {...WIDE_FORM_ITEM_LAYOUT(isStudentForm)}
      name="languagesMentoring"
      label={isStudentForm ? LABELS.languagesStudent : LABELS.languages}
      rules={VALIDATION_RULES}
      required
    >
      <Select
        mode="multiple"
        placeholder={PLACEHOLDERS.languages}
        options={languages.map(language => ({
          label: language,
          value: language,
        }))}
      />
    </Form.Item>
  );
}
