import { Input, Typography, InputNumber, Slider } from 'antd';
import { useMemo } from 'react';
import isUndefined from 'lodash/isUndefined';
import isNil from 'lodash/isNil';
import { CrossCheckCriteriaDataDto } from 'api';
import { getCriteriaStatusColor } from 'modules/CrossCheck';

const { TextArea } = Input;
const { Text } = Typography;

interface SubtaskCriteriaProps {
  subtaskData: CrossCheckCriteriaDataDto;
  updateCriteriaData: (updatedEntry: CrossCheckCriteriaDataDto) => void;
}

export function SubtaskCriteria({ subtaskData, updateCriteriaData }: SubtaskCriteriaProps) {
  const maxScore = subtaskData.max;
  const comment = subtaskData.textComment;
  const criteriaScore = subtaskData.point;
  const backgroundColor = getCriteriaStatusColor(criteriaScore ?? 0, maxScore);

  const updateSubtaskData = ({ textComment, point }: { textComment?: string; point?: number | null }) => {
    const updatedEntry = {
      ...subtaskData,
      ...(isUndefined(textComment) ? undefined : { textComment }),
      ...(isNil(point) ? undefined : { point }),
    };
    updateCriteriaData(updatedEntry);
  };

  const statusCommentRequired = useMemo(() => {
    if (criteriaScore !== undefined && maxScore) {
      const commentNotMatchRules = comment ? comment.length < 10 : true;
      return criteriaScore < maxScore && commentNotMatchRules;
    }
    return false;
  }, [criteriaScore, comment, maxScore]);

  return (
    <div style={{ border: '1px solid #F5F5F5', margin: '24px 0', backgroundColor }}>
      <div
        style={{
          background: '#FAFAFA',
          borderBottom: '1px solid #F5F5F5',
          padding: '14px 12px',
        }}
      >
        <Text>{subtaskData.text}</Text>
      </div>

      <div
        style={{
          display: 'flex',
          padding: '13px 12px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text>
          Quality of execution:
          <br />
          (Max {maxScore} points for criteria)
        </Text>
        <div style={{ width: '60%', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Slider
            style={{ width: '70%' }}
            min={0}
            max={maxScore}
            onChange={num => updateSubtaskData({ point: num })}
            value={criteriaScore ?? 0}
          />
          <InputNumber
            min={0}
            max={maxScore}
            value={criteriaScore ?? 0}
            onChange={num => updateSubtaskData({ point: num })}
          />
        </div>
      </div>
      <div style={{ padding: '0 12px' }}>
        <TextArea
          style={{ border: statusCommentRequired ? '1px red solid' : '' }}
          value={subtaskData.textComment}
          rows={2}
          onInput={event => updateSubtaskData({ textComment: (event.target as HTMLInputElement).value })}
        />
        <div style={{ height: '20px' }}>
          {statusCommentRequired && <Text type="danger">Please leave a detailed comment</Text>}
        </div>
      </div>
    </div>
  );
}
