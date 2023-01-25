import { Input, Rate, Typography } from 'antd';
import { CrossCheckCriteriaData } from 'services/course';

import { CommentState, CountState } from '../CrossCheckCriteriaForm';

const { TextArea } = Input;
interface SubtaskCriteriaProps {
  criteriaComment: CommentState[];
  subtaskData: CrossCheckCriteriaData;
  countStar: CountState[];
  updateCountStar: (event: number, max: number, key: string) => void;
  updateComment: (value: string, key: string) => void;
}

const NUMBER_OF_STARS = 5;

export default function SubtaskCriteria({
  criteriaComment,
  subtaskData,
  countStar,
  updateCountStar,
  updateComment,
}: SubtaskCriteriaProps) {
  const criteriaScore = (countStar.find(item => item.key === subtaskData.key)?.point as number) ?? 0;

  return (
    <div style={{ border: '1px solid #F5F5F5', margin: '24px 0' }} key={subtaskData.key}>
      <div
        style={{
          display: 'block',
          margin: '0',
          fontSize: '14px',
          background: '#FAFAFA',
          borderBottom: '1px solid #F5F5F5',
          padding: '14px 12px',
        }}
      >
        <Typography.Text>{subtaskData.text}</Typography.Text>
      </div>

      <div
        style={{
          display: 'flex',
          padding: '13px 12px',
          fontSize: '14px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography.Text>Quality of execution:</Typography.Text>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Rate
            value={(criteriaScore / (subtaskData.max as number)) * NUMBER_OF_STARS}
            allowClear
            allowHalf
            defaultValue={0}
            count={5}
            onChange={event => {
              updateCountStar(event, subtaskData.max as number, subtaskData.key);
            }}
          />
          <Typography.Text>
            {criteriaScore} / {subtaskData.max}
          </Typography.Text>
        </div>
      </div>
      <TextArea
        value={criteriaComment.find(item => item.key === subtaskData.key)?.textComment}
        placeholder="Comment about this criteria for task"
        rows={2}
        style={{ width: 'calc(100% - 24px)', display: 'block', margin: '0 auto 16px' }}
        onInput={event => updateComment((event.target as HTMLInputElement).value, subtaskData.key)}
      />
    </div>
  );
}
