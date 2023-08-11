import { Typography } from 'antd';
import { CrossCheckCriteriaDataDto } from 'api';
import React from 'react';

interface TitleCriteriaProps {
  titleData: CrossCheckCriteriaDataDto;
}
const { Text } = Typography;

export function TitleCriteria({ titleData }: TitleCriteriaProps) {
  return (
    <div
      style={{
        display: 'block',
        fontSize: '14px',
        marginTop: '10px',
        background: '#E6F7FF',
        border: '1px solid #91D5FF',
        borderRadius: '2px',
        padding: '9px',
      }}
    >
      <Text key={titleData.key}>{titleData.text}</Text>
    </div>
  );
}
