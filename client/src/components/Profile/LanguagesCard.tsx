import TranslationOutlined from '@ant-design/icons/TranslationOutlined';
import { Form, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import { UpdateProfileInfoDto, UpdateUserDtoLanguagesEnum } from '@client/api';
import { getLanguageName, SelectLanguages } from 'components/SelectLanguages';
import CommonCardWithSettingsModal from './CommonCardWithSettingsModal';

type Props = {
  data: UpdateUserDtoLanguagesEnum[];
  isEditingModeEnabled: boolean;
  updateProfile: (data: UpdateProfileInfoDto) => Promise<boolean>;
};

type FormData = {
  languages: UpdateUserDtoLanguagesEnum[];
};

const label = (
  <Typography.Text strong style={{ fontSize: 18 }}>
    My Languages:
  </Typography.Text>
);
const fieldName = 'languages';

const LanguagesCard = ({ isEditingModeEnabled, data, updateProfile }: Props) => {
  const [form] = Form.useForm<FormData>();
  const [languages, setLanguages] = useState(data);

  const handleSave = async () => {
    const values = form.getFieldValue(fieldName);
    const isUpdated = await updateProfile({ languages: values });
    if (!isUpdated) {
      return;
    }

    setLanguages(values);
  };

  const handleCancel = () => {
    form.setFieldValue(fieldName, languages);
  };

  return (
    <CommonCardWithSettingsModal
      title="My Languages"
      icon={<TranslationOutlined />}
      isEditingModeEnabled={isEditingModeEnabled}
      noDataDescription="Languages are not selected"
      content={
        languages.length ? (
          <Space size={[0, 8]} wrap>
            {languages.map(el => (
              <Tag key={el}>{getLanguageName(el)}</Tag>
            ))}
          </Space>
        ) : null
      }
      profileSettingsContent={
        <Form layout="vertical" form={form} initialValues={{ languages }}>
          <Form.Item label={label} name={fieldName}>
            <SelectLanguages />
          </Form.Item>
        </Form>
      }
      saveProfile={handleSave}
      cancelChanges={handleCancel}
    />
  );
};

export default LanguagesCard;
