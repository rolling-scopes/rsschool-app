import { Typography } from 'antd';
import React from 'react';
import { CrossCheckCriteriaData } from 'services/course';

interface TitleCriteriaProps {
  titleData: CrossCheckCriteriaData;
}
const { Text } = Typography;

export default function TitleCriteria({ titleData }: TitleCriteriaProps) {
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
