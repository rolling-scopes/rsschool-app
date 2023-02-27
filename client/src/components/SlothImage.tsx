import { Image, ImageProps } from 'antd';

export const slothNames = ['slothzy', 'its-a-good-job', 'what-is-it', 'welcome'] as const;

export type SlothNames = typeof slothNames[number];

interface Props extends ImageProps {
  name: SlothNames;
  imgExtension?: 'svg' | 'png';
}

const slothsBaseURL = 'https://cdn.rs.school/sloths/stickers/';

export function SlothImage({ name, imgExtension = 'svg', ...props }: Props) {
  const src = `${slothsBaseURL}${name}/image.${imgExtension}`;

  return <Image src={src} alt={name} preview={false} {...props} />;
}
