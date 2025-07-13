import { AutoTests } from 'modules/AutoTest/pages';
import { SessionProvider } from 'modules/Course/contexts';

function Page() {
  return (
    <SessionProvider>
      <AutoTests />
    </SessionProvider>
  );
}

export default Page;
