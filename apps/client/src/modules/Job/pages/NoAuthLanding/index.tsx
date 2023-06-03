import { Footer } from 'modules/Job/components/Footer';
import { COLORS } from 'modules/Job/theme/colors';
import { Header } from '../../components/Header';
import { EmployerInfo } from './components/EmployerInfo';
import { Info } from './components/Info';
import { JobSeekerInfo } from './components/JobSeekerInfo';
import { TopSlide } from './components/TopSlide';

export function NoAuthLanding() {
  return (
    <>
      <section className="w-1440">
        <Header />
        <TopSlide />
        <div className="content-wrap">
          <Info />
          <JobSeekerInfo />
          <EmployerInfo />
        </div>
        <Footer />
      </section>

      <style jsx>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          :global(*) {
            font-family: 'Roboto';
          }
          .w-1440 {
            max-width: 1440px;
            margin: 0 auto;
          }
          .content-wrap {
            position: relative;
            padding: 0 120px;
            background: ${COLORS.WHITE};
            background-image: radial-gradient(${COLORS.YELLOW} 2px, transparent 0);
            background-size: 40px 40px;
            z-index: 1;
          }
          @media (max-width: 1300px) {
            .content-wrap {
              padding: 0 40px;
            }
          }
        `}
      </style>
    </>
  );
}
