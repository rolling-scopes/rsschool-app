import { SessionProvider } from 'modules/Course/contexts';
import { DiscordAdminPage } from 'modules/DiscordAdmin';

export default function () {
  return (
    <SessionProvider adminOnly>
      <DiscordAdminPage />
    </SessionProvider>
  );
}
