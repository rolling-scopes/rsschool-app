import { Button } from 'antd';
import { COLORS } from 'modules/Job/theme/colors';

export const JobSeekerInfo = () => {
  return (
    <>
      <div className="wrapper">
        <div className="circle">
          <img src="/static/svg/jobs/rs-super-sloth.svg" className="image" alt="super-rss" />
          <div className="content">
            <h2>Job seeker</h2>
            <ul>
              <li>You graduated from RS school no more than a year ago?</li>
              <li>You have a RS App CV?</li>
            </ul>
            <div className="button-wrap">
              <Button
                type="primary"
                size="large"
                block
                onClick={() => (window.location.href = `/api/v2/auth/github/login`)}
              >
                Find a Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .wrapper {
            display: flex;
            justify-content: end;
            padding-top: 165px;
            padding-right: 160px;
          }
          .content {
            display: flex;
            flex-direction: column;
            padding-left: 78px;
          }
          .content h2 {
            margin-top: 96px;
            margin-bottom: 40px;
            font-size: 120px;
            font-weight: 700;
            line-height: 141px;
            color: ${COLORS.Neutral_9};
            white-space: nowrap;
          }
          .content ul {
            max-width: 450px;
          }
          .content li {
            font-size: 24px;
          }
          .circle {
            display: flex;
            width: 640px;
            height: 640px;
            border-radius: 100%;
            background: ${COLORS.RS_yellow};
          }
          .button-wrap {
            width: 160px;
            margin-top: 40px;
          }
          .image {
            align-self: end;
            width: 484px;
            height: 447px;
            margin-left: -350px;
            margin-bottom: 45px;
          }

          @media (max-width: 1200px) {
            .image {
              display: none;
            }
            .wrapper {
              justify-content: center;
              padding: 50px 0 0 0;
            }
            .circle {
              align-items: center;
              justify-content: center;
            }
            .content {
              align-items: start;
              padding: 0;
            }
            .content h2 {
              margin: 0 0 30px 0;
              font-size: 60px;
              font-weight: 700;
              line-height: 60px;
            }
          }
          @media (max-width: 770px) {
            .circle {
              width: 80vw;
              height: 80vw;
            }
            .content h2 {
              font-size: 30px;
              line-height: 30px;
            }
            .content li {
              font-size: 20px;
            }
            .content {
              padding: 0;
              align-items: center;
            }
          }
          @media (max-width: 450px) {
            .circle {
              background: transparent;
            }
          }
        `}
      </style>
    </>
  );
};
