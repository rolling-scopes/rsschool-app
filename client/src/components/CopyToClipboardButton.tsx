import { Button } from 'antd';
import { CopyTwoTone } from '@ant-design/icons';

type Props = {
  value: string;
};

export default function CopyToClipboardButton({ value }: Props) {
  const copyToClipboard = () => {
    window.navigator.clipboard.writeText(value);
  };

  return <Button type="dashed" icon={<CopyTwoTone />} onClick={copyToClipboard} />;
}
