import { SessionProvider } from 'modules/Course/contexts';
import { Students } from 'modules/Students/Pages/Students';

export default function () {
  return (
    <SessionProvider hirerOnly>
      <Students />
    </SessionProvider>
  );
}
