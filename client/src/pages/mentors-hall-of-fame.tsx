import { MentorsHallOfFamePage } from 'modules/MentorsHallOfFame';
import { PageLayout } from 'components/PageLayout';

function Page() {
  return (
    <PageLayout loading={false} title="Mentors Hall of Fame">
      <MentorsHallOfFamePage />
    </PageLayout>
  );
}

export default Page;
