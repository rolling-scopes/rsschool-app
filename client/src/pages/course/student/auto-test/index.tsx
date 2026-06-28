import { AutoTests } from '@client/modules/AutoTest/pages';
import { SessionProvider } from '@client/modules/Course/contexts';

function Page() {
  return (
    <SessionProvider>
      <AutoTests />
    </SessionProvider>
  );
}

export default Page;
