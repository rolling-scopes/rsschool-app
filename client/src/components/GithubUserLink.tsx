import { GithubAvatar } from './GithubAvatar';
import { CopyOutlined, GithubOutlined } from '@ant-design/icons';
import { useMessage } from 'hooks';
import { useCopyToClipboard } from 'react-use';
import { theme } from 'antd';

type Props = {
  value: string;
  isUserIconHidden?: boolean;
  fullName?: string;
  copyable?: boolean;
};

export function GithubUserLink({ value, isUserIconHidden = false, fullName, copyable = true }: Props) {
  const { token } = theme.useToken();
  const { message } = useMessage();
  const [, copyToClipboard] = useCopyToClipboard();

  const handleCopyToClipboard = async () => {
    copyToClipboard(value);
    await message.success("User's name copied to clipboard");
  };

  return (
    <div className="link-user">
      <a title='Open Rolling Scopes App profile page' target="_blank" className="link-user-profile" href={`/profile?githubId=${value}`}>
        {!isUserIconHidden && <GithubAvatar githubId={value} size={24} />}
        {fullName || value}
      </a>
      <a
        title="Open GitHub profile page"
        target="_blank"
        className="link-user-action"
        href={`https://github.com/${value}`}
      >
        <GithubOutlined style={{ color: token.colorTextBase }} />
      </a>
      {copyable && (
        <span title="Copy GitHub name to clipboard" className="link-user-action" onClick={handleCopyToClipboard}>
          <CopyOutlined style={{ color: token.colorInfo }} />
        </span>
      )}
      <style jsx>{`
        .link-user,
        .link-user-profile {
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.5ch;
          color: ${token.colorText};
        }
        .link-user-action {
          opacity: 0;
          margin: 0.1ch;
        }
        .link-user:hover .link-user-action {
          cursor: pointer;
          opacity: 1;
          transition: opacity 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
