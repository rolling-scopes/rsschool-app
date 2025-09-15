import { SessionProvider } from 'modules/Course/contexts';
import { StudentRegistry } from 'modules/Registry/pages';

function StudentRegistryPage() {
  return (
    <SessionProvider>
      <StudentRegistry />
    </SessionProvider>
  );
}

export default StudentRegistryPage;
