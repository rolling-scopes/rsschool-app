import { ChangeEvent, useEffect, useState } from 'react';
import { Typography, Input } from 'antd';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { UpdateProfileInfoDto } from 'api';
import CommonCardWithSettingsModal from './CommonCardWithSettingsModal';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

type Props = {
  data: string;
  isEditingModeEnabled: boolean;
  updateProfile: (data: UpdateProfileInfoDto) => Promise<boolean>;
};

const AboutCard = ({ isEditingModeEnabled, data, updateProfile }: Props) => {
  const [displayValue, setDisplayValue] = useState(data);
  const [value, setValue] = useState(displayValue);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleSave = async () => {
    const isUpdated = await updateProfile({ aboutMyself: value });
    if (!isUpdated) {
      return;
    }

    setDisplayValue(value);
  };

  const handleCancel = () => {
    setValue(displayValue);
  };

  useEffect(() => {
    const readyToUpdate = displayValue !== value;

    setIsSaveDisabled(!readyToUpdate);
  }, [displayValue, value]);

  return (
    <CommonCardWithSettingsModal
      title="About"
      icon={<InfoCircleOutlined />}
      content={displayValue ? <Paragraph ellipsis={{ rows: 2, expandable: true }}>{displayValue}</Paragraph> : null}
      noDataDescription="About info isn't written"
      isEditingModeEnabled={isEditingModeEnabled}
      profileSettingsContent={
        <div>
          <p style={{ fontSize: 18, marginBottom: 5 }}>
            <Text strong>About myself:</Text>
          </p>
          <TextArea rows={4} value={value} onChange={handleChange} showCount={false} allowClear={false} count={false} />
        </div>
      }
      saveProfile={handleSave}
      cancelChanges={handleCancel}
      isSaveDisabled={isSaveDisabled}
    />
  );
};

export default AboutCard;
