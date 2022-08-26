import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { Typography, Select } from 'antd';
import CommonCard from './CommonCard';
import { GeneralInfo } from 'common/models/profile';
import { EnglishLevel } from 'common/models/index';

const { Text } = Typography;
const { Option } = Select;

import { TagOutlined } from '@ant-design/icons';

const ENGLISH_LEVELS: EnglishLevel[] = ['a0', 'a1', 'a1+', 'a2', 'a2+', 'b1', 'b1+', 'b2', 'b2+', 'c1', 'c1+', 'c2'];

type Props = {
  data: GeneralInfo;
  isEditingModeEnabled: boolean;
  onProfileSettingsChange: (event: any, path: string) => void;
};

class EnglishCard extends React.Component<Props> {
  shouldComponentUpdate = (nextProps: Props) =>
    !isEqual(nextProps.data.englishLevel, this.props.data.englishLevel) ||
    !isEqual(nextProps.isEditingModeEnabled, this.props.isEditingModeEnabled);

  render() {
    const { isEditingModeEnabled, onProfileSettingsChange } = this.props;
    const { englishLevel } = this.props.data;
    return (
      <CommonCard
        title="Estimated English level"
        icon={<TagOutlined />}
        content={
          englishLevel ? (
            <Text style={{ textTransform: 'capitalize', fontSize: '48px' }}>{englishLevel}</Text>
          ) : undefined
        }
        noDataDescrption="English level isn't choosen"
        isEditingModeEnabled={isEditingModeEnabled}
        profileSettingsContent={
          <div>
            <p style={{ fontSize: 18, marginBottom: 5 }}>
              <Text strong>English level:</Text>
            </p>
            <div style={{ marginBottom: 20 }}>
              <Select
                style={{ width: '100%' }}
                defaultValue={englishLevel || 'a0'}
                onChange={(event: any) => onProfileSettingsChange(event, 'generalInfo.englishLevel')}
              >
                {ENGLISH_LEVELS.map(level => (
                  <Option key={`settings-english-level-${level}`} value={level}>
                    {level.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        }
      />
    );
  }
}

export default EnglishCard;
