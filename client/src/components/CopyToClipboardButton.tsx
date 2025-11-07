import { Button, ButtonProps } from 'antd';
import { useCopyToClipboard } from 'react-use';
import { useMessage } from 'hooks';
import { CopyOutlined } from '@ant-design/icons';

type Props = {
  value: string;
  type?: ButtonProps['type'];
};

export default function CopyToClipboardButton({ value, type = 'dashed' }: Props) {
  const { message } = useMessage();
  const [, copyToClipboard] = useCopyToClipboard();

  const handleClick = async () => {
    copyToClipboard(value);
    await message.success(`Copied ${value} to clipboard`);
  };

  return <Button data-testid="copy-to-clipboard" type={type} icon={<CopyOutlined />} onClick={handleClick} />;
}
