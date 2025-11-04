import { FullscreenOutlined } from '@ant-design/icons';
import { Button } from 'antd';

export function ExpandButtonWidget({ onClick }: { onClick: () => void }) {
  return (
    <Button type="dashed" onClick={onClick} aria-label="Open details" title="Open details">
      <FullscreenOutlined />
    </Button>
  );
}
