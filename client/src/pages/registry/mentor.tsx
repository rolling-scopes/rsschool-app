import { SessionProvider } from '@client/modules/Course/contexts';
import { MentorRegistry } from '@client/modules/Registry/pages';

function MentorRegistryPage() {
  return (
    <SessionProvider>
      <MentorRegistry />
    </SessionProvider>
  );
}

export default MentorRegistryPage;
