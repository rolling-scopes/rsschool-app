import { Form } from 'antd';
import { SelectLanguages } from 'components/SelectLanguages';
import { LABELS, VALIDATION_RULES, WIDE_FORM_ITEM_LAYOUT } from 'modules/Registry/constants';

type Props = {
  isStudentForm?: boolean;
};

export function LanguagesMentoring({ isStudentForm }: Props) {
  return (
    <Form.Item
      {...WIDE_FORM_ITEM_LAYOUT(isStudentForm)}
      name="languagesMentoring"
      label={isStudentForm ? LABELS.languagesStudent : LABELS.languagesMentor}
      rules={VALIDATION_RULES}
      required
    >
      <SelectLanguages />
    </Form.Item>
  );
}
