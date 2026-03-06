import { ReactNode } from 'react';
import { theme } from 'antd';

type CommentProps = {
  author?: ReactNode;
  avatar?: ReactNode;
  content?: ReactNode;
  datetime?: ReactNode;
  children?: ReactNode;
};

export function Comment({ author, avatar, content, datetime, children }: CommentProps) {
  const { token } = theme.useToken();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {avatar && <div style={{ flexShrink: 0 }}>{avatar}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {(author || datetime) && (
          <div style={{ marginBottom: 4 }}>
            {author && <span style={{ fontWeight: 500, marginRight: 8 }}>{author}</span>}
            {datetime && <span style={{ color: token.colorTextSecondary, fontSize: 12 }}>{datetime}</span>}
          </div>
        )}
        {content && <div>{content}</div>}
        {children && <div style={{ marginTop: 8 }}>{children}</div>}
      </div>
    </div>
  );
}
