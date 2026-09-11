type Props = { src?: string; alt?: string; size?: string };

export function PublicSvgIcon({ src, alt = '', size = 'fit-content' }: Props) {
  if (!src) {
    return null;
  }

  return <img src={src} alt={alt} style={{ width: size, height: size, display: 'inline-block' }} />;
}
