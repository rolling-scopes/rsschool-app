import React from 'react';
import { Radio, RadioChangeEvent, Typography } from 'antd';
import { CrossCheckCriteriaDataDto } from 'api';

const { Text } = Typography;
const { Group } = Radio;

enum HasPenalty {
  Yes = 'yes',
  No = 'no',
}

interface PenaltyCriteriaProps {
  penaltyData: CrossCheckCriteriaDataDto;
  updateCriteriaData: (updatedEntry: CrossCheckCriteriaDataDto) => void;
}

export function PenaltyCriteria({ penaltyData, updateCriteriaData }: PenaltyCriteriaProps) {
  const hasPenalty = Boolean(penaltyData.point && penaltyData.point !== 0);
  const penaltyScore = -Math.abs(penaltyData.max!);

  const updatePenalty = (event: RadioChangeEvent) => {
    const pointsForPenalty = event.target.value === HasPenalty.Yes ? penaltyScore : 0;
    const updatedEntry = { ...penaltyData, point: pointsForPenalty };
    updateCriteriaData(updatedEntry);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
        background: '#FAFAFA',
        borderBottom: '1px solid #F5F5F5',
        margin: '24px 0',
        padding: '14px 12px',
      }}
    >
      <Text>
        {penaltyData.text} ({penaltyScore} points)
      </Text>

      <Group style={{ minWidth: '120px' }} value={hasPenalty ? 'yes' : 'no'} onChange={updatePenalty}>
        <Radio value="yes">Yes</Radio>
        <Radio value="no">No</Radio>
      </Group>
    </div>
  );
}
