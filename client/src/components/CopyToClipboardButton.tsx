import { Button, notification } from 'antd';
import { CopyTwoTone } from '@ant-design/icons';
import { useCopyToClipboard } from 'react-use';

type Props = {
  value: string;
};

export default function CopyToClipboardButton({ value }: Props) {
  const [, copyToClipboard] = useCopyToClipboard();

  const handleClick = () => {
    copyToClipboard(value);
    notification.success({ message: 'Copied to clipboard', duration: 2 });
  };

  return <Button type="dashed" icon={<CopyTwoTone />} onClick={handleClick} />;
}
