import { FullscreenOutlined } from '@ant-design/icons';
import { Button } from 'antd';

export function ExpandButtonWidget({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="dashed"
      style={{ padding: '0.3em 0.5em' }}
      onClick={onClick}
      data-testid="expand-button"
      aria-label="Open details"
      title="Open details"
    >
      <FullscreenOutlined />
    </Button>
  );
}
