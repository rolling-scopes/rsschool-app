import { SessionProvider } from '@client/modules/Course/contexts';
import { DiscordAdminPage } from '@client/modules/DiscordAdmin';

export default function () {
  return (
    <SessionProvider adminOnly>
      <DiscordAdminPage />
    </SessionProvider>
  );
}
