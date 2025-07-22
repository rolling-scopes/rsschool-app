import { Button, ButtonProps } from 'antd';
import CopyTwoTone from '@ant-design/icons/CopyTwoTone';
import { useCopyToClipboard } from 'react-use';
import { useMessage } from 'hooks';

type Props = {
  value: string;
  type?: ButtonProps['type'];
};

export default function CopyToClipboardButton({ value, type = 'dashed' }: Props) {
  const { notification } = useMessage();
  const [, copyToClipboard] = useCopyToClipboard();

  const handleClick = () => {
    copyToClipboard(value);
    notification.success({ message: 'Copied to clipboard', duration: 2 });
  };

  return <Button type={type} icon={<CopyTwoTone />} onClick={handleClick} />;
}
