import { ChangeEvent, useEffect, useState } from 'react';
import { Typography, Input } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ProfileApi } from 'api';
import { onSaveError, onSaveSuccess } from 'utils/profileMessengers';
import CommonCardWithSettingsModal from './CommonCardWithSettingsModal';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

type Props = {
  data: string;
  isEditingModeEnabled: boolean;
};

const profileApi = new ProfileApi();

const AboutCard = ({ isEditingModeEnabled, data }: Props) => {
  const [displayValue, setDisplayValue] = useState(data);
  const [value, setValue] = useState(displayValue);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleSave = async () => {
    try {
      await profileApi.updateProfileInfoFlat({ aboutMyself: value });
      setDisplayValue(value);
      onSaveSuccess();
    } catch (error) {
      onSaveError();
    }
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
          <TextArea rows={4} value={value} onChange={handleChange} />
        </div>
      }
      saveProfile={handleSave}
      cancelChanges={handleCancel}
      isSaveDisabled={isSaveDisabled}
    />
  );
};

export default AboutCard;
