import { SessionProvider } from '@client/modules/Course/contexts';
import { Teams } from '@client/modules/Teams';

export function Page() {
  return (
    <SessionProvider>
      <Teams />
    </SessionProvider>
  );
}

export default Page;
