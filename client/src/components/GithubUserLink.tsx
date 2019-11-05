import { Icon } from 'antd';
import { GithubAvatar } from './GithubAvatar';
import css from 'styled-jsx/css';

export function GithubUserLink(props: { value: string }) {
  return (
    <div className="link-user">
      <a target="_blank" className="link-user-profile" href={`/profile?githubId=${props.value}`}>
        <GithubAvatar size={24} githubId={props.value} /> {props.value}
      </a>{' '}
      <a target="_blank" className="link-user-github" href={`https://github.com/${props.value}`}>
        <Icon type="github" />
      </a>
      <style jsx>{styles}</style>
    </div>
  );
}

const styles = css`
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
`;
