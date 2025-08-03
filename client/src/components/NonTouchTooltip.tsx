import { PropsWithChildren, useEffect, useState } from 'react';
import { Tooltip, TooltipProps } from 'antd';

type NonTouchTooltipProps = PropsWithChildren<{
  title: string;
  placement?: TooltipProps['placement'];
}>;

export default function NonTouchTooltip({ title, placement, children }: NonTouchTooltipProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(checkTouchDevice);
  }, []);

  if (isTouchDevice) {
    return children;
  }

  return (
    <Tooltip title={title} placement={placement || 'left'}>
      {children}
    </Tooltip>
  );
}
