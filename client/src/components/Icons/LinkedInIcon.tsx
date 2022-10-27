import * as React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const svg = () => (
  <svg width="25" height="25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#a)" fillRule="evenodd" clipRule="evenodd">
      <path
        d="M12.445 24.002c6.628 0 12-5.373 12-12s-5.372-12-12-12c-6.627 0-12 5.373-12 12s5.373 12 12 12Z"
        fill="#007EBB"
      />
      <path
        d="M20.112 19.002h-3.014v-5.133c0-1.407-.534-2.194-1.648-2.194-1.212 0-1.845.819-1.845 2.194v5.133h-2.904V9.224h2.904v1.317s.873-1.616 2.948-1.616c2.074 0 3.559 1.267 3.559 3.886v6.19ZM7.236 7.944c-.99 0-1.79-.808-1.79-1.804 0-.997.8-1.805 1.79-1.805s1.79.808 1.79 1.805c0 .996-.8 1.804-1.79 1.804Zm-1.5 11.058h3.029V9.224H5.737v9.778Z"
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

export const LinkedInIcon = (props: Partial<CustomIconComponentProps>) => {
  return <Icon component={svg} {...props} />;
};
