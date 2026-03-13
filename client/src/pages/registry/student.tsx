import { SessionProvider } from '@client/modules/Course/contexts';
import { StudentRegistry } from '@client/modules/Registry/pages';

function StudentRegistryPage() {
  return (
    <SessionProvider>
      <StudentRegistry />
    </SessionProvider>
  );
}

export default StudentRegistryPage;
