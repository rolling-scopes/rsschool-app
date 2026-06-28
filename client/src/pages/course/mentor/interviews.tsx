import { SessionProvider } from '@client/modules/Course/contexts';
import { Interviews } from '@client/modules/Mentor/pages/Interviews';

export default function () {
  return (
    <SessionProvider>
      <Interviews />
    </SessionProvider>
  );
}
