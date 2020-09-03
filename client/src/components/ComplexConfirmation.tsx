import { Modal, Input, Typography } from 'antd';
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
  const { onOk, keyLength, message, isConfirmationVisible, hideConfirmation } = props;

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

  return (
    <Modal
      title="Confirm action"
      onOk={onOk}
      visible={isConfirmationVisible}
      onCancel={() => {
        hideConfirmation();
      }}
      okButtonProps={{ disabled: !isKeyMatch }}
    >
      <p>
        <ExclamationCircleOutlined />
        Are you sure?
      </p>
      <br />
      <p>{message}</p>
      <br />
      <p>Enter following number to confirm action:</p>
      <br />
      <Text strong>{key}</Text>
      <Input placeholder="Enter" type="text" onChange={checkKeyMatch} />
    </Modal>
  );
}
