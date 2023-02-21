import { COLORS } from 'modules/Job/theme/colors';
import { DottedRectangle } from './DottedRectangle';

export function TopSlide() {
  return (
    <>
      <div className="wrapper">
        <div className="divider"></div>
        <div className="content">
          <div className="text-wrapper">
            <div className="logo-dots-wrap">
              <div className="dot-wrap">
                <DottedRectangle />
              </div>
              <img src="/static/svg/jobs/rs-logo-big.svg" className="logo" alt="logo-rss" />
            </div>
            <div className="text-block">
              <h1 className="title"> RS Jobs - developer job portal</h1>
              <p className="subtitle"> powered by The Rolling Scopes developer community</p>
            </div>
          </div>
          <div className="circle-logo-wrap">
            <div className="circle"></div>
            <img src="/static/svg/jobs/sloth-welcome.svg" className="welcome-pic" alt="welcome" />
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .content {
            display: flex;
            justify-content: space-between;
            padding: 50px 30px 0 16px;
          }
          .wrapper {
            padding-top: 24px;
            background: ${COLORS.YELLOW};
          }
          .divider {
            height: 8px;
            background: ${COLORS.WHITE};
          }
          .logo-dots-wrap {
            display: flex;
            align-items: start;
            gap: 32px;
          }
          .dot-wrap {
            max-width: 352px;
          }
          .circle-logo-wrap {
            position: relative;
            display: flex;
            align-items: end;
            justify-content: center;
            min-width: 640px;
          }
          .circle {
            position: absolute;
            bottom: -25%;
            width: 640px;
            height: 640px;
            background: ${COLORS.WHITE};
            border-radius: 100%;
          }
          .welcome-pic {
            width: 460px;
            height: 405px;
            z-index: 1;
          }
          .text-wrapper {
            display: flex;
            flex-direction: column;
            gap: 60px;
          }
          .text-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-bottom: 60px;
          }
          .title {
            margin: 0;
            text-align: center;
            font-size: 48px;
            font-weight: 500;
            color: ${COLORS.GREY};
          }
          .subtitle {
            margin: 0;
            text-align: center;
            font-size: 40px;
            max-width: 560px;
            color: ${COLORS.GREY};
          }
          @media (max-width: 1439px) {
            .welcome-pic {
              width: 200px;
              height: 200px;
            }
            .circle {
              display: none;
            }
            .dot-wrap {
              display: none;
            }
            .content {
              flex-direction: column;
            }
            .logo-dots-wrap {
              justify-content: center;
            }
            .circle-logo-wrap {
              min-width: 0;
            }
          }
          @media (max-width: 767px) {
            .title {
              font-size: 24px;
              color: ${COLORS.GREY};
            }
            .subtitle {
              font-size: 16px;
            }
            .logo {
              width: 200px;
            }
          }
        `}
      </style>
    </>
  );
}
