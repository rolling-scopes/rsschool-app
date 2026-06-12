import { AuditLogPage } from '@client/modules/AuditLog';
import { SessionProvider } from '@client/modules/Course/contexts';

export default function () {
  return (
    <SessionProvider adminOnly>
      <AuditLogPage />
    </SessionProvider>
  );
}
