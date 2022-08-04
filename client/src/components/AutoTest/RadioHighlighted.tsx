import { Radio, RadioChangeEvent, Row } from 'antd';
import { useState } from 'react';

type RadioHighlightedProps = {
  answers: string[];
  answersType: 'image' | undefined;
};

export const RadioHighlighted = ({ answers, answersType }: RadioHighlightedProps) => {
  const [checkedValue, setCheckedValue] = useState<number>();

  const onChange = (event: RadioChangeEvent) => {
    setCheckedValue(event.target.value);
  };

  return (
    <Radio.Group onChange={onChange}>
      {answers.map((answer, index) => (
        <Row key={index}>
          <Radio value={index} style={{ backgroundColor: checkedValue === index ? 'lightgrey' : '' }}>
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
          </Radio>
        </Row>
      ))}
    </Radio.Group>
  );
};
