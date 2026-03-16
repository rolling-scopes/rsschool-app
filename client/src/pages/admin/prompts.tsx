import { SessionProvider } from '@client/modules/Course/contexts';
import { PromptsPage } from '@client/modules/Prompts/pages/PromptPage';

export default function () {
  return (
    <SessionProvider adminOnly>
      <PromptsPage />
    </SessionProvider>
  );
}
