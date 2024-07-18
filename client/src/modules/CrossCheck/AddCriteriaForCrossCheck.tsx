import { Button, Form, InputNumber, Input, message } from 'antd';
import { TaskType } from 'modules/CrossCheck/components/CrossCheckCriteriaForm';
import React, { useMemo, useState } from 'react';
import { CrossCheckCriteriaType, IAddCriteriaForCrossCheck } from 'services/course';
import { CriteriaTypeSelect } from './CriteriaTypeSelect';

const { Item } = Form;
const { TextArea } = Input;

export const AddCriteriaForCrossCheck = ({ onCreate }: IAddCriteriaForCrossCheck) => {
  const [type, setType] = useState<CrossCheckCriteriaType>('title');
  const [max, setMax] = useState(0);
  const [maxPenalty, setMaxPenalty] = useState(0);
  const [text, setText] = useState('');
  const DEFAULT_KEY = '0';
  const DEFAULT_INDEX = 0;

  const clearInputs = () => {
    setMax(0);
    setMaxPenalty(0);
    setText('');
  };

  const onFinish = () => {
    const criteriaDetails =
      type === TaskType.Title
        ? {
            key: DEFAULT_KEY,
            text: text,
            type: type,
            index: DEFAULT_INDEX,
          }
        : {
            key: DEFAULT_KEY,
            max: type === TaskType.Penalty ? -Math.abs(maxPenalty) : max,
            text: text,
            type: type,
            index: DEFAULT_INDEX,
          };
    clearInputs();
    onCreate(criteriaDetails);
    message.success('Criteria added!');
  };

  function changeMax(value: number | null) {
    setMax(value ?? 0);
  }

  function changeMaxPenalty(value: number | null) {
    setMaxPenalty(value ?? 0);
  }

  function changeType(value: CrossCheckCriteriaType) {
    setType(value);
  }

  const isDisabled: boolean = useMemo(() => {
    if (type === TaskType.Title) {
      return !text;
    }

    if (type === TaskType.Penalty) {
      return !text || !maxPenalty;
    }

    return !text || !max;
  }, [type, max, maxPenalty, text]);

  return (
    <>
      <Item label="Criteria Type">
        <CriteriaTypeSelect onChange={changeType} />
      </Item>

      {type === TaskType.Subtask ? (
        <Item label="Add Max Score">
          <InputNumber value={max} min={0} step={1} onChange={changeMax} />
        </Item>
      ) : type === TaskType.Penalty ? (
        <Item label="Add Max Penalty">
          <InputNumber value={maxPenalty} step={1} onChange={changeMaxPenalty} />
        </Item>
      ) : null}

      <Item label="Add Text">
        <TextArea
          rows={3}
          style={{ maxWidth: 1200 }}
          placeholder="Add description"
          value={text}
          onChange={e => setText(e.target.value)}
        ></TextArea>
      </Item>

      <div style={{ textAlign: 'right' }}>
        <Button type="primary" onClick={onFinish} disabled={isDisabled}>
          Add New Criteria
        </Button>
      </div>
    </>
  );
};
