import { PageLayout } from 'components/PageLayout';
import withSession, { Session } from 'components/withSession';
import { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import css from 'styled-jsx/css';
import { GratitudesApi, HeroesRadarDto } from 'api';
import HeroesRadarCard from 'modules/Heroes/HeroesRadarCard';

type Props = {
  session: Session;
};

function Page(props: Props) {
  const [loading, setLoading] = useState(false);
  const [heroes, setHeroes] = useState<HeroesRadarDto[]>([]);
  const gratitudeApi = new GratitudesApi();

  useEffect(() => {
    const getHeroes = async () => {
      setLoading(true);
      const { data: heroes } = await gratitudeApi.getHeroesRadar();
      setHeroes(heroes);
      setLoading(false);
    };
    getHeroes();
  }, []);

  return (
    <PageLayout loading={loading} title="Heroes Radar" githubId={props.session.githubId}>
      <Masonry
        breakpointCols={{
          default: 4,
          1100: 3,
          700: 2,
          500: 1,
        }}
        className={masonryClassName}
        columnClassName={masonryColumnClassName}
      >
        {heroes.map(hero => (
          <HeroesRadarCard hero={hero} />
        ))}
      </Masonry>
      {masonryStyles}
      {masonryColumnStyles}
    </PageLayout>
  );
}

const gapSize = 16;
const { className: masonryClassName, styles: masonryStyles } = css.resolve`
  div {
    display: flex;
    margin-left: -${gapSize}px;
    width: auto;
  }
`;
const { className: masonryColumnClassName, styles: masonryColumnStyles } = css.resolve`
  div {
    padding-left: ${gapSize}px;
    background-clip: padding-box;
  }
`;

export default withSession(Page);
