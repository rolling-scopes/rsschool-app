import { SessionProvider } from '@client/modules/Course/contexts';
import { EditPage } from '@client/modules/Opportunities/pages/EditPage';

// force the page to render on the server to fix issue with getting githubId from url
export const getServerSideProps = async () => {
  return { props: {} };
};

export default function () {
  return (
    <SessionProvider>
      <EditPage />
    </SessionProvider>
  );
}
