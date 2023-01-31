import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const svg = () => (
  <svg width="24" height="65" viewBox="0 0 24 65" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.9393 63.7296C11.5251 64.3154 12.4749 64.3154 13.0607 63.7296L22.6066 54.1837C23.1924 53.5979 23.1924 52.6481 22.6066 52.0623C22.0208 51.4766 21.0711 51.4766 20.4853 52.0623L12 60.5476L3.51472 52.0623C2.92893 51.4766 1.97918 51.4766 1.3934 52.0623C0.807609 52.6481 0.807609 53.5979 1.3934 54.1837L10.9393 63.7296ZM10.5 -6.5567e-08L10.5 62.6689L13.5 62.6689L13.5 6.5567e-08L10.5 -6.5567e-08Z"
      fill="#1890FF"
    />
  </svg>
);

export const ArrowIcon = (props: Partial<CustomIconComponentProps>) => {
  return <Icon component={svg} {...props} />;
};
