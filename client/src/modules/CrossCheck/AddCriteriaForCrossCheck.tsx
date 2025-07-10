import { Button, Form, Input, InputNumber } from 'antd';
import React, { ChangeEventHandler, useMemo, useState } from 'react';
import { CrossCheckCriteriaType, IAddCriteriaForCrossCheck } from 'services/course';
import { CriteriaTypeSelect } from './CriteriaTypeSelect';
import { TaskType } from './constants';
import { useMessage } from 'hooks';

const { Item } = Form;
const { TextArea } = Input;

export const AddCriteriaForCrossCheck = ({ onCreate }: IAddCriteriaForCrossCheck) => {
  const [type, setType] = useState<CrossCheckCriteriaType>('title');
  const [max, setMax] = useState(0);
  const [maxPenalty, setMaxPenalty] = useState(0);
  const [text, setText] = useState('');
  const DEFAULT_KEY = '0';
  const DEFAULT_INDEX = 0;

  const { message } = useMessage();

  const clearInputs = () => {
    setMax(0);
    setMaxPenalty(0);
    setText('');
  };

  const onSave = () => {
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
    onCreate(criteriaDetails);
    clearInputs();
    message.success('Criteria added.');
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

  const changeText: ChangeEventHandler<HTMLTextAreaElement> = event => {
    setText(event.target.value);
  };

  const canSave: boolean = useMemo(() => {
    if (type === TaskType.Title) {
      return !!text;
    }

    if (type === TaskType.Penalty) {
      return !!(text && maxPenalty);
    }

    return !!(text && max);
  }, [type, max, maxPenalty, text]);

  return (
    <>
      <Item label="Criteria Type">
        <CriteriaTypeSelect onChange={changeType} />
      </Item>

      {type === TaskType.Subtask && (
        <Item label="Add Max Score">
          <InputNumber type="number" value={max} min={0} step={1} onChange={changeMax} />
        </Item>
      )}

      {type === TaskType.Penalty && (
        <Item label="Add Max Penalty">
          <InputNumber type="number" value={maxPenalty} min={0} step={1} onChange={changeMaxPenalty} />
        </Item>
      )}

      <Item label="Add Text">
        <TextArea
          rows={3}
          style={{ maxWidth: 1200 }}
          placeholder="Add description"
          value={text}
          onChange={changeText}
        ></TextArea>
      </Item>

      <div style={{ textAlign: 'right' }}>
        <Button type="primary" onClick={onSave} disabled={!canSave}>
          Add New Criteria
        </Button>
      </div>
    </>
  );
};
