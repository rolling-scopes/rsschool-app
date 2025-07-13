import { SessionProvider } from 'modules/Course/contexts';
import { HomePage } from 'modules/Home/pages/HomePage';

function Page() {
  return (
    <SessionProvider>
      <HomePage />
    </SessionProvider>
  );
}

export default Page;
