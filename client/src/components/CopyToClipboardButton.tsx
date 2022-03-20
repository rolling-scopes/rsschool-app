import React, { useRef, useCallback } from 'react';
import { Button } from 'antd';
import { CopyTwoTone } from '@ant-design/icons';

type Props = {
  value: string;
};

export default function CopyToClipboardButton({ value }: Props) {
  const textAreaRef = useRef(null);

  const copyToClipboard = useCallback(
    (event: any) => {
      const textArea = textAreaRef?.current as HTMLTextAreaElement | null;
      if (textArea) {
        textArea.select();
        document.execCommand('copy');
        event.target.focus();
      }
    },
    [textAreaRef.current],
  );

  return document.queryCommandSupported('copy') ? (
    <>
      <Button type="dashed" icon={<CopyTwoTone />} htmlType="button" onClick={copyToClipboard} />
      <textarea className="visually-hidden" ref={textAreaRef} value={value} />
      <style jsx>{`
        .visually-hidden {
          position: absolute;
          clip: rect(0 0 0 0);
          width: 1px;
          height: 1px;
          margin: -1px;
        }
      `}</style>
    </>
  ) : (
    <></>
  );
}
