import { Badge, BadgeProps } from 'antd';
import React from 'react';

type PresetColors = BadgeProps['status'];

function getStylesByStatus(status?: PresetColors) {
  // Add other status if needed
  switch (status) {
    case 'default':
      return {
        backgroundColor: '#f0f2f5',
        color: 'rgba(0, 0, 0, 0.45)',
      };
    case 'processing':
      return {
        backgroundColor: '#e6f7ff',
        color: '#1890ff',
      };
    default:
      return {};
  }
}

function CustomCountBadge(props: BadgeProps) {
  const { status, ...restProps } = props;

  return <Badge {...restProps} style={getStylesByStatus(status)} />;
}

export default CustomCountBadge;
