import { GithubAvatar } from './GithubAvatar';
import { CopyOutlined, GithubOutlined } from '@ant-design/icons';
import { useMessage } from 'hooks';
import { useCopyToClipboard } from 'react-use';
import { theme } from 'antd';
import styles from './GithubUserLink.module.css';

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
    <div className={styles.linkUser} style={{ color: token.colorText }}>
      <a
        title="Open Rolling Scopes App profile page"
        target="_blank"
        className={styles.linkUserProfile}
        href={`/profile?githubId=${value}`}
      >
        {!isUserIconHidden && <GithubAvatar githubId={value} size={24} />}
        {fullName || value}
      </a>
      <a
        title="Open GitHub profile page"
        target="_blank"
        className={styles.linkUserAction}
        href={`https://github.com/${value}`}
      >
        <GithubOutlined style={{ color: token.colorTextBase }} />
      </a>
      {copyable && (
        <span title="Copy GitHub name to clipboard" className={styles.linkUserAction} onClick={handleCopyToClipboard}>
          <CopyOutlined style={{ color: token.colorInfo }} />
        </span>
      )}
    </div>
  );
}
