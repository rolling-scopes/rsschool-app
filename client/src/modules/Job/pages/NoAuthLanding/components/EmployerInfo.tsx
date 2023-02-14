import { Button } from 'antd';
import { COLORS } from 'modules/Job/theme/colors';

export const EmployerInfo = () => {
  return (
    <>
      <div className="wrapper">
        <div className="circle">
          <div className="content">
            <h2>Employer</h2>
            <p>Do you have a GitHub account?</p>
            <div className="button-wrap">
              <Button
                type="primary"
                size="large"
                block
                onClick={() => (window.location.href = `/api/v2/auth/github/login`)}
              >
                Post a Job
              </Button>
            </div>
          </div>
        </div>
        <img src="/static/svg/jobs/rs-github.svg" className="image" alt="super-rss" />
      </div>

      <style jsx>
        {`
          .wrapper {
            display: flex;
            justify-content: space-between;
            padding: 165px 0;
          }
          .content {
            display: flex;
            flex-direction: column;
            padding-left: 85px;
          }
          .content h2 {
            margin-top: 81px;
            margin-bottom: 40px;
            font-size: 120px;
            font-weight: 700;
            line-height: 141px;
            color: ${COLORS.Neutral_9};
            white-space: nowrap;
          }
          .content p {
            font-size: 24px;
            line-height: 32px;
            color: ${COLORS.Neutral_9};
          }
          .circle {
            display: flex;
            width: 540px;
            height: 540px;
            border-radius: 100%;
            background: ${COLORS.RS_yellow};
          }
          .button-wrap {
            width: 160px;
            margin-top: 40px;
          }
          .image {
            align-self: end;
            width: 512px;
            height: 433px;
          }

          @media (max-width: 1200px) {
            .image {
              display: none;
            }
            .wrapper {
              justify-content: center;
            }
            .circle {
              align-items: center;
              justify-content: center;
            }
            .content {
              width: 80%;
              padding: 0;
              justify-content: start;
            }
            .content h2 {
              margin: 0 0 20px 0;
              font-size: 60px;
              line-height: 60px;
            }
            .button-wrap {
              margin-top: 20px;
            }
          }
          @media (max-width: 770px) {
            .wrapper {
              padding: 60px 0;
            }
            .circle {
              width: 80vw;
              height: 80vw;
            }
            .content {
              align-items: center;
            }
            .content h2 {
              font-size: 30px;
              line-height: 30px;
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
