import { GithubAvatar } from './GithubAvatar';
import css from 'styled-jsx/css';

export function GithubUserLink(props: { value: string }) {
  return (
    <>
      <a className="link-user-github" href={`/profile?githubId=${props.value}`}>
        <GithubAvatar size={24} githubId={props.value} /> {props.value}
      </a>
      <style jsx>{styles}</style>
    </>
  );
}

const styles = css`
  .link-user-github {
    white-space: nowrap;
  }
`;
