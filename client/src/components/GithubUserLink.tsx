import { GithubFilled } from '@ant-design/icons';
import css from 'styled-jsx/css';

export function GithubUserLink(props: { value: string }) {
  const imgProps: any = { loading: 'lazy' };
  return (
    <div className="link-user">
      <a target="_blank" className="link-user-profile" href={`/profile?githubId=${props.value}`}>
        <img
          {...imgProps}
          style={{ height: '24px', width: '24px', borderRadius: '12px' }}
          src={`https://github.com/${props.value}.png?size=48`}
        />{' '}
        {props.value}
      </a>{' '}
      <a target="_blank" className="link-user-github" href={`https://github.com/${props.value}`}>
        <GithubFilled />
      </a>
      <style jsx>{styles}</style>
    </div>
  );
}

const styles = css`
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
`;
