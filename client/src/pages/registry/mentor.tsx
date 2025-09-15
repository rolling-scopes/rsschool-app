import { SessionProvider } from 'modules/Course/contexts';
import { MentorRegistry } from 'modules/Registry/pages';

function MentorRegistryPage() {
  return (
    <SessionProvider>
      <MentorRegistry />
    </SessionProvider>
  );
}

export default MentorRegistryPage;
