import { ReactNode } from 'react';

type CommentProps = {
  author?: ReactNode;
  avatar?: ReactNode;
  content?: ReactNode;
  datetime?: ReactNode;
  children?: ReactNode;
};

export function Comment({ author, avatar, content, datetime, children }: CommentProps) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {avatar && <div style={{ flexShrink: 0 }}>{avatar}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {(author || datetime) && (
          <div style={{ marginBottom: 4 }}>
            {author && <span style={{ fontWeight: 500, marginRight: 8 }}>{author}</span>}
            {datetime && <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{datetime}</span>}
          </div>
        )}
        {content && <div>{content}</div>}
        {children && <div style={{ marginTop: 8 }}>{children}</div>}
      </div>
    </div>
  );
}
