import * as React from 'react';
import Icon from '@ant-design/icons/lib/components/Icon';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const svg = () => (
  <svg width="25" height="25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#a)">
      <path
        d="M12.445 24.002c6.628 0 12-5.373 12-12s-5.372-12-12-12c-6.627 0-12 5.373-12 12s5.373 12 12 12Z"
        fill="url(#b)"
      />
      <path
        d="m8.568 12.88 1.424 3.94s.178.369.369.369c.19 0 3.025-2.95 3.025-2.95L16.54 8.15l-7.92 3.712-.05 1.017Z"
        fill="#C8DAEA"
      />
      <path d="m10.456 13.89-.274 2.904s-.114.89.776 0 1.741-1.576 1.741-1.576" fill="#A9C6D8" />
      <path
        d="m8.594 13.02-2.929-.954s-.35-.143-.237-.465c.023-.066.07-.122.21-.22.649-.452 12.01-4.535 12.01-4.535s.322-.109.51-.037a.277.277 0 0 1 .19.206c.02.084.028.171.025.258-.001.076-.01.145-.017.255-.07 1.116-2.14 9.449-2.14 9.449s-.124.487-.568.504a.81.81 0 0 1-.593-.23c-.87-.748-3.881-2.772-4.547-3.217a.126.126 0 0 1-.054-.09c-.01-.047.041-.105.041-.105s5.243-4.66 5.382-5.149c.011-.038-.03-.057-.084-.04-.349.128-6.385 3.94-7.051 4.36a.32.32 0 0 1-.148.01Z"
        fill="#fff"
      />
    </g>
    <defs>
      <linearGradient id="b" x1="12.445" y1="24.002" x2="12.445" y2=".002" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1D93D2" />
        <stop offset="1" stopColor="#38B0E3" />
      </linearGradient>
      <clipPath id="a">
        <path fill="#fff" transform="translate(.445 .002)" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);

export const TelegramIcon = (props: Partial<CustomIconComponentProps>) => {
  return <Icon component={svg} {...props} />;
};
