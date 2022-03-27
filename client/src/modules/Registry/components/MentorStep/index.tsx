import { Row, Typography } from 'antd';
import css from 'styled-jsx/css';
import { MentorStepFooter } from '../MentorStepFooter';

type Props = React.PropsWithChildren<{
  header: React.ReactNode;
  title?: string;
  type?: 'normal' | 'wider';
}>;

export function MentorStep(props: Props) {
  const { header, title, children, type = 'normal' } = props;
  return (
    <>
      <div className={`mentor-step mentor-step-${type}`}>
        <div className="mentor-step-slide">
          <header>
            <img className="rss-logo" src="/static/images/logo-rsschool3.png" alt="Rolling Scopes School Logo" />
            {header}
          </header>
          <MentorStepFooter />
        </div>
        <div className="mentor-step-content">
          {title ? (
            <Row>
              <Typography.Title level={3}>{title}</Typography.Title>
            </Row>
          ) : null}
          {children}
        </div>
      </div>
      <style jsx>{styles}</style>
    </>
  );
}

const styles = css`
  .mentor-step {
    max-width: 970px;
    margin: 0 auto;
    background-color: #fff;
    display: flex;
    font-size: 12px;
    box-shadow: 1px 1px 10px #59595940;
  }
  .ant-typography {
    font-size: 14px;
  }
  .mentor-step-slide {
    background-color: #141414;
    flex: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .mentor-step-normal .mentor-step-slide {
    width: 350px;
  }

  .mentor-step-wider .mentor-step-slide {
    max-width: 225px;
  }

  .mentor-step-content {
    padding: 72px 150px 64px 150px;
    flex: 3;
  }

  .mentor-step-wider .mentor-step-content {
    padding: 40px 125px 64px 147px;
  }

  @media (max-width: 768px) {
    .mentor-step-content {
      padding: 32px 24px 80px 24px;
    }
    .mentor-step-slide {
      background-color: #141414;
      width: 220px;
    }
  }
  @media (max-width: 575px) {
    .mentor-step {
      flex-direction: column;
    }
    .mentor-step-slide {
      background-color: #141414;
      width: 100%;
      display: flex;
      justify-content: center;
      flex-direction: column;
    }
    .mentor-step-wider .mentor-registration-slide {
      max-width: 100vw;
    }
    header {
      display: contents;
    }
    .steps-wrapper {
      display: none;
    }
  }

  .rss-logo {
    margin: 38px 24px 0 24px;
    height: 64px;
    -webkit-filter: invert(100%);
    filter: invert(100%);
  }
  .rss-logo-descriptions {
    margin: 32px 24px 0 24px;
    padding: 4px 0;
    font-size: 14px;
    font-weight: 700;
    background-color: #ffec3d;
    text-align: center;
  }
  @media (max-width: 575px) {
    .rss-logo {
      margin: 22px auto;
      height: 45px;
      -webkit-filter: invert(100%);
      filter: invert(100%);
    }
    .rss-logo-descriptions {
      margin: 0 16px 16px;
    }
  }
`;
