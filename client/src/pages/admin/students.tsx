import { SessionProvider } from '@client/modules/Course/contexts';
import { Students } from '@client/modules/Students/Pages/Students';

export default function () {
  return (
    <SessionProvider hirerOnly>
      <Students />
    </SessionProvider>
  );
}
