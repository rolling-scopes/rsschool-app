import { Button } from 'antd';
import { COLORS } from 'modules/Job/theme/colors';

export const Info = () => {
  return (
    <>
      <div className="wrapper">
        <div className="title-wrap">
          <h3>Looking for a job or employee?</h3>
          <h2>Let's get started</h2>
          <div className="button-wrap">
            <Button
              type="primary"
              size="large"
              block
              onClick={() => (window.location.href = `/api/v2/auth/github/login`)}
            >
              Sign up
            </Button>
          </div>
        </div>
        <p className="text">
          Our community-based educational program - RS School - welcomes hundreds of thousands of students worldwide
          annually. We know how hard it is for juniors to find a job so we are here to help our alumni
        </p>
      </div>

      <style jsx>
        {`
          .wrapper {
            display: flex;
            justify-content: space-between;
            padding-top: 64px;
          }
          .title-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .title-wrap h3 {
            text-align: center;
            font-size: 24px;
            font-weight: 500;
            color: ${COLORS.GREY};
          }
          .title-wrap h2 {
            text-align: center;
            font-size: 30px;
            font-weight: 500;
            color: ${COLORS.GREY};
          }
          .button-wrap {
            width: 160px;
          }
          .text {
            font-size: 24px;
            max-width: 672px;
          }
          @media (max-width: 1300px) {
            .title-wrap {
              flex-shrink: 0;
            }

            .text {
              padding-left: 40px;
              flex-shrink: 1;
              text-align: justify;
            }
          }
          @media (max-width: 770px) {
            .wrapper {
              flex-direction: column-reverse;
              align-items: center;
            }
            .text {
              padding-left: 0;
            }
          }
        `}
      </style>
    </>
  );
};
