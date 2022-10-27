import * as React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const svg = () => (
  <svg width="1em" height="1em" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#a)">
      <path
        d="M12.445 24.002c6.628 0 12-5.373 12-12s-5.372-12-12-12c-6.627 0-12 5.373-12 12s5.373 12 12 12Z"
        fill="#5865F2"
      />
      <path
        d="M17.901 7.91s-1.56-1.224-3.407-1.364l-.164.333c1.668.407 2.432.993 3.234 1.71-1.378-.703-2.742-1.364-5.114-1.364s-3.736.661-5.114 1.364c.801-.717 1.71-1.368 3.234-1.71l-.164-.333C8.47 6.729 6.998 7.91 6.998 7.91s-1.743 2.531-2.043 7.5c1.757 2.03 4.43 2.043 4.43 2.043l.557-.745a6.807 6.807 0 0 1-2.944-1.983c1.102.835 2.77 1.707 5.457 1.707 2.685 0 4.35-.867 5.456-1.707a6.806 6.806 0 0 1-2.944 1.983l.558.745s2.672-.014 4.43-2.043c-.31-4.969-2.053-7.5-2.053-7.5Zm-7.673 6.136c-.66 0-1.195-.61-1.195-1.364 0-.755.534-1.364 1.195-1.364s1.195.609 1.195 1.364c0 .754-.534 1.364-1.195 1.364Zm4.434 0c-.66 0-1.195-.61-1.195-1.364 0-.755.534-1.364 1.195-1.364s1.196.609 1.196 1.364c0 .754-.54 1.364-1.196 1.364Z"
        fill="#fff"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" transform="translate(.445 .002)" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);

export const DiscordFilled = (props: Partial<CustomIconComponentProps>) => {
  return <Icon component={svg} {...props} />;
};
