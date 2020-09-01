import { Modal, Button, Input } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';

type AnyFunc = (...params: any) => any;

type Props = {
  onOk: AnyFunc,
  keyLength: number,
  message: string
};

export function ComplexConfirmation(props: Props) {

}
