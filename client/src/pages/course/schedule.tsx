import { SessionProvider } from '@client/modules/Course/contexts';
import { SchedulePage } from '@client/modules/Schedule/pages/SchedulePage';

export default function () {
  return (
    <SessionProvider>
      <SchedulePage />
    </SessionProvider>
  );
}
