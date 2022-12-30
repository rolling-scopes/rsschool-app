import React from 'react';
import { Radio, Typography } from 'antd';

import { CountState } from '../CrossCheckCriteriaForm';
import { CrossCheckCriteriaData } from 'services/course';

const { Text } = Typography;
const { Group } = Radio;

interface PenaltyCriteriaProps {
  penaltyData: CrossCheckCriteriaData;
  updatePenalty: (max: number, key: string, value: string) => void;
  penaltyCount: CountState[];
}

export default function PenaltyCriteria({ penaltyData, updatePenalty, penaltyCount }: PenaltyCriteriaProps) {
  const pointForPenalty = penaltyCount.filter(item => penaltyData.key === item.key)[0]?.point;
  const hasPenalty = Boolean(pointForPenalty && pointForPenalty !== 0);

  const penaltyScore = -Math.abs(penaltyData.max!);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#FAFAFA',
        borderBottom: '1px solid #F5F5F5',
        margin: '24px 0',
        padding: '14px 12px',
      }}
      key={penaltyData.key}
    >
      <Text>
        {penaltyData.text} ({penaltyScore} points)
      </Text>

      <Group
        size="middle"
        value={hasPenalty ? 'yes' : 'no'}
        onChange={event => updatePenalty(penaltyScore, penaltyData.key, event.target.value)}
      >
        <Radio value="yes">Yes</Radio>
        <Radio value="no">No</Radio>
      </Group>
    </div>
  );
}
