import { PropsWithChildren } from 'react';
import { Tooltip, TooltipProps } from 'antd';

type NonTouchTooltipProps = PropsWithChildren<{
  title: string;
  placement?: TooltipProps['placement'];
}>;

export default function NonTouchTooltip({ title, placement, children }: NonTouchTooltipProps) {
  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice()) {
    return children;
  }

  return (
    <Tooltip title={title} placement={placement || 'left'}>
      {children}
    </Tooltip>
  );
}
