import { SessionProvider } from 'modules/Course/contexts';
import { ConnectionConfirmed } from 'modules/Notifications/pages/ConnectionConfirmedPage';

function Page() {
  return (
    <SessionProvider>
      <ConnectionConfirmed />
    </SessionProvider>
  );
}

export default Page;
