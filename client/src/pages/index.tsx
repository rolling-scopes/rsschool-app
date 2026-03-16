import { SessionProvider } from '@client/modules/Course/contexts';
import { HomePage } from '@client/modules/Home/pages/HomePage';

function Page() {
  return (
    <SessionProvider>
      <HomePage />
    </SessionProvider>
  );
}

export default Page;
