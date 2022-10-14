import { Button, Form, InputNumber, Select, Input, message } from 'antd';
import React, { useState } from 'react';
import { IAddCriteriaForCrossCheck } from 'services/course';

const { Item } = Form;
const { TextArea } = Input;

export const AddCriteriaForCrossCheck = ({ onCreate }: IAddCriteriaForCrossCheck) => {
  const [type, setType] = useState('');
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
    let criteriaDetails;
    type === 'Title'
      ? (criteriaDetails = {
          key: DEFAULT_KEY,
          text: text,
          type: type,
          index: DEFAULT_INDEX,
        })
      : (criteriaDetails = {
          key: DEFAULT_KEY,
          max: type === 'Penalty' ? -Math.abs(maxPenalty) : max,
          text: text,
          type: type,
          index: DEFAULT_INDEX,
        });
    clearInputs();
    onCreate(criteriaDetails);
    message.success('Criteria added!');
  };

  function changeMax(value: number) {
    setMax(value);
  }

  function changeMaxPenalty(value: number) {
    setMaxPenalty(value);
  }

  function changeType(value: string) {
    setType(value);
  }

  return (
    <>
      <Item label="Criteria Type">
        <Select placeholder="Select type" onChange={changeType}>
          <Select.Option value="Title">Title</Select.Option>
          <Select.Option value="Subtask">Subtask</Select.Option>
          <Select.Option value="Penalty">Penalty</Select.Option>
        </Select>
      </Item>

      {type === 'Subtask' ? (
        <Item label="Add Max Score">
          <InputNumber value={max} min={0} step={1} onChange={changeMax} />
        </Item>
      ) : type === 'Penalty' ? (
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
        <Button type="primary" onClick={onFinish}>
          Add New Criteria
        </Button>
      </div>
    </>
  );
};
