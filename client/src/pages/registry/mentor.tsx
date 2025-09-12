import { SessionProvider } from 'modules/Course/contexts';
import { MentorRegistry } from 'modules/Registry/pages';

function MentorRegistryPage(props: { courseAlias?: string }) {
  return (
    <SessionProvider>
      <MentorRegistry {...props} />
    </SessionProvider>
  );
}

export default MentorRegistryPage;
