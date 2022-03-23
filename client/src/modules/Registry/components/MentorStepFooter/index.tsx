import css from 'styled-jsx/css';

export function MentorStepFooter() {
  return (
    <>
      <footer>
        <img className="logo" src="/static/svg/logo-github.svg" alt="GitHub Logo" />
        <img className="logo-rs" src="/static/svg/logo-rs.svg" alt="Rolling Scopes Logo" />
        <img className="logo" src="/static/svg/logo-epam.svg" alt="EPAM Logo" />
      </footer>
      <style jsx>{styles}</style>
    </>
  );
}

const styles = css`
  footer {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 10px 30px;
  }
  .logo {
    height: 20px;
  }
  .logo-rs {
    height: 40px;
  }
  @media (max-width: 575px) {
    footer {
      display: none;
    }
  }
`;
