import { useEffect, useState } from 'react';

type Props = { src: string; alt?: string; size?: string };

export function PublicSvgIcon({ src, alt = '', size = 'fit-content' }: Props) {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const response = await fetch(src);
        if (response.ok) {
          const text = await response.text();
          setSvgContent(text);
        }
      } catch (err) {
        console.error('Error loading SVG:', err);
      }
    };

    loadSvg();
  }, [src]);

  return (
    <span
      style={{ width: size, height: size, display: 'inline-block' }}
      role="img"
      aria-label={alt}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
