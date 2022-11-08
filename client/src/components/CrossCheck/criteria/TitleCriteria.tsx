import { Typography } from 'antd';
import React from 'react';

import { CrossCheckCriteriaData } from '../CrossCheckCriteriaForm';

interface TitleCriteriaProps {
  task: CrossCheckCriteriaData;
}
const { Text } = Typography;

export default function TitleCriteria({ task }: TitleCriteriaProps) {
  return (
    <Text
      key={task.key}
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
      {task.text}
    </Text>
  );
}
