import { SessionProvider } from 'modules/Course/contexts';
import { StudentRegistry } from 'modules/Registry/pages';

function StudentRegistryPage(props: { courseAlias?: string }) {
  return (
    <SessionProvider>
      <StudentRegistry {...props} />
    </SessionProvider>
  );
}

export default StudentRegistryPage;
