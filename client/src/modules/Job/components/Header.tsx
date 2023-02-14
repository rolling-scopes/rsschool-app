import { Button } from 'antd';
import { COLORS } from '../theme/colors';

export const Header = () => {
  return (
    <>
      <header className="header">
        <img src="/static/svg/jobs/rs-jobs-logo.svg" alt="logo_rs-jobs" />
        <Button
          ghost
          style={{ color: COLORS.RS_yellow, borderColor: COLORS.RS_yellow }}
          onClick={() => (window.location.href = `/api/v2/auth/github/login`)}
        >
          Sign in
        </Button>
      </header>

      <style jsx>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 48px;
          padding: 0 48px;
          background: ${COLORS.Neutral_9};
        }
      `}</style>
    </>
  );
};
