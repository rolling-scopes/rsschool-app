import { Modal, Input, Typography, Divider } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import random from 'lodash/random';

type AnyFunc = (...params: any) => any;

const { Text } = Typography;

type Props = {
  onOk: AnyFunc;
  keyLength: number;
  message: string;
  isConfirmationVisible: boolean;
  hideConfirmation: AnyFunc;
};

export function ComplexConfirmation(props: Props) {
  const { onOk, keyLength, message, hideConfirmation, isConfirmationVisible } = props;

  const [isKeyMatch, setKeyMatch] = useState(false);
  let key = '';

  for (let i = 0; i < keyLength; i++) key += random(0, 9);

  const checkKeyMatch = (e: any) => {
    if (e.target.value === key) {
      setKeyMatch(true);
    } else {
      setKeyMatch(false);
    }
  };

  const title = (
    <>
      <ExclamationCircleOutlined /> Are you sure?
    </>
  );

  return (
    <Modal
      title={title}
      centered={true}
      onOk={onOk}
      visible={isConfirmationVisible}
      onCancel={() => {
        hideConfirmation();
      }}
      closable={false}
      okButtonProps={{ disabled: !isKeyMatch }}
    >
      <Text underline strong>
        {message}
      </Text>
      <Divider plain>
        Enter following number to confirm action: <Text strong>{key}</Text>
      </Divider>
      <Input placeholder="Enter the number" type="text" onChange={checkKeyMatch} />
    </Modal>
  );
}
