import { useEffect } from 'react';
import { Typography, InputNumber, Button, Modal, List } from 'antd';
import { isEqual } from 'lodash';

import { SubtaskCriteria } from './criteria/SubtaskCriteria';
import { TitleCriteria } from './criteria/TitleCriteria';
import { PenaltyCriteria } from './criteria/PenaltyCriteria';
import { CrossCheckCriteriaDataDto, CrossCheckSolutionReviewDto } from 'api';
import { TaskType } from '../constants';

const { Text, Title } = Typography;

export interface CriteriaFormProps {
  maxScore: number | undefined;
  score: number;
  setScore: (value: number) => void;
  criteriaData: CrossCheckCriteriaDataDto[];
  setCriteriaData: (newData: CrossCheckCriteriaDataDto[]) => void;
  initialData: CrossCheckSolutionReviewDto;
  setIsSkipped: (value: boolean) => void;
  isSkipped: boolean;
}

export function CrossCheckCriteriaForm({
  maxScore,
  score,
  setScore,
  criteriaData,
  setCriteriaData,
  initialData,
  setIsSkipped,
  isSkipped,
}: CriteriaFormProps) {
  const [modal, contextHolder] = Modal.useModal();

  const maxScoreValue = maxScore ?? 100;
  const maxScoreLabel = maxScoreValue ? ` (Max ${maxScoreValue} points)` : '';
  const penaltyData: CrossCheckCriteriaDataDto[] =
    criteriaData?.filter(item => item.type.toLowerCase() === TaskType.Penalty) ?? [];

  useEffect(() => {
    const criteria = initialData?.criteria ? [...initialData.criteria] : undefined;
    const sortedInitialData = criteria?.sort((a, b) => (a.key > b.key ? 1 : -1));
    const sortedCriteriaData = [...criteriaData].sort((a, b) => (a.key > b.key ? 1 : -1));

    if (!isEqual(sortedInitialData, sortedCriteriaData)) {
      const totalPoints = criteriaData.reduce((acc, criteria) => {
        return criteria.point ? acc + criteria.point : acc;
      }, 0);
      setScore(totalPoints > 0 ? totalPoints : 0);
    } else {
      setScore(initialData.score);
    }
  }, [criteriaData, initialData]);

  function updateCriteriaData(updatedEntry: CrossCheckCriteriaDataDto) {
    const index = criteriaData.findIndex(item => item.key === updatedEntry.key);
    const updatedData = [...criteriaData];
    updatedData.splice(index, 1, updatedEntry);
    setCriteriaData(updatedData);
  }

  const skipConfirmation = () => {
    if (isSkipped) {
      setIsSkipped(false);
    } else {
      modal.confirm({
        onOk: () => setIsSkipped(true),
        title: 'Skip Task for Checking',
        okText: 'Yes, skip form',
        cancelText: 'Back to review',
        content: (
          <>
            <div className="skip-modal">
              <Text>Are you sure you want to skip cross check form?</Text>
              <Text>Possible reasons:</Text>
              <List
                size="small"
                dataSource={['- Task not done (Submitted but empty)', '- Submitted broken link']}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </div>
            <style jsx>{`
              .skip-modal {
                display: flex;
                flex-direction: column;
                gap: 10px;
              }
            `}</style>
          </>
        ),
      });
    }
  };

  return (
    <div style={{ margin: '0 auto' }}>
      {criteriaData?.length ? (
        <Button style={{ marginBottom: '16px' }} type="primary" onClick={skipConfirmation}>
          {isSkipped ? 'Show' : 'Skip'} cross check form
        </Button>
      ) : null}
      {contextHolder}
      {!isSkipped && (
        <div>
          {!!criteriaData?.length && (
            <>
              <Title level={4}>Criteria</Title>
              {criteriaData
                ?.filter(
                  (item: CrossCheckCriteriaDataDto) =>
                    item.type.toLowerCase() === TaskType.Title || item.type.toLowerCase() === TaskType.Subtask,
                )
                .map((item: CrossCheckCriteriaDataDto) => {
                  return item.type.toLowerCase() === TaskType.Title ? (
                    <TitleCriteria key={item.key} titleData={item} />
                  ) : (
                    <SubtaskCriteria key={item.key} subtaskData={item} updateCriteriaData={updateCriteriaData} />
                  );
                })}
            </>
          )}
          {!!penaltyData?.length && (
            <>
              <Title level={4}>Penalty</Title>
              {penaltyData?.map((item: CrossCheckCriteriaDataDto) => (
                <PenaltyCriteria key={item.key} penaltyData={item} updateCriteriaData={updateCriteriaData} />
              ))}
            </>
          )}
        </div>
      )}
      <Title level={4}>{maxScoreLabel}</Title>
      <InputNumber
        value={score}
        onChange={num => setScore(Number(num || 0))}
        step={1}
        min={0}
        max={maxScoreValue}
        decimalSeparator={','}
      />
    </div>
  );
}
