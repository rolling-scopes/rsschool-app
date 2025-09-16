import { SessionProvider } from 'modules/Course/contexts';
import { Teams } from 'modules/Teams';

export function Page() {
  return (
    <SessionProvider>
      <Teams />
    </SessionProvider>
  );
}

export default Page;
