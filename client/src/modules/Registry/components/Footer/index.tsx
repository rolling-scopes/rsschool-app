import { Image, Space, Typography } from 'antd';
import css from 'styled-jsx/css';

const copyrights = `Copyright © The Rolling Scopes ${new Date().getFullYear()}`;
const logos = [
  {
    src: '/static/svg/logo-rs.svg',
    alt: 'Rolling Scopes Logo',
  },
  {
    src: '/static/svg/logo-github.svg',
    alt: 'GitHub Logo',
  },
  {
    src: '/static/svg/logo-epam.svg',
    alt: 'EPAM Logo',
  },
];

export function Footer() {
  return (
    <>
      <footer>
        <Space align="center" size={40} style={{ height: '32px' }}>
          {logos.map(({ src, alt }) => (
            <Image key={alt} preview={false} src={src} alt={alt} />
          ))}
        </Space>
        <Typography.Paragraph style={{ color: 'rgba(0, 0, 0, 0.45)', margin: 0 }}>{copyrights}</Typography.Paragraph>
      </footer>
      <style jsx>{styles}</style>
    </>
  );
}

const styles = css`
  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 36px 0;
  }
`;
