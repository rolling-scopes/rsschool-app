import GithubFilled from '@ant-design/icons/GithubFilled';
import { CDN_AVATARS_URL } from 'configs/cdn';

type Props = {
  value: string;
  isUserIconHidden?: boolean;
};

export function GithubUserLink({ value, isUserIconHidden = false }: Props) {
  const imgProps: any = { loading: 'lazy' };
  return (
    <div className="link-user">
      <a target="_blank" className="link-user-profile" href={`/profile?githubId=${value}`}>
        {!isUserIconHidden && (
          <>
            <img
              {...imgProps}
              style={{ height: '24px', width: '24px', borderRadius: '12px' }}
              src={`${CDN_AVATARS_URL}/${value}.png?size=48`}
            />{' '}
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
