import { SessionProvider } from 'modules/Course/contexts';
import { Interviews } from 'modules/Mentor/pages/Interviews';

export default function () {
  return (
    <SessionProvider>
      <Interviews />
    </SessionProvider>
  );
}
