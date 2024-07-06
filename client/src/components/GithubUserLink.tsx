import GithubFilled from '@ant-design/icons/GithubFilled';
import { GithubAvatar } from './GithubAvatar';

type Props = {
  value: string;
  isUserIconHidden?: boolean;
};

export function GithubUserLink({ value, isUserIconHidden = false }: Props) {
  return (
    <div className="link-user">
      <a target="_blank" className="link-user-profile" href={`/profile?githubId=${value}`}>
        {!isUserIconHidden && (
          <>
            <GithubAvatar githubId={value} size={24} />{' '}
          </>
        )}
        {value}
      </a>{' '}
      <a target="_blank" className="link-user-github" href={`https://github.com/${value}`}>
        <GithubFilled />
      </a>
      <style jsx>{`
        .link-user {
          display: inline-block;
        }
        .link-user,
        .link-user-profile {
          white-space: nowrap;
        }
        .link-user-github {
          visibility: hidden;
        }
        .link-user:hover .link-user-github {
          visibility: visible;
        }
      `}</style>
    </div>
  );
}
