import { Typography } from 'antd';
import { FC, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const markdownLabel = '{markdown}\n';

type Props = {
  text: string;
};

const PreparedComment: FC<Props> = ({ text }) => {
  const [state, setState] = useState(text);
  const [isMD, setIsMD] = useState(false);

  useEffect(() => {
    if (text.indexOf(markdownLabel) === 0) {
      setIsMD(true);
      setState(text.slice(markdownLabel.length));
    }
  }, []);

  /**
   * Для того, чтобы не повлиять на предыдущие сохраненные комментарии, для markdown синтаксиса используем специальную метку.
   */
  return (
    <>
      {isMD ? (
        <Typography.Text>
          <ReactMarkdown rehypePlugins={[remarkGfm]}>{state}</ReactMarkdown>
        </Typography.Text>
      ) : (
        <Typography.Text>
          {state.split('\n').map((item, i) => (
            <div key={i}>{item}</div>
          ))}
        </Typography.Text>
      )}
    </>
  );
};

export default PreparedComment;
