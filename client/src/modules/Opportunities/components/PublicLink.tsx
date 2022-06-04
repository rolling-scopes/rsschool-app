import { CopyOutlined } from '@ant-design/icons';
import { Alert, Button, notification } from 'antd';
import React from 'react';
import { useCopyToClipboard } from 'react-use';

type Props = {
  url: string;
};

export function PublicLink({ url }: Props) {
  const [, copyToClipboard] = useCopyToClipboard();

  if (!url) {
    return null;
  }

  return (
    <Alert
      message={
        <>
          Public Link{' '}
          <Button target="_blank" type="link" href={url}>
            {url}
          </Button>
          <Button
            onClick={() => {
              copyToClipboard(url ?? '');
              notification.success({ message: 'Copied to clipboard' });
            }}
            size="small"
            type="text"
            icon={<CopyOutlined />}
          />
        </>
      }
      type="info"
    ></Alert>
  );
}
