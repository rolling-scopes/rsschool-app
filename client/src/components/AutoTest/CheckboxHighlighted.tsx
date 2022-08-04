import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { useState } from 'react';

type CheckboxHighlightedProps = {
  answer: string;
  index: number;
  answersType: 'image' | undefined;
};

export const CheckboxHighlighted = ({ answer, index, answersType }: CheckboxHighlightedProps) => {
  const [checked, setChecked] = useState(false);

  const onChange = (event: CheckboxChangeEvent) => {
    setChecked(event.target.checked);
  };

  return (
    <Checkbox value={index} onChange={onChange} style={{ backgroundColor: checked ? 'lightgrey' : '' }}>
      {answersType === 'image' ? (
        <>
          ({index + 1}){' '}
          <img
            src={answer}
            style={{
              width: '100%',
              maxWidth: '400px',
              marginBottom: '10px',
            }}
          />
        </>
      ) : (
        answer
      )}
    </Checkbox>
  );
};
