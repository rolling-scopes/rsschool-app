import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface AddEventButtonProps {
  onClick: () => void;
}

export function AddEventButton({ onClick }: AddEventButtonProps) {
  return (
    <Button type="primary" icon={<PlusOutlined />} onClick={onClick}>
      Add New
    </Button>
  );
}
